import { StateboxServer } from "../../src/statebox-server/StateboxServer";
import { Monitor } from "../../src/structure/Monitor";
import { Job } from "../../src/structure/Job";

describe("Multiplexing tests", () => {
    it("Test label match , listener first", () => {
        const server = new StateboxServer();
        const mockFn = jest.fn();

        server.listeners.add({
            id: "testID",
            tracked: {
                monitorLabels: ["test-monitor-label"],
            },
            commChannel: { send: mockFn, close: () => {} },
        });
        const monitor = new Monitor("test-monitor", ["test-monitor-label"]);
        server.monitors.add(monitor);

        const job = new Job(monitor.id, "test-job", "job-name", [], null);
        monitor.addJob(job);

        // init-info, listener-register monitor-new job-new
        expect(mockFn).toBeCalledTimes(4);
    });
    it("Test label match , listener connect after job and monitor ( init info )", () => {
        const server = new StateboxServer();
        const mockFn = jest.fn();

        const monitor = new Monitor("test-monitor", ["test-monitor-label"]);
        server.monitors.add(monitor);

        const job = new Job(monitor.id, "test-job", "job-name", [], null);
        monitor.addJob(job);

        server.listeners.add({
            id: "testID",
            tracked: {
                monitorLabels: ["test-monitor-label"],
            },
            commChannel: { send: mockFn, close: () => {} },
        });

        // init-info, listener-register monitor-new job-new
        expect(mockFn).toBeCalledTimes(2);
        const firstCallArg = JSON.parse(mockFn.mock.calls[0][0]);
        expect(firstCallArg.monitors.length).toEqual(1);
        expect(firstCallArg.monitors[0].jobs.length).toEqual(1);
    });
});
