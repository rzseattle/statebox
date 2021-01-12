import { StateboxServer } from "../../src/server/StateboxServer";

import { Monitor } from "../../src/structure/Monitor";
import { Job } from "../../src/structure/Job";
import {IJobMessage, MonitorOverwrite} from "statebox-common";

describe("Update communicates tests", () => {
    const fakeBackChannel = { send: jest.fn() };
    it("Job comm with additional monitor data ( find by monitor id )", () => {
        const server = new StateboxServer();
        const monitor = new Monitor("test-monitor", [], { description: "to update" });
        server.monitors.add(monitor);

        server.messageProcessor.process(
            {
                type: "job",
                name: "test-job",
                monitorId: "test-monitor",
                labels: [],
                monitorData: { description: "Test description" },
            } as IJobMessage,
            fakeBackChannel,
        );
        expect(monitor.description).toEqual("Test description");
        expect(monitor.getJobs()[0].name).toEqual("test-job");
        // expect(JSON.parse(mockFn.mock.calls[0][0]).id.length).toBeGreaterThan(10);
    });
    it("Job comm with additional monitor data ( find by monitor labels )", () => {
        const server = new StateboxServer();
        const monitor = new Monitor("test-monitor", ["test-label"], { description: "to update" });
        server.monitors.add(monitor);

        server.messageProcessor.process(
            {
                type: "job",
                name: "test-job",
                labels: [],

                monitorData: {
                    description: "Test description",
                    labels: ["test-label"],
                    overwriteStrategy: MonitorOverwrite.Join,
                },
            } as IJobMessage,
            fakeBackChannel,
        );
        expect(monitor.description).toEqual("Test description");
        expect(monitor.getJobs()[0].name).toEqual("test-job");
        // expect(JSON.parse(mockFn.mock.calls[0][0]).id.length).toBeGreaterThan(10);
    });

    it("Job comm with additional monitor data ( moitor not found )", () => {
        const server = new StateboxServer();

        server.messageProcessor.process(
            {
                type: "job",
                name: "test-job",
                labels: [],
                monitorId: "monitor-id",
                monitorData: {
                    description: "Test description",
                    labels: ["test-label"],
                    overwriteStrategy: MonitorOverwrite.Join,
                },
            } as IJobMessage,
            fakeBackChannel,
        );
        const newMonitor = server.monitors.findByLabels(["test-label"]);
        expect(newMonitor).not.toEqual(null);
        expect(newMonitor.description).toEqual("Test description");
        expect(newMonitor.getJobs()[0].name).toEqual("test-job");
    });

    it("Job comm to existing job", () => {
        const server = new StateboxServer();
        const monitor = new Monitor("test-monitor", [], { description: "to update" });
        server.monitors.add(monitor);
        monitor.addJob(
            new Job(monitor.id, "test-job", "test-job", ["test-label-job"], { description: "test-description" }),
        );

        server.messageProcessor.process(
            {
                type: "job",
                monitorId: "test-monitor",
                jobId: "test-job",
                description: "updated-description",
            } as IJobMessage,
            fakeBackChannel,
        );
        expect(monitor.getJobs()[0].description).toEqual("updated-description");
        // expect(JSON.parse(mockFn.mock.calls[0][0]).id.length).toBeGreaterThan(10);
    });
});
