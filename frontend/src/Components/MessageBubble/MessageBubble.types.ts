import type {ChatMessage} from "../../pages/Chat/ChatPage.types.ts";

export interface MessageBubbleProps {
    message: ChatMessage;
    isOwn: boolean;
}