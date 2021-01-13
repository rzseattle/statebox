import React from "react";
import { Monitor } from "./Monitor";
import { IMonitorClientState } from "statebox-client";

export const MonitorList = ({
    monitorList,
}: {
    monitorList: IMonitorClientState[];
}) => {
    const monitorsCount = monitorList.length;
    return (
        <div>
            {monitorList.map((monitor) => {
                return (
                    <Monitor
                        monitor={monitor}
                        key={monitor.id}
                        displayTitle={monitorsCount > 1}
                    />
                );
            })}
        </div>
    );
};
