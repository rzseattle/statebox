import WebSocket from "ws";
import {messageProcessor} from "../message-processor/MessageProcessor";
import {structure} from "../jobs-structure/Structure";

class MyWebsockets {
    private monitorListener!: WebSocket.Server;
    private listenersListener!: WebSocket.Server;

    constructor() {
        this.initMonitorListener();
        this.initListenersListener();
    }

    private initMonitorListener = () => {
        this.monitorListener = new WebSocket.Server({port: 3011});
        this.monitorListener.on("connection", function connection(ws) {
            ws.on("message", function incoming(message) {
                try {
                    messageProcessor.process(JSON.parse(message.toString()));
                } catch (e) {
                    console.log("Error while processing message");
                }
            });
        });
    }

    private initListenersListener = () => {
        this.listenersListener = new WebSocket.Server({port: 3012});
        this.listenersListener.on("connection", function connection(ws) {
            ws.send(JSON.stringify(structure.getAll()));

        });
    }


    public informClients = (data: any) => {
        console.log("informing clients");
        this.listenersListener.clients.forEach((ws) => {
            console.log("got one");
            ws.send(JSON.stringify(data));
        });
    };
}

export const websockets = new MyWebsockets();
