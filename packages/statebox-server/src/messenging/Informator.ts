import { multiplexer } from "./Multiplexer";
import { Monitor } from "../structure/Monitor";
import { Job } from "../structure/Job";

export enum EVENT_TYPE {
    MONITOR_NEW = "monitor-new",
    MONITOR_UPDATE = "monitor-update",
    MONITOR_REMOVE = "monitor-remove",
    JOB_NEW = "job-new",
    JOB_UPDATE = "job-update",
    JOB_REMOVE = "job-remove",
}

class Informator {
    monitorAdded = (monitor: Monitor) => {
        console.log("+++ monitor " + monitor.id);
        multiplexer.informListeners(EVENT_TYPE.MONITOR_NEW, monitor);
    };
    monitorUpdated = (monitor: Monitor) => {
        console.log("@@@ monitor " + monitor.id);
        multiplexer.informListeners(EVENT_TYPE.MONITOR_UPDATE, monitor);
    };
    monitorRemoved = (monitor: Monitor) => {
        console.log("--- monitor " + monitor.id);
        multiplexer.informListeners(EVENT_TYPE.MONITOR_REMOVE, monitor);
    };

    jobAdded = (monitor: Monitor, job: Job) => {
        console.log("job added");
        multiplexer.informListeners(EVENT_TYPE.JOB_NEW, monitor, job);
    };
    jobUpdated = (monitor: Monitor, job: Job) => {
        console.log("job updated");
        multiplexer.informListeners(EVENT_TYPE.JOB_UPDATE, monitor, job);
    };
    jobRemoved = (monitor: Monitor, job: Job) => {
        console.log("job removed");
        multiplexer.informListeners(EVENT_TYPE.JOB_REMOVE, monitor, job);
    };

    // // to nie może byc całe w throttle
    // triggerClientInformation = throttle(() => {
    //     // console.log([...listeners.getAll().values()]);
    //     websockets.informClients({
    //         monitors: structure.monitors,
    //         listeners: [...listeners.getAll().values()],
    //     });
    // }, 30);
}

export const informator = new Informator();
