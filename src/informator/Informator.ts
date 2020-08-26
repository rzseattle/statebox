import { throttle } from "../lib/throttle";
import { websockets } from "../websockets/Websockets";
import { structure } from "../jobs-structure/Structure";
import { listeners } from "../listeners/Listeners";

class Informator {
    // to nie może byc całe w throttle
    triggerClientInformation = throttle(() => {
        console.log([...listeners.values()]);
        websockets.informClients({
            monitors: structure.monitors,
            listeners: [...listeners.values()],
        });
    }, 30);
}

export const informator = new Informator();
