import { monitorList } from "../structure/MonitorList";

class GarbageCollector {
    constructor() {
        setInterval(this.collect, 10000);
    }

    collect = () => {
        const prevLength = monitorList.monitors.length;

        monitorList.monitors = monitorList.monitors.filter((monitor) => {
            const allDone = monitor.getJobs().reduce((p, c) => p && c.done, true);
            if (monitor.modified < Date.now() - 150000 && allDone) {
                console.log("usuwam");
                return false;
            }
            return true;
        });

        if (prevLength !== monitorList.monitors.length) {
            // informator.triggerClientInformation();
        }
    };
}

export const garbageCollector = new GarbageCollector();
