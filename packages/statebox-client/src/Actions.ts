import { IJobMessage } from "statebox-common";

export class Actions {
    constructor(private id: string, private connection: WebSocket) {}

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
