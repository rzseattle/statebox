import * as React from "react";
export interface IProgressBarProps {
    current: number;
    all: number;
}

export const ProgressBar = React.memo(({ current, all }: IProgressBarProps) => {
    return (
        <div
            style={{
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
