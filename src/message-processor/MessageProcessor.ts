import { IMonitor, structure } from "../jobs-structure/Structure";
import { IJobMessage, IMessage } from "../common-interface/IMessage";
import { websockets } from "../websockets/Websockets";

class MessageProcessor {
    public process = (message: IMessage) => {
        if (message.type === "job") {
            const m: IJobMessage = message as IJobMessage;
            console.log(m, "priccessing");

            const monitor = structure.getMonitor(m.clientId);
            if(monitor === null ){
                const client: IMonitor = {
                    id: m.clientId,
                    name: "clientName",
                    title: "test client",
                    description: "test description",
                    modified: Date.now(),
                    jobs: [
                        {
                            id: m.jobId,
                            name: m.title,
                            description: m.description,
                            progress: m.progress,
                            title: m.title,
                        },
                    ],
                };
                structure.registerMonitor(client);
            }else{

            }

            const index = structure.monitors.findIndex((el) => el.id === m.clientId);
            if (index === -1) {

                structure.monitors.push(client);
            }
            websockets.informClients(structure.monitors);
        }
    };
}
export const messageProcessor = new MessageProcessor();
