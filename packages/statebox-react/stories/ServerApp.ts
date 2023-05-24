import * as http from "http";
import url from "url";
import { Connection, Monitor } from "statebox-monitor";
import React from "react";

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
    console.log(q.pathname);
    switch (q.pathname) {
      case "/progress":
        const job = await monitor.createJob("test", { labels: ["dupa"] });

        job.log("This is log");
        break;
      case "/logs":
        break;
      case "/manyClean":
        break;
      case "/manyPreserve":
        break;
      case "/current":
        break;

      case "/noConnection":
        break;
      case "/brokeConnection":
        break;
      case "/cleanup":
        await monitor.cleanup();
        break;
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
