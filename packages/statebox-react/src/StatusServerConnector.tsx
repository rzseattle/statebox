import React, { useEffect, useState } from "react";

import { MonitorList } from "./MonitorList";
import {
    StateboxClient,
    WEBSOCKET_STATUS,
    IMonitorClientState,
} from "statebox-client";

export const ConnectorContext = React.createContext<StateboxClient>(null);
export const StatusServerConnector = ({
    tracked,
    statusServerAddress,
    children,
    keepDone = -1,
}: {
    tracked: string[];
    statusServerAddress: string;
    children?: (data: IMonitorClientState[], error: string) => React.ReactNode;
    keepDone: number;
}) => {
    const connector = React.useRef<StateboxClient>();
    const [lastMessage, setLastMessage] = useState([]);
    const [error, setError] = useState("");

    // const ConnectorContext = React.createContext(connector.current);

    useEffect(() => {
        (async () => {
            if (connector.current === undefined) {
                try {
                    connector.current = new StateboxClient(
                        () => new WebSocket(statusServerAddress),
                        5000,
                        {
                            tracked: tracked,
                            keepDone: keepDone,
                        }
                    );

                    connector.current.setMessageListener((msg) => {
                        //console.log(msg, "message listeener not ready ");
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
                    await connector.current.connect();
                } catch (ex) {
                    setError(ex + "");
                }
            }

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
                {/*{lastMessage.map((msg,index) => <div key={index}>{msg}</div>)}*/}
            </ConnectorContext.Provider>
        </div>
    );
};
