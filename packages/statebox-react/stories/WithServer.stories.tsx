import { IMonitorClientState } from "statebox-client";
import React from "react";
// also exported from '@storybook/react' if you can deal with breaking changes in 6.1
import { Meta, Story } from "@storybook/react/types-6-0";

import { IMonitorListProps, MonitorList } from "../src/MonitorList";
import { monitorsMockList } from "../__mocks__/TestMonitorList";
import { StatusServerConnector } from "../src";

require("core-js/stable");
require("regenerator-runtime/runtime");

export default {
  title: "Components/Live with server",
  component: MonitorList,
  argTypes: {
    monitorList: [],
  },
} as Meta;

const TestButton = ({title, path}:{title: string, path: string}) => {
  return <>
    <button onClick={() => fetch("http://localhost:8080" + path)}>
      {title}
    </button>
    &nbsp;
  </>
}

const Template: Story<IMonitorListProps> = (_args) => (
  <StatusServerConnector
    tracked={["*/*"]}
    statusServerAddress={"ws://localhost:3012"}
  >
    {(data, error) => (
      <div>
        <TestButton title={"Clean"} path={"/cleanup"} />
        <TestButton title={"Progress"} path={"/progress"} />
        <TestButton title={"Logs"} path={"/logs"} />
        <TestButton title={"Many jobs clean"} path={"/manyClean"} />
        <TestButton title={"Many jobs preserve"} path={"/manyPreserve"} />
        <TestButton title={"Current job"} path={"/current"} />
        <br/>
        <MonitorList monitorList={data} />
        <pre>{JSON.stringify(data, null, 2)}</pre>
        <hr />
        {error}
      </div>
    )}
  </StatusServerConnector>
);

export const Primary = Template.bind({});

const list: IMonitorClientState[] = monitorsMockList;

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
  monitorList: [{ ...list[1], jobs: [{ ...list[1].jobs[0], progress: null }] }],
};
export const Fifth = Template.bind({});
Fifth.storyName = "No logs";
Fifth.args = {
  monitorList: [{ ...list[1], jobs: [{ ...list[1].jobs[0], logsPart: [] }] }],
};
