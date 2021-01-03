export enum STATEBOX_EVENTS {
    MONITOR_NEW = "monitor-new",
    MONITOR_UPDATED = "monitor-updated",
    MONITOR_DELETED = "monitor-deleted",
    JOB_NEW = "job-new",
    JOB_UPDATED = "job-updated",
    JOB_DELETED = "job-deleted",

    LISTENER_NEW = "listener-new",
    LISTENER_DELETED = "listener-deleted",
}

export type StateboxChangeListener = (eventType: STATEBOX_EVENTS, data: object) => void;

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
