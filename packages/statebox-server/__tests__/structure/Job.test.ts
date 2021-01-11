import { Monitor } from "../../src/structure/Monitor";
import { StateboxServer } from "../../src/server/StateboxServer";
import { Job } from "../../src/structure/Job";

describe("Jobs structure & events test", () => {
    it("Listener add test", () => {
        const server = new StateboxServer();

        const spyAddListener = jest.spyOn(server.multiplexer, "addListener");

        server.listeners.add({ id: "testID", tracked: {}, commChannel: { send: (_msg) => {}, close: () => {} } });
        expect(server.listeners.getAll().size).toEqual(1);
        expect(spyAddListener).toHaveBeenCalled();
    });

    it("Listener remove test", () => {
        const server = new StateboxServer();

        const spyRemoveListener = jest.spyOn(server.multiplexer, "removeListener");

        server.listeners.add({ id: "testID", tracked: {}, commChannel: { send: (_msg) => {}, close: () => {} } });

        server.listeners.remove("testID");

        expect(server.listeners.getAll().size).toEqual(0);
        expect(spyRemoveListener).toHaveBeenCalled();
    });

    it("Job add test", () => {
        const server = new StateboxServer();

        const spyAddJobMultiplexer = jest.spyOn(server.multiplexer, "addJob");
        const spyAddJobInformation = jest.spyOn(server.informator, "jobAdded");

        const monitor = new Monitor("test-monitor", []);
        server.monitors.add(monitor);

        const job = new Job(monitor.id, "test-job", "job-name", [], null);
        monitor.addJob(job);

        expect(server.monitors.getAll().length).toEqual(1);
        expect(spyAddJobMultiplexer).toHaveBeenCalled();
        expect(spyAddJobInformation).toHaveBeenCalled();
    });

    it("Job update test", () => {
        const server = new StateboxServer();

        const spyAddJobInformation = jest.spyOn(server.informator, "jobUpdated");

        const monitor = new Monitor("test-monitor", []);
        server.monitors.add(monitor);

        const job = new Job(monitor.id, "test-job", "job-name", [], null);
        monitor.addJob(job);

        job.consumeInputData({ done: true });

        expect(server.monitors.getAll().length).toEqual(1);
        expect(spyAddJobInformation).toHaveBeenCalledTimes(1);
    });

    it("Job remove test", () => {
        const server = new StateboxServer();

        const spyRemoveJobMultiplexer = jest.spyOn(server.multiplexer, "removeJob");
        const spyRemoveJobInformation = jest.spyOn(server.informator, "jobRemoved");

        const monitor = new Monitor("test-monitor", []);
        server.monitors.add(monitor);

        const job = new Job(monitor.id, "test-job", "job-name", [], null);
        monitor.addJob(job);

        monitor.removeJob(monitor.getJobById("test-job"));

        expect(server.monitors.getAll().length).toEqual(1);
        expect(spyRemoveJobMultiplexer).toHaveBeenCalled();
        expect(spyRemoveJobInformation).toHaveBeenCalled();
    });
});
