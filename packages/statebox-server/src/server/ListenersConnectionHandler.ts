import * as WebSocket from "ws";
import { nanoid } from "nanoid";
import { listenerActions } from "../listener-actions/ListenerActions";
import { IListenerData, Listeners } from "../structure/Listeners";
import { Logger } from "../lib/Logger";

interface IIdWebsocket extends WebSocket {
    id: string;
}

export class ListenersConnectionHandler {
    private server!: WebSocket.Server;
    constructor(private logger: Logger, private _port: number, private listeners: Listeners) {}

    get port(): number {
        return this._port;
    }

    public init = async () => {
        this.server = new WebSocket.Server({ port: this._port });

        this.server.on("connection", (ws) => {
            // Generating new unique id for listener

            const id = nanoid();
            // @ts-ignore
            ws.id = id;

            ws.on("message", (message) => {
                const parsed: any = JSON.parse(message.toString());
                // inserting new listener and id into listeners
                try {
                    if (parsed.action !== undefined) {
                        if (parsed.action === "remove-job") {
                            listenerActions.removeJob(parsed.monitorId, parsed.jobId, parsed.listenerId);
                        }
                    } else {
                        const listener = parsed as IListenerData;
                        listener.commChannel = ws;
                        listener.id = id;
                        this.listeners.add(listener);
                    }
                } catch (ex) {
                    this.logger.log(ex);
                }
            });

            ws.on("close", () => {
                this.logger.log("Closing " + (ws as IIdWebsocket).id);
                this.listeners.remove((ws as IIdWebsocket).id);
            });
            ws.on("error", () => {
                this.logger.log("Error in listener " + (ws as IIdWebsocket).id);
                this.listeners.remove((ws as IIdWebsocket).id);
            });
        });
    };

    public close = async () => {
        return new Promise((resolve) => {
            this.server.close(() => {
                resolve(null);
            });
        });
    };
}
