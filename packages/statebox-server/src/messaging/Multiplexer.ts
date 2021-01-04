import { IListenerData, Listeners } from "../structure/Listeners";
import { Monitor } from "../structure/Monitor";
import { Monitors } from "../structure/Monitors";
import { Job } from "../structure/Job";
import { STATEBOX_EVENTS } from "../structure/StateboxEventsRouter";
import { isSubset } from "../lib/CompareTools";
import { Logger } from "../lib/Logger";

/**
 * Object with passign right infromation baset on selectors
 */
export class Multiplexer {
    /**
     * connection between  [ jobId , listenerId ]
     * @private
     */
    private jobConnections: [string, string][] = [];
    /**
     * connection between  [ monitorId , listenerId ]
     * @private
     */
    private monitorConnections: [string, string][] = [];

    /**
     * Not implemented yet , connections to listen everything
     * @private
     */
    // private adminConnections: string[] = [];

    constructor(private logger: Logger, private listeners: Listeners, private monitors: Monitors) {
        // setInterval(() => {
        //     this.logger.log(this.monitorConnections, )
        // }, 3000)
    }

    /**
     * Adds listener and connect it with monitors and jobs
     * by jobConnections and monitorConnections
     * @param listener
     */
    public addListener = (listener: IListenerData): any => {
        this.logger.log("Listener add " + listener.id);
        this.monitors.monitors.forEach((monitor) => {
            listener.tracked.monitorLabels.forEach((listenerMonitorLabels) => {
                if (isSubset(listenerMonitorLabels, monitor.labels)) {
                    this.monitorConnections.push([monitor.id, listener.id]);
                    monitor.getJobs().forEach((el) => {
                        listener.tracked.jobLabels.forEach((listenersJobLabels) => {
                            if (isSubset(listenersJobLabels, el.labels)) {
                                this.jobConnections.push([el.id, listener.id]);
                            }
                        });
                    });
                }
            });
        });
        // initing data in listener
        const tmpMonitors: Monitor[] = [];

        this.monitorConnections
            .filter((el) => el[1] === listener.id)
            .forEach((connection) => {
                const monitor = this.monitors.findById(connection[0]);
                if (monitor !== null) {
                    // TODO
                    tmpMonitors.push(monitor);
                    //monitor.getJobs()
                }
            });

        listener.commChannel.send(
            JSON.stringify({
                event: "init-info",
                monitors: tmpMonitors,
            }),
        );

        // this.logger.log(this.jobConnections, "listener");
    };
    /**
     * Adds monitor and connect it with listeners
     * by  monitorConnections
     */
    public addMonitor = (monitor: Monitor) => {
        this.logger.log("------------------------ adding monitor ", monitor.labels);
        this.listeners.getAll().forEach((listener) => {
            listener.tracked.monitorLabels.forEach((listenerMonitorLabels) => {
                if (isSubset(listenerMonitorLabels, monitor.labels)) {
                    // checking if monitor labels are tracked by listener
                    this.logger.log("Monitor is now connected to listener: " + listener.id);
                    this.monitorConnections.push([monitor.id, listener.id]);
                }
            });
        });
    };

    /**
     * Adds job and connect it with listeners
     * by  jobConnections
     */
    public addJob = (monitor: Monitor, job: Job) => {
        this.logger.log("--------------- adding job", job.labels);


        this.listeners.getAll().forEach((listener) => {
            // checking if job labels are tracked by listener
            listener.tracked.monitorLabels.forEach((listenerMonitorLabels) => {
                if (isSubset(listenerMonitorLabels, monitor.labels)) {

                    if (listener.tracked.jobLabels.length === 0) {
                        this.jobConnections.push([job.id, listener.id]);
                    } else {
                        listener.tracked.jobLabels.forEach((listenerJobLabels) => {
                            if (job.labels.length === 0 || isSubset(listenerJobLabels, job.labels)) {
                                this.jobConnections.push([job.id, listener.id]);
                            }
                        });
                    }
                }
            });
        });
        // this.logger.log(this.jobConnections, "job");
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
        this.logger.log("              > informing " + eventType + " " + monitor.id);

        if (job !== null) {
            this.logger.log(eventType);
            const comm = {
                event: eventType,
                monitorId: monitor.id,
                job,
            };
            this.jobConnections
                .filter((el) => el[0] === job.id)
                .forEach((connection) => {
                    this.logger.log("sub job ---");
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
                    this.logger.log("sub ----");
                    this.listeners.get(connection[1])?.commChannel.send(JSON.stringify(comm));
                });
        }
    };
}
