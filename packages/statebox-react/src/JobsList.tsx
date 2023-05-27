import React from "react";
import { Job } from "./job/Job";
import { IJobMessage } from "statebox-common";
import styles from "./JobList.module.sass";

export const JobList = ({
  jobs,
  reverse,
  openedWhileNotFinished,
}: //monitorId,
{
  jobs: Partial<IJobMessage>[];
  openedWhileNotFinished: boolean;
  reverse: boolean;
  //monitorId: string;
}) => {
  return (
    <div className={styles.main}>
      {/*(Active: {jobs.filter(el => !el.done).length} | Done: {jobs.filter(el => el.done).length})*/}
      {/*monitorId={monitorId}*/}
      {(reverse ? [...jobs].reverse() : jobs).map((job) => {
        return (
          <div className={styles.jobElement}>
            <Job
              job={job}
              key={job.jobId}
              openedWhileNotFinished={openedWhileNotFinished}
            />
          </div>
        );
      })}
    </div>
  );
};
