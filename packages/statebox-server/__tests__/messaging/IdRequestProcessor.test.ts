import { StateboxServer } from "../../src/server/StateboxServer";

import { Monitor } from "../../src/structure/Monitor";
import {IIdRequestMessage, MonitorOverwrite} from "statebox-common";

describe("Request Id and overwrite strategies", () => {
    it("Full new monitor", () => {
        const server = new StateboxServer();

        const mockFn = jest.fn();

        server.messageProcessor.process(
            {
                type: "id-request",
                elementType: "monitor",
                monitorLabels: [],
                data: {
                    monitor: { description: "Test description" },
                },
            } as IIdRequestMessage,
            {
                send: mockFn,
            },
        );
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(JSON.parse(mockFn.mock.calls[0][0]).id.length).toBeGreaterThan(10);
    });

    it("MonitorOverwrite.Join monitor by label", () => {
        const server = new StateboxServer();
        const spyAddMonitorInformation = jest.spyOn(server.informator, "monitorAdded");
        const mockFn = jest.fn();

        server.messageProcessor.process(
            {
                type: "id-request",
                elementType: "monitor",
                monitorLabels: ["monitor-test-label", "another-label"],
                data: {
                    monitor: { description: "Test description" },
                },
            } as IIdRequestMessage,
            {
                send: mockFn,
            },
        );

        server.messageProcessor.process(
            {
                type: "id-request",
                elementType: "monitor",
                monitorLabels: ["another-label", "monitor-test-label"],
                overwriteStrategy: MonitorOverwrite.Join,
            } as IIdRequestMessage,
            {
                send: mockFn,
            },
        );

        const id1 = JSON.parse(mockFn.mock.calls[0][0]).id;
        const id2 = JSON.parse(mockFn.mock.calls[1][0]).id;

        expect(id1).toEqual(id2);

        expect(server.monitors.getAll().length).toEqual(1);
        expect(spyAddMonitorInformation).toBeCalledTimes(1);
    });

    it("MonitorOverwrite.Replace monitor by label", () => {
        const server = new StateboxServer();
        const spyAddMonitorInformation = jest.spyOn(server.informator, "monitorAdded");
        const mockFn = jest.fn();

        server.messageProcessor.process(
            {
                type: "id-request",
                elementType: "monitor",
                monitorLabels: ["monitor-test-label", "another-label"],
            } as IIdRequestMessage,
            {
                send: mockFn,
            },
        );

        server.messageProcessor.process(
            {
                type: "id-request",
                elementType: "monitor",
                monitorLabels: ["another-label", "monitor-test-label"],
                overwriteStrategy: MonitorOverwrite.Replace,
            } as IIdRequestMessage,
            {
                send: mockFn,
            },
        );

        const id1 = JSON.parse(mockFn.mock.calls[0][0]).id;
        const id2 = JSON.parse(mockFn.mock.calls[1][0]).id;

        expect(id1).not.toEqual(id2);

        expect(server.monitors.getAll().length).toEqual(1);
        expect(spyAddMonitorInformation).toBeCalledTimes(2);
    });

    it("CreateNew.CreateNew monitor by label", () => {
        const server = new StateboxServer();
        const spyAddMonitorInformation = jest.spyOn(server.informator, "monitorAdded");
        const mockFn = jest.fn();

        server.messageProcessor.process(
            {
                type: "id-request",
                elementType: "monitor",
                monitorLabels: ["monitor-test-label", "another-label"],
            } as IIdRequestMessage,
            {
                send: mockFn,
            },
        );

        server.messageProcessor.process(
            {
                type: "id-request",
                elementType: "monitor",
                monitorLabels: ["another-label", "monitor-test-label"],
                overwriteStrategy: MonitorOverwrite.CreateNew,
            } as IIdRequestMessage,
            {
                send: mockFn,
            },
        );

        const id1 = JSON.parse(mockFn.mock.calls[0][0]).id;
        const id2 = JSON.parse(mockFn.mock.calls[1][0]).id;

        expect(id1).not.toEqual(id2);

        expect(server.monitors.getAll().length).toEqual(2);
        expect(spyAddMonitorInformation).toBeCalledTimes(2);
    });

    it("Full new job", () => {
        const server = new StateboxServer();

        const mockFn = jest.fn();

        server.messageProcessor.process(
            {
                type: "id-request",
                elementType: "job",
                jobLabels: ["job-label", "job-test"],
                monitorLabels: ["another-label", "monitor-test-label"],
                data: {
                    monitor: { description: "Test description" },
                },
            } as IIdRequestMessage,
            {
                send: mockFn,
            },
        );
        const monitor = server.monitors.findByLabels(["another-label", "monitor-test-label"]);
        const id = JSON.parse(mockFn.mock.calls[0][0]).id;
        expect(mockFn).toHaveBeenCalledTimes(1);
        expect(id.length).toBeGreaterThan(10);
        expect(monitor.jobs.length).toEqual(1);
        expect(monitor.getJobById(id)).not.toEqual(null);
    });

    it("MonitorOverwrite.Join job", () => {
        const server = new StateboxServer();
        const monitor = new Monitor("test-monitor", ["another-label", "monitor-test-label"]);
        server.monitors.add(monitor);

        const mockFn = jest.fn();

        server.messageProcessor.process(
            {
                type: "id-request",
                elementType: "job",
                monitorId: monitor.id,
                jobLabels: ["job-label", "job-test"],
            } as IIdRequestMessage,
            {
                send: mockFn,
            },
        );

        server.messageProcessor.process(
            {
                type: "id-request",
                elementType: "job",
                monitorId: monitor.id,
                jobLabels: ["job-test", "job-label"],
                overwriteStrategy: MonitorOverwrite.Join,
            } as IIdRequestMessage,
            {
                send: mockFn,
            },
        );

        const id1 = JSON.parse(mockFn.mock.calls[0][0]).id;
        const id2 = JSON.parse(mockFn.mock.calls[1][0]).id;

        expect(id1).toEqual(id2);

        expect(mockFn).toHaveBeenCalledTimes(2);
        expect(monitor.jobs.length).toEqual(1);
    });

    it("MonitorOverwrite.Replace job", () => {
        const server = new StateboxServer();
        const monitor = new Monitor("test-monitor", ["another-label", "monitor-test-label"]);
        server.monitors.add(monitor);

        const mockFn = jest.fn();

        server.messageProcessor.process(
            {
                type: "id-request",
                elementType: "job",
                monitorId: monitor.id,
                jobLabels: ["job-label", "job-test"],
            } as IIdRequestMessage,
            {
                send: mockFn,
            },
        );

        server.messageProcessor.process(
            {
                type: "id-request",
                elementType: "job",
                monitorId: monitor.id,
                jobLabels: ["job-test", "job-label"],
                overwriteStrategy: MonitorOverwrite.Replace,
            } as IIdRequestMessage,
            {
                send: mockFn,
            },
        );

        const id1 = JSON.parse(mockFn.mock.calls[0][0]).id;
        const id2 = JSON.parse(mockFn.mock.calls[1][0]).id;

        expect(id1).not.toEqual(id2);

        expect(mockFn).toHaveBeenCalledTimes(2);
        expect(monitor.jobs.length).toEqual(1);
    });

    it("MonitorOverwrite.CreateNew job", () => {
        const server = new StateboxServer();
        const monitor = new Monitor("test-monitor", ["another-label", "monitor-test-label"]);
        server.monitors.add(monitor);

        const mockFn = jest.fn();

        server.messageProcessor.process(
            {
                type: "id-request",
                elementType: "job",
                monitorId: monitor.id,
                jobLabels: ["job-label", "job-test"],
            } as IIdRequestMessage,
            {
                send: mockFn,
            },
        );

        server.messageProcessor.process(
            {
                type: "id-request",
                elementType: "job",
                monitorId: monitor.id,
                jobLabels: ["job-test", "job-label"],
                overwriteStrategy: MonitorOverwrite.CreateNew,
            } as IIdRequestMessage,
            {
                send: mockFn,
            },
        );

        const id1 = JSON.parse(mockFn.mock.calls[0][0]).id;
        const id2 = JSON.parse(mockFn.mock.calls[1][0]).id;

        expect(id1).not.toEqual(id2);

        expect(mockFn).toHaveBeenCalledTimes(2);
        expect(monitor.jobs.length).toEqual(2);
    });
});
