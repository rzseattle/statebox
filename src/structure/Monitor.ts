import { IJobMonitorData, MonitorOverwrite } from "../common-interface/IMessage";
import { Job } from "./Job";
import { multiplexer } from "../messenging/Multiplexer";
import { informator } from "../messenging/Informator";

export enum ClientActions {
    REMOVE_MONITOR = 1,
    REMOVE_JOB = 2,
    CLEAN_JOB = 4,
}

export interface IMonitor {
    id: string;
    title: string;
    description: string;

    labels: string[];
    modified: number;
    overwriteStrategy: MonitorOverwrite;
    authKey: string;
    logRotation: number;
    lifeTime: number;
    allowedClientActions: number;

    addJob: (job: Job) => any;
    removeJob: (job: Job) => any;
    getJobs: () => Job[];
}

export class Monitor implements IMonitor {
    public static defaultOverwriteStrategy = MonitorOverwrite.CreateNew;
    id: string;
    title: string = "";
    labels: string[];
    private jobs: Job[] = [];
    description: string = "";
    modified: number = Date.now();
    overwriteStrategy: MonitorOverwrite = Monitor.defaultOverwriteStrategy;
    authKey: string = "";
    logRotation: number = 100;
    lifeTime: number = 3600;
    allowedClientActions: number = ClientActions.REMOVE_JOB + ClientActions.REMOVE_MONITOR + ClientActions.CLEAN_JOB;

    constructor(id: string, labels: string[]) {
        this.id = id;
        this.labels = labels;
    }

    consumeInputData(monitorData: IJobMonitorData) {
        this.overwriteStrategy = monitorData.overwriteStrategy ?? this.overwriteStrategy;
        this.title = monitorData.title ?? this.title;
        this.description = monitorData.description ?? this.description;
        this.logRotation = monitorData.logRotation ?? this.logRotation;
        this.lifeTime = monitorData.lifeTime ?? this.lifeTime;
        this.authKey = monitorData.authKey ?? this.authKey;
    }

    public addJob = (job: Job) => {
        this.jobs.push(job);
        // add job to routing
        multiplexer.addJob(this, job);
        // inform listeners about new event
        informator.jobAdded(this, job);
    };
    public removeJob = (job: Job) => {
        const index = this.jobs.findIndex((el) => el.id === job.id);

        // inform listeners about new event
        informator.jobRemoved(this, job);

        // add job to routing
        multiplexer.removeJob(job);

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
            if (el.labels.length > 0 && el.labels.length === labels.length && el.labels.join("") === labels.join("")) {
                return true;
            }
        });

        if (index !== -1) {
            return this.jobs[index];
        }

        return null;
    }
}
