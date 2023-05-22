import React from "react";
import { Job } from "./job/Job";
import { IJobMessage } from "statebox-common";
import styles from "./JobList.module.sass";

export const JobList = ({
  jobs,
}: //monitorId,
{
  jobs: Partial<IJobMessage>[];
  //monitorId: string;
}) => {
  return (
    <div className={styles.main}>
      {/*(Active: {jobs.filter(el => !el.done).length} | Done: {jobs.filter(el => el.done).length})*/}
      {/*monitorId={monitorId}*/}
      {jobs.map((job) => {
        return <Job job={job} key={job.jobId} />;
      })}
    </div>
  );
};
