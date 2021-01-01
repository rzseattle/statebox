import { IJobMessage, ILogKindMessage } from "../common-interface/IMessage";
import { Monitor } from "./Monitor";
import { informator } from "../messenging/Informator";

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

export class Job implements IJob {
    id: string;
    name: string;
    title: string = "";
    labels: string[];
    description: string = "";
    progress: { current: number; end: number } = { current: -1, end: -1 };
    currentOperation: string = "";
    logs: ILogMessage[] = [];
    done: boolean = false;
    data: any = null;
    error: boolean = false;
    monitor: Monitor;

    constructor(monitor: Monitor, id: string, name: string, labels: string[]) {
        this.monitor = monitor;
        this.id = id;
        this.labels = labels;
        this.name = name;

        monitor.addJob(this);
    }

    consumeInputData(jobData: IJobMessage) {
        this.description = jobData.description ?? this.description;
        this.progress = jobData.progress ?? this.progress;
        this.currentOperation = jobData.currentOperation ?? this.currentOperation;
        if (jobData.logsPart && jobData.logsPart.length > 0) {
            this.logs = this.prepareLogsArray(this.logs, jobData.logsPart, this.monitor.logRotation);
        }
        this.title = jobData.title ?? this.title;
        this.done = jobData.done ?? this.done;
        this.error = jobData.error ?? this.error;

        this.data = jobData.data ?? this.data;
    }

    private prepareLogsArray = (
        currentLogsArray: ILogMessage[],
        input: ILogKindMessage[],
        maxLength: number,
    ): ILogMessage[] => {
        let lastKey: number = currentLogsArray.length > 0 ? currentLogsArray[currentLogsArray.length - 1].key : 0;
        const identyfied = input.map((entry) => ({ ...entry, key: ++lastKey }));

        if (currentLogsArray.length === 0 || currentLogsArray.length + identyfied.length > maxLength) {
            return identyfied.length < maxLength ? identyfied : identyfied.slice(input.length - maxLength);
        } else {
            const toCut = currentLogsArray.length + identyfied.length - maxLength;
            return [...currentLogsArray.slice(toCut), ...identyfied];
        }
    };

    cleanup() {
        informator.jobUpdated(this.monitor, this);
        throw new Error("Not implemented cleanup for job");
    }
}
