import { StateboxClient } from "../src";
import * as NodeWS from "ws";
import { StateboxServer } from "../../statebox-server/src/server/StateboxServer";
import { Monitor } from "../../statebox-server/src/structure/Monitor";
import { Job } from "../../statebox-server/src/structure/Job";

const createEnv = (
  server: StateboxServer,
  monitors: { labels: string[]; jobLabels: string[][] }[]
) => {
  for (let i = 0; i < monitors.length; i++) {
    const monitor = new Monitor("test-monitor-" + i, monitors[i].labels);
    server.monitors.add(monitor);
    for (let y = 0; y < monitors[i].jobLabels.length; y++) {
      const job = new Job(
        monitor.id,
        "test-job-" + y,
        "job-name-" + y,
        monitors[i].jobLabels[y],
        null
      );
      monitor.addJob(job);
    }
  }

  return server;
};

describe("StateboxClient", () => {
  let server: any;
  beforeEach(async () => {
    server = new StateboxServer(4000, 4001);
    await server.init();
  });

  afterEach(async () => {
    await server.close();
  });

  it("Get id", async () => {
    const connection = new NodeWS("ws://localhost:4000");
    const client = new StateboxClient(connection, -1, { tracked: [] });
    await client.connect();
    expect((await client.getId()).length).toBeGreaterThan(6);
    connection.close();
  });

  it("New monitor and job", async (done) => {
    const connection = new NodeWS("ws://localhost:4000");
    const client = new StateboxClient(connection, -1, {
      tracked: ["test-label/labels-job"],
    });

    await client.connect();

    client.setChangeListener((monitors) => {
      if (monitors.length > 0) {
        expect(monitors.length).toEqual(1);
        expect(monitors[0].id).toEqual("test-monitor-0");
        done();
      }
    });

    createEnv(server, [
      { labels: ["test-label"], jobLabels: [["labels-job"]] },
    ]);

    //expect((await client.getId()).length).toBeGreaterThan(6);
    connection.close();
  });

  it("Job update", async (done) => {
    const connection = new NodeWS("ws://localhost:4000");
    const client = new StateboxClient(connection, -1, {
      tracked: ["test-label/labels-job"],
    });

    await client.connect();

    client.setChangeListener((monitors) => {
      if (monitors.length > 0) {
        expect(monitors.length).toEqual(1);
        expect(monitors[0].id).toEqual("test-monitor-0");
        done();
      }
    });

    createEnv(server, [
      { labels: ["test-label"], jobLabels: [["labels-job"]] },
    ]);

    //expect((await client.getId()).length).toBeGreaterThan(6);
    connection.close();
  });
});
