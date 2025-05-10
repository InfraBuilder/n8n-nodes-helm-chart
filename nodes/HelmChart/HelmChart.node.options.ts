import { INodeProperties } from 'n8n-workflow';

export const helmChartOperations: INodeProperties[] = [
        {
                displayName: 'Operation',
                name: 'operation',
                type: 'options',
                noDataExpression: true,
                displayOptions: {
                        show: {
                                resource: ['helmChart'],
                        },
                },
                options: [
                        {
                                name: 'Get Default Values',
                                value: 'getDefaultValues',
                                description: 'Get the default values.yaml from a Helm chart',
                                action: 'Get default values from a helm chart',
                        },
                        {
                                name: 'Get Chart Metadata',
                                value: 'getChartMetadata',
                                description: 'Get the Chart.yaml file from a Helm chart',
                                action: 'Get chart metadata from a helm chart',
                        },
                ],
                default: 'getDefaultValues',
        },
];

export const helmChartFields: INodeProperties[] = [
        /* -------------------------------------------------------------------------- */
        /*                                 helmChart:getDefaultValues                  */
        /* -------------------------------------------------------------------------- */
        {
                displayName: 'Repository URL',
                name: 'repositoryUrl',
                type: 'string',
                required: true,
                default: '',
                description:
                        'URL of the Helm chart repository. For HTTP repositories, start with http:// or https://. For OCI repositories, use oci:// or leave the scheme empty.',
                displayOptions: {
                        show: {
                                resource: ['helmChart'],
                                operation: ['getDefaultValues', 'getChartMetadata'],
                        },
                },
        },
        {
                displayName: 'Chart Name',
                name: 'chartName',
                type: 'string',
                required: true,
                default: '',
                description: 'Name of the Helm chart',
                displayOptions: {
                        show: {
                                resource: ['helmChart'],
                                operation: ['getDefaultValues', 'getChartMetadata'],
                        },
                },
        },
        {
                displayName: 'Chart Version',
                name: 'chartVersion',
                type: 'string',
                required: false,
                default: '',
                description: 'Version of the Helm chart. If not specified, the latest version will be used.',
                displayOptions: {
                        show: {
                                resource: ['helmChart'],
                                operation: ['getDefaultValues', 'getChartMetadata'],
                        },
                },
        },
        {
                displayName: 'Authentication',
                name: 'authentication',
                type: 'boolean',
                default: false,
                description: 'Whether to use authentication for the Helm repository',
                displayOptions: {
                        show: {
                                resource: ['helmChart'],
                                operation: ['getDefaultValues', 'getChartMetadata'],
                        },
                },
        },
        {
                displayName: 'Credentials',
                name: 'credentials',
                type: 'string',
                typeOptions: {
                        credential: 'helmRepositoryCredentials',
                },
                default: '',
                required: true,
                description: 'The credentials to use for authentication',
                displayOptions: {
                        show: {
                                resource: ['helmChart'],
                                operation: ['getDefaultValues', 'getChartMetadata'],
                                authentication: [true],
                        },
                },
        },
];
