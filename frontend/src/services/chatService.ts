import { getToken } from "./authService";
import type {Conversation} from "../Components/ConversationItem/ConversationItem.types.ts";
import type {ChatMessage} from "../pages/Chat/ChatPage.types.ts";

const API_BASE = import.meta.env.VITE_API_URL_CHAT ?? "http://localhost:8081";

function authHeaders(): HeadersInit {
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
    };
}

export async function getConversations(): Promise<Conversation[]> {
    const res: Response = await fetch(`${API_BASE}/api/chat/conversations`, {
        headers: authHeaders(),
    });

    if (!res.ok)
        throw new Error("Nu s-au putut încărca conversațiile.");

    return res.json();
}

export async function getOrCreateConversation(parkingSpotId: string): Promise<Conversation> {
    const res: Response = await fetch(`${API_BASE}/api/chat/conversations`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ parkingSpotId }),
    });

    if (!res.ok)
        throw new Error("Nu s-a putut deschide conversația.");

    return res.json();
}

export async function getMessages(conversationId: string, page: number = 0, size: number = 30): Promise<{ content: ChatMessage[]; totalPages: number }> {
    const res: Response = await fetch(
        `${API_BASE}/api/chat/conversations/${conversationId}/messages?page=${page}&size=${size}`,
        { headers: authHeaders() }
    );

    if (!res.ok)
        throw new Error("Nu s-au putut încărca mesajele.");

    return res.json();
}

export async function markAsRead(conversationId: string): Promise<void> {
    await fetch(`${API_BASE}/api/chat/conversations/${conversationId}/read`, {
        method: "POST",
        headers: authHeaders(),
    });
}