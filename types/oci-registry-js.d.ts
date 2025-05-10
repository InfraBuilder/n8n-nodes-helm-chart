declare module 'oci-registry-js' {
    export class Registry {
        constructor(options: { url: string });
        login(username: string, password: string): Promise<void>;
        listTags(repository: string): Promise<{ tags: string[] }>;
        getManifest(repository: string, reference: string): Promise<{ layers: Array<{ digest: string }> }>;
        getBlob(repository: string, digest: string): Promise<Buffer>;
    }
}

declare module 'js-yaml' {
    export function load(content: string): any;
}