import { MonitorConnectionHandler } from "../../dist/server/MonitorsConnectionHandler";
import * as NodeWS from "ws";
import { Logger } from "../../src/lib/Logger";

describe("Monitor websockets test", () => {
    it("Websockets test", async () => {
        let connection;
        let monitor;
        await new Promise((resolve) => {
            monitor = new MonitorConnectionHandler(new Logger(), 5000, {
                process: async (message) => {
                    expect(message.message).toEqual("test");
                    connection.close();
                    await monitor.close();
                    resolve(false);
                },
            });

            return monitor.init().then(() => {
                connection = new NodeWS("ws://localhost:5000", { timeout: 1000 });
                connection.on("open", () => {
                    connection.send(JSON.stringify({ message: "test" }));
                });
            });
        });
    });
});
