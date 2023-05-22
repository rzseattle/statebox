import { StateboxEventsRouter } from "./StateboxEventsRouter";
import { STATEBOX_EVENTS } from "statebox-common";

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
