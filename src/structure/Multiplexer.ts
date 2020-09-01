import { IListenerData, listeners } from "./Listeners";
import { IJob, IMonitor, structure } from "./Structure";
import { EVENT_TYPE } from "../informator/Informator";
import { MonitorOverwrite } from "../common-interface/IMessage";

class Multiplexer {
    private jobConnections: [string, string][] = new Array();
    private monitorConnections: [string, string][] = new Array();
    private adminConnections: string[] = [];

    constructor() {
        // setInterval(() => {
        //     console.log(this.monitorConnections, )
        // }, 3000)
    }

    public addListener = (listener: IListenerData): any => {
        console.log("Listener add " + listener.id);
        structure.monitors.forEach((monitor) => {
            if (monitor.authKey !== "" && monitor.authKey !== listener.authKey) {
                return;
            }

            if (intersect_filter_has_this(monitor.labels, listener.tracked.monitorLabels).length > 0) {
                this.monitorConnections.push([monitor.id, listener.id]);
                monitor.jobs.forEach((el) => {
                    this.jobConnections.push([el.id, listener.id]);
                });
            }
        });
        // initing data in listener
        const tmpMonitors: IMonitor[] = [];

        this.monitorConnections
            .filter((el) => el[1] === listener.id)
            .forEach((connection) => {
                const monitor = structure.getMonitor(connection[0], [], MonitorOverwrite.Replace);
                if (monitor !== null) {
                    tmpMonitors.push(monitor);
                }
            });

        listener.websocket.send(
            JSON.stringify({
                event: "init-info",
                monitors: tmpMonitors,
            }),
        );

        // console.log(this.jobConnections, "listener");
    };

    public addMonitor = (monitor: IMonitor) => {
        listeners.getAll().forEach((listener) => {
            if (monitor.authKey !== "" && monitor.authKey !== listener.authKey) {
                return;
            }
            if (intersect_filter_has_this(monitor.labels, listener.tracked.monitorLabels).length > 0) {
                this.monitorConnections.push([monitor.id, listener.id]);
            }
        });
    };

    // public addMonitor = (monitor: IMonitor) => {};
    public addJob = (monitor: IMonitor, job: IJob) => {
        listeners.getAll().forEach((listener) => {
            if (monitor.authKey !== "" && monitor.authKey !== listener.authKey) {
                return;
            }
            if (intersect_filter_has_this(monitor.labels, listener.tracked.monitorLabels).length > 0) {
                this.monitorConnections.push([monitor.id, listener.id]);
                this.jobConnections.push([job.id, listener.id]);
            }
        });
        // console.log(this.jobConnections, "job");
    };

    public removeListener = (listener: IListenerData) => {
        this.jobConnections = this.jobConnections.filter((el) => el[1] !== listener.id);
        this.monitorConnections = this.monitorConnections.filter((el) => el[1] !== listener.id);
    };

    public removeMonitor = (monitor: IMonitor) => {
        monitor.jobs.forEach((el) => {
            this.removeJob(el);
        });
        this.monitorConnections = this.monitorConnections.filter((el) => el[0] !== monitor.id);
    };

    public removeJob = (job: IJob) => {
        this.jobConnections = this.jobConnections.filter((el) => el[0] !== job.id);
    };

    public informListeners = (eventType: EVENT_TYPE, monitor: IMonitor, job: IJob | null = null) => {
        // asume its job event
        console.log("------------informing " + eventType + " " + monitor.id);
        if (job !== null) {
            console.log(eventType);
            const comm = {
                event: eventType,
                monitorId: monitor.id,
                job,
            };
            this.jobConnections
                .filter((el) => el[0] === job.id)
                .forEach((connection) => {
                    listeners.get(connection[1])?.websocket.send(JSON.stringify(comm));
                });
        } else {
            const comm = {
                event: eventType,
                monitor,
            };
            this.monitorConnections
                .filter((el) => el[0] === monitor.id)
                .forEach((connection) => {
                    console.log("sub ----");
                    listeners.get(connection[1])?.websocket.send(JSON.stringify(comm));
                });
        }
    };
}

function intersect_filter_has_this(a: string[], b: string[]) {
    return a.filter(Set.prototype.has, new Set(b));
}

export const multiplexer = new Multiplexer();
