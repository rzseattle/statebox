import { MonitorOverwrite } from "../common-interface/IMessage";

export interface IMonitor {
    id: string;
    title: string;
    description: string;
    jobs: IJob[];
    labels: string[];
    modified: number;
    overwriteStrategy: MonitorOverwrite;
}

export interface IJob {
    id: string;
    title: string;
    labels: string[];
    description: string;
    progress: { current: number; end: number };
    currentOperation: string;
    logs: string[];
    errorLogs: string[];
    done: boolean;
    error: boolean;
}

//dodac monitor life time and log rotation

class Structure {
    public monitors: IMonitor[] = [];

    public getMonitor = (monitorId: string, labels: string[], overwriteStrategy: MonitorOverwrite): IMonitor | null => {
        let index = structure.monitors.findIndex((el) => el.id === monitorId);
        if (index !== -1) {
            return this.monitors[index];
        } else if (overwriteStrategy !== MonitorOverwrite.CreateNew) {
            index = structure.monitors.findIndex((el) => {
                if (
                    el.labels.length > 0 &&
                    el.labels.length === labels.length &&
                    el.labels.join("") === labels.join("")
                ) {
                    return true;
                }
            });

            if (index !== -1) {
                return this.monitors[index];
            } else {
                console.log(
                    structure.monitors.map((el) => {
                        console.log(el.labels.join("") + "=== " + labels.join(""));
                    }),
                );
                console.log("nie znalazłem");
            }
        }
        return null;
    };

    public registerMonitor = (monitor: IMonitor) => {
        this.monitors.push(monitor);
    };
    public unregisterMonitor = (monitor: IMonitor) => {
        const index = structure.monitors.findIndex((el) => el.id === monitor.id);
        if (index !== -1) {
            structure.monitors.splice(index, 1);
        }
    };

    public getAll() {
        return this.monitors;
    }

    findMonitorByLabels(labels: string[]): IMonitor | null {
        const index = this.monitors.findIndex((el) => {
            if (el.labels.length > 0 && el.labels.length === labels.length && el.labels.join("") === labels.join("")) {
                return true;
            }
        });

        if (index !== -1) {
            return this.monitors[index];
        }

        return null;
    }

    findJobByLabels(monitorId: string, labels: string[]): IJob | null {
        const monitor = this.getMonitor(monitorId, [], MonitorOverwrite.Join);

        if (monitor !== null) {
            const index = monitor?.jobs.findIndex((el) => {
                if (
                    el.labels.length > 0 &&
                    el.labels.length === labels.length &&
                    el.labels.join("") === labels.join("")
                ) {
                    return true;
                }
            });

            if (index !== -1) {
                return monitor.jobs[index];
            }
        }

        return null;
    }
}

export const structure = new Structure();
