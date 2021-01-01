import { IActionMessage, IIdRequestMessage, IJobMessage, IMessage } from "../common-interface/IMessage";

import { IdRequestProcessor } from "./IdRequestProcessor";
import { Monitor } from "../structure/Monitor";
import { Job } from "../structure/Job";
import { monitorList } from "../structure/MonitorList";
import { informator } from "./Informator";

/**
 * Processing all incoming messages
 * Only 2 type of messages are processed:
 * job - job monitoring
 * id-request - gives id to any object which want to be monitored based on labels and overwrite strategy
 */
class MessageProcessor {
    private readonly idRequestProcessor: IdRequestProcessor;
    constructor() {
        this.idRequestProcessor = new IdRequestProcessor();
    }

    public process = (message: IMessage, ws: any) => {
        console.log(
            "message:" +
                message.type +
                " m:" +
                // @ts-ignore
                (message.monitorData?.labels ?? []).join(",") +
                " j:" +
                // @ts-ignore
                (message?.labels ?? []).join(","),
        );

        if (message.type === "job") {
            const m: IJobMessage = message as IJobMessage;

            const labels = m.monitorData?.labels ?? [];
            const overwriteStrategy = m.monitorData?.overwriteStrategy ?? Monitor.defaultOverwriteStrategy;
            const monitor = monitorList.getMonitorTODOANDREMOVE(m.monitorId, labels, overwriteStrategy);

            if (monitor === null) {
                console.log("nie znalazłem");
            }

            // monitor is not found for job
            if (monitor === null) {
                const newMonitor = new Monitor(m.monitorId, m.labels);
                if (m.monitorData) {
                    newMonitor.consumeInputData(m.monitorData);
                }

                const job = new Job(newMonitor, m.jobId, m.name, m.labels ?? []);
                job.consumeInputData(m);

                monitorList.add(newMonitor);
            } else {
                // monitor is found for job

                monitor.modified = Date.now();
                let job = monitor.getJobById(m.jobId);

                if (job === null) {
                    job = new Job(monitor, m.jobId, m.name, m.labels ?? []);
                    job.consumeInputData(m);
                } else {
                    job.consumeInputData(m);
                }
                informator.jobUpdated(monitor, job);
            }
        } else if (message.type === "id-request") {
            const m: IIdRequestMessage = message as IIdRequestMessage;

            const id = this.idRequestProcessor.process(m);

            ws.send(
                JSON.stringify({
                    ...m,
                    type: "id-response",
                    id,
                }),
            );
        } else if (message.type === "action") {
            const m: IActionMessage = message as IActionMessage;
            const monitor = monitorList.getMonitorTODOANDREMOVE(m.monitorId, [], null);

            if (monitor) {
                if (m.subjectType === "monitor") {
                    if (m.action === "remove") {
                        monitorList.remove(monitor);
                    }
                    if (m.action === "cleanup") {
                        monitor.getJobs().forEach((job) => {
                            monitor.removeJob(job);
                        });
                    }
                } else if (m.subjectType === "job") {
                    const job = monitor.getJobById(m.subjectId);

                    if (job) {
                        if (m.action === "remove") {
                            monitor.removeJob(job);
                        }
                        if (m.action === "cleanup") {
                            job.cleanup();
                        }
                    }
                }
            }
        }
    };
}

export const messageProcessor = new MessageProcessor();
