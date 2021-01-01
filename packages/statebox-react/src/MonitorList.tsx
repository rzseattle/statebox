import React from "react";
import { Monitor } from "./Monitor";
import {IMonitor} from "statebox-client";

export const MonitorList = ({ monitorList }: { monitorList: IMonitor[] }) => {
    const monitorsCount = monitorList.length;
    return (
        <div>
            {monitorList.map((monitor) => {
                return <Monitor monitor={monitor} key={monitor.id} displayTitle={monitorsCount > 1} />;
            })}
        </div>
    );
};
