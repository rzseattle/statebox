import { STATEBOX_EVENTS, StateboxEventsRouter } from "./StateboxEventsRouter";

export abstract class AbstractTrackableObject {
    /**
     * Event listeners registry
     */
    protected eventsRouter: StateboxEventsRouter;

    public injectEventsTracker(eventsRouter: StateboxEventsRouter) {
        this.eventsRouter = eventsRouter;
    }

    protected runEvent = (eventType: STATEBOX_EVENTS, data: any) => {
        this.eventsRouter.pushEvent(eventType, data);
    };
}
