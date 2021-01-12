import { State } from "./State";
import { IMonitorClientState } from "./Interfaces";

export class MessageProcessor {
    constructor(private state: State, private maxLogSize: number) {}

    public process(message: any) {
        let monitor: IMonitorClientState;
        let index: number;

        switch (message.event) {
            case "job-update": {
                index = this.state.monitors.findIndex(
                    (el) => el.id === message.monitorId
                );
                monitor = this.state.monitors[index];
                index = monitor.jobs.findIndex(
                    (el) => el.jobId === message.job.id
                );

                monitor.jobs[index] = {
                    ...monitor.jobs[index],
                    ...message.job,
                };

                break;
            }
            case "job-new": {
                index = this.state.monitors.findIndex(
                    (el) => el.id === message.monitorId
                );
                monitor = this.state.monitors[index];
                monitor.jobs = [...monitor.jobs, message.job];
                break;
            }
            case "monitor-new": {
                index = this.state.monitors.findIndex(
                    (el) => el.id === message.monitorId
                );
                this.state.monitors.push(message.monitor);
                break;
            }
            case "monitor-remove": {
                index = this.state.monitors.findIndex(
                    (el) => el.id === message.monitor.id
                );
                if (index !== -1) {
                    this.state.monitors.splice(index, 1);
                }
                break;
            }
            case "init-info": {
                message.monitors.forEach((el: IMonitorClientState) => {
                    this.state.monitors.push(el);
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
