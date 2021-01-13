import { WEBSOCKET_STATUS } from "./SocketEnums";
import { IJobMessage } from "statebox-common";

export type MessageListener = (message: any) => void;
export type ChangeListener = (structure: Array<IMonitorClientState>) => void;
export type StatusListener = (status: WEBSOCKET_STATUS) => void;

export interface IConfig {
    authKey: string;
    tracked: {
        monitorIds: Array<string>;
        monitorLabels: string[][];
        jobIds: Array<string>;
        jobLabels: string[][];
    };
}

export interface IMonitorClientState {
    id: string;
    title: string;
    description: string;
    modified: number;
    jobs: Partial<IJobMessage>[];
}
