import { IUpdateMessage } from "./IUpdateMessage";
import { STATEBOX_EVENTS } from "../common";

export interface IJobDeleteMessage extends IUpdateMessage {
    event: STATEBOX_EVENTS.JOB_DELETED;
    jobId: string;
}
