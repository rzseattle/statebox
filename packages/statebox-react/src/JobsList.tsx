import React from "react";
import { Job } from "./Job";
import { IJobMessage } from "statebox-common";

export const JobList = ({
    jobs,
    monitorId,
}: {
    jobs: IJobMessage[];
    monitorId: string;
}) => {
    return (
        <div>
            {/*(Active: {jobs.filter(el => !el.done).length} | Done: {jobs.filter(el => el.done).length})*/}
            {jobs.map((job) => {
                return <Job job={job} key={job.jobId} monitorId={monitorId} />;
            })}
        </div>
    );
};
