import WebSocket from "ws";
export const listeners: Map<
    WebSocket,
    {
        authKey: string;
        tracked: {
            monitorIds: string[];
            monitorLabels: string[];
            jobIds: string[];
            jobLabels: string[];
        };
        upgradeDataInfo: {
            monitorDataSend: Map<string, boolean>;
            jobsDataSend: Map<string, boolean>;
        };
    }
> = new Map();
