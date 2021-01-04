import { StateboxServer } from "../../src/statebox-server/StateboxServer";
import { Monitor } from "../../src/structure/Monitor";
import { Job } from "../../src/structure/Job";

// 1 monitorLabels a
// 2 monitorLabels a b
// 3 monitorLabels a b c

// listener a => 1
// listener a b =>  1 2
// listener a b c => 1 2 3

const createEnv = (
    monitors: { labels: string[]; jobLabels: string[][] }[],
    listenerLabels: { monitor: string[]; job: string[] },
    mockSend: any,
    direction: "listenerFirst" | "listenerLast" = "listenerFirst",
) => {
    const loop = direction === "listenerFirst" ? ["listener", "rest"] : ["rest", "listener"];

    const server = new StateboxServer();
    for (const type of loop) {
        if (type === "listener") {
            server.listeners.add({
                id: "testID",
                tracked: {
                    monitorLabels: listenerLabels.monitor.length > 0 ? [listenerLabels.monitor] : [],
                    jobLabels: listenerLabels.job.length > 0 ? [listenerLabels.job] : [],
                },
                commChannel: {
                    send: mockSend,
                    close: () => {},
                },
            });
        }

        if (type === "rest") {
            for (let i = 0; i < monitors.length; i++) {
                const monitor = new Monitor("test-monitor-" + i, monitors[i].labels);
                server.monitors.add(monitor);
                for (let y = 0; y < monitors[i].jobLabels.length; y++) {
                    const job = new Job(monitor.id, "test-job-" + y, "job-name-" + y, monitors[i].jobLabels[y], null);
                    monitor.addJob(job);
                }
            }
        }
    }
    return server;
};

describe("Multiplexing simple", () => {
    it("Monitor dont match", () => {
        const mockFn = jest.fn();

        createEnv(
            [{ labels: ["test"], jobLabels: [["job 1 label"], ["job 2 label"]] }],
            { monitor: ["listener-label"], job: [] },
            mockFn,
        );

        expect(mockFn).toBeCalledTimes(2 /* id + init*/);
    });
    it("Monitor match and all job are tracked", () => {
        const mockFn = jest.fn();

        createEnv(
            [{ labels: ["test"], jobLabels: [["job 1 label"], ["job 2 label"]] }],
            { monitor: ["test"], job: [] },
            mockFn,
        );

        //console.log(mockFn.mock.calls);
        expect(mockFn).toBeCalledTimes(2 /* id + init*/ + 3 /* monitor and 2 jobs */);
    });
    it("Monitor match and one job is tracked", () => {
        const mockFn = jest.fn();

        createEnv(
            [{ labels: ["test"], jobLabels: [["job 1 label"], ["job 2 label"]] }],
            { monitor: ["test"], job: ["job 1 label"] },
            mockFn,
        );

        // console.log(mockFn.mock.calls);
        expect(mockFn).toBeCalledTimes(2 /* id + init*/ + 2 /* monitor and 1 jobs */);
    });
    it("Monitor match and one job is tracked ( listener last )", () => {
        const mockFn = jest.fn();

        createEnv(
            [{ labels: ["test"], jobLabels: [["job 1 label"], ["job 2 label"]] }],
            { monitor: ["test"], job: ["job 1 label"] },
            mockFn,
            "listenerLast",
        );

        const initState = JSON.parse(mockFn.mock.calls[0][0]);
        expect(mockFn).toBeCalledTimes(2 /* id + init*/);
        expect(initState.monitors.length).toBe(1);
        expect(initState.monitors[0].jobs.length).toBe(1);
    });
});

//     it("Test monitor label match , listener first", () => {
//         const server = new StateboxServer();
//         const mockFn = jest.fn();
//
//         server.listeners.add({
//             id: "testID",
//             tracked: {
//                 monitorLabels: ["test-monitor-label"],
//             },
//             commChannel: { send: mockFn, close: () => {} },
//         });
//         const monitor = new Monitor("test-monitor", ["test-monitor-label"]);
//         server.monitors.add(monitor);
//
//         const job = new Job(monitor.id, "test-job", "job-name", [], null);
//         monitor.addJob(job);
//
//         // init-info, listener-register monitor-new job-new
//         expect(mockFn).toBeCalledTimes(4);
//     });
//
//     it("Test NOT monitor label match , listener first", () => {
//         const server = new StateboxServer();
//         const mockFn = jest.fn();
//
//         server.listeners.add({
//             id: "testID",
//             tracked: {
//                 monitorLabels: ["test-monitor-label"],
//             },
//             commChannel: { send: mockFn, close: () => {} },
//         });
//         const monitor = new Monitor("test-monitor", ["test-monitor-label-not-match"]);
//         server.monitors.add(monitor);
//
//         const job = new Job(monitor.id, "test-job", "job-name", [], null);
//         monitor.addJob(job);
//
//         // init-info, listener-register
//         expect(mockFn).toBeCalledTimes(2);
//     });
//
//     it("Test monitor label match , listener connect after job and monitor ( init info )", () => {
//         const server = new StateboxServer();
//         const mockFn = jest.fn();
//
//         const monitor = new Monitor("test-monitor", ["test-monitor-label"]);
//         server.monitors.add(monitor);
//
//         const job = new Job(monitor.id, "test-job", "job-name", [], null);
//         monitor.addJob(job);
//
//         server.listeners.add({
//             id: "testID",
//             tracked: {
//                 monitorLabels: ["test-monitor-label"],
//             },
//             commChannel: { send: mockFn, close: () => {} },
//         });
//
//         // init-info, listener-register monitor-new job-new
//         expect(mockFn).toBeCalledTimes(2);
//         const firstCallArg = JSON.parse(mockFn.mock.calls[0][0]);
//         expect(firstCallArg.monitors.length).toEqual(1);
//         expect(firstCallArg.monitors[0].jobs.length).toEqual(1);
//     });
//
//     it("Test monitor label NOT match , listener connect after job and monitor ( init info )", () => {
//         const server = new StateboxServer();
//         const mockFn = jest.fn();
//
//         const monitor = new Monitor("test-monitor", ["test-monitor-label-not-match"]);
//         server.monitors.add(monitor);
//
//         const job = new Job(monitor.id, "test-job", "job-name", [], null);
//         monitor.addJob(job);
//
//         server.listeners.add({
//             id: "testID",
//             tracked: {
//                 monitorLabels: ["test-monitor-label"],
//             },
//             commChannel: { send: mockFn, close: () => {} },
//         });
//
//         // init-info, listener-register monitor-new job-new
//         expect(mockFn).toBeCalledTimes(2);
//         const firstCallArg = JSON.parse(mockFn.mock.calls[0][0]);
//         expect(firstCallArg.monitors.length).toEqual(0);
//     });
// });
//
// describe("Multiplexing tests - job labels", () => {
//     it("All job label match", () => {
//         const server = new StateboxServer();
//         const mockFn = jest.fn();
//
//         const monitor = new Monitor("test-monitor", ["test-monitor-label"]);
//         server.monitors.add(monitor);
//
//         const job = new Job(monitor.id, "test-job", "job-name", ["job-label"], null);
//         monitor.addJob(job);
//         const job2 = new Job(monitor.id, "test-job2", "job-name2", ["job-label"], null);
//         monitor.addJob(job2);
//
//         server.listeners.add({
//             id: "testID",
//             tracked: {
//                 monitorLabels: ["test-monitor-label"],
//             },
//             commChannel: { send: mockFn, close: () => {} },
//         });
//
//         // init-info, listener-register monitor-new job-new
//         expect(mockFn).toBeCalledTimes(2);
//         const firstCallArg = JSON.parse(mockFn.mock.calls[0][0]);
//         expect(firstCallArg.monitors.length).toEqual(1);
//         expect(firstCallArg.monitors[0].jobs.length).toEqual(2);
//     });
//
//     it("Some job label match", () => {
//         const server = new StateboxServer();
//         const mockFn = jest.fn();
//
//         const monitor = new Monitor("test-monitor", ["test-monitor-label"]);
//         server.monitors.add(monitor);
//
//         const job = new Job(monitor.id, "test-job", "job-name", ["job-label"], null);
//         monitor.addJob(job);
//         const job2 = new Job(monitor.id, "test-job2", "job-name2", ["job-label-no-match"], null);
//         monitor.addJob(job2);
//
//         server.listeners.add({
//             id: "testID",
//             tracked: {
//                 monitorLabels: ["test-monitor-label"],
//             },
//             commChannel: { send: mockFn, close: () => {} },
//         });
//
//         // init-info, listener-register monitor-new job-new
//         expect(mockFn).toBeCalledTimes(2);
//         const firstCallArg = JSON.parse(mockFn.mock.calls[0][0]);
//         expect(firstCallArg.monitors[0].jobs.length).toEqual(1);
//     });
