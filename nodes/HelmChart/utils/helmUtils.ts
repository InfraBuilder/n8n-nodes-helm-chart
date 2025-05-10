import axios, { AxiosRequestConfig } from 'axios';
import * as yaml from 'js-yaml';
import * as tar from 'tar';
import * as stream from 'stream';
import * as util from 'util';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { Registry } from 'oci-registry-js';

// For working with temporary files
const pipeline = util.promisify(stream.pipeline);
const mkdir = util.promisify(fs.mkdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const rmdir = util.promisify(fs.rmdir);

interface RepositoryAuth {
        username?: string;
        password?: string;
}

interface ChartData {
        metadata?: any;
        values?: any;
}

/**
 * Identifies the repository type based on the URL
 * @param repositoryUrl The URL of the Helm chart repository
 */
export function getRepositoryType(repositoryUrl: string): 'http' | 'oci' {
        if (repositoryUrl.startsWith('http://') || repositoryUrl.startsWith('https://')) {
                return 'http';
        }
        // If it starts with oci:// or doesn't have a scheme, it's an OCI repo
        return 'oci';
}

/**
 * Normalizes an OCI repository URL
 * @param repositoryUrl The OCI repository URL
 */
export function normalizeOciUrl(repositoryUrl: string): string {
        // Remove oci:// prefix if present
        if (repositoryUrl.startsWith('oci://')) {
                return repositoryUrl.substring(6);
        }
        return repositoryUrl;
}

/**
 * Fetches the index.yaml file from an HTTP Helm repository
 * @param repositoryUrl The URL of the Helm repository
 * @param auth Authentication details for the repository
 */
export async function fetchRepositoryIndex(
        repositoryUrl: string,
        auth?: RepositoryAuth,
): Promise<any> {
        const url = `${repositoryUrl.replace(/\/$/, '')}/index.yaml`;
        
        const requestConfig: AxiosRequestConfig = {};
        if (auth?.username && auth?.password) {
                requestConfig.auth = {
                        username: auth.username,
                        password: auth.password,
                };
        }

        try {
                const response = await axios.get(url, requestConfig);
                return yaml.load(response.data);
        } catch (error) {
                throw new Error(`Failed to fetch repository index: ${error.message}`);
        }
}

/**
 * Gets chart details from an HTTP repository
 * @param repositoryUrl The URL of the Helm repository
 * @param chartName The name of the Helm chart
 * @param chartVersion The version of the Helm chart
 * @param auth Authentication details for the repository
 */
export async function getHttpChartDetails(
        repositoryUrl: string,
        chartName: string,
        chartVersion: string,
        auth?: RepositoryAuth,
): Promise<{ chartUrl: string; version: string }> {
        const index = await fetchRepositoryIndex(repositoryUrl, auth);
        
        if (!index.entries || !index.entries[chartName]) {
                throw new Error(`Chart "${chartName}" not found in repository`);
        }

        const charts = index.entries[chartName];
        
        // Find the specified version or use the latest
        let chart;
        if (chartVersion) {
                chart = charts.find((c: any) => c.version === chartVersion);
                if (!chart) {
                        throw new Error(`Version "${chartVersion}" of chart "${chartName}" not found`);
                }
        } else {
                // Sort by version and get the latest
                chart = charts.sort((a: any, b: any) => {
                        // Simple version comparison (this should be replaced with a proper semver library in production)
                        return b.version.localeCompare(a.version);
                })[0];
        }

        return {
                chartUrl: chart.urls[0],
                version: chart.version,
        };
}

/**
 * Downloads and extracts a Helm chart from an HTTP repository
 * @param repositoryUrl The URL of the Helm repository
 * @param chartName The name of the Helm chart
 * @param chartVersion The version of the Helm chart
 * @param auth Authentication details for the repository
 */
export async function downloadHttpChart(
        repositoryUrl: string,
        chartName: string,
        chartVersion: string,
        auth?: RepositoryAuth,
): Promise<ChartData> {
        const { chartUrl, version } = await getHttpChartDetails(repositoryUrl, chartName, chartVersion, auth);
        
        // Determine if it's a full URL or relative to the repository
        const fullChartUrl = chartUrl.startsWith('http')
                ? chartUrl
                : `${repositoryUrl.replace(/\/$/, '')}/${chartUrl}`;

        // Create temp directory
        const tempDir = path.join(os.tmpdir(), `helm-chart-${Date.now()}`);
        await mkdir(tempDir, { recursive: true });
        const chartFilePath = path.join(tempDir, 'chart.tgz');

        try {
                // Download the chart
                const requestConfig: AxiosRequestConfig = {
                        responseType: 'stream',
                };
                if (auth?.username && auth?.password) {
                        requestConfig.auth = {
                                username: auth.username,
                                password: auth.password,
                        };
                }

                const response = await axios.get(fullChartUrl, requestConfig);
                await pipeline(response.data, fs.createWriteStream(chartFilePath));

                // Extract the chart
                await tar.extract({
                        file: chartFilePath,
                        cwd: tempDir,
                        strict: true,
                });

                // Find the chart directory
                const chartDir = fs.readdirSync(tempDir).find(file => 
                        fs.statSync(path.join(tempDir, file)).isDirectory() && 
                        file !== 'lost+found'
                );

                if (!chartDir) {
                        throw new Error('Could not find chart directory in the tar file');
                }

                const chartPath = path.join(tempDir, chartDir);
                const chartData: ChartData = {};

                // Read Chart.yaml
                try {
                        const chartYamlPath = path.join(chartPath, 'Chart.yaml');
                        const chartYamlContent = await readFile(chartYamlPath, 'utf8');
                        chartData.metadata = yaml.load(chartYamlContent);
                } catch (error) {
                        console.error('Error reading Chart.yaml:', error);
                }

                // Read values.yaml
                try {
                        const valuesYamlPath = path.join(chartPath, 'values.yaml');
                        const valuesYamlContent = await readFile(valuesYamlPath, 'utf8');
                        chartData.values = yaml.load(valuesYamlContent);
                } catch (error) {
                        console.error('Error reading values.yaml:', error);
                }

                return chartData;
        } finally {
                // Clean up temp files
                try {
                        await rmdir(tempDir, { recursive: true });
                } catch (error) {
                        console.error('Error cleaning up temporary files:', error);
                }
        }
}

/**
 * Downloads and extracts a Helm chart from an OCI registry
 * @param repositoryUrl The URL of the OCI registry
 * @param chartName The name of the Helm chart
 * @param chartVersion The version of the Helm chart
 * @param auth Authentication details for the registry
 */
export async function downloadOciChart(
        repositoryUrl: string,
        chartName: string,
        chartVersion: string,
        auth?: RepositoryAuth,
): Promise<ChartData> {
        // Normalize the OCI URL
        const registryUrl = normalizeOciUrl(repositoryUrl);
        
        // Parse the registry URL to get the hostname and repository
        let registry: string;
        let repository: string;
        
        if (registryUrl.includes('/')) {
                const parts = registryUrl.split('/');
                registry = parts[0];
                repository = parts.slice(1).join('/');
        } else {
                registry = registryUrl;
                repository = chartName;
        }

        // Create temp directory
        const tempDir = path.join(os.tmpdir(), `helm-chart-${Date.now()}`);
        await mkdir(tempDir, { recursive: true });
        const chartFilePath = path.join(tempDir, 'chart.tgz');

        try {
                // Initialize OCI client
                const client = new Registry({
                        url: `https://${registry}`,
                });

                // Authenticate if credentials provided
                if (auth?.username && auth?.password) {
                        await client.login(auth.username, auth.password);
                }

                // Determine the full repository path
                const fullRepository = repository ? `${repository}/${chartName}` : chartName;

                // Get tags/versions - handle compatibility between different API versions
                let tagsResponse;
                if ('listTags' in client) {
                    tagsResponse = await (client as any).listTags(fullRepository);
                } else if ('getTags' in client) {
                    tagsResponse = await (client as any).getTags(fullRepository);
                } else {
                    throw new Error('No tags retrieval method available in OCI client');
                }
                
                // Find the specified version or use the latest
                let version = chartVersion;
                if (!version) {
                        // Sort by version and get the latest
                        // This is a simplistic approach and should be replaced with proper semver comparison
                        const tags = Array.isArray(tagsResponse.tags) ? tagsResponse.tags : [];
                        version = tags.sort().reverse()[0];
                        if (!version) {
                            throw new Error(`No versions found for chart "${chartName}"`);
                        }
                } else if (Array.isArray(tagsResponse.tags) && !tagsResponse.tags.includes(version)) {
                        throw new Error(`Version "${version}" of chart "${chartName}" not found`);
                }

                // Pull the chart - handle compatibility between different API versions
                let manifest;
                if ('getManifest' in client) {
                    manifest = await (client as any).getManifest(fullRepository, version);
                } else if ('pullManifest' in client) {
                    manifest = await (client as any).pullManifest(fullRepository, version);
                } else {
                    throw new Error('No manifest retrieval method available in OCI client');
                }
                
                // Download the chart layer
                const layer = manifest.layers[0];
                // Handle compatibility between different API versions
                let blob;
                if ('getBlob' in client) {
                    blob = await (client as any).getBlob(fullRepository, layer.digest);
                } else if ('pullBlob' in client) {
                    blob = await (client as any).pullBlob(fullRepository, layer.digest);
                } else {
                    throw new Error('No blob download method available in OCI client');
                }
                
                // Save the blob to a file
                await writeFile(chartFilePath, Buffer.from(blob));

                // Extract the chart
                await tar.extract({
                        file: chartFilePath,
                        cwd: tempDir,
                        strict: true,
                });

                // Find the chart directory
                const chartDir = fs.readdirSync(tempDir).find(file => 
                        fs.statSync(path.join(tempDir, file)).isDirectory() && 
                        file !== 'lost+found'
                );

                if (!chartDir) {
                        throw new Error('Could not find chart directory in the tar file');
                }

                const chartPath = path.join(tempDir, chartDir);
                const chartData: ChartData = {};

                // Read Chart.yaml
                try {
                        const chartYamlPath = path.join(chartPath, 'Chart.yaml');
                        const chartYamlContent = await readFile(chartYamlPath, 'utf8');
                        chartData.metadata = yaml.load(chartYamlContent);
                } catch (error) {
                        console.error('Error reading Chart.yaml:', error);
                }

                // Read values.yaml
                try {
                        const valuesYamlPath = path.join(chartPath, 'values.yaml');
                        const valuesYamlContent = await readFile(valuesYamlPath, 'utf8');
                        chartData.values = yaml.load(valuesYamlContent);
                } catch (error) {
                        console.error('Error reading values.yaml:', error);
                }

                return chartData;
        } finally {
                // Clean up temp files
                try {
                        await rmdir(tempDir, { recursive: true });
                } catch (error) {
                        console.error('Error cleaning up temporary files:', error);
                }
        }
}

/**
 * Gets Helm chart data based on the repository type
 * @param repositoryUrl The URL of the Helm repository
 * @param chartName The name of the Helm chart
 * @param chartVersion The version of the Helm chart
 * @param auth Authentication details for the repository
 */
export async function getHelmChartData(
        repositoryUrl: string,
        chartName: string,
        chartVersion: string,
        auth?: RepositoryAuth,
): Promise<ChartData> {
        const repoType = getRepositoryType(repositoryUrl);
        
        if (repoType === 'http') {
                return await downloadHttpChart(repositoryUrl, chartName, chartVersion, auth);
        } else {
                return await downloadOciChart(repositoryUrl, chartName, chartVersion, auth);
        }
}
