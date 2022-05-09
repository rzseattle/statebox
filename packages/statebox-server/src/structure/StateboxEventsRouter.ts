import { STATEBOX_EVENTS } from "statebox-common";

export type StateboxChangeListener = (eventType: STATEBOX_EVENTS, data: unknown) => void;

export class StateboxEventsRouter {
    private eventListeners: StateboxChangeListener[] = [];

    public pushEvent = (eventType: STATEBOX_EVENTS, data: any) => {
        for (const l of this.eventListeners) {
            l(eventType, data);
        }
    };

    onChange = (listener: StateboxChangeListener) => {
        this.eventListeners.push(listener);
    };
}
