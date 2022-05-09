import { MonitorOverwrite } from "./MonitorOverwrite";

export interface IMonitorMessage {
    id?: string;
    title?: string;
    description?: string;
    labels: string[];
    listenersAccess?: {
        accessToken?: string;
        jwtCompareData?: any;
    };
    overwriteStrategy?: MonitorOverwrite;
    logRotation?: number;
    lifeTime?: number;
    throttle?: number;
    allowedClientActions?: number;
    doneJobDeleteTimeout?:  number;

}
