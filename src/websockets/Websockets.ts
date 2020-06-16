import WebSocket from "ws";
import { messageProcessor } from "../message-processor/MessageProcessor";

class MyWebsockets {
    private wss: WebSocket.Server;
    constructor() {
        this.wss = new WebSocket.Server({ port: 3011 });
        this.wss.on("connection", function connection(ws) {
            ws.on("message", function incoming(message) {
                try {
                    messageProcessor.process(JSON.parse(message.toString()));
                } catch (e) {
                    console.log("Error while processing message");
                }
            });
        });
    }

    public informClients = (data: any) => {
        console.log("informing clients");
        this.wss.clients.forEach((ws) => {
            ws.send(JSON.stringify(data));
        });
    };
}

export const websockets = new MyWebsockets();
