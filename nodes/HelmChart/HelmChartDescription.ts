import { INodeTypeDescription } from 'n8n-workflow';

import { helmChartOperations, helmChartFields } from './HelmChart.node.options';

export const helmChartDescription: INodeTypeDescription = {
	displayName: 'Helm Chart',
	name: 'helmChart',
	icon: 'file:helm.svg',
	group: ['transform'],
	version: 1,
	subtitle: '={{$parameter["operation"] + ": " + $parameter["resource"]}}',
	description: 'Perform operations on Helm charts',
	defaults: {
		name: 'Helm Chart',
	},
	inputs: ['main'],
	outputs: ['main'],
	credentials: [
		{
			name: 'helmRepositoryCredentials',
			required: false,
		},
	],
	properties: [
		{
			displayName: 'Resource',
			name: 'resource',
			type: 'options',
			noDataExpression: true,
			options: [
				{
					name: 'Helm Chart',
					value: 'helmChart',
				},
			],
			default: 'helmChart',
		},
		...helmChartOperations,
		...helmChartFields,
	],
};
