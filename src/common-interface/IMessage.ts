export interface IMessage {
    type: "log" | "job" | "id-request";
    monitorId: string;
}

export interface IIdRequestMessage extends IMessage {
    type: "id-request";
    elementType: "monitor" | "job";
    controlKey1: string;
    controlKey2: string;
    time: number;
}

export interface ILogMessage extends IMessage {
    type: "log";
}

export enum MonitorOverwrite {
    CreateNew = "new",
    Join = "join",
    Replace = "replace",
}
export interface IJobMessage extends IMessage {
    type: "job";
    monitorId: string;
    labels: string[];
    jobId: string;
    title: string;
    description: string;
    progress: { current: number; end: number };
    currentOperation: string;
    logsPart: string[];
    logsErrorPart: string[];
    done: boolean;
    error: boolean;
    monitorData?: {
        title: string;
        description: string;
        labels: string[];
        overwriteStrategy: MonitorOverwrite;
    };
}
