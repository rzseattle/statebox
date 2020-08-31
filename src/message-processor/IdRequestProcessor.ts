import { IIdRequestMessage, MonitorOverwrite } from "../common-interface/IMessage";
import { nanoid } from "nanoid";
import { IMonitor, structure } from "../structure/Structure";
import { multiplexer } from "../structure/Multiplexer";
import { informator } from "../informator/Informator";

export class IdRequestProcessor {
    process = (message: IIdRequestMessage): string => {
        let id = nanoid();

        if (message.elementType === "monitor") {
            if (message.monitorLabels.length > 0 && message.overwriteStrategy !== MonitorOverwrite.CreateNew) {
                const monitor = structure.findMonitorByLabels(message.monitorLabels);

                if (monitor !== null) {
                    id = monitor.id;
                } else {
                    const newMonitor: IMonitor = {
                        id,
                        overwriteStrategy: message.overwriteStrategy,
                        title: message.data.monitor?.title || "Unknow",
                        description: message.data.monitor?.description || "Unknow",
                        labels: message.monitorLabels,
                        modified: Date.now(),
                        logRotation: message.data.monitor?.logRotation || 100,
                        lifeTime: message.data.monitor?.lifeTime || 3600,
                        authKey: "",
                        jobs: [],
                    };

                    structure.registerMonitor(newMonitor);
                }
            }
        } else {
            if (message.jobLabels.length > 0 && message.overwriteStrategy !== MonitorOverwrite.CreateNew) {
                const job = structure.findJobByLabels(message.monitorId, message.jobLabels);
                const monitor = structure.getMonitor(message.monitorId, [], message.overwriteStrategy);
                if (monitor) {
                    if (job !== null) {
                        id = job.id;
                    } else {
                        const jobEntry = {
                            id,
                            description: message.data.job?.description || "unktow description",
                            progress: message.data.job?.progress || { current: -1, end: -1 },
                            currentOperation: message.data.job?.currentOperation || "",
                            logs: [],
                            errorLogs: [],
                            title: message.data.job?.title || "unktow title",
                            done: false,
                            error: false,
                            labels: message.jobLabels,
                        };
                        monitor?.jobs.push(jobEntry);
                        multiplexer.addJob(monitor, jobEntry);
                        informator.jobAdded(monitor, jobEntry);
                    }
                } else {
                    console.log("No monitor found");
                }
            }
        }

        return id;
    };
}
