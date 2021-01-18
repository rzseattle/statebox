import * as NodeWS from "ws";
import { Logger } from "../../src/lib/Logger";
import { ListenersConnectionHandler } from "../../src/server/ListenersConnectionHandler";
import { Listeners } from "../../src/structure/Listeners";
import { StateboxEventsRouter } from "../../src/structure/StateboxEventsRouter";

describe("Monitor websockets test", () => {
    let connection;
    let server;
    let listeners;
    beforeEach(async () => {
        listeners = new Listeners(new StateboxEventsRouter());
        server = new ListenersConnectionHandler(new Logger(), 5000, listeners);
        await server.init();
    });
    afterEach(async () => {
        await server.close();
    });

    it("Websockets test", async () => {
        await new Promise((resolve) => {
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
