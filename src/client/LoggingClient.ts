import WebSocket, { OpenEvent } from "ws";
import { IJobInitData, Job } from "./Job";
import { nanoid } from "nanoid";
import { IJobMessage } from "../common-interface/IMessage";

export class LoggingClient {
    private connection: WebSocket | null = null;
    private readonly id: string;
    private readonly url: string;

    constructor({ url, name, description }: { url: string; name: string; description?: string }) {
        this.id = nanoid();
        this.url = url;
    }

    public connect = async () => {
        return new Promise((resolve, reject) => {
            this.connection = new WebSocket(this.url);
            this.connection.on("open", () => {
                console.log("connection is opened");
                resolve();
            });

            this.connection.on("error", () => {
                console.log("connection error");
                reject();
            });
        });
    };

    public createJob(data: IJobInitData): Job {
        return new Job(
            {
                id: nanoid(),
                ...data,
            },
            this,
        );
    }

    public requestUpdate = throttle(
        (
            jobId: string,
            data: {
                title: string;
                description: string;
                progress: { current: number; end: number };
                currentOperation: string;
            },
        ) => {
            const message: IJobMessage = { type: "job", jobId, clientId: this.id, ...data };
            this.connection?.send(JSON.stringify(message));
        },
        200,
    );
}

const throttle = (func: CallableFunction, limit: number) => {
    let lastFunc: any;
    let lastRan: number;
    return function () {
        // @ts-ignore
        const context: any = this;
        const args = arguments;
        if (!lastRan) {
            // @ts-ignore
            func.apply(context, args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            // @ts-ignore
            lastFunc = setTimeout(() => {
                if (Date.now() - lastRan >= limit) {
                    // @ts-ignore
                    func.apply(context, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
};
