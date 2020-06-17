import WebSocket from "ws";
import { messageProcessor } from "../message-processor/MessageProcessor";
import { structure } from "../jobs-structure/Structure";

class MyWebsockets {
    private monitorListener!: WebSocket.Server;
    private listenersListener!: WebSocket.Server;

    constructor() {
        this.initMonitorListener();
        this.initListenersListener();
    }

    private initMonitorListener = () => {
        console.log("Init monitors listener on 3011");
        this.monitorListener = new WebSocket.Server({ port: 3011 });
        this.monitorListener.on("connection", (ws) => {
            ws.on("message", (message) => {
                try {
                    messageProcessor.process(JSON.parse(message.toString()));
                } catch (e) {
                    console.log("Error while processing message");
                }
            });
        });
    };

    private initListenersListener = () => {
        console.log("Init listeners listener on 3012");
        this.listenersListener = new WebSocket.Server({ port: 3012 });
        this.listenersListener.on("connection", function connection(ws) {
            ws.send(JSON.stringify(structure.getAll()));
        });
    };

    public informClients = (data: any) => {
        console.log("informing clients");
        this.listenersListener.clients.forEach((ws) => {
            // console.log("got one: " + JSON.stringify(data));

            ws.send(JSON.stringify(data));
        });
    };
}

export const websockets = new MyWebsockets();
