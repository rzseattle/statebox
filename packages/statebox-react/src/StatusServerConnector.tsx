import React, { useEffect, useState } from "react";

import { MonitorList } from "./MonitorList";
import {
    StatusServerClient,
    IMonitor,
    WEBSOCKET_STATUS,
} from "statebox-client";

export const ConnectorContext = React.createContext<StatusServerClient>(null);
export const StatusServerConnector = ({
    trackedMonitorLabels,
    trackedJobLabels,
    statusServerAddress,
    children,
}: {
    trackedMonitorLabels: string[];
    trackedJobLabels?: string[];
    statusServerAddress: string;
    children?: (data: IMonitor[], error: string) => React.ReactNode;
}) => {
    const connector = React.useRef<StatusServerClient>();
    const [lastMessage, setLastMessage] = useState([]);
    const [error, setError] = useState("");

    // const ConnectorContext = React.createContext(connector.current);

    useEffect(() => {
        (async () => {
            // @ts-ignore
            connector.current = new StatusServerClient(statusServerAddress, {
                tracked: {
                    monitorLabels: trackedMonitorLabels,
                    jobLabels: trackedJobLabels,
                },
            });

            connector.current.setMessageListener((msg) => {
                console.log("message listeener not ready " + msg);
                // setLastMessage((last) => {
                //     return [...last, msg];
                // });
            });
            connector.current.setChangeListener((msg) => {
                setLastMessage([...msg]);
            });
            connector.current.setStatusListener((status) => {
                if (
                    status === WEBSOCKET_STATUS.ERROR ||
                    status == WEBSOCKET_STATUS.NOT_CONNECTED
                ) {
                    setError(connector.current.getError());
                } else {
                    setError("");
                }
            });
            connector.current.setUpConnection();
            // setListenerId(await connector.current.getId());
        })();
    }, []);

    if (children !== undefined) {
        return <>{children(lastMessage, error)}</>;
    }

    return (
        <div>
            <ConnectorContext.Provider value={connector.current}>
                <MonitorList monitorList={lastMessage} />
                {error && <div>{error}</div>}
            </ConnectorContext.Provider>
        </div>
    );
};
