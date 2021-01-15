import React from "react";
import "@testing-library/dom";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";

import { MonitorList } from "../src/MonitorList";


it("Renders empty monitors list", () => {
    console.log("------------", "próbuje");
    console.log(MonitorList, "próbuje");
    render(<MonitorList monitorList={[]} title={"Test title"} />);
    expect(screen.findByText("Test title")).toBeInTheDocument();
});

// describe("React test", () => {
//     it("React", () => {
//         console.log("test");
//     });
// });
