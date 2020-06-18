export interface IMessage {
    type: "log" | "job";
    monitorId: string;
}

export interface ILogMessage extends IMessage {
    type: "log";
}
export interface IJobMessage extends IMessage {
    type: "job";
    monitorId: string;
    jobId: string;
    name: string;
    title: string;
    description: string;
    progress: { current: number; end: number };
    currentOperation: string;
    logsPart: string[];
    logsErrorPart: string[];
    monitorData?: {
        name: string;
        title: string;
        description: string;
        labels: string[];
    };
}
