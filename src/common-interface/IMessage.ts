import { IMonitor } from "../structure/Monitor";
import { LogMessageTypes } from "../structure/Job";

export interface IMessage {
    type: "log" | "job" | "id-request" | "action";
    monitorId: string;
}

export interface IIdRequestMessage extends IMessage {
    type: "id-request";
    elementType: "monitor" | "job";
    overwriteStrategy: MonitorOverwrite;
    monitorLabels: string[];
    jobLabels: string[];
    controlKey1: string;
    controlKey2: string;
    time: number;
    data: {
        monitor?: IJobMonitorData;
        job?: IJobMessage;
    };
}

export interface IActionMessage extends IMessage {
    subjectType: string;
    subjectId: string;
    action: "remove" | "cleanup";
}

export enum MonitorOverwrite {
    CreateNew = "new",
    Join = "join",
    Replace = "replace",
}

export interface ILogKindMessage {
    type: LogMessageTypes;
    msg: string;
    time: number;
}
export interface IJobMessage extends IMessage {
    type: "job";
    monitorId: string;
    labels: string[];
    jobId: string;
    name: string;
    title: string;
    description: string;
    progress: { current: number; end: number };
    currentOperation: string;
    logsPart: ILogKindMessage[];
    done: boolean;
    error: boolean;
    data: any;
    monitorData?: IJobMonitorData;
}

export interface IJobMonitorData {
    title: string;
    description: string;
    labels: string[];
    overwriteStrategy: MonitorOverwrite;
    authKey: string;
    logRotation: number;
    canClientDoAction: boolean;
    lifeTime: number;
}
