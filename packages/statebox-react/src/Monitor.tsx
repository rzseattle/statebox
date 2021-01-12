import React from "react";
import { JobList } from "./JobsList";
import { IMonitorClientState } from "statebox-client";

export const Monitor = ({
    monitor,
    displayTitle,
}: {
    monitor: IMonitorClientState;
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
