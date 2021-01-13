import { STATEBOX_EVENTS } from "statebox-common";

export type StateboxChangeListener = (eventType: STATEBOX_EVENTS, data: unknown) => void;

export class StateboxEventsRouter {
    private eventListeners: StateboxChangeListener[] = [];

    public pushEvent = (evetnType: STATEBOX_EVENTS, data: any) => {
        for (const l of this.eventListeners) {
            l(evetnType, data);
        }
    };

    onChange = (listener: StateboxChangeListener) => {
        this.eventListeners.push(listener);
    };
}
