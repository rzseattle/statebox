import React, { useState } from "react";

import { IJobMessage } from "statebox-common";
// import { ConnectorContext } from "../StatusServerConnector";
import styles from "./Job.module.sass";
import { ProgressBar } from "./components/ProgressBar";
import { Logs } from "./components/Logs";

export const Job = ({
  job,
  openedWhileNotFinished,
}: //monitorId,
{
  //monitorId: string;
  job: Partial<IJobMessage>;
  openedWhileNotFinished: boolean;
}) => {
  const [opened, setOpened] = useState(false);

  return (
    <div className={styles.main}>
      <div className={styles.top} onClick={() => setOpened((o) => !o)}>
        <div className={styles.title}>
          <div
            className={styles.isDone + " " + (!job.done ? styles.doneBox : "")}
          ></div>

          {job.title || job.name}
        </div>
        {opened && job.description !== "" && (
          <div className={styles.description}>{job.description}</div>
        )}
      </div>
      {(opened || (openedWhileNotFinished && job.done === false)) && (
        <div className={styles.content}>
          {job.currentOperation !== null && (
            <div className={styles.currentOperation}>
              {job.currentOperation}
            </div>
          )}
          {job.progress &&
            (job.progress.current != -1 || job.progress.end != -1) && (
              <div className={styles.progressContainer}>
                <ProgressBar
                  current={job.progress.current}
                  all={job.progress.end}
                />
              </div>
            )}

          {job.logsPart.length > 0 && (
            <div className={styles.logsContainer}>
              <Logs logs={job.logsPart} />
            </div>
          )}
          {job.data !== null && <pre>{JSON.stringify(job.data, null, 2)} </pre>}
        </div>
      )}
    </div>
  );
};

//const connector = useContext(ConnectorContext);

// <div
//     onClick={() => {
//         connector.actions.clearJob(monitorId, job);
//     }}
//     style={{ float: "right", cursor: "pointer", padding: 3 }}
// >
//     x
// </div>
