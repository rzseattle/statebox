import { Listeners } from "../structure/Listeners";

import { Multiplexer } from "../messaging/Multiplexer";
import { ListenersConnectionHandler } from "./ListenersConnectionHandler";
import { MonitorConnectionHandler } from "./MonitorsConnectionHandler";
import { Monitors } from "../structure/Monitors";
import { GarbageCollector } from "../garbage-collector/GarbageCollector";
import { Informator } from "../messaging/Informator";
import { MessageProcessor } from "../messaging/MessageProcessor";
import { STATEBOX_EVENTS, StateboxEventsRouter } from "../structure/StateboxEventsRouter";
import { Logger } from "../lib/Logger";

/**
 * Statebox main object
 */
export class StateboxServer {
    /**
     * Event listeners registry
     */
    public readonly eventsRouter: StateboxEventsRouter;

    /**
     * Event listeners registry
     */
    public readonly listeners: Listeners;
    /**
     * Publishers registry
     */
    public readonly monitors: Monitors;

    /**
     * Handler for listeners websockets connections
     */
    public readonly listenersConnectionHandler: ListenersConnectionHandler;
    /**
     * Handler for monitors websockets connections
     */
    public readonly monitorsConnectionHandler: MonitorConnectionHandler;

    /**
     * Sending proper information to listeners
     */
    public readonly informator: Informator;

    /**
     * Connection listeners<->monitors list
     */
    public readonly multiplexer: Multiplexer;

    /**
     * Removes old monitors data
     */
    public readonly garbageCollector: GarbageCollector;

    /**
     * Transforms input messages to state
     */
    public readonly messageProcessor: MessageProcessor;

    /**
     * Logger
     */
    public readonly logger: Logger;

    constructor(listenerPort = 3012, monitorPort = 3011) {
        this.logger = new Logger();
        this.eventsRouter = new StateboxEventsRouter();
        this.listeners = new Listeners(this.eventsRouter);
        this.monitors = new Monitors(this.eventsRouter);
        this.multiplexer = new Multiplexer(this.logger, this.listeners, this.monitors);
        this.informator = new Informator(this.logger, this.multiplexer);
        this.messageProcessor = new MessageProcessor(this.monitors);

        this.bindEvents();

        this.listenersConnectionHandler = new ListenersConnectionHandler(this.logger, listenerPort, this.listeners);
        this.monitorsConnectionHandler = new MonitorConnectionHandler(this.logger, monitorPort, this.messageProcessor);

        // this.garbageCollector = new GarbageCollector(this.monitors);
    }

    public init = async () => {
        await this.monitorsConnectionHandler.init();
        await this.listenersConnectionHandler.init();
    };

    public close = async () => {
        // this.garbageCollector.close();
        await this.monitorsConnectionHandler.close();
        await this.listenersConnectionHandler.close();
    };

    private bindEvents = () => {
        this.eventsRouter.onChange((eventType, data: any) => {
            switch (eventType) {
                case STATEBOX_EVENTS.LISTENER_NEW:
                    this.multiplexer.addListener(data);
                    break;
                case STATEBOX_EVENTS.LISTENER_DELETED:
                    this.multiplexer.removeListener(data);
                    break;
                case STATEBOX_EVENTS.MONITOR_NEW:
                    // add monitor to routing
                    this.multiplexer.addMonitor(data);
                    // inform listeners about new monitor
                    this.informator.monitorAdded(data);
                    break;
                case STATEBOX_EVENTS.MONITOR_UPDATED:
                    // inform listeners about new monitor
                    this.informator.monitorUpdated(data);
                    break;
                case STATEBOX_EVENTS.MONITOR_DELETED:
                    // sending info about removed monitor
                    this.informator.monitorRemoved(data);
                    // removed monitor from routing
                    this.multiplexer.removeMonitor(data);
                    break;
                case STATEBOX_EVENTS.JOB_NEW:
                    this.multiplexer.addJob(data.monitor, data.job);
                    this.informator.jobAdded(data.monitor, data.job);
                    break;
                case STATEBOX_EVENTS.JOB_UPDATED:
                    this.informator.jobUpdated(this.monitors.findById(data.monitorId), data.job);
                    break;
                case STATEBOX_EVENTS.JOB_DELETED:
                    // inform listeners about new event
                    this.informator.jobRemoved(data.monitor, data.job);

                    // add job to routing
                    this.multiplexer.removeJob(data.job);

                    break;
            }
        });
    };
}
