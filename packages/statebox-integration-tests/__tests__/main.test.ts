import { StateboxServer } from "statebox-server/lib/server/StateboxServer";
import { Connection } from "statebox-monitor";
import { StatusServerClient } from "statebox-client";
import * as NodeWS from "ws";

describe("greeter function", () => {
    let stateboxServer = null;
    const monitorPort = 3011;
    const listenerPort = 3012;
    const listenerAddress = "ws://localhost:" + listenerPort;
    const monitorAddress = "ws://localhost:" + monitorPort;
    beforeEach(() => {
        stateboxServer = new StateboxServer(listenerPort, monitorPort);
        stateboxServer.init();
    });

    afterEach(async () => {
        await stateboxServer.close();
    });

    afterAll(async () => {
        await stateboxServer.close();
    });

    it("Monitor connection test", async () => {
        expect.assertions(1);
        const conn = new Connection(monitorAddress, 0);
        console.log = jest.fn();
        return expect(await conn.connect()).toEqual(true);
    });

    it("Listener connection test", async () => {
        expect.assertions(2);

        const conn = new StatusServerClient(
            new NodeWS(listenerAddress, { timeout: 1000 }),
            0,
            {}
        );
        //console.log = jest.fn();

        expect(await conn.connect()).toEqual(true);
        setTimeout(() => {
            expect(stateboxServer.listeners.getAll().size).toEqual(1);

        }, 300);
    });

    // it("Do server register monitor", async () => {
    //     expect.assertions(1);
    //     const conn = new Connection(monitorAddress, 0);
    //     const monitor = new Monitor(conn,{labels: ["test-label"]});
    //
    //
    //     stateboxServer.
    //
    //     console.log = jest.fn();
    //     return expect(await conn.connect()).toEqual(true);
    // });
});
