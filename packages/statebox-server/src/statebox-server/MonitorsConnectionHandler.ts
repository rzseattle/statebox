import * as WebSocket from "ws";


export class MonitorConnectionHandler {
    private server!: WebSocket.Server;
    constructor(private port: number, private messageProcessor) {}

    public init = async () => {
        this.server = new WebSocket.Server({ port: this.port });
        this.server.on("connection", (ws) => {
            ws.on("message", (message) => {
                try {
                    // passing parsed message to message processor
                    this.messageProcessor.process(JSON.parse(message.toString()), ws);
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

    public close = async () => {
        return new Promise((resolve) => {
            this.server.close(() => {
                resolve(null);
            });
        });
    };
}
