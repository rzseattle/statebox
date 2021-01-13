import { STATEBOX_EVENTS } from "../common";

import { IJobMessage, IMonitorMessage } from "../monitor";

export interface IMonitorInitInfo extends IMonitorMessage {
    jobs: IJobMessage[];
}

export interface IInitMessage {
    event: STATEBOX_EVENTS.LISTENER_INIT_INFO;
    monitors: IMonitorInitInfo[];
}
