import { Job } from "./Job";
import { throttle } from "./lib/throttle";
import { Connection } from "./Connection";
import { extend } from "./lib/extends";
import { IJobMessage, ILogKindMessage, IMonitorMessage, MonitorOverwrite } from "statebox-common";

export class Monitor {
    private connection: Connection;
    private id: string | null = null;
    private isMonitorDataSend = false;
    public readonly config: IMonitorMessage = {
        title: "",
        description: "",
        labels: [],
        listenersAccess: {
            accessToken: null,
            jwtCompareData: null,
        },
        overwriteStrategy: MonitorOverwrite.Join,
        logRotation: 200,
        lifeTime: 3600,
        throttle: 30,
        allowedClientActions: 0,
    };

    public requestUpdate: (
        jobId: string,
        data: {
            title: string;
            description: string;
            progress: { current: number; end: number };
            currentOperation: string;
            logsPart: ILogKindMessage[];
            error: boolean;
            done: boolean;
            data: any;
        },
        onSend: () => any,
    ) => any;

    constructor(connection: Connection, options: IMonitorMessage) {
        this.connection = connection;
        this.config = extend(this.config, options) as IMonitorMessage;

        connection.requestId("monitor", this).then((id) => {
            this.id = id as string;
        });

        connection.onReconnect(() => {
            this.isMonitorDataSend = false;
        });

        if (this.config.throttle === 0) {
            this.requestUpdate = this._requestUpdate;
        } else {
            this.requestUpdate = throttle(this._requestUpdate, this.config.throttle);
        }
    }

    public async getId() {
        return new Promise<string>((resolve, reject) => {
            if (this.id !== null) {
                resolve(this.id);
            } else {
                let interval: any = 0;
                let counter = 0;

                interval = setInterval(() => {
                    if (this.id !== null) {
                        resolve(this.id);
                        clearInterval(interval);
                    }
                    counter++;
                    if (counter === 10) {
                        clearInterval(interval);
                        reject("Cannot get id");
                    }
                }, 10);
            }
        });
    }

    public async createJob(data: IJobMessage): Promise<Job> {
        // waiting for monitor id
        await this.getId();
        const jobId = await this.connection.requestId("job", this, data);
        return new Job(
            {
                id: jobId,
                ...data,
            },
            this,
        );
    }

    private _requestUpdate = (
        jobId: string,
        data: {
            title: string;
            name: string;
            description: string;
            labels: string[];
            progress: { current: number; end: number };
            currentOperation: string;
            logsPart: ILogKindMessage[];
            error: boolean;
            done: boolean;
            data: any;
        },
        onSend: () => any,
    ) => {
        const message: IJobMessage = { type: "job", jobId, monitorId: this.id as string, ...data };
        if (!this.isMonitorDataSend) {
            message.monitorData = this.config;
            this.isMonitorDataSend = true;
        }
        this.connection.send(message);
        onSend();
    };

    public requestAction = async (subjectType: "monitor" | "job", subjectId: string, action: "cleanup" | "remove") => {
        const message = {
            type: "action",
            monitorId: await this.getId(),
            subjectType,
            subjectId,
            action,
        };

        this.connection.send(message);
    };

    public cleanup = async () => {
        this.requestAction("monitor", await this.getId(), "cleanup");
    };

    public remove = async () => {
        this.requestAction("monitor", await this.getId(), "remove");
    };
}
