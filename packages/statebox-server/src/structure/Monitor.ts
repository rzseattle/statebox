import { IJobMonitorData, MonitorOverwrite } from "../common-interface/IMessage";
import { Job } from "./Job";
import { AbstractTrackableObject } from "./AbstractTrackableObject";
import { STATEBOX_EVENTS } from "./StateboxEventsRouter";
import { compareLabels } from "../lib/CompareTools";

export enum ClientActions {
    REMOVE_MONITOR = 1,
    REMOVE_JOB = 2,
    CLEAN_JOB = 4,
}

export interface IMonitorData {
    id: string;
    title?: string;
    description?: string;
    labels: string[];
    modified?: number;
    overwriteStrategy?: MonitorOverwrite;
    logRotation?: number;
    lifeTime?: number;
    allowedClientActions?: number;
}

export class Monitor extends AbstractTrackableObject implements IMonitorData {
    public static defaultOverwriteStrategy = MonitorOverwrite.CreateNew;
    id: string;
    title = "";
    labels: string[];
    private jobs: Job[] = [];
    description = "";
    modified: number = Date.now();
    overwriteStrategy: MonitorOverwrite = Monitor.defaultOverwriteStrategy;
    logRotation = 100;
    lifeTime = 3600;
    allowedClientActions: number = ClientActions.REMOVE_JOB + ClientActions.REMOVE_MONITOR + ClientActions.CLEAN_JOB;

    constructor(id: string, labels: string[], dataToConsume: Partial<IJobMonitorData> = {}) {
        super();
        this.id = id;
        this.labels = labels;
        this.consumeInputData(dataToConsume, false);
    }

    consumeInputData(monitorData: Partial<IJobMonitorData>, triggerChangeEvent = true) {
        this.overwriteStrategy = monitorData.overwriteStrategy ?? this.overwriteStrategy;
        this.title = monitorData.title ?? this.title;
        this.description = monitorData.description ?? this.description;
        this.logRotation = monitorData.logRotation ?? this.logRotation;
        this.lifeTime = monitorData.lifeTime ?? this.lifeTime;

        if (triggerChangeEvent) {
            this.runEvent(STATEBOX_EVENTS.MONITOR_UPDATED, this);
        }
    }

    public addJob = (job: Job) => {
        this.jobs.push(job);
        job.injectEventsTracker(this.eventsRouter);
        // todo do it in smarter way
        job.logRotation = this.logRotation;
        this.runEvent(STATEBOX_EVENTS.JOB_NEW, { monitor: this, job });
    };
    public removeJob = (job: Job) => {
        const index = this.jobs.findIndex((el) => el.id === job.id);

        this.runEvent(STATEBOX_EVENTS.JOB_DELETED, { monitor: this, job });

        this.jobs.splice(index, 1);
    };

    public getJobs = () => {
        return this.jobs;
    };

    public getJobById = (id: string): Job | null => {
        const result = this.jobs.filter((job) => job.id === id);
        if (result.length === 1) {
            return result[0];
        } else {
            return null;
        }
    };

    findJobByLabels(labels: string[]): Job | null {
        const index = this.jobs.findIndex((el) => {
            return compareLabels(el.labels, labels);
        });

        if (index !== -1) {
            return this.jobs[index];
        }

        return null;
    }
}
