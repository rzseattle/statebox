import { StateboxServer } from "./server/StateboxServer";

export { StateboxServer };

if (process.argv[2] === "run") {
    new StateboxServer().init();
}
