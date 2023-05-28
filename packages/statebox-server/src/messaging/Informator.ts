import { Monitor } from "../structure/Monitor";
import { Job } from "../structure/Job";
import { Multiplexer } from "./Multiplexer";
import { Logger } from "../lib/Logger";
import { STATEBOX_EVENTS } from "statebox-common";

export class Informator {
    constructor(private logger: Logger, private multiplexer: Multiplexer) {}
    monitorAdded = (monitor: Monitor) => {
        this.logger.log("+++ monitor " + monitor.id);
        this.multiplexer.informListeners(STATEBOX_EVENTS.MONITOR_NEW, monitor);
    };
    monitorUpdated = (monitor: Monitor) => {
        this.logger.log("@@@ monitor " + monitor.id);
        this.multiplexer.informListeners(STATEBOX_EVENTS.MONITOR_UPDATED, monitor);
    };
    monitorRemoved = (monitor: Monitor) => {
        this.logger.log("--- monitor " + monitor.id);
        this.multiplexer.informListeners(STATEBOX_EVENTS.MONITOR_DELETED, monitor);
    };

    jobAdded = (monitor: Monitor, job: Job) => {
        this.logger.log("job added");
        this.multiplexer.informListeners(STATEBOX_EVENTS.JOB_NEW, monitor, job);
    };
    jobUpdated = (monitor: Monitor, job: Job) => {
        this.logger.log("job updated");
        this.multiplexer.informListeners(STATEBOX_EVENTS.JOB_UPDATED, monitor, job);
    };
    jobRemoved = (monitor: Monitor, job: Job) => {
        this.logger.log("job removed");
        this.multiplexer.informListeners(STATEBOX_EVENTS.JOB_DELETED, monitor, job);
    };
}
