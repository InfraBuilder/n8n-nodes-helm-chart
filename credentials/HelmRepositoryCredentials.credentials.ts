import { ICredentialType, INodeProperties } from 'n8n-workflow';

export class HelmRepositoryCredentials implements ICredentialType {
	name = 'helmRepositoryCredentials';
	displayName = 'Helm Repository Credentials';
	properties: INodeProperties[] = [
		// Auth for HTTP repositories
		{
			displayName: 'Username',
			name: 'username',
			type: 'string',
			default: '',
			description: 'Username for the Helm repository',
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Password for the Helm repository',
		},
		// Auth for OCI repositories
		{
			displayName: 'Registry Username',
			name: 'registryUsername',
			type: 'string',
			default: '',
			description: 'Username for the OCI registry',
		},
		{
			displayName: 'Registry Password',
			name: 'registryPassword',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Password for the OCI registry',
		},
	];
}
