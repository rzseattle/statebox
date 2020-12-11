import { MonitorOverwrite } from "../common-interface/IMessage";
import { informator } from "../informator/Informator";
import { multiplexer } from "./Multiplexer";

export interface IMonitor {
    id: string;
    title: string;
    description: string;
    jobs: IJob[];
    labels: string[];
    modified: number;
    overwriteStrategy: MonitorOverwrite;
    authKey: string;
    logRotation: number;
    lifeTime: number;
    canClientDoAction: boolean;
}

export interface IJob {
    id: string;
    name: string;
    title: string;
    labels: string[];
    description: string;
    progress: { current: number; end: number };
    currentOperation: string;
    logs: ILogMessage[];
    done: boolean;
    data: any;
    error: boolean;
}

export interface ILogMessage {
    key: number;
    type: LogMessageTypes;
    msg: string;
    time: number;
}
export enum LogMessageTypes {
    DEBUG,
    INFO,
    NOTICE,
    WARNING,
    ERROR,
    CRITICAL,
    ALERT,
    EMERGENCY,
}

class Structure {
    public monitors: IMonitor[] = [];

    public getMonitor = (
        monitorId: string,
        labels: string[],
        overwriteStrategy: MonitorOverwrite | null,
    ): IMonitor | null => {
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
            }
        }
        return null;
    };

    public registerMonitor = (monitor: IMonitor) => {
        console.log("++++++++++++++++++++++   rejestruje ten holerny monitor");
        this.monitors.push(monitor);
        // add monitor to routing
        multiplexer.addMonitor(monitor);
        // inform listeners about new monitor
        informator.monitorAdded(monitor);
    };
    public unregisterMonitor = (monitor: IMonitor) => {
        const index = structure.monitors.findIndex((el) => el.id === monitor.id);
        if (index !== -1) {
            informator.monitorRemoved(monitor);
            structure.monitors.splice(index, 1);
        }
    };

    public registerJob = (monitor: IMonitor, job: IJob) => {
        const index = structure.monitors.findIndex((el) => el.id === monitor.id);
        structure.monitors[index].jobs.push(job);
        // add job to routing
        multiplexer.addJob(monitor, job);
        // inform listeners about new event
        informator.jobAdded(monitor, job);
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
            // console.log(el.labels.join(",") + " === " + labels.join(","));
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
        } else {
            console.log("to ja kurła monitora nie znajduje " + monitorId);
        }

        return null;
    }
}

// @ts-ignore
export const structure = new Structure();
