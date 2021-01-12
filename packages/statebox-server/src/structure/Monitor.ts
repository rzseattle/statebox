import { Job } from "./Job";
import { AbstractTrackableObject } from "./AbstractTrackableObject";
import { STATEBOX_EVENTS } from "./StateboxEventsRouter";
import { compareLabels } from "../lib/CompareTools";
import { IMonitorMessage, MonitorOverwrite } from "statebox-common";
import { Operations } from "statebox-common";

export interface IMonitorData extends IMonitorMessage {
    id: string;
}

export class Monitor extends AbstractTrackableObject implements IMonitorData {
    public static defaultOverwriteStrategy = MonitorOverwrite.CreateNew;
    id: string;
    title = "";
    labels: string[];
    jobs: Job[] = [];
    description = "";
    modified: number = Date.now();
    overwriteStrategy: MonitorOverwrite = Monitor.defaultOverwriteStrategy;
    logRotation = 100;
    lifeTime = 3600;
    allowedClientActions: number = Operations.REMOVE_JOB + Operations.REMOVE_MONITOR + Operations.CLEAN_JOB;
    listenersAccess: { accessToken?: string; jwtCompareData?: any };
    throttle?: number;

    constructor(id: string, labels: string[], dataToConsume: IMonitorMessage = null) {
        super();
        this.id = id;
        this.labels = labels;
        if (dataToConsume !== null) {
            this.consumeInputData(dataToConsume, false);
        }
    }

    consumeInputData(monitorData: IMonitorMessage, triggerChangeEvent = true) {
        this.overwriteStrategy = monitorData.overwriteStrategy ?? this.overwriteStrategy;
        this.title = monitorData.title ?? this.title;
        this.description = monitorData.description ?? this.description;
        this.logRotation = monitorData.logRotation ?? this.logRotation;
        this.lifeTime = monitorData.lifeTime ?? this.lifeTime;
        this.listenersAccess = monitorData.listenersAccess;

        if (triggerChangeEvent) {
            this.runEvent(STATEBOX_EVENTS.MONITOR_UPDATED, this);
        }
    }

    serialize = (): IMonitorData => {
        return {
            id: this.id,
            title: this.title,
            description: this.description,
            labels: this.labels,
            overwriteStrategy: this.overwriteStrategy,
            logRotation: this.logRotation,
            lifeTime: this.lifeTime,
            allowedClientActions: this.allowedClientActions,
            listenersAccess: this.listenersAccess,
        };
    };

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
