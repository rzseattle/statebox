import { State } from "./State";
import { IMonitorClientState } from "./Interfaces";
import {
    IInitMessage,
    IJobDeleteMessage,
    IJobUpdateMessage,
    IMonitorDeleteMessage,
    IMonitorUpdateMessage,
    STATEBOX_EVENTS,
} from "statebox-common";

export class MessageProcessor {
    constructor(private state: State, private maxLogSize: number) {}

    public process(
        message:
            | IJobUpdateMessage
            | IMonitorUpdateMessage
            | IJobDeleteMessage
            | IMonitorDeleteMessage
            | IInitMessage
    ) {
        let monitor: IMonitorClientState;
        let index: number;

        switch (message.event) {
            case STATEBOX_EVENTS.JOB_UPDATED: {
                index = this.state.monitors.findIndex(
                    (el) => el.id === message.monitorId
                );
                monitor = this.state.monitors[index];
                index = monitor.jobs.findIndex(
                    (el) => el.jobId === message.jobId
                );

                monitor.jobs[index] = {
                    ...monitor.jobs[index],
                    ...message.data,
                };

                break;
            }
            case STATEBOX_EVENTS.JOB_NEW: {
                index = this.state.monitors.findIndex(
                    (el) => el.id === message.monitorId
                );
                monitor = this.state.monitors[index];
                monitor.jobs = [...monitor.jobs, message.data];
                break;
            }
            case STATEBOX_EVENTS.MONITOR_NEW: {
                index = this.state.monitors.findIndex(
                    (el) => el.id === message.monitorId
                );
                this.state.monitors.push({
                    id: message.data.id,
                    title: message.data.title,
                    description: message.data.description,
                    modified: Date.now(),
                    jobs: [],
                });
                break;
            }
            case STATEBOX_EVENTS.MONITOR_DELETED: {
                index = this.state.monitors.findIndex(
                    (el) => el.id === message.monitorId
                );
                if (index !== -1) {
                    this.state.monitors.splice(index, 1);
                }
                break;
            }
            case STATEBOX_EVENTS.LISTENER_INIT_INFO: {
                message.monitors.forEach((el) => {
                    this.state.monitors.push({
                        id: el.id,
                        title: el.title,
                        description: el.description,
                        modified: Date.now(),
                        jobs: el.jobs,
                    });
                });
                break;
            }
        }
        for (const currMonitor of this.state.monitors) {
            for (const jobIndex in currMonitor.jobs) {
                if (
                    currMonitor.jobs[jobIndex].logsPart.length >=
                    this.maxLogSize
                ) {
                    currMonitor.jobs[jobIndex].logsPart = currMonitor.jobs[
                        jobIndex
                    ].logsPart.slice(
                        currMonitor.jobs[jobIndex].logsPart.length -
                            this.maxLogSize
                    );
                }
            }
        }
    }
}
