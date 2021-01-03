import { IJobMessage, ILogKindMessage } from "../common-interface/IMessage";
import { AbstractTrackableObject } from "./AbstractTrackableObject";
import { STATEBOX_EVENTS } from "./StateboxEventsRouter";

export interface IJob {
    id: string;
    name: string;
    title: string;
    labels: string[];
    description: string;
    progress: { current: number; end: number };
    currentOperation: string;
    logs: ILogMessage[];
    done: boolean;
    data: any;
    error: boolean;
}

export interface ILogMessage {
    key: number;
    type: LogMessageTypes;
    msg: string;
    time: number;
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

export class Job extends AbstractTrackableObject implements IJob {
    id: string;
    name: string;
    title = "";
    labels: string[];
    description = "";
    progress: { current: number; end: number } = { current: -1, end: -1 };
    currentOperation = "";
    logs: ILogMessage[] = [];
    done = false;
    data: any = null;
    error = false;
    monitorId: string;
    logRotation = 200;

    constructor(monitorId: string, id: string, name: string, labels: string[], toConsume: Partial<IJobMessage> = {}) {
        super();
        this.monitorId = monitorId;
        this.id = id;
        this.labels = labels;
        this.name = name;
        if (toConsume !== null) {
            this.consumeInputData(toConsume, false);
        }
    }

    consumeInputData(jobData: Partial<IJobMessage>, triggerChangeEvent = true) {
        this.description = jobData.description ?? this.description;
        this.progress = jobData.progress ?? this.progress;
        this.currentOperation = jobData.currentOperation ?? this.currentOperation;
        if (jobData.logsPart && jobData.logsPart.length > 0) {
            this.logs = this.prepareLogsArray(this.logs, jobData.logsPart, this.logRotation);
        }
        this.title = jobData.title ?? this.title;
        this.done = jobData.done ?? this.done;
        this.error = jobData.error ?? this.error;

        this.data = jobData.data ?? this.data;

        if (triggerChangeEvent) {
            this.runEvent(STATEBOX_EVENTS.JOB_UPDATED, { monitorId: this.monitorId, job: this });
        }
    }

    private prepareLogsArray = (
        currentLogsArray: ILogMessage[],
        input: ILogKindMessage[],
        maxLength: number,
    ): ILogMessage[] => {
        let lastKey: number = currentLogsArray.length > 0 ? currentLogsArray[currentLogsArray.length - 1].key : 0;
        const identyfied = input.map((entry) => ({ ...entry, key: ++lastKey }));

        if (currentLogsArray.length === 0 || currentLogsArray.length + identyfied.length > maxLength) {
            return identyfied.length < maxLength ? identyfied : identyfied.slice(input.length - maxLength);
        } else {
            const toCut = currentLogsArray.length + identyfied.length - maxLength;
            return [...currentLogsArray.slice(toCut), ...identyfied];
        }
    };

    cleanup() {
        // informator.jobUpdated(this.monitor, this);
        throw new Error("Not implemented cleanup for job");
    }
}
