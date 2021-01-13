import { IUpdateMessage } from "./IUpdateMessage";
import { IJobMessage } from "../monitor";
import { STATEBOX_EVENTS } from "../common";

export interface IJobUpdateMessage extends IUpdateMessage {
    event: STATEBOX_EVENTS.JOB_UPDATED | STATEBOX_EVENTS.JOB_NEW;
    jobId: string;
    data: Partial<IJobMessage>;
}
