import React from "react";
import { Monitor } from "./Monitor";
import {IMonitorMessage} from "statebox-common";


export const MonitorList = ({ monitorList }: { monitorList: IMonitorMessage[] }) => {
    const monitorsCount = monitorList.length;
    return (
        <div>
            {monitorList.map((monitor) => {
                return <Monitor monitor={monitor} key={monitor.id} displayTitle={monitorsCount > 1} />;
            })}
        </div>
    );
};
