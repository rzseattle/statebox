import { IListenerData, Listeners } from "../structure/Listeners";
import { Monitor } from "../structure/Monitor";
import { Monitors } from "../structure/Monitors";
import { Job } from "../structure/Job";
import { STATEBOX_EVENTS } from "../structure/StateboxEventsRouter";
import { intersectFilterHasThis } from "../lib/CompareTools";

/**
 * Object with passign right infromation baset on selectors
 */
export class Multiplexer {
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
    // private adminConnections: string[] = [];

    constructor(private listeners: Listeners, private monitors: Monitors) {
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
        this.monitors.monitors.forEach((monitor) => {
            if (intersectFilterHasThis(monitor.labels, listener.tracked.monitorLabels)) {
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
                const monitor = this.monitors.findById(connection[0]);
                if (monitor !== null) {
                    tmpMonitors.push(monitor);
                }
            });

        listener.commChannel.send(
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
        this.listeners.getAll().forEach((listener) => {
            if (intersectFilterHasThis(monitor.labels, listener.tracked.monitorLabels)) {
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
        this.listeners.getAll().forEach((listener) => {
            // checking if job labels are tracked by listener
            if (intersectFilterHasThis(monitor.labels, listener.tracked.monitorLabels)) {
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
            monitor.removeJob(el);
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
    public informListeners = (eventType: STATEBOX_EVENTS, monitor: Monitor, job: Job | null = null) => {
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
                    this.listeners.get(connection[1])?.commChannel.send(JSON.stringify(comm));
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
                    this.listeners.get(connection[1])?.commChannel.send(JSON.stringify(comm));
                });
        }
    };
}
