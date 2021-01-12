import {IMessage} from "../monitor/IMessage";

export interface IActionMessage extends IMessage {
    subjectType: string;
    subjectId: string;
    action: "remove" | "cleanup";
}
