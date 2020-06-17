import { throttle } from "../lib/throttle";
import {websockets} from "../websockets/Websockets";
import {structure} from "../jobs-structure/Structure";

class Informator {
    // to nie może byc całe w throttle
    triggerClientInformation = throttle(() => {
        websockets.informClients(structure.monitors);
    }, 30);
}

export const informator = new Informator();
