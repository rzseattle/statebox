import { IUpdateMessage } from "./IUpdateMessage";
import { STATEBOX_EVENTS } from "../common";
import { IMonitorMessage } from "../monitor";

export interface IMonitorUpdateMessage extends IUpdateMessage {
    event: STATEBOX_EVENTS.MONITOR_UPDATED | STATEBOX_EVENTS.MONITOR_NEW;
    data: Partial<IMonitorMessage>;
}
