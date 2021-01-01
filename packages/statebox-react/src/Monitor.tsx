import React from "react";
import { JobList } from "./JobsList";
import { IMonitor } from "statebox-client";

export const Monitor = ({
    monitor,
    displayTitle,
}: {
    monitor: IMonitor;
    displayTitle: boolean;
}) => {
    return (
        <div>
            {displayTitle && (
                <div>
                    <b>{monitor.title}</b>
                </div>
            )}
            <JobList monitorId={monitor.id} jobs={monitor.jobs} />
        </div>
    );
};
