import { AbstractTrackableObject } from "./AbstractTrackableObject";
import { IJobMessage, ILogKindMessage, STATEBOX_EVENTS } from "statebox-common";

export class Job extends AbstractTrackableObject implements IJobMessage {
    jobId: string;
    name: string;
    title = "";
    labels: string[];
    description = "";
    progress: { current: number; end: number } = { current: -1, end: -1 };
    currentOperation = "";
    logsPart: ILogKindMessage[] = [];
    done = false;
    data: any = null;
    error = false;
    monitorId: string;
    logRotation = 200;
    type: "job";

    constructor(monitorId: string, id: string, name: string, labels: string[], toConsume: Partial<IJobMessage> = {}) {
        super();
        this.monitorId = monitorId;
        this.jobId = id;
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
            this.logsPart = this.prepareLogsArray(this.logsPart, jobData.logsPart, this.logRotation);
        }
        this.title = jobData.title ?? this.title;
        this.done = jobData.done ?? this.done;
        this.error = jobData.error ?? this.error;

        this.data = jobData.data ?? this.data;

        if (triggerChangeEvent) {
            this.runEvent(STATEBOX_EVENTS.JOB_UPDATED, { monitorId: this.monitorId, job: this });
        }
    }

    serialize = (): IJobMessage => {
        return {
            type: "job",
            name: this.name,
            jobId: this.jobId,
            monitorId: this.monitorId,
            title: this.title,
            description: this.description,
            labels: this.labels,
            progress: this.progress,
            currentOperation: this.currentOperation,
            logsPart: this.logsPart,
            done: this.done,
            error: this.error,
            data: this.data,
        };
    };

    private prepareLogsArray = (
        currentLogsArray: ILogKindMessage[],
        input: ILogKindMessage[],
        maxLength: number,
    ): ILogKindMessage[] => {
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
