import { IMonitor, structure } from "../jobs-structure/Structure";
import { IIdRequestMessage, IJobMessage, IMessage, MonitorOverwrite } from "../common-interface/IMessage";
import { informator } from "../informator/Informator";
import { nanoid } from "nanoid";

class MessageProcessor {
    public process = (message: IMessage, ws: any) => {
        if (message.type === "job") {
            const m: IJobMessage = message as IJobMessage;

            const labels = m.monitorData?.labels ?? [];
            const overwriteStrategy = m.monitorData?.overwriteStrategy ?? MonitorOverwrite.CreateNew;
            let monitor = structure.getMonitor(m.monitorId, labels, overwriteStrategy);
            console.log(structure.monitors.length);
            if (monitor) {
                console.log("znalazłem monitor" + monitor.id);
            }

            if (monitor !== null && overwriteStrategy === MonitorOverwrite.Replace) {
                structure.unregisterMonitor(monitor);
                monitor = null;
            }

            if (monitor === null) {
                const client: IMonitor = {
                    id: m.monitorId,
                    overwriteStrategy,
                    title: m.monitorData?.title ?? "unknown title",
                    description: m.monitorData?.description ?? "unknown title",
                    labels,
                    modified: Date.now(),
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
                structure.registerMonitor(client);
            } else {
                monitor.modified = Date.now();
                const jobIndex = monitor.jobs.findIndex((el) => el.id === m.jobId);
                if (jobIndex === -1) {
                    monitor.jobs.push({
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
                    });
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
                }
            }
            informator.triggerClientInformation();
        } else if (message.type === "id-request") {
            const m: IIdRequestMessage = message as IIdRequestMessage;

            let id = nanoid();

            if (m.elementType === "monitor") {
                if (m.monitorLabels.length > 0 && m.overwriteStrategy !== MonitorOverwrite.CreateNew) {
                    const monitor = structure.findMonitorByLabels();
                    if (monitor !== null) {
                        id = monitor.id;
                    }
                }
            } else {
                if (m.jobLabels.length > 0 && m.overwriteStrategy !== MonitorOverwrite.CreateNew) {
                    const monitor = structure.findJobByLabels(m.monitorId, m.jobLabels);
                    if (monitor !== null) {
                        id = monitor.id;
                    }
                }
            }

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
