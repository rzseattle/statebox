import { IJob, IMonitor, structure } from "../structure/Structure";
import { IIdRequestMessage, IJobMessage, IMessage, MonitorOverwrite } from "../common-interface/IMessage";
import { informator } from "../informator/Informator";
import { nanoid } from "nanoid";
import { multiplexer } from "../structure/Multiplexer";
import { IdRequestProcessor } from "./IdRequestProcessor";

class MessageProcessor {
    private readonly idRequestProcessor: IdRequestProcessor;
    constructor() {
        this.idRequestProcessor = new IdRequestProcessor();
    }

    public process = (message: IMessage, ws: any) => {
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
                    jobs: [
                        {
                            id: m.jobId,
                            description: m.description,
                            progress: m.progress,
                            currentOperation: m.currentOperation,
                            logs: m.logsPart,
                            errorLogs: m.logsErrorPart,
                            title: m.title,
                            done: m.done ?? false,
                            error: m.error ?? false,
                            labels: m.labels ?? [],
                        },
                    ],
                };
                job = client.jobs[0];
                multiplexer.addMonitor(client);
                multiplexer.addJob(client, job);
                informator.jobAdded(client, job);
                structure.registerMonitor(client);
            } else {
                console.log("----------------");
                monitor.modified = Date.now();
                const jobIndex = monitor.jobs.findIndex((el) => el.id === m.jobId);

                if (jobIndex === -1) {
                    job = {
                        id: m.jobId,
                        description: m.description,
                        progress: m.progress,
                        currentOperation: m.currentOperation,
                        logs: m.logsPart,
                        errorLogs: m.logsErrorPart,
                        title: m.title,
                        done: m.done ?? false,
                        error: m.error ?? false,
                        labels: m.labels ?? [],
                    };
                    console.log("tutaj ---------------- tutaj");
                    monitor.jobs.push(job);
                    multiplexer.addJob(monitor, job);
                    informator.jobAdded(monitor, job);
                } else {
                    monitor.jobs[jobIndex] = {
                        ...monitor.jobs[jobIndex],
                        progress: m.progress,
                        currentOperation: m.currentOperation,
                        logs: [...monitor.jobs[jobIndex].logs, ...m.logsPart],
                        errorLogs: [...monitor.jobs[jobIndex].errorLogs, ...m.logsErrorPart],
                        done: m.done ?? false,
                        error: m.error ?? false,
                    };
                    console.log("tutaj2 ---------------- tutaj2");
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
        }
    };
}

export const messageProcessor = new MessageProcessor();
