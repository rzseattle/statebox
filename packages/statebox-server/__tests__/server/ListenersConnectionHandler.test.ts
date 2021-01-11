import * as NodeWS from "ws";
import { Logger } from "../../src/lib/Logger";
import { ListenersConnectionHandler } from "../../src/server/ListenersConnectionHandler";
import { Listeners } from "../../src/structure/Listeners";
import { StateboxEventsRouter } from "../../src/structure/StateboxEventsRouter";

describe("Monitor websockets test", () => {
    it("Websockets test", async () => {
        let connection;
        let server;
        await new Promise((resolve) => {
            const listeners = new Listeners(new StateboxEventsRouter());
            server = new ListenersConnectionHandler(new Logger(), 5000, listeners);

            return server.init().then(() => {
                connection = new NodeWS("ws://localhost:5000", { timeout: 1000 });
                connection.on("open", () => {
                    connection.send("{}");
                    setTimeout(async () => {
                        expect(listeners.getAll().size).toEqual(1);
                        connection.close();
                    }, 100);
                });

                connection.on("close", () => {
                    setTimeout(async () => {
                        expect(listeners.getAll().size).toEqual(0);
                        await server.close();
                        resolve(true);
                    }, 50);
                });
            });
        });
    });
});
