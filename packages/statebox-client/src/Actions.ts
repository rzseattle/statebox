import { IJobMessage } from "statebox-common";
import {IUnifiedWebsockets} from "./Interfaces";

export class Actions {
    constructor(private id: string, private connection: IUnifiedWebsockets) {}

    public clearJob = (monitorId: string, job: IJobMessage) => {
        // alert("cleruje jak holera" + job.id);
        this.connection.send(
            JSON.stringify({
                action: "remove-job",
                monitorId,
                listenerId: this.id,
                jobId: job.jobId,
            })
        );
    };
}
