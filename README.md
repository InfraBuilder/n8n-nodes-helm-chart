# n8n-nodes-helm-chart

This is an n8n community node that provides functionality to interact with Helm charts from both HTTP and OCI repositories. It allows you to retrieve chart metadata and default values, making it easy to integrate Helm chart information into your n8n workflows.

> **Created with Replit:** This package was developed using [Replit](https://replit.com), a collaborative browser-based development environment.

## Disclaimer

**USE AT YOUR OWN RISK:** This package is provided as-is without any warranties or guarantees. The author(s) are not responsible for any consequences, damages, or losses that may result from using this software in production environments. Always thoroughly test in a controlled environment before deploying to production systems.

![N8N Helm Chart Node](https://raw.githubusercontent.com/yourusername/n8n-nodes-helm-chart/main/docs/helm-chart-node.png)

## Features

- Retrieve Helm chart metadata (Chart.yaml) from HTTP or OCI repositories
- Retrieve Helm chart default values (values.yaml) from HTTP or OCI repositories
- Support for both HTTP and OCI repository types
- Authentication for private repositories
- Automatic version detection with fallback to latest

## Prerequisites

- n8n version 0.125.0 or later
- Kubernetes knowledge (for understanding Helm charts)

## Installation

### Local Installation (Self-hosted n8n)

1. Go to your n8n installation directory
2. Install the package:
```bash
npm install n8n-nodes-helm-chart
```
3. Restart n8n

### Using n8n-nodes-base.config.js (Self-hosted n8n)

1. In your n8n installation directory, create a file named `n8n-nodes-base.config.js`:
```javascript
module.exports = {
  nodes: [
    'n8n-nodes-helm-chart'
  ],
};
```
2. Install the package:
```bash
npm install n8n-nodes-helm-chart
```
3. Restart n8n

### Docker Installation

If you're using Docker, create a custom Dockerfile:

```dockerfile
FROM n8nio/n8n

# Install your custom node
RUN npm install n8n-nodes-helm-chart
```

Then build and run your custom Docker image:

```bash
docker build -t custom-n8n .
docker run -it --rm -p 5678:5678 custom-n8n
```

### n8n.io (Cloud Hosted)

For n8n.io cloud-hosted instances, you can install this community node from the Community Nodes menu in the settings.

## Usage

After installing the node, you can use it in your n8n workflows:

1. Add a new node and search for "Helm Chart"
2. Select either "Get Chart Metadata" or "Get Default Values" operation
3. Configure the repository URL, chart name, and optional version
4. For private repositories, enable authentication and provide credentials

### Repository URL Format

- HTTP repositories: Must start with `http://` or `https://`
  - Example: `https://charts.helm.sh/stable`

- OCI repositories: Must start with `oci://` or have no scheme
  - Example: `oci://registry.example.com/charts` or `registry.example.com/charts`

### Authentication

For private repositories, you can set up authentication credentials:

1. Go to the Credentials section in n8n
2. Create a new "Helm Repository Credentials" entry
3. For HTTP repositories, fill in the username and password
4. For OCI repositories, fill in the registry username and registry password

## Example Workflows

### Get Default Values for a Chart

1. Add the Helm Chart node
2. Select "Get Default Values" operation
3. Specify repository URL: `https://charts.helm.sh/stable`
4. Specify chart name: `mysql`
5. Leave version blank to get the latest version

### Get Chart Metadata

1. Add the Helm Chart node
2. Select "Get Chart Metadata" operation
3. Specify repository URL: `oci://registry.example.com/charts`
4. Specify chart name: `my-chart`
5. Optional: Specify version if you want a specific version

## License

This project is licensed under the [MIT License](LICENSE).

### Dependencies and their Licenses

- [n8n-core](https://github.com/n8n-io/n8n): MIT License
- [n8n-workflow](https://github.com/n8n-io/n8n): MIT License
- [axios](https://github.com/axios/axios): MIT License
- [js-yaml](https://github.com/nodeca/js-yaml): MIT License
- [oci-registry-js](https://github.com/shizhMSFT/oci-registry-js): MIT License
- [tar](https://github.com/npm/node-tar): ISC License

## Support

If you have any questions or issues, please [open an issue](https://github.com/yourusername/n8n-nodes-helm-chart/issues) on the GitHub repository.

## Contributing

Contributions are welcome! Feel free to submit a pull request with new features, improvements, or bug fixes.

## Acknowledgements

- This node was created to simplify the integration of Helm chart information into n8n workflows
- Inspired by the need to automate tasks related to Kubernetes and Helm in DevOps pipelines

## Legal

This package is not officially associated with or endorsed by n8n, Helm, or any of the repositories it may connect to. All product names, logos, and brands are property of their respective owners.

The author(s) of this package assume no liability for any issues that may arise from its use. By using this package, you agree to the terms of the MIT License and acknowledge that you are using it at your own risk.