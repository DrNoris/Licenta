export interface ConversationItemProps {
    conversation: Conversation;
    onClick: (conversation: Conversation) => void;
}

export interface Conversation {
    id: string;
    parkingSpotId: string;
    parkingSpotAddress: string;
    otherUserId: string;
    otherUserName: string;
    lastMessage: string | null;
    lastMessageAt: string | null;
    unreadCount: number;
}