import { IListenerData, listeners } from "./Listeners";
import { IJob, IMonitor, structure } from "./Structure";

class Multiplexer {
    private connections: [string, string][] = new Array();

    public addListener = (listener: IListenerData): any => {
        //console.log("dodaje listenera");
        //console.log(listener);
        structure.monitors.forEach((monitor) => {
            if (monitor.authKey !== "" && monitor.authKey !== listener.authKey) {
                return;
            }

            if (intersect_filter_has_this(monitor.labels, listener.tracked.monitorLabels).length > 0) {
                monitor.jobs.forEach((el) => {
                    this.connections.push([el.id, listener.id]);
                });
            }
        });
        console.log(this.connections, "listener");
    };
    // public addMonitor = (monitor: IMonitor) => {};
    public addJob = (monitor: IMonitor, job: IJob) => {
        //console.log(job);
        listeners.getAll().forEach((listener) => {
            if (monitor.authKey !== "" && monitor.authKey !== listener.authKey) {
                return;
            }
            if (intersect_filter_has_this(monitor.labels, listener.tracked.monitorLabels).length > 0) {
                this.connections.push([job.id, listener.id]);
            }
        });
        console.log(this.connections, "job");
    };

    public removeListener = (listener: IListenerData) => {
        this.connections = this.connections.filter((el) => el[1] !== listener.id);
    };

    public removeMonitor = (monitor: IMonitor) => {
        monitor.jobs.forEach((el) => {
            this.removeJob(el);
        });
    };

    public removeJob = (job: IJob) => {
        this.connections = this.connections.filter((el) => el[0] !== job.id);
    };

    public informListeners = (job: IJob) => {
        this.connections
            .filter((el) => el[0] === job.id)
            .forEach((connection) => {
                listeners.get(connection[1])?.websocket.send(JSON.stringify(structure.monitors));
                //listeners.get(connection[1])?.websocket.send(JSON.stringify(job));
            });
    };
}

function intersect_filter_has_this(a: string[], b: string[]) {
    return a.filter(Set.prototype.has, new Set(b));
}

export const multiplexer = new Multiplexer();
