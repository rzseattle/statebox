import { StateboxEventsRouter } from "./StateboxEventsRouter";
import { STATEBOX_EVENTS } from "statebox-common";

export interface IListenerData {
    id: string;
    admin?: {
        login: string;
        password: string;
    };
    tracked: string[];
    // upgradeDataInfo?: {
    //     monitorDataSend: Map<string, boolean>;
    //     jobsDataSend: Map<string, boolean>;
    // };
    commChannel: {
        send: (message: string) => void;
        close: () => void;
    };
}

export class Listeners {
    listeners: Map<string, IListenerData> = new Map();

    constructor(private eventsRouter: StateboxEventsRouter) {}

    public add = (data: IListenerData) => {
        this.listeners.set(data.id, data);
        this.eventsRouter.pushEvent(STATEBOX_EVENTS.LISTENER_NEW, data);

        data.commChannel.send(JSON.stringify({ event: "listener-register", id: data.id }));
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
            this.eventsRouter.pushEvent(STATEBOX_EVENTS.LISTENER_DELETED, listener);
        }
        this.listeners.delete(id);
    };
}
