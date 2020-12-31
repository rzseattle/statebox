import { IIdRequestMessage, MonitorOverwrite } from "../common-interface/IMessage";
import { nanoid } from "nanoid";

import { IMonitor, Monitor } from "../structure/Monitor";
import { monitorList } from "../structure/MonitorList";
import { Job } from "../structure/Job";
import { multiplexer } from "./Multiplexer";
import { informator } from "./Informator";

export class IdRequestProcessor {
    process = (message: IIdRequestMessage): string => {
        let id = nanoid();

        if (message.elementType === "monitor") {
            if (message.monitorLabels.length > 0 && message.overwriteStrategy !== MonitorOverwrite.CreateNew) {
                let monitor = monitorList.findByLabels(message.monitorLabels);

                if (monitor !== null && message.overwriteStrategy === MonitorOverwrite.Replace) {
                    // id = monitor.id;
                    monitorList.remove(monitor);
                    monitor = null;
                }

                if (monitor !== null) {
                    id = monitor.id;
                } else {
                    const newMonitor = new Monitor(id, message.monitorLabels);

                    if (message.data.monitor) {
                        newMonitor.consumeInputData(message.data.monitor);
                    }

                    monitorList.add(newMonitor);
                }
            }
        } else {
            if (message.jobLabels.length > 0 && message.overwriteStrategy !== MonitorOverwrite.CreateNew) {
                const monitor = monitorList.getMonitorTODOANDREMOVE(message.monitorId, [], message.overwriteStrategy);

                if (monitor) {
                    const job = monitor.findJobByLabels(message.jobLabels);

                    if (job !== null) {
                        id = job.id;
                    } else {
                        const newJob = new Job(monitor, id, message.data.job?.name || "", message.jobLabels);

                        if (message.data.job) {
                            newJob.consumeInputData(message.data.job);
                        }

                        multiplexer.addJob(monitor, newJob);
                        informator.jobAdded(monitor, newJob);
                    }
                }
            }
        }

        return id;
    };
}
