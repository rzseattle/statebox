import { IMonitorClientState } from "statebox-client";
import { LogMessageTypes } from "statebox-common";

export const monitorsMockList: IMonitorClientState[] = [
  {
    id: "test-id",
    description: "This is decscription of the monitor",
    title: "This is monitor title",
    modified: Date.now(),
    jobs: [
      {
        type: "job",
        name: "name of job",
        description: "description of job",
        jobId: "ss",
        logsPart: [
          {
            key: 1,
            msg: "log message 1",
            type: LogMessageTypes.INFO,
            time: Date.now(),
          },
          {
            key: 2,
            msg: "Error log message 1",
            type: LogMessageTypes.ERROR,
            time: Date.now(),
          },
          {
            key: 3,
            msg: "Error log message 1",
            type: LogMessageTypes.INFO,
            time: Date.now(),
          },
          {
            key: 4,
            msg: "Error log message 1",
            type: LogMessageTypes.INFO,
            time: Date.now(),
          },
        ],
        progress: { current: 40, end: 100 },
        done: true,
        currentOperation: "Coping file",
      },
    ],
  },
  {
    id: "test-id2",
    description: "This is decscription of the monitor",
    title: "This is second monitor title",
    modified: Date.now(),
    jobs: [
      {
        type: "job",
        name: "name of job",
        description: "description of job",
        jobId: "ss",
        logsPart: [
          {
            key: 1,
            msg: "log message 1",
            type: LogMessageTypes.INFO,
            time: Date.now(),
          },
          {
            key: 2,
            msg: "Error log message 1",
            type: LogMessageTypes.ERROR,
            time: Date.now(),
          },
          {
            key: 3,
            msg: "Error log message 1",
            type: LogMessageTypes.INFO,
            time: Date.now(),
          },
          {
            key: 4,
            msg: "Error log message 1",
            type: LogMessageTypes.INFO,
            time: Date.now(),
          },
        ],
        progress: { current: 40, end: 100 },
        done: true,
        currentOperation: "Coping file",
      },
    ],
  },
];
