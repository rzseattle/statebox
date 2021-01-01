import React from "react";
import { Job } from "./Job";
import {IJob} from "statebox-client";

export const JobList = ({ jobs, monitorId }: { jobs: IJob[]; monitorId: string }) => {
    return (
        <div>
            {/*(Active: {jobs.filter(el => !el.done).length} | Done: {jobs.filter(el => el.done).length})*/}
            {jobs.map((job) => {
                return <Job job={job} key={job.id} monitorId={monitorId} />;
            })}
        </div>
    );
};
