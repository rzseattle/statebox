import WebSocket from "ws";
import { multiplexer } from "./Multiplexer";

export interface IIdWebsocket extends WebSocket {
    id: string;
}
export interface IListenerData {
    authKey: string;
    id: string;
    tracked: {
        monitorIds: string[];
        monitorLabels: string[];
        jobIds: string[];
        jobLabels: string[];
    };
    upgradeDataInfo: {
        monitorDataSend: Map<string, boolean>;
        jobsDataSend: Map<string, boolean>;
    };
    websocket: WebSocket;
}

class Listeners {
    listeners: Map<string, IListenerData> = new Map();

    public add = (ws: IIdWebsocket, data: IListenerData) => {
        data.id = ws.id;
        data.websocket = ws;
        this.listeners.set(ws.id, data);
        multiplexer.addListener(data);
    };

    public getAll = () => {
        return this.listeners;
    };

    public get = (id: string) => {
        return this.listeners.get(id);
    };

    public remove = (id: string) => {
        const listener = this.get(id);
        if (listener !== undefined) {
            multiplexer.removeListener(listener);
        }
        this.listeners.delete(id);
    };
}

// @ts-ignore
export const listeners = new Listeners();
