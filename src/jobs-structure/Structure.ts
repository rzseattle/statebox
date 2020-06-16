export interface IJob {
    id: string;
    name: string;
    title: string;
    description: string;
    progress: { current: number; end: number };
}

export interface IClient {
    id: string;
    name: string;
    title: string;
    description: string;
    jobs: IJob[];
    modified: number;
}

class Structure {
    public clients: IClient[] = [];

    public registerClient = (data: Partial<IClient>) => {};
    public unregisterClient = (clientId: string) => {};

    public registerClientJob = (clientId: string, data: Partial<IJob>) => {};
    public unregisterClientJob = (clientId: string, jobId: string) => {};
}


export const structure = new Structure();
