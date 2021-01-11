import { Monitor } from "../../src/structure/Monitor";
import { StateboxServer } from "../../src/server/StateboxServer";
import { Job } from "../../src/structure/Job";

describe("Monitors structure & events test", () => {
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

    it("Monitor add test", () => {
        const server = new StateboxServer();

        const spyAddMonitorInformation = jest.spyOn(server.informator, "monitorAdded");
        const spyAddMonitor = jest.spyOn(server.multiplexer, "addMonitor");
        server.monitors.add(new Monitor("test-monitor", []));
        expect(server.monitors.getAll().length).toEqual(1);
        expect(spyAddMonitor).toHaveBeenCalled();
        expect(spyAddMonitorInformation).toHaveBeenCalled();
    });

    it("Monitor update test", () => {
        const server = new StateboxServer();

        const spyAddMonitorInformation = jest.spyOn(server.informator, "monitorUpdated");
        const monitor = new Monitor("test-monitor", []);
        server.monitors.add(monitor);
        monitor.consumeInputData({ description: "changed-description" });
        expect(spyAddMonitorInformation).toHaveBeenCalledTimes(1);
    });

    it("Monitor remove test", () => {
        const server = new StateboxServer();

        const spyAddMonitorInformation = jest.spyOn(server.informator, "monitorRemoved");
        const spyAddMonitor = jest.spyOn(server.multiplexer, "removeMonitor");
        const spyRemoveJobMultiplexer = jest.spyOn(server.multiplexer, "removeJob");
        const spyRemoveJobInformation = jest.spyOn(server.informator, "jobRemoved");

        const monitor = new Monitor("test-monitor", []);
        server.monitors.add(monitor);
        const job = new Job(monitor.id, "test-job", "job-name", [], null);
        monitor.addJob(job);

        server.monitors.remove(server.monitors.findById("test-monitor"));

        expect(server.monitors.getAll().length).toEqual(0);
        expect(spyAddMonitor).toHaveBeenCalled();
        expect(spyAddMonitorInformation).toHaveBeenCalled();
        expect(spyRemoveJobMultiplexer).toHaveBeenCalled();
        expect(spyRemoveJobInformation).toHaveBeenCalled();
    });
});
