// import { Connection } from "../src";
// import { Monitor } from "../src";

import { StateboxServer } from "../../statebox-server/src/server/StateboxServer";
import { Connection, Monitor } from "../src";

describe("Monitor tests", () => {
    let server: StateboxServer;
    let connection;
    beforeEach(async () => {
        server = new StateboxServer(4000, 4001);
        await server.init();
        connection = new Connection("ws://localhost:4001");
        await connection.connect();
    });

    afterEach(async () => {
        await server.close();
        await connection.close();
    });

    it("Monitor test", async () => {
        const monitor = new Monitor(connection, { labels: ["label"] });
        const job = await monitor.createJob("job", { labels: ["job-labels"] });
        job.progress(1, 100);
        expect(server.monitors.getAll().length).toEqual(1);
        expect(server.monitors.getAll()[0].jobs.length).toEqual(1);
    });
});
