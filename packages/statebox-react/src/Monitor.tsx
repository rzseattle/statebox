import React from "react";
import { JobList } from "./JobsList";
import { IMonitorClientState } from "statebox-client";
import styles from "./Monitor.module.sass";

export const Monitor = ({
  monitor,
  displayTitle,
  openedWhileNotFinished,
  reverse,
}: {
  monitor: IMonitorClientState;
  displayTitle: boolean;
  openedWhileNotFinished: boolean;
  reverse: boolean;
}) => {
  return (
    <div className={styles.main}>
      {displayTitle && <div className={styles.title}>{monitor.title}</div>}
      {/*monitorId={monitor.id} */}
      <JobList
        jobs={monitor.jobs}
        openedWhileNotFinished={openedWhileNotFinished}
        reverse={reverse}
      />
    </div>
  );
};
