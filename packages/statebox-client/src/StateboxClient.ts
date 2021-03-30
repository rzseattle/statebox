import { WEBSOCKET_CLOSE_REASONS, WEBSOCKET_STATUS } from "./SocketEnums";

import {
    ChangeListener,
    IConfig, IUnifiedWebsockets,
    MessageListener,
    StatusListener,
} from "./Interfaces";
import { MessageProcessor } from "./MessageProcessor";
import { State } from "./State";
import { Actions } from "./Actions";

export class StateboxClient {
    private status: WEBSOCKET_STATUS;
    private connectionStatusListener: StatusListener = null;
    private messageListener: MessageListener = null;
    private changeListener: MessageListener = null;
    private error: string = null;
    private id: string = null;
    private readonly processor: MessageProcessor;
    private readonly state: State;
    private maxLogSize = 20;
    public actions;

    private config: IConfig = {
        tracked: [],
    };

    constructor(
        private connection: IUnifiedWebsockets,
        private _reconnectTimeout = 15000,
        config: IConfig
    ) {
        this.config = config;

        this.state = new State();
        this.processor = new MessageProcessor(this.state, this.maxLogSize);
    }

    private wsOnOpen = async () => {
        this.error = "";
        this.connectionStatusChanged(WEBSOCKET_STATUS.CONNECTED);
        this.configureClient();
        this.actions = new Actions(await this.getId(), this.connection);
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

        this.state.monitors = [];
        if (this.changeListener) {
            this.changeListener(this.state.monitors);
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
            if (this.id !== null) {
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

    private processMessage(message: any) {
        this.processor.process(message);

        if (this.messageListener !== null) {
            this.messageListener(message);
        }
        if (this.changeListener !== null) {
            this.changeListener(this.state.monitors);
        }
    }
}
