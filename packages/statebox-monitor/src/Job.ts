import { Monitor } from "./Monitor";
import { IJobMessage, ILogKindMessage, LogMessageTypes } from "statebox-common";

export class Job {
    private client: Monitor;
    private progressFlag: { current: number; end: number } = { current: -1, end: -1 };
    private readonly id: string;
    private readonly title: string;
    private readonly description: string;
    private currentOperation = "";
    private logKindMessage: ILogKindMessage[] = [];

    private readonly labels: string[];
    private dataToTransport: any = null;

    private _isError = false;
    get isError(): boolean {
        return this._isError;
    }
    set isError(value: boolean) {
        this._isError = value;
        this.requestSend();
    }

    private _isDone = false;
    get isDone(): boolean {
        return this._isDone;
    }
    set isDone(value: boolean) {
        this._isDone = value;
        this.requestSend();
    }

    private _isLoggingToConsole = false;
    get isLoggingToConsole(): boolean {
        return this._isLoggingToConsole;
    }
    set isLoggingToConsole(value: boolean) {
        this._isLoggingToConsole = value;
    }

    constructor(data: { id: string } & IJobMessage, client: Monitor) {
        this.client = client;
        this.id = data.id;
        this.description = data.description ?? "";
        this.title = data.title ?? "";
        this.labels = data.labels ?? [];
    }

    private requestSend() {
        const data = {
            title: this.title,
            description: this.description,
            progress: this.progressFlag,
            currentOperation: this.currentOperation,
            logsPart: this.logKindMessage,
            done: this.isDone,
            error: this._isError,
            labels: this.labels,
            data: this.dataToTransport,
        };

        this.client.requestUpdate(this.id, data, () => {
            this.logKindMessage = [];
        });
    }

    public progress = (current: number, end?: number) => {
        this.progressFlag = { current, end: end ? end : this.progressFlag.end };
        this.requestSend();
    };
    public log = (text: string | string[], messageType: LogMessageTypes = LogMessageTypes.INFO) => {
        if (Array.isArray(text)) {
            if (this.isLoggingToConsole) {
                text.forEach((line) => console.log(line));
            }
            this.logKindMessage = [
                ...this.logKindMessage,
                ...text.map(
                    (entry): ILogKindMessage => {
                        return {
                            type: messageType,
                            time: Date.now(),
                            msg: entry,
                        };
                    },
                ),
            ];
        } else {
            this.logKindMessage.push({
                type: messageType,
                time: Date.now(),
                msg: text,
            });
        }
        this.requestSend();
    };

    public debug = (text: string | string[]) => {
        this.log(text, LogMessageTypes.DEBUG);
    };

    public warning = (text: string | string[]) => {
        this.log(text, LogMessageTypes.WARNING);
    };

    public error = (text: string | string[]) => {
        this.log(text, LogMessageTypes.ERROR);
    };

    public operation = (text: string) => {
        this.currentOperation = text;
        this.requestSend();
    };

    public data = (data: any) => {
        this.dataToTransport = data;
        this.requestSend();
    };

    public cleanup = () => {
        this.client.requestAction("monitor", this.id, "cleanup");
    };

    public remove = () => {
        this.client.requestAction("monitor", this.id, "remove");
    };
}
