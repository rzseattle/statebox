
import { nanoid } from "nanoid";

import { Monitor } from "../structure/Monitor";
import { Job } from "../structure/Job";

import { Monitors } from "../structure/Monitors";
import {IIdRequestMessage, MonitorOverwrite} from "statebox-common";

export class IdRequestProcessor {
    constructor(private monitorList: Monitors) {}
    process = (message: IIdRequestMessage): string => {
        let id = nanoid();

        if (message.elementType === "monitor") {
            if (message.monitorLabels.length > 0 && message.overwriteStrategy !== MonitorOverwrite.CreateNew) {
                let monitor = this.monitorList.findByLabels(message.monitorLabels);

                if (monitor !== null && message.overwriteStrategy === MonitorOverwrite.Replace) {
                    // id = monitor.id;
                    this.monitorList.remove(monitor);
                    monitor = null;
                }

                if (monitor !== null) {
                    id = monitor.id;
                } else {
                    const newMonitor = new Monitor(id, message.monitorLabels);

                    if (message.data?.monitor) {
                        newMonitor.consumeInputData(message.data.monitor, false);
                    }

                    this.monitorList.add(newMonitor);
                }
            } else {
                const newMonitor = new Monitor(id, message.monitorLabels);

                if (message.data?.monitor) {
                    newMonitor.consumeInputData(message.data.monitor, false);
                }
                this.monitorList.add(newMonitor);
            }
        } else {
            let monitor = this.monitorList.findById(message.monitorId);
            if (!monitor) {
                monitor = new Monitor(id, message.monitorLabels);

                if (message.data?.monitor) {
                    monitor.consumeInputData(message.data.monitor, false);
                }
                this.monitorList.add(monitor);
            }

            if (message.jobLabels.length > 0 && message.overwriteStrategy !== MonitorOverwrite.CreateNew) {
                let job = monitor.findJobByLabels(message.jobLabels);

                if (message.overwriteStrategy === MonitorOverwrite.Replace) {
                    monitor.removeJob(job);
                    job = null;
                }

                if (job !== null) {
                    id = job.id;
                } else {
                    const newJob = new Job(
                        monitor.id,
                        id,
                        message.data?.job?.name || "",
                        message.jobLabels,
                        message.data?.job ?? {},
                    );
                    monitor.addJob(newJob);
                }
            } else {
                const newJob = new Job(
                    monitor.id,
                    id,
                    message.data?.job?.name || "",
                    message.jobLabels,
                    message.data?.job ?? {},
                );
                monitor.addJob(newJob);
            }
        }

        return id;
    };
}
