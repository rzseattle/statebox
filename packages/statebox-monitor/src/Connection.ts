import * as NodeWS from "ws";
import { nanoid } from "nanoid";
import { Monitor } from "./Monitor";
import { MonitorOverwrite } from "statebox-common";
import {Logger} from "./lib/Logger";


interface IPendingRequest {
    elementType: "monitor" | "job" ;
    monitorId: string | null;
    time: number;
    controlKey1: string;
    controlKey2: string;
    resolve: (result: any) => any;
}

export class Connection {
    private connection!: NodeWS;
    private browserConnection!: WebSocket;

    private readonly url: string;

    private reconnectTimeoutToClear: any = -1;

    private idRequestsPending: IPendingRequest[] = [];
    private onReconnectCallback: (() => any) | null = null;

    private logger: Logger;

    constructor(url: string, private _reconnectTimeout = 15000) {
        this.url = url;
        this.logger = new Logger();
    }

    get reconnectTimeout(): number {
        return this._reconnectTimeout;
    }

    set reconnectTimeout(value: number) {
        this._reconnectTimeout = value;
    }

    onReconnect = (callback: () => any) => {
        this.onReconnectCallback = callback;
    };

    public connect = async () => {
        if (typeof window === "undefined") {

            return this.connectInNode();
        } else {
            return this.connectInBrowser();
        }
    };

    public close = async () => {
        return new Promise((resolve) => {
            this.connection.on("close", () => resolve(null));
            this.connection.close();
        });
    };

    public send = (message: any) => {
        try {
            const str = JSON.stringify(message);

            if (typeof window === "undefined") {
                this.connection.send(str);
            } else {
                this.browserConnection.send(JSON.stringify(str));
            }
        } catch (er) {

            console.error("---------------------------------");
            console.error("Can't send message");
            this.logger.debug(message);
            console.trace();
            console.error("---------------------------------");
        }
    };

    public requestId = async (
        type: "monitor" | "job",
        monitor: Monitor | null = null,
        job: { name: string; labels: string[] } | null = null,
    ): Promise<string> => {
        let monitorId: string | null = null;
        if (monitor && type === "job") {
            monitorId = await monitor.getId();
        }
        return new Promise((resolve) => {
            const request = {
                elementType: type,
                monitorId,
                controlKey1: nanoid(),
                controlKey2: nanoid(),
                time: new Date().getMilliseconds(),
                resolve,
            };
            this.idRequestsPending.push(request);
            this.send({
                type: "id-request",
                overwriteStrategy: monitor?.config.overwriteStrategy || MonitorOverwrite.CreateNew,
                monitorLabels: monitor?.config.labels,
                jobLabels: job?.labels || [],
                elementType: request.elementType,
                monitorId: request.monitorId,
                controlKey1: request.controlKey1,
                controlKey2: request.controlKey2,
                time: request.time,
                data: {
                    monitor: {
                        title: monitor?.config.title || "",
                        description: monitor?.config.description || "",
                    },
                    job,
                },
            });
        });
    };

    private onMessage = (input: string) => {
        try {
            const data = JSON.parse(input);

            if (data.type !== undefined && data.type === "id-response") {
                const index = this.idRequestsPending.findIndex((el) => {
                    if (
                        el.controlKey1 === data.controlKey1 &&
                        el.controlKey2 === data.controlKey2 &&
                        el.time === data.time &&
                        el.elementType === data.elementType
                    ) {
                        return true;
                    }
                    return false;
                });
                if (index !== -1) {
                    this.idRequestsPending[index].resolve(data.id);
                    this.idRequestsPending.splice(index, 1);
                } else {
                    console.error({
                        msg: "Not found data to connect key",
                    });
                }
            }
        } catch (ex) {
            this.logger.debug("Unexpected message: " + input);
            this.logger.debug(ex);
        }
    };

    private connectInNode = async (): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            this.connection = new NodeWS(this.url, { timeout: 1000 });
            this.connection.on("open", () => {
                if (this.onReconnectCallback !== null) {
                    this.onReconnectCallback();
                }
                clearTimeout(this.reconnectTimeoutToClear);
                resolve(true);
            });

            this.connection.on("error", () => {
                this.logger.debug("Status server connection error");
            });

            this.connection.on("message", (messageEvent: NodeWS.MessageEvent) => {
                // @ts-ignore
                this.onMessage(messageEvent as string);
            });

            this.connection.on("close", () => {
                this.logger.debug(
                    "Status server connection is closed [ " +
                        this.url +
                        " ] Trying to open in " +
                        this._reconnectTimeout / 1000 +
                        " s",
                );
                if (this._reconnectTimeout === 0) {
                    reject(new Error("Status server connection is closed"));
                } else {
                    this.logger.error("Cant connect to: " + this.url );
                    this.reconnectTimeoutToClear = setTimeout(() => {
                        this.connect();
                    }, this._reconnectTimeout);
                }
            });
        });
    };
    private connectInBrowser = async (): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            this.browserConnection = new window.WebSocket(this.url);
            this.browserConnection.addEventListener("open", () => {
                this.logger.debug("connection is opened");
                if (this.onReconnectCallback !== null) {
                    this.onReconnectCallback();
                }
                clearTimeout(this.reconnectTimeoutToClear);
                resolve(true);
            });

            this.browserConnection.addEventListener("error", () => {
                this.logger.debug("Status server connection error");
            });

            this.browserConnection.addEventListener("message", (e) => {
                this.onMessage(e.data);
            });

            this.browserConnection.addEventListener("close", () => {
                this.connection.on("close", () => {
                    this.logger.debug(
                        "Status server connection is closed [ " +
                            this.url +
                            " ] Trying to open in " +
                            this._reconnectTimeout / 1000 +
                            " s",
                    );

                    if (this._reconnectTimeout === 0) {
                        reject(new Error("Status server connection is closed"));
                    } else {
                        this.reconnectTimeoutToClear = setTimeout(() => {
                            this.connect();
                        }, this._reconnectTimeout);
                    }
                });
            });
        });
    };
}
