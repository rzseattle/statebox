export interface IMonitor {
    id: string;
    name: string;
    title: string;
    description: string;
    jobs: IJob[];
    labels: string[];
    modified: number;
}

export interface IJob {
    id: string;
    name: string;
    title: string;
    description: string;
    progress: { current: number; end: number };
    currentOperation: string;
    logs: string[];
    errorLogs: string[];
    done: boolean;
    error: boolean;
}

class Structure {
    public monitors: IMonitor[] = [];

    public getMonitor = (monitorId: string): IMonitor | null => {
        const index = structure.monitors.findIndex((el) => el.id === monitorId);
        if (index !== -1) {
            return this.monitors[index];
        }
        return null;
    };

    public registerMonitor = (monitor: IMonitor) => {
        this.monitors.push(monitor);
    };
    public unregisterMonitor = (monitor: IMonitor) => {
        this.monitors.push(monitor);
    };

    public getAll() {
        return this.monitors;
    }
}

export const structure = new Structure();
