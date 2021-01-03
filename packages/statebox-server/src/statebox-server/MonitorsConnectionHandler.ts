import * as WebSocket from "ws";
import { nanoid } from "nanoid";
import { listenerActions } from "../listener-actions/ListenerActions";
import { IIdWebsocket, Listeners } from "../structure/Listeners";

export class ListenersConnectionHandler {
    private server!: WebSocket.Server;
    constructor(private port: number, private listeners: Listeners) {}

    public init = async () => {
        console.log("Init listeners listener on 3012 " + this.port);
        this.server = new WebSocket.Server({ port: this.port });

        this.server.on("connection", (ws) => {
            // Generating new unique id for listener
            // @ts-ignore
            ws.id = nanoid();

            ws.on("message", (message) => {
                const parsed: any = JSON.parse(message.toString());
                // inserting new listener and id into listeners
                try {
                    if (parsed.action !== undefined) {
                        if (parsed.action === "remove-job") {
                            listenerActions.removeJob(parsed.monitorId, parsed.jobId, parsed.listenerId);
                        }
                    } else {
                        this.listeners.add(ws as IIdWebsocket, parsed);
                    }
                } catch (ex) {
                    console.log(ex);
                }
            });

            ws.on("close", () => {
                // @ts-ignore
                console.log("closing " + ws.id);
                this.listeners.remove((ws as IIdWebsocket).id);
            });
            ws.on("error", () => {
                console.log("error in listener");
                this.listeners.remove((ws as IIdWebsocket).id);
            });
        });
    };
}
