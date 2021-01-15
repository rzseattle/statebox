import React from "react";

import { IJobMessage } from "statebox-common";
// import { ConnectorContext } from "../StatusServerConnector";
import styles from "./Job.module.sass";
import { ProgressBar } from "./components/ProgressBar";
import { Logs } from "./components/Logs";


export const Job = ({
    job,
}: //monitorId,
{
    //monitorId: string;
    job: Partial<IJobMessage>;
}) => {
    return (
        <div className={styles.main}>
            <div className={styles.top}>
                <div className={styles.title}>{job.title || job.name}</div>
                {job.description !== "" && (
                    <div className={styles.description}>{job.description}</div>
                )}
            </div>

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

            {job.data !== null && (
                <pre>{JSON.stringify(job.data, null, 2)} </pre>
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
