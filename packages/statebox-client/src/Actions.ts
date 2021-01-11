import { IJob } from "./Interfaces";

export class Actions {
    constructor(private id: string, private connection: WebSocket) {}

    public clearJob = (monitorId: string, job: IJob) => {
        // alert("cleruje jak holera" + job.id);
        this.connection.send(
            JSON.stringify({
                action: "remove-job",
                monitorId,
                listenerId: this.id,
                jobId: job.id,
            })
        );
    };
}
