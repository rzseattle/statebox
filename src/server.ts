import { websockets } from "./websockets/Websockets";
import {garbageCollector} from "./garbage-collector/GarbageCollector";



console.log("Starting")

const x  = websockets;
const y = garbageCollector;



/*const app = express();
const port = 3000;
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/webpage/index.html");
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`));*/

// import redis from "redis";
//
//
// const client = redis.createClient({
//     host: "redis",
// });
//
// client.on("error", (error: any) => {
//     console.error(error);
// });
//
// client.set("key", "value", redis.print);
// client.get("key", redis.print);
