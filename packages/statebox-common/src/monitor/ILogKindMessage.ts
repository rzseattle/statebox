import {LogMessageTypes} from "./LogMessageTypes";


export interface ILogKindMessage {

    type: LogMessageTypes;
    msg: string;
    time: number;
}
