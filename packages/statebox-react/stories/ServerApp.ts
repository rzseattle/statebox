import * as http from "http";
import url from "url";
import { Connection, Monitor } from "statebox-monitor";

console.log("I'm server app");

let monitor;
(async function () {
  const conn = await new Connection("ws://localhost:3011");
  await conn.connect();
  monitor = await new Monitor(conn, {
    title: "Test monitor",
    labels: ["test"],
  });
})();

const requestListener = function (req, res) {
  res.writeHead(200);
  const q = url.parse(req.url, true);
  (async () => {
    try {
      await monitor.updateId();
      const job = await monitor.createJob("test", { labels: ["dupa"] });
      switch (q.pathname) {
        case "/progress":
          job.progress(2, 100);
          for (let i = 0; i < 10; i++) {
            setTimeout(() => {
              job.progress(10 * i + 1, 100);
            }, i * 1000);
          }
          break;
        case "/logs":
          for (let i = 0; i < 10; i++) {
            setTimeout(() => {
              job.log("Test log message " + Math.random());
            }, i * 1000);
          }
          for (let i = 0; i < 4; i++) {
            setTimeout(() => {
              job.error("Test error message " + Math.random());
            }, i * 1000);
          }
          for (let i = 0; i < 4; i++) {
            setTimeout(() => {
              job.warning("Test warning message " + Math.random());
            }, i * 1000);
          }
          for (let i = 0; i < 4; i++) {
            setTimeout(() => {
              job.debug("Test debug message " + Math.random());
            }, i * 1000);
          }
          break;
        case "/manyClean":
          for (let i = 0; i < 20; i++) {
            setTimeout(async () => {
              const job1 = await monitor.createJob("Test job " + i, {
                labels: ["dupa", i],
              });
              job1.operation("Job " + i);
              if (i % 2 === 0) {
                job1.log("Modulo = 0");
                job1.log("Modulo = 0 :)");
              }
              if (i % 3 === 0) {
                job1.progress(1);
              }
              setTimeout(async () => {
                job1.setDone(true);
              }, 3000);
            }, i * 1000);
          }

          break;
        case "/manyPreserve":
          break;
        case "/current":
          job.operation("Current operation " + Math.random());
          break;

        case "/noConnection":
          break;
        case "/brokeConnection":
          break;
        case "/remove-monitor":
          await monitor.remove();
          break;
        case "/cleanup-monitor":
          await monitor.cleanup();
          break;
        case "/remove-job":
          await job.remove();
          break;
        case "/cleanup-job":
          await job.cleanup();
          break;
      }
    } catch (e) {
      console.log(e);
    }
  })();

  res.end(q.pathname);
};
const server = http.createServer(requestListener);
const port = 8080;
const host = "localhost";
server.listen(port, host, () => {
  console.log(`Server is running on http://${host}:${port}`);
});
