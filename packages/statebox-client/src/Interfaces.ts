import { WEBSOCKET_STATUS } from "./SocketEnums";
import { IJobMessage } from "statebox-common";

export type MessageListener = (message: any) => void;
export type ChangeListener = (structure: Array<IMonitorClientState>) => void;
export type StatusListener = (status: WEBSOCKET_STATUS) => void;

export interface IConfig {
    authPhrase?: string;
    jwt?: string;
    tracked: string[];
}

export interface IMonitorClientState {
    id: string;
    title: string;
    description: string;
    modified: number;
    jobs: Partial<IJobMessage>[];
}


export interface IUnifiedWebsockets {
    send(message:string)
}
