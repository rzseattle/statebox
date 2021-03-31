import { StateboxServer } from "../../src/server/StateboxServer";
import { Monitor } from "../../src/structure/Monitor";
import { Job } from "../../src/structure/Job";

const createEnv = (
    monitors: { labels: string[]; jobLabels: string[][] }[],
    listenerTracked: string[],
    mockSend: any,
    direction: "listenerFirst" | "listenerLast" = "listenerFirst",
) => {
    const loop = direction === "listenerFirst" ? ["listener", "rest"] : ["rest", "listener"];

    const server = new StateboxServer();
    for (const type of loop) {
        if (type === "listener") {
            server.listeners.add({
                id: "testID",
                tracked: listenerTracked,
                commChannel: {
                    send: mockSend,
                    close: () => {
                        // non empty
                    },
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

        createEnv([{ labels: ["test"], jobLabels: [["job 1 label"], ["job 2 label"]] }], ["another-label/*"], mockFn);

        expect(mockFn).toBeCalledTimes(2 /* id + init*/);
    });
    it("Monitor match and all job are tracked", () => {
        const mockFn = jest.fn();

        createEnv([{ labels: ["test"], jobLabels: [["job 1 label"], ["job 2 label"]] }], ["test/*"], mockFn);

        // console.log(mockFn.mock.calls);
        expect(mockFn).toBeCalledTimes(2 /* id + init*/ + 3 /* monitor and 2 jobs */);
    });
    it("Monitor match and one job is tracked", () => {
        const mockFn = jest.fn();

        createEnv(
            [{ labels: ["test"], jobLabels: [["job 1 label"], ["job 2 label"]] }],

            ["test/job 1 label"],
            mockFn,
        );

        // console.log(mockFn.mock.calls);
        expect(mockFn).toBeCalledTimes(2 /* id + init*/ + 2 /* monitor and 1 jobs */);
    });
    it("Monitor match and one job is tracked ( listener last )", () => {
        const mockFn = jest.fn();

        createEnv(
            [{ labels: ["test"], jobLabels: [["job 1 label"], ["job 2 label"]] }],
            ["test/job 1 label"],
            mockFn,
            "listenerLast",
        );

        const initState = JSON.parse(mockFn.mock.calls[0][0]);
        expect(mockFn).toBeCalledTimes(2 /* id + init*/);
        expect(initState.monitors.length).toBe(1);
        expect(initState.monitors[0].jobs.length).toBe(1);
    });
    it("Check monitor matched by id ", () => {
        const mockFn = jest.fn();

        createEnv(
            [{ labels: ["test"], jobLabels: [["job 1 label"], ["job 2 label"]] }],
            ["#test-monitor-0/*"],
            mockFn,
            "listenerLast",
        );

        const initState = JSON.parse(mockFn.mock.calls[0][0]);
        expect(mockFn).toBeCalledTimes(2 /* id + init*/);
        expect(initState.monitors.length).toBe(1);
        expect(initState.monitors[0].jobs.length).toBe(2);
    });
});
