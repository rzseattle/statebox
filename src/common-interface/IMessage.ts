export interface IMessage {
    type: "log" | "job";
    clientId: string;
}

export interface ILogMessage extends IMessage {
    type: "log";
}
export interface IJobMessage extends IMessage {
    type: "job";
    jobId: string;
    title: string;
    description: string;
    progress: { current: number; end: number };
    currentOperation: string;
}
