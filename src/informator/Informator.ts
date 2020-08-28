import { throttle } from "../lib/throttle";
import { websockets } from "../websockets/Websockets";
import { structure } from "../structure/Structure";
import { listeners } from "../structure/Listeners";

class Informator {
    // to nie może byc całe w throttle
    triggerClientInformation = throttle(() => {
        // console.log([...listeners.getAll().values()]);
        websockets.informClients({
            monitors: structure.monitors,
            listeners: [...listeners.getAll().values()],
        });
    }, 30);
}

export const informator = new Informator();
