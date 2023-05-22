import { ILogKindMessage, LogMessageTypes } from "statebox-common";
import React, { useEffect } from "react";

export const Logs = ({ logs }: { logs: ILogKindMessage[] }) => {
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
      {logs.map((el: ILogKindMessage) => {
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
