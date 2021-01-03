import { Monitors } from "../structure/Monitors";
import Timeout = NodeJS.Timeout;

export class GarbageCollector {
    private readonly interval: Timeout;

    constructor(private monitors: Monitors) {
        this.interval = setInterval(this.collect, 10000);
    }

    collect = () => {
        const prevLength = this.monitors.monitors.length;

        this.monitors.monitors = this.monitors.monitors.filter((monitor) => {
            const allDone = monitor.getJobs().reduce((p, c) => p && c.done, true);
            if (monitor.modified < Date.now() - 150000 && allDone) {
                console.log("usuwam");
                return false;
            }
            return true;
        });

        if (prevLength !== this.monitors.monitors.length) {
            // informator.triggerClientInformation();
        }
    };

    public close = () => {
        clearInterval(this.interval);
    };
}
