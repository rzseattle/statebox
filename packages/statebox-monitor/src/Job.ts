import { Monitor, UpdateRequestConn } from "./Monitor";
import { IJobMessage, ILogKindMessage, LogMessageTypes } from "statebox-common";

export class Job {
    private client: Monitor;
    public progressFlag: { current: number; end: number } | null = null;
    private readonly id: string;
    public _title: string;
    private _description: string;
    private currentOperation: string | null = null;
    private logKindMessage: ILogKindMessage[] = [];
    private updateRequestor: UpdateRequestConn;

    private readonly labels: string[];
    private dataToTransport: any = null;

    get title(): string {
        return this._title;
    }

    set title(value: string) {
        this._title = value;
        this.requestSend();
    }
    get description(): string {
        return this._description;
    }

    set description(value: string) {
        this._description = value;
        this.requestSend();
    }

    private _isError = false;
    get isError(): boolean {
        return this._isError;
    }
    set isError(value: boolean) {
        this._isError = value;
        this.requestSend();
    }

    public getId(): string {
        return this.id;
    }

    private _isDone = false;
    get isDone(): boolean {
        return this._isDone;
    }
    public set isDone(value: boolean) {
        this._isDone = value;
        this.requestSend();
    }

    public setDone(value: boolean) {
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

    constructor(data: { id: string } & Partial<IJobMessage>, client: Monitor) {
        this.client = client;
        //because every job should have own throttling request
        this.updateRequestor = this.client.requestUpdaterProvider();
        this.id = data.id;
        this._description = data.description ?? "";
        this._title = data.title ?? "";
        this.labels = data.labels ?? [];
    }

    private timeout: number = -1;
    private lastSend: number = -1;

    private requestSend() {
        const data = {
            title: this._title,
            description: this._description,
            progress: this.progressFlag,
            currentOperation: this.currentOperation,
            logsPart: this.logKindMessage,
            done: this.isDone,
            error: this._isError,
            labels: this.labels,
            data: this.dataToTransport,
        };

        const throttle = 300;
        const calculated = this.lastSend - Date.now() + throttle;

        clearTimeout(this.timeout);
        this.lastSend = Date.now();
        if (calculated < 0) {
            this.updateRequestor(this.id, data, () => {
                this.logKindMessage = [];
            });
        } else {
            // @ts-ignore
            this.timeout = setTimeout(() => {
                this.updateRequestor(this.id, data, () => {
                    this.logKindMessage = [];
                });
            }, calculated);
        }
    }

    public progress = (current: number, end?: number) => {
        this.progressFlag = { current, end: end ? end : this.progressFlag?.end ?? 100 };
        this.requestSend();
    };
    public log = (text: string | string[], messageType: LogMessageTypes = LogMessageTypes.INFO) => {
        if (Array.isArray(text)) {
            if (this.isLoggingToConsole) {
                text.forEach((line) => console.log(line));
            }
            this.logKindMessage = [
                ...this.logKindMessage,
                ...text.map((entry): ILogKindMessage => {
                    return {
                        type: messageType,
                        time: Date.now(),
                        msg: entry,
                    };
                }),
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
        this.client.requestAction("job", this.id, "cleanup");
    };

    public remove = () => {
        this.client.requestAction("job", this.id, "remove");
    };
}
