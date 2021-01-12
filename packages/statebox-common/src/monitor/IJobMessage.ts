import { IMonitorMessage } from "./IMonitorMessage";
import { ILogKindMessage } from "./ILogKindMessage";

export interface IMessage {
    type: "log" | "job";
    monitorId: string;
}

export interface ILogMessage extends IMessage {
    type: "log";
}
export interface IJobMessage extends IMessage {
    type: "job";
    name: string;
    jobId: string;
    title?: string;
    description: string;
    labels: string[];
    progress: { current: number; end: number };
    currentOperation: string;
    logsPart: ILogKindMessage[];
    done: boolean;
    error: boolean;
    monitorData?: IMonitorMessage;
    data: any;
}
