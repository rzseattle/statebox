import * as WebSocket from "ws";
import { Logger } from "../lib/Logger";

export class MonitorConnectionHandler {
    private server!: WebSocket.Server;
    constructor(private logger: Logger, private _port: number, private messageProcessor) {}

    get port(): number {
        return this._port;
    }

    public init = async () => {
        this.server = new WebSocket.Server({ port: this._port });

        this.server.on("connection", (ws) => {
            this.logger.log("New monitor connection");
            ws.on("message", (message) => {
                try {
                    // passing parsed message to message processor
                    this.messageProcessor.process(JSON.parse(message.toString()), ws);
                } catch (e) {
                    console.log("---------------");
                    console.error("Error while processing message");
                    console.error(e);
                    console.log(e.message);
                    console.log(e.toString());
                    console.log(message);
                    console.log("---------------");
                    // throw new Error("Error while processing message: " + message);
                    console.log("--------------- ");
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
