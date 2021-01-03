import { Monitor } from "../structure/Monitor";
import { Job } from "../structure/Job";
import { Multiplexer } from "./Multiplexer";
import {STATEBOX_EVENTS} from "../structure/StateboxEventsRouter";



export class Informator {
    constructor(private multiplexer: Multiplexer) {}
    monitorAdded = (monitor: Monitor) => {
        console.log("+++ monitor " + monitor.id);
        this.multiplexer.informListeners(STATEBOX_EVENTS.MONITOR_NEW, monitor);
    };
    monitorUpdated = (monitor: Monitor) => {
        console.log("@@@ monitor " + monitor.id);
        this.multiplexer.informListeners(STATEBOX_EVENTS.MONITOR_UPDATED, monitor);
    };
    monitorRemoved = (monitor: Monitor) => {
        console.log("--- monitor " + monitor.id);
        this.multiplexer.informListeners(STATEBOX_EVENTS.MONITOR_DELETED, monitor);
    };

    jobAdded = (monitor: Monitor, job: Job) => {
        console.log("job added");
        this.multiplexer.informListeners(STATEBOX_EVENTS.JOB_NEW, monitor, job);
    };
    jobUpdated = (monitor: Monitor, job: Job) => {
        console.log("job updated");
        this.multiplexer.informListeners(STATEBOX_EVENTS.JOB_UPDATED, monitor, job);
    };
    jobRemoved = (monitor: Monitor, job: Job) => {
        console.log("job removed");
        this.multiplexer.informListeners(STATEBOX_EVENTS.JOB_DELETED, monitor, job);
    };
}
