import { IMessage } from "./IMessage";
import { MonitorOverwrite } from "./MonitorOverwrite";
import { IMonitorMessage } from "./IMonitorMessage";
import { IJobMessage } from "./IJobMessage";

export interface IIdRequestMessage extends IMessage {
    type: "id-request";
    elementType: "monitor" | "job";
    overwriteStrategy?: MonitorOverwrite;
    monitorLabels?: string[];
    jobLabels?: string[];
    time?: number;
    controlKey1: string;
    controlKey2: string;
    access: {
        accessToken?: string;
        jwt?: string;
    };
    data?: {
        monitor?: IMonitorMessage;
        job?: IJobMessage;
    };
}
