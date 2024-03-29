import React from "react";
import { Monitor } from "./Monitor";
import { IMonitorClientState } from "statebox-client";

import styles from "./MonitorList.module.sass";

export interface IMonitorListProps {
  monitorList: IMonitorClientState[];
  title?: string;
  openedWhileNotFinished: boolean;
  reverse: boolean;
}
export const MonitorList = ({
  monitorList,
  title,
  openedWhileNotFinished,
  reverse,
}: IMonitorListProps) => {
  const monitorsCount = monitorList.length;
  return (
    <div className={styles.main}>
      {title && <div className={styles.title}>{title}</div>}
      <div className={styles.list}>
        {monitorList.map((monitor) => {
          return (
            <Monitor
              monitor={monitor}
              key={monitor.id}
              displayTitle={monitorsCount > 1}
              openedWhileNotFinished={openedWhileNotFinished}
              reverse={reverse}
            />
          );
        })}
      </div>
    </div>
  );
};
