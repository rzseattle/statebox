import { LogMessageTypes } from "./LogMessageTypes";

export interface ILogKindMessage {
    /**
     * Key is assigned after consume log from monitor
     */
    key?: number;
    type: LogMessageTypes;
    msg: string;
    time: number;
}
