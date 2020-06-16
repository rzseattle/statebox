import { IClient, structure } from "../jobs-structure/Structure";
import { IJobMessage, IMessage } from "../common-interface/IMessage";
import { websockets } from "../websockets/Websockets";

class MessageProcessor {
    public process = (message: IMessage) => {
        if (message.type === "job") {
            const m: IJobMessage = message as IJobMessage;
            console.log(m, "priccessing");

            const index = structure.clients.findIndex((el) => el.id === m.clientId);
            if (index === -1) {
                const client: IClient = {
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
                structure.clients.push(client);
            }
            websockets.informClients(structure.clients);
        }
    };
}
export const messageProcessor = new MessageProcessor();
