import React, { useContext, useEffect } from "react";
import { IJob, ILogMessage, LogMessageTypes } from "statebox-client";

import { ConnectorContext } from "./StatusServerConnector";

export const Job = ({ job, monitorId }: { monitorId: string; job: IJob }) => {
    const connector = useContext(ConnectorContext);
    return (
        <div style={{ padding: 5, backgroundColor: "white", marginTop: 10 }}>
            <div style={{ backgroundColor: "#eee", padding: 10 }}>
                {job.title || job.name}
                <div
                    onClick={() => {
                        connector.clearJob(monitorId, job);
                    }}
                    style={{ float: "right", cursor: "pointer", padding: 3 }}
                >
                    x
                </div>
            </div>
            {job.description !== "" && (
                <div>
                    <small>{job.description}</small>
                </div>
            )}

            {job.currentOperation !== "" && <div>{job.currentOperation}</div>}
            {job.logs.length > 0 && <Logs logs={job.logs} />}

            {(job.progress.current != -1 || job.progress.end != -1) && (
                <div>
                    <ProgressBar
                        current={job.progress.current}
                        all={job.progress.end}
                    />
                </div>
            )}
            {job.data !== null && (
                <pre>{JSON.stringify(job.data, null, 2)} </pre>
            )}
        </div>
    );
};

interface IProgressBarProps {
    current: number;
    all: number;
}

const Logs = ({ logs }: { logs: ILogMessage[] }) => {
    const messagesEndRef = React.useRef<HTMLDivElement>();

    useEffect(() => {
        messagesEndRef.current.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "start",
        });
    }, [logs]);

    return (
        <pre
            style={{
                margin: 0,
                padding: 4,
                backgroundColor: "black",
                color: "white",
                maxHeight: 400,
                overflow: "auto",
            }}
        >
            {logs.map((el: ILogMessage) => {
                return (
                    <div
                        key={el.key}
                        style={
                            el.type == LogMessageTypes.ERROR
                                ? { backgroundColor: "darkred" }
                                : {}
                        }
                    >
                        {el.msg}
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
        </pre>
    );
};
const ProgressBar = React.memo(({ current, all }: IProgressBarProps) => {
    return (
        <div
            style={{
                width: 300,
                backgroundColor: "lightgray",
                height: 27,
                textAlign: "center",
                position: "relative",
                borderRadius: 5,
            }}
        >
            <div
                style={{
                    height: "100%",
                    width: "100%",
                    position: "absolute",
                    left: 0,
                    top: 2,
                    zIndex: 20,
                    textAlign: "center",
                }}
            >
                <div
                    style={{
                        backgroundColor: "rgb(247,247,247)",
                        display: "inline-block",
                        borderRadius: 5,
                        padding: 2,
                    }}
                >
                    {current} / {all}
                </div>
            </div>
            <div
                style={{
                    width: Math.round(Math.min(current / all, 1) * 100) + "%",
                    height: "100%",
                    backgroundColor: "#114B7D",
                    position: "absolute",
                    left: 0,
                    top: 0,
                    borderRadius: 5,
                }}
            />
        </div>
    );
});
