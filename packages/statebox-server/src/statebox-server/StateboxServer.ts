import WebSocket from "ws";
import { messageProcessor } from "../messenging/MessageProcessor";
import { nanoid } from "nanoid";
import { IIdWebsocket, listeners } from "../structure/Listeners";
import { listenerActions } from "../listener-actions/ListenerActions";

/**
 * Websockets connector
 */
export class StateboxServer {
    private monitorListener!: WebSocket.Server;
    private listenersListener!: WebSocket.Server;

    constructor(private listenerPort: number = 312, private monitorPort = 311) {}

    public init = () => {
        this.initMonitorListener();
        this.initListenersListener();
    };

    /**
     * New monitor listener
     */
    private initMonitorListener = () => {
        console.log("Init monitors listener on 3011");
        this.monitorListener = new WebSocket.Server({ port: this.monitorPort });
        this.monitorListener.on("connection", (ws) => {
            ws.on("message", (message) => {
                try {
                    // passing parsed message to message processor
                    messageProcessor.process(JSON.parse(message.toString()), ws);
                } catch (e) {
                    console.log("Error while processing message");
                    console.log(e);
                    console.log("------------------");
                    console.log(message);
                    console.log("------------------");
                }
            });
        });
    };

    /**
     * New listener connection listener
     */
    private initListenersListener = () => {
        console.log("Init listeners listener on 3012");
        this.listenersListener = new WebSocket.Server({ port: this.listenerPort });

        this.listenersListener.on("connection", (ws) => {
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
                        listeners.add(ws as IIdWebsocket, parsed);
                    }
                } catch (ex) {
                    console.log(ex);
                }
            });

            ws.on("close", () => {
                // @ts-ignore
                console.log("closing " + ws.id);
                listeners.remove((ws as IIdWebsocket).id);
            });
            ws.on("error", () => {
                console.log("error in listener");
                listeners.remove((ws as IIdWebsocket).id);
            });
        });
    };

    // public informClients = (data: any) => {
    //     console.clear();
    //     this.listenersListener.clients.forEach((ws) => {
    //         ws.send(JSON.stringify(data));
    //     });
    // };
}
