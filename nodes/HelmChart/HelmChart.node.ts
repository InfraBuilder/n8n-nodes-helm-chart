import {
        IExecuteFunctions,
        INodeExecutionData,
        INodeType,
        INodeTypeDescription,
        NodeOperationError,
} from 'n8n-workflow';

import { helmChartDescription } from './HelmChartDescription';
import { getHelmChartData, getRepositoryType } from './utils/helmUtils';

export class HelmChart implements INodeType {
        description: INodeTypeDescription = helmChartDescription;
        
        async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
                const items = this.getInputData();
                const returnData: INodeExecutionData[] = [];
                
                const resource = this.getNodeParameter('resource', 0) as string;
                const operation = this.getNodeParameter('operation', 0) as string;
                
                for (let i = 0; i < items.length; i++) {
                        try {
                                if (resource === 'helmChart') {
                                        if (operation === 'getDefaultValues' || operation === 'getChartMetadata') {
                                                // Get parameters
                                                const repositoryUrl = this.getNodeParameter('repositoryUrl', i) as string;
                                                const chartName = this.getNodeParameter('chartName', i) as string;
                                                const chartVersion = this.getNodeParameter('chartVersion', i) as string;
                                                const useAuthentication = this.getNodeParameter('authentication', i) as boolean;
                                                
                                                let auth;
                                                if (useAuthentication) {
                                                        const credentials = await this.getCredentials('helmRepositoryCredentials');
                                                        // Determine if this is an HTTP or OCI repository
                                                        const repoType = getRepositoryType(repositoryUrl);
                                                        if (repoType === 'http') {
                                                                auth = {
                                                                        username: credentials.username as string,
                                                                        password: credentials.password as string,
                                                                };
                                                        } else {
                                                                auth = {
                                                                        username: credentials.registryUsername as string,
                                                                        password: credentials.registryPassword as string,
                                                                };
                                                        }
                                                }
                                                
                                                // Validate input
                                                if (!repositoryUrl) {
                                                        throw new NodeOperationError(this.getNode(), 'Repository URL must be specified');
                                                }
                                                
                                                if (!chartName) {
                                                        throw new NodeOperationError(this.getNode(), 'Chart name must be specified');
                                                }
                                                
                                                // Get chart data
                                                const chartData = await getHelmChartData(
                                                        repositoryUrl,
                                                        chartName,
                                                        chartVersion,
                                                        auth,
                                                );
                                                
                                                // Return the requested data
                                                if (operation === 'getDefaultValues') {
                                                        returnData.push({
                                                                json: {
                                                                        success: true,
                                                                        values: chartData.values || {},
                                                                },
                                                        });
                                                } else if (operation === 'getChartMetadata') {
                                                        returnData.push({
                                                                json: {
                                                                        success: true,
                                                                        metadata: chartData.metadata || {},
                                                                },
                                                        });
                                                }
                                        }
                                }
                        } catch (error) {
                                if (this.continueOnFail()) {
                                        returnData.push({
                                                json: {
                                                        success: false,
                                                        error: error.message,
                                                },
                                        });
                                        continue;
                                }
                                throw error;
                        }
                }
                
                return [returnData];
        }
}
