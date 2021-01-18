import React from "react";
import "@testing-library/dom";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

import { MonitorList } from "../src/MonitorList";

import { monitorsMockList } from "../__mocks__/TestMonitorList";

// implementing scrollIntoView which is not implemented in jsdom
window.HTMLElement.prototype.scrollIntoView = jest.fn();

describe("Test with static data", () => {
    it("Renders empty monitors list", () => {
        render(<MonitorList monitorList={[]} title={"Test title"} />);
        expect(screen.getByText("Test title")).toBeInTheDocument();
    });
    it("Test all", () => {
        render(
            <MonitorList monitorList={monitorsMockList} title={"Test title"} />
        );
        expect(screen.getByText("Test title")).toBeInTheDocument();
    });
});
