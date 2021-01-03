import {WEBSOCKET_STATUS} from "./SocketEnums";

export type MessageListener = (message: any) => void;
export type ChangeListener = (structure: Array<IMonitor>) => void;
export type StatusListener = (status: WEBSOCKET_STATUS) => void;

export interface IConfig {
	authKey: string;
	tracked: {
		monitorIds: Array<string>;
		monitorLabels: Array<string>;
		jobIds: Array<string>;
		jobLabels: Array<string>;
	};
}

export interface IMonitor {
	id: string;
	title: string;
	description: string;
	jobs: Array<IJob>;
	modified: number;
}

export interface IJob {
	id: string;
	title: string;
	name: string;
	description: string;
	progress: {
		current: number;
		end: number;
	};
	labels: Array<string>;
	currentOperation: string;
	logs: Array<ILogMessage>;
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
