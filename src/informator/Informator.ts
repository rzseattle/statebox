import { throttle } from "../lib/throttle";
import { websockets } from "../websockets/Websockets";
import { IJob, IMonitor, structure } from "../structure/Structure";
import { listeners } from "../structure/Listeners";
import { multiplexer } from "../structure/Multiplexer";

export enum EVENT_TYPE {
    MONITOR_NEW = "monitor-new",
    MONITOR_UPDATE = "monitor-update",
    MONITOR_REMOVE = "monitor-remove",
    JOB_NEW = "job-new",
    JOB_UPDATE = "job-update",
    JOB_REMOVE = "job-remove",
}

class Informator {
    monitorAdded = (monitor: IMonitor) => {
        console.log("monitor added");
        multiplexer.addMonitor(monitor);
        multiplexer.informListeners(EVENT_TYPE.MONITOR_NEW, monitor);
    };
    monitorUpdated = (monitor: IMonitor) => {
        console.log("monitor updated");
        multiplexer.informListeners(EVENT_TYPE.MONITOR_UPDATE, monitor);
    };
    monitorRemoved = (monitor: IMonitor) => {
        console.log("monitor removed");
        multiplexer.informListeners(EVENT_TYPE.MONITOR_REMOVE, monitor);
        multiplexer.removeMonitor(monitor);
    };

    jobAdded = (monitor: IMonitor, job: IJob) => {
        console.log("job added");
        multiplexer.informListeners(EVENT_TYPE.JOB_NEW, monitor, job);
    };
    jobUpdated = (monitor: IMonitor, job: IJob) => {
        console.log("job updated");
        multiplexer.informListeners(EVENT_TYPE.JOB_UPDATE, monitor, job);
    };
    jobRemoved = (monitor: IMonitor, job: IJob) => {
        console.log("job removed");
        multiplexer.informListeners(EVENT_TYPE.JOB_REMOVE, monitor, job);
    };

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
