import { websockets } from "./websockets/Websockets";

console.log("xx1 2");
import redis from "redis";

import express from "express";
import { LoggingClient } from "./client/LoggingClient";

const client = redis.createClient({
    host: "redis",
});

client.on("error", (error: any) => {
    console.error(error);
});

client.set("key", "value", redis.print);
client.get("key", redis.print);


console.log(websockets);

const logClient = new LoggingClient({ url: "ws://localhost:3011", name: "Test klient 1" });

logClient
    .connect()
    .then(() => {
        const job = logClient.createJob({ name: "MyTestJob" });

        for (let i = 0; i <= 10; i++) {
            setTimeout(() => {
                job.progress(i, 100);
                console.log("-------");
            }, i * 20);
        }
    })
    .catch((e) => {
        console.log(e);
    });

/*const app = express();
const port = 3000;
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/webpage/index.html");
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));*/
