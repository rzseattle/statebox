import { structure } from "../jobs-structure/Structure";
import { informator } from "../informator/Informator";

class GarbageCollector {
    constructor() {
        setInterval(this.collect, 10000);
    }

    collect = () => {
        const prevLength = structure.monitors.length;

        structure.monitors = structure.monitors.filter((monitor, index) => {
            const allDone = monitor.jobs.reduce((p,c) => p && c.done, true);
            if (monitor.modified < Date.now() - 150000 && allDone ) {
                console.log("usuwam");
                return false;
            }
            return true;
        });

        if (prevLength !== structure.monitors.length) {
            informator.triggerClientInformation();
        }
    };
}

export const garbageCollector = new GarbageCollector();
