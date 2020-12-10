import { IJob, IMonitor, structure } from "../structure/Structure";
import {
    IActionMessage,
    IIdRequestMessage,
    IJobMessage,
    IMessage,
    MonitorOverwrite,
} from "../common-interface/IMessage";
import { informator } from "../informator/Informator";
import { nanoid } from "nanoid";
import { multiplexer } from "../structure/Multiplexer";
import { IdRequestProcessor } from "./IdRequestProcessor";

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
            const overwriteStrategy = m.monitorData?.overwriteStrategy ?? MonitorOverwrite.CreateNew;
            const monitor = structure.getMonitor(m.monitorId, labels, overwriteStrategy);

            // if (m.monitorId  === "" && monitor !== null && overwriteStrategy === MonitorOverwrite.Replace) {
            //     multiplexer.removeMonitor(monitor);
            //     structure.unregisterMonitor(monitor);
            //     monitor = null;
            // }

            if (monitor === null) {
                console.log("nie znalazłem");
            }

            let job: IJob;
            // monitor is not found for job
            if (monitor === null) {
                const client: IMonitor = {
                    id: m.monitorId,
                    overwriteStrategy,
                    title: m.monitorData?.title ?? "unknown title",
                    description: m.monitorData?.description ?? "unknown title",
                    labels,
                    modified: Date.now(),
                    logRotation: m.monitorData?.logRotation ?? 200,
                    lifeTime: m.monitorData?.logRotation ?? 3600,
                    authKey: m.monitorData?.authKey ?? "",
                    canClientDoAction: m.monitorData?.canClientDoAction ?? false,
                    jobs: [
                        {
                            id: m.jobId,
                            name: m.name,
                            description: m.description,
                            progress: m.progress,
                            currentOperation: m.currentOperation,
                            logs: m.logsPart,
                            title: m.title,
                            done: m.done ?? false,
                            error: m.error ?? false,
                            labels: m.labels ?? [],
                            data: m.data ?? null,
                        },
                    ],
                };
                job = client.jobs[0];
                multiplexer.addMonitor(client);
                multiplexer.addJob(client, job);
                informator.jobAdded(client, job);
                structure.registerMonitor(client);
            } else {
                // monitor is found for job

                monitor.modified = Date.now();
                const jobIndex = monitor.jobs.findIndex((el) => el.id === m.jobId);

                if (jobIndex === -1) {
                    job = {
                        id: m.jobId,
                        name: m.name,
                        description: m.description,
                        progress: m.progress,
                        currentOperation: m.currentOperation,
                        logs: m.logsPart,
                        title: m.title,
                        done: m.done ?? false,
                        error: m.error ?? false,
                        labels: m.labels ?? [],
                        data: m.data ?? null,
                    };

                    monitor.jobs.push(job);
                    multiplexer.addJob(monitor, job);
                    informator.jobAdded(monitor, job);
                } else {
                    monitor.jobs[jobIndex] = {
                        ...monitor.jobs[jobIndex],
                        progress: m.progress,
                        currentOperation: m.currentOperation,
                        logs: [...monitor.jobs[jobIndex].logs, ...m.logsPart],
                        done: m.done ?? false,
                        error: m.error ?? false,
                        data: m.data ?? null,
                    };

                    job = monitor.jobs[jobIndex];
                    informator.jobUpdated(monitor, job);
                }
            }

            // informator.triggerClientInformation();
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
            const monitor = structure.getMonitor(m.monitorId, [], null);

            if (monitor) {
                if (m.subjectType === "monitor") {
                    if (m.action === "remove") {
                        structure.unregisterMonitor(monitor);
                    }
                    if (m.action === "cleanup") {
                        monitor.jobs.forEach((job) => {
                            informator.jobRemoved(monitor, job);
                        });
                        monitor.jobs = [];
                    }
                } else if (m.subjectType === "job") {
                    const jobIndex = monitor.jobs.findIndex((el) => el.id === m.subjectId);

                    if (jobIndex !== -1) {
                        const job = monitor.jobs[jobIndex];

                        if (m.action === "remove") {
                            informator.jobRemoved(monitor, job);
                            monitor.jobs.splice(jobIndex, 1);
                        }
                        if (m.action === "cleanup") {
                            informator.jobUpdated(monitor, job);
                        }
                    }
                }
            }
        }
    };
}

export const messageProcessor = new MessageProcessor();
