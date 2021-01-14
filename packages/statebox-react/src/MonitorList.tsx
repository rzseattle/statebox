import React from "react";
import { Monitor } from "./Monitor";
import { IMonitorClientState } from "statebox-client";

export interface IMonitorListProps {
    monitorList: IMonitorClientState[];
}
export const MonitorList = ({ monitorList }: IMonitorListProps) => {
    const monitorsCount = monitorList.length;
    return (
        <div>
            Piękna lista monitorów
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
