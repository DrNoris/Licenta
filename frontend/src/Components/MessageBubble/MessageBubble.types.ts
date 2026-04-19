import type {ChatMessage} from "../../pages/Chat/ChatPage.types.ts";

export interface MessageBubbleProps {
    message: ChatMessage;
    isOwn: boolean;
}

export interface MessageThreadState {
    messages: ChatMessage[];
    loading: boolean;
    sending: boolean;
    error: string;
}