import {Monitors} from "../monitor/Monitors";

export interface IJob {
    id: string;
    name: string;
    title: string;
    description: string;
    progress: { current: number; end: number };
}

export interface IMonitor {
    id: string;
    name: string;
    title: string;
    description: string;
    jobs: IJob[];
    modified: number;
}

class Structure {
    public monitors: IMonitor[] = [];

    public getMonitor = (monitorId: string): IMonitor | null => {
        const index = structure.monitors.findIndex((el) => el.id === monitorId);
        if (index !== -1) {
            return this.monitors[index];
        }
        return null;
    }

    public registerMonitor = (monitor: IMonitor) => {
        this.monitors.push(monitor);
    };
    public unregisterClient = (clientId: string) => {
    };

    public registerClientJob = (clientId: string, data: Partial<IJob>) => {
    };
    public unregisterClientJob = (clientId: string, jobId: string) => {
    };

    public getAll() {
        return this.monitors;
    }
}


export const structure = new Structure();
