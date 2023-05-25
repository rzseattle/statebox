import { IdRequestProcessor } from "./IdRequestProcessor";
import { Monitor } from "../structure/Monitor";
import { Job } from "../structure/Job";
import { Monitors } from "../structure/Monitors";
import { IActionMessage, IIdRequestMessage, IJobMessage, MonitorOverwrite } from "statebox-common";

/**
 * Processing all incoming messages
 * Only 2 type of messages are processed:
 * job - job monitoring
 * id-request - gives id to any object which want to be monitored based on labels and overwrite strategy
 */
export class MessageProcessor {
    private readonly idRequestProcessor: IdRequestProcessor;
    constructor(private monitorList: Monitors) {
        this.idRequestProcessor = new IdRequestProcessor(monitorList);
    }

    public process = (
        message: IIdRequestMessage | IJobMessage | IActionMessage,
        backChannel: { send: (message: string) => void },
    ) => {
        if (message.type === "job") {
            this.processJobMessage(message as IJobMessage);
        } else if (message.type === "id-request") {
            this.processIdRequestMessage(message as IIdRequestMessage, backChannel);
        } else if (message.type === "action") {
            this.processActionMessage(message as IActionMessage);
        }
    };

    private processIdRequestMessage = (
        message: IIdRequestMessage,
        backChannel: { send: (message: string) => void },
    ) => {
        const id = this.idRequestProcessor.process(message);

        backChannel.send(
            JSON.stringify({
                ...message,
                type: "id-response",
                id,
            }),
        );
    };

    private processJobMessage = (message: IJobMessage) => {
        const labels = message.monitorData?.labels ?? [];
        const overwriteStrategy = message.monitorData?.overwriteStrategy ?? Monitor.defaultOverwriteStrategy;

        let monitor = this.monitorList.findById(message.monitorId);
        if (!monitor && overwriteStrategy !== MonitorOverwrite.CreateNew) {
            monitor = this.monitorList.findByLabels(labels);
        }

        // monitor is not found for job
        if (monitor === null) {
            const newMonitor = new Monitor(message.monitorId, message.monitorData.labels, message.monitorData ?? null);

            const job = new Job(newMonitor.id, message.jobId, message.name, message.labels ?? [], message);
            this.monitorList.add(newMonitor);
            newMonitor.addJob(job);
        } else {
            if (message.monitorData) {
                monitor.consumeInputData(message.monitorData);
            }
            monitor.modified = Date.now();
            let job = monitor.getJobById(message.jobId);

            if (job === null) {
                job = new Job(monitor.id, message.jobId, message.name, message.labels ?? [], message);
                monitor.addJob(job);
            } else {
                job.consumeInputData(message);
                if (message.done) {
                    monitor.removeJob(job);
                }
            }
        }
    };

    private processActionMessage = (message: IActionMessage) => {
        console.log(message);
        if (message.subjectType === "monitor") {
            const monitor = this.monitorList.findById(message.subjectId);
            if (monitor !== null) {
                if (message.action === "cleanup") {
                    monitor.getJobs().forEach((job) => {
                        monitor.removeJob(job);
                    });
                } else if (message.action === "remove") {
                    this.monitorList.remove(monitor);
                } else {
                    console.log("Unknown monitor action '" + message.action + "'");
                }
            }
        } else if (message.subjectType === "job") {
            const monitor = this.monitorList.findById(message.monitorId);
            const job = monitor.getJobById(message.subjectId);
            if (job !== null) {
                if (message.action === "cleanup") {
                    job.cleanup();
                } else if (message.action === "remove") {
                    monitor.removeJob(job);
                }
            } else {
                console.log("job not found");
            }
        } else {
            console.log("Unknown subject type '" + message.subjectType + "'");
        }
        // const monitor = this.monitorList.findById(message.monitorId);
        //
        // if (monitor) {
        //     if (message.subjectType === "monitor") {
        //         if (message.action === "remove") {
        //             this.monitorList.remove(monitor);
        //         }
        //         if (message.action === "cleanup") {
        //             monitor.getJobs().forEach((job) => {
        //                 monitor.removeJob(job);
        //             });
        //         }
        //     } else if (message.subjectType === "job") {
        //         const job = monitor.getJobById(message.subjectId);
        //
        //         if (job) {
        //             if (message.action === "remove") {
        //                 monitor.removeJob(job);
        //             }
        //             if (message.action === "cleanup") {
        //                 job.cleanup();
        //             }
        //         }
        //     }
        // }
    };
}
