import { IMonitorClientState } from "statebox-client";
import React from "react";
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Meta, Story } from "@storybook/react/types-6-0";

import { IMonitorListProps, MonitorList } from "../MonitorList";
import { LogMessageTypes } from "statebox-common";

require("core-js/stable");
require("regenerator-runtime/runtime");

export default {
    title: "Components/MonitorList",
    component: MonitorList,
    argTypes: {
        monitorList: [],
    },
} as Meta;

const Template: Story<IMonitorListProps> = (args) => <MonitorList {...args} />;

export const Primary = Template.bind({});

const list: IMonitorClientState[] = [
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

Primary.storyName = "Multi monitors";
Primary.args = {
    monitorList: list,
    title: "This is list of monitors",
};

export const Secondary = Template.bind({});
Secondary.storyName = "One monitor";
Secondary.args = {
    monitorList: [list[1]],
};

export const Third = Template.bind({});
Third.storyName = "No current operation";
Third.args = {
    monitorList: [
        { ...list[1], jobs: [{ ...list[1].jobs[0], currentOperation: null }] },
    ],
};
export const Fourth = Template.bind({});
Fourth.storyName = "No progress";
Fourth.args = {
    monitorList: [
        { ...list[1], jobs: [{ ...list[1].jobs[0], progress: null }] },
    ],
};
export const Fifth = Template.bind({});
Fifth.storyName = "No logs";
Fifth.args = {
    monitorList: [
        { ...list[1], jobs: [{ ...list[1].jobs[0], logsPart: [] }] },
    ],
};
