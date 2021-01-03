import { WEBSOCKET_CLOSE_REASONS, WEBSOCKET_STATUS } from "./SocketEnums";

import {
    ChangeListener,
    IConfig,
    IJob,
    IMonitor,
    MessageListener,
    StatusListener,
} from "./Interfaces";

export class StatusServerClient {
    private status: WEBSOCKET_STATUS;
    private connectionStatusListener: StatusListener = null;
    private messageListener: MessageListener;
    private changeListener: MessageListener;
    private error: string = null;
    private id: string = null;
    private monitors: Array<IMonitor> = [];

    private config: IConfig = {
        authKey: "",
        tracked: {
            monitorIds: [],
            monitorLabels: [],
            jobIds: [],
            jobLabels: [],
        },
    };

    constructor(
        private connection: WebSocket,
        private _reconnectTimeout = 15000,
        config: {
            authKey?: string;
            tracked?: {
                monitorIds?: Array<string>;
                monitorLabels?: Array<string>;
                jobIds?: Array<string>;
                jobLabels?: Array<string>;
            };
        }
    ) {
        if (config.authKey !== undefined) {
            this.config.authKey = config.authKey;
        }
        if (config.tracked !== undefined) {
            this.config.tracked = { ...this.config.tracked, ...config.tracked };
        }
    }

    private wsOnOpen = () => {
        this.error = "";
        this.connectionStatusChanged(WEBSOCKET_STATUS.CONNECTED);
        this.configureClient();
    };

    private wsOnMessage = (event: MessageEvent<any>) => {
        const message = JSON.parse(event.data);

        if (message.event === "listener-register") {
            this.id = message.id;
        } else {
            this.processMessage(message);
        }
    };
    private wsOnError = () => {
        this.connectionStatusChanged(WEBSOCKET_STATUS.ERROR);
        this.connection.close();
    };

    private wsOnClose = (event: CloseEvent) => {
        const reason = WEBSOCKET_CLOSE_REASONS[event.code] ?? "unknow reason";
        this.error = reason;
        this.connectionStatusChanged(WEBSOCKET_STATUS.NOT_CONNECTED);

        this.monitors = [];
        if (this.changeListener) {
            this.changeListener(this.monitors);
        }

        if (this._reconnectTimeout > 0) {
            setTimeout(() => {
                this.connectionStatusChanged(WEBSOCKET_STATUS.RECONNECTING);
                this.connect();
            }, this._reconnectTimeout);
        } else {
            this.connectionStatusChanged(WEBSOCKET_STATUS.NOT_CONNECTED);
        }
    };

    connect = async (): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            //this.connection = this._websockets;
            this.connection.addEventListener("open", () => {
                this.wsOnOpen();
                resolve(true);
            });

            this.connection.addEventListener("message", this.wsOnMessage);
            this.connection.addEventListener("error", this.wsOnError);

            this.connection.addEventListener("close", (event) => {
                this.wsOnClose(event);
                if (this._reconnectTimeout <= 0) {
                    reject(new Error("Status server connection is closed"));
                }
            });
        });
    };

    public getId = (): Promise<string> => {
        return new Promise<string>((resolve, reject) => {
            if (this.id !== undefined) {
                resolve(this.id);
            } else {
                let interval = 0;
                let counter = 0;
                // @ts-ignore
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
    };

    setTrackingIds(monitorIds: Array<string>, jobIds: Array<string> = []) {
        this.config.tracked.monitorIds = monitorIds;
        this.config.tracked.jobIds = jobIds;
    }

    setTrackingLabels(
        monitorLabels: Array<string>,
        jobLabels: Array<string> = []
    ) {
        this.config.tracked.monitorLabels = monitorLabels;
        this.config.tracked.jobLabels = jobLabels;
    }

    public setMessageListener = (listener: MessageListener) => {
        this.messageListener = listener;
    };
    public setChangeListener = (listener: ChangeListener) => {
        this.changeListener = listener;
    };

    public setStatusListener = (listener: StatusListener) => {
        this.connectionStatusListener = listener;
    };

    public getError = (): string => {
        return this.error;
    };

    private connectionStatusChanged = (newStatus: WEBSOCKET_STATUS) => {
        this.status = newStatus;
        if (this.connectionStatusListener !== null) {
            this.connectionStatusListener(this.status);
        }
    };

    configureClient = () => {
        this.connection.send(JSON.stringify(this.config));
    };

    public clearJob = async (monitorId: string, job: IJob) => {
        // alert("cleruje jak holera" + job.id);
        this.connection.send(
            JSON.stringify({
                action: "remove-job",
                monitorId,
                listenerId: await this.getId(),
                jobId: job.id,
            })
        );
    };
    private maxLogSize = 20;
    private processMessage(message: any) {
        let monitor: IMonitor;
        let index: number;

        switch (message.event) {
            case "job-update": {
                index = this.monitors.findIndex(
                    (el) => el.id === message.monitorId
                );
                monitor = this.monitors[index];
                index = monitor.jobs.findIndex(
                    (el) => el.id === message.job.id
                );

                monitor.jobs[index] = {
                    ...monitor.jobs[index],
                    ...message.job,
                };

                break;
            }
            case "job-new": {
                index = this.monitors.findIndex(
                    (el) => el.id === message.monitorId
                );
                monitor = this.monitors[index];
                monitor.jobs = [...monitor.jobs, message.job];
                break;
            }
            case "monitor-new": {
                index = this.monitors.findIndex(
                    (el) => el.id === message.monitorId
                );
                this.monitors.push(message.monitor);
                break;
            }
            case "monitor-remove": {
                index = this.monitors.findIndex(
                    (el) => el.id === message.monitor.id
                );
                if (index !== -1) {
                    this.monitors.splice(index, 1);
                }
                break;
            }
            case "init-info": {
                message.monitors.forEach((el: IMonitor) => {
                    this.monitors.push(el);
                });
                break;
            }
        }
        for (const currMonitor of this.monitors) {
            for (const jobIndex in currMonitor.jobs) {
                if (currMonitor.jobs[jobIndex].logs.length >= this.maxLogSize) {
                    currMonitor.jobs[jobIndex].logs = currMonitor.jobs[
                        jobIndex
                    ].logs.slice(
                        currMonitor.jobs[jobIndex].logs.length - this.maxLogSize
                    );
                }
            }
        }

        if (this.messageListener !== null) {
            this.messageListener(message);
        }
        if (this.changeListener !== null) {
            this.changeListener(this.monitors);
        }
    }
}
