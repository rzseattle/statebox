import { IUpdateMessage } from "./IUpdateMessage";
import { STATEBOX_EVENTS } from "../common";

export interface IMonitorDeleteMessage extends IUpdateMessage {
    event: STATEBOX_EVENTS.MONITOR_DELETED;
}
