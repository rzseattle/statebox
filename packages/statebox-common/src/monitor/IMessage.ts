export interface IMessage {
    type: "log" | "job" | "id-request" | "action";
    monitorId: string;
}
