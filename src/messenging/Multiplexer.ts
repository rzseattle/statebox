import { IListenerData, listeners } from "../structure/Listeners";
import { MonitorOverwrite } from "../common-interface/IMessage";
import { Monitor } from "../structure/Monitor";
import { monitorList } from "../structure/MonitorList";
import { Job } from "../structure/Job";
import { EVENT_TYPE } from "./Informator";

/**
 * Object with passign right infromation baset on selectors
 */
class Multiplexer {
    /**
     * connection between  [ jobId , listenerId ]
     * @private
     */
    private jobConnections: [string, string][] = new Array();
    /**
     * connection between  [ monitorId , listenerId ]
     * @private
     */
    private monitorConnections: [string, string][] = new Array();

    /**
     * Not implemented yet , connections to listen everything
     * @private
     */
    private adminConnections: string[] = [];

    constructor() {
        // setInterval(() => {
        //     console.log(this.monitorConnections, )
        // }, 3000)
    }

    /**
     * Adds listener and connect it with monitors and jobs
     * by jobConnections and monitorConnections
     * @param listener
     */
    public addListener = (listener: IListenerData): any => {
        console.log("Listener add " + listener.id);
        monitorList.monitors.forEach((monitor) => {
            if (monitor.authKey !== "" && monitor.authKey !== listener.authKey) {
                return;
            }

            if (intersect_filter_has_this(monitor.labels, listener.tracked.monitorLabels).length > 0) {
                this.monitorConnections.push([monitor.id, listener.id]);
                monitor.getJobs().forEach((el) => {
                    this.jobConnections.push([el.id, listener.id]);
                });
            }
        });
        // initing data in listener
        const tmpMonitors: Monitor[] = [];

        this.monitorConnections
            .filter((el) => el[1] === listener.id)
            .forEach((connection) => {
                const monitor = monitorList.getMonitorTODOANDREMOVE(connection[0], [], MonitorOverwrite.Replace);
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
    /**
     * Adds monitor and connect it with listeners
     * by  monitorConnections
     */
    public addMonitor = (monitor: Monitor) => {
        console.log("------------------------ adding monitor ", monitor.labels);
        listeners.getAll().forEach((listener) => {
            if (monitor.authKey !== "" && monitor.authKey !== listener.authKey) {
                return;
            }
            if (intersect_filter_has_this(monitor.labels, listener.tracked.monitorLabels).length > 0) {
                // checking if monitor labels are tracked by listener
                console.log("Monitor is now connected to listener: " + listener.id);
                this.monitorConnections.push([monitor.id, listener.id]);
            }
        });
    };

    /**
     * Adds job and connect it with listeners
     * by  jobConnections
     */
    public addJob = (monitor: Monitor, job: Job) => {
        console.log("--------------- adding job", job.labels);
        listeners.getAll().forEach((listener) => {
            if (monitor.authKey !== "" && monitor.authKey !== listener.authKey) {
                return;
            }
            // checking if job labels are tracked by listener
            if (intersect_filter_has_this(monitor.labels, listener.tracked.monitorLabels).length > 0) {
                this.monitorConnections.push([monitor.id, listener.id]);
                this.jobConnections.push([job.id, listener.id]);
            }
        });
        // console.log(this.jobConnections, "job");
    };

    /**
     * Removes listener
     */
    public removeListener = (listener: IListenerData) => {
        this.jobConnections = this.jobConnections.filter((el) => el[1] !== listener.id);
        this.monitorConnections = this.monitorConnections.filter((el) => el[1] !== listener.id);
    };

    /**
     * Removes monitor
     */
    public removeMonitor = (monitor: Monitor) => {
        monitor.getJobs().forEach((el) => {
            this.removeJob(el);
        });
        this.monitorConnections = this.monitorConnections.filter((el) => el[0] !== monitor.id);
    };

    /**
     * Removes job
     */
    public removeJob = (job: Job) => {
        this.jobConnections = this.jobConnections.filter((el) => el[0] !== job.id);
    };

    /**
     * Inform listeners about monitor and jobs changes
     * Routing is based on jobConnections and monitorConnections
     */
    public informListeners = (eventType: EVENT_TYPE, monitor: Monitor, job: Job | null = null) => {
        // asume its job event
        console.log("              > informing " + eventType + " " + monitor.id);

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
                    console.log("sub job ---");
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

/**
 * Helper to look labels intersect
 */
function intersect_filter_has_this(a: string[], b: string[]) {
    return a.filter(Set.prototype.has, new Set(b));
}

export const multiplexer = new Multiplexer();
