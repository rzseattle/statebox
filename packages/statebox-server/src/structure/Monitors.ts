import { Monitor } from "./Monitor";
import { StateboxEventsRouter } from "./StateboxEventsRouter";
import { compareLabels } from "../lib/CompareTools";
import { STATEBOX_EVENTS } from "statebox-common";

export class Monitors {
    monitors: Monitor[] = [];

    constructor(private eventsRouter: StateboxEventsRouter) {}

    public getAll = () => {
        return this.monitors;
    };

    public add = (monitor: Monitor) => {
        monitor.injectEventsTracker(this.eventsRouter);
        this.monitors.push(monitor);
        this.eventsRouter.pushEvent(STATEBOX_EVENTS.MONITOR_NEW, monitor);
    };
    public remove = (monitor: Monitor) => {
        const index = this.monitors.findIndex((el) => el.id === monitor.id);
        if (index !== -1) {
            this.monitors.splice(index, 1);
            this.eventsRouter.pushEvent(STATEBOX_EVENTS.MONITOR_DELETED, monitor);
        }
    };

    public findById = (id: string): Monitor | null => {
        const result = this.monitors.filter((el) => el.id === id);
        if (result.length === 1) {
            return result[0];
        } else {
            return null;
        }
    };

    findByLabels(labels: string[]): Monitor | null {
        const index = this.monitors.findIndex((el) => {
            return compareLabels(el.labels, labels);
        });

        if (index !== -1) {
            return this.monitors[index];
        }

        return null;
    }
}
