import type {Conversation} from "../../Components/ConversationItem/ConversationItem.types.ts";

export interface ChatMessage {
    id: string;
    conversationId: string;
    senderId: string;
    senderName: string;
    content: string;
    sentAt: string;
    readAt: string | null;
}

export interface ChatPageState {
    conversations: Conversation[];
    loading: boolean;
    error: string;
}