import { WEBSOCKET_STATUS } from "./SocketEnums";

export type MessageListener = (message: any) => any;
export type ChangeListener = (structure: IMonitor[]) => any;
export type StatusListener = (status: WEBSOCKET_STATUS) => any;

export interface IConfig {
  authKey: string;
  tracked: {
    monitorIds: string[];
    monitorLabels: string[];
    jobIds: string[];
    jobLabels: string[];
  };
}

export interface IMonitor {
  id: string;
  title: string;
  description: string;
  jobs: IJob[];
  modified: number;
}

export interface IJob {
  id: string;
  title: string;
  name: string;
  description: string;
  progress: { current: number; end: number };
  labels: string[];
  currentOperation: string;
  logs: ILogMessage[];
  done: boolean;
  error: boolean;
  data: any;
}

export enum LogMessageTypes {
  DEBUG,
  INFO,
  NOTICE,
  WARNING,
  ERROR,
  CRITICAL,
  ALERT,
  EMERGENCY,
}
export interface ILogMessage {
  key: number;
  type: LogMessageTypes;
  msg: string;
  time: number;
}
