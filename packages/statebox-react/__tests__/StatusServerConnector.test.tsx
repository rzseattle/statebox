import { StateboxServer } from "../../statebox-server/src/server/StateboxServer";
import { Monitor } from "../../statebox-server/src/structure/Monitor";
import { Job } from "../../statebox-server/src/structure/Job";
import { render, screen, waitFor } from "@testing-library/react";
import { StatusServerConnector } from "../src/StatusServerConnector";
import { LogMessageTypes } from "statebox-common";
import React from "react";

describe("Test with server", () => {
    let server;
    beforeEach(async () => {
        server = new StateboxServer(4000, 4001);
        await server.init();
    });

    afterEach(async () => {
        await server.close();
    });

    it("Test with init data", async () => {
        const monitor = new Monitor("test-monitor", ["test-monitor"]);
        server.monitors.add(monitor);
        const job = new Job(monitor.id, "test-job", "job-name", ["test-job"]);
        monitor.addJob(job);

        render(
            <StatusServerConnector
                statusServerAddress={"ws://localhost:4000"}
                tracked={["test-monitor/test-job"]}
            />
        );

        waitFor(() => {
            expect(screen.getByText("job-name")).toBeInTheDocument();
        });
    });
    it("Test data update", async () => {
        const monitor = new Monitor("test-monitor", ["test-monitor"]);
        server.monitors.add(monitor);
        const job = new Job(monitor.id, "test-job", "job-name", ["test-job"]);
        monitor.addJob(job);

        render(
            <StatusServerConnector
                statusServerAddress={"ws://localhost:4000"}
                tracked={["test-monitor/test-job"]}
            />
        );

        waitFor(() => {
            expect(screen.getByText("job-name")).toBeInTheDocument();
        });

        job.consumeInputData({
            logsPart: [
                {
                    type: LogMessageTypes.INFO,
                    msg: "Test log message",
                    time: Date.now(),
                },
            ],
        });
        waitFor(() => {
            expect(screen.getByText("Test log message")).toBeInTheDocument();
        });
    });
});
