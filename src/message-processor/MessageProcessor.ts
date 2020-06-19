import { IMonitor, structure } from "../jobs-structure/Structure";
import { IJobMessage, IMessage } from "../common-interface/IMessage";
import { websockets } from "../websockets/Websockets";
import { informator } from "../informator/Informator";

class MessageProcessor {
    public process = (message: IMessage) => {
        if (message.type === "job") {
            const m: IJobMessage = message as IJobMessage;
            const monitor = structure.getMonitor(m.monitorId);
            if (monitor === null) {
                const client: IMonitor = {
                    id: m.monitorId,
                    name: m.monitorData?.name ?? "unknown name",
                    title: m.monitorData?.title ?? "unknown title",
                    description: m.monitorData?.description ?? "unknown title",
                    labels: m.monitorData?.labels ?? [],
                    modified: Date.now(),
                    jobs: [
                        {
                            id: m.jobId,
                            name: m.name,
                            description: m.description,
                            progress: m.progress,
                            currentOperation: m.currentOperation,
                            logs: m.logsPart,
                            errorLogs: m.logsErrorPart,
                            title: m.title,
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
                        name: m.name,
                        description: m.description,
                        progress: m.progress,
                        currentOperation: m.currentOperation,
                        logs: m.logsPart,
                        errorLogs: m.logsErrorPart,
                        title: m.title,
                    });
                } else {
                    monitor.jobs[jobIndex] = {
                        ...monitor.jobs[jobIndex],
                        progress: m.progress,
                        currentOperation: m.currentOperation,
                        logs: [...monitor.jobs[jobIndex].logs, ...m.logsPart],
                        errorLogs: [...monitor.jobs[jobIndex].errorLogs, ...m.logsErrorPart],
                    };
                }
            }
        }
        informator.triggerClientInformation();
    };
}

export const messageProcessor = new MessageProcessor();
