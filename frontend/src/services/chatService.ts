import { getToken } from "./authService";
import type {Conversation} from "../Components/ConversationItem/ConversationItem.types.ts";
import type {ChatMessage} from "../pages/Chat/ChatPage.types.ts";

const API_BASE = import.meta.env.VITE_API_URL_CHAT ?? "http://localhost:8081";
const WS_BASE = (import.meta.env.VITE_API_URL_CHAT ?? "http://localhost:8081")
    .replace("http", "ws");

function authHeaders(): HeadersInit {
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
    };
}

// ── Get all conversations ─────────────────────────────────────
export async function getConversations(): Promise<Conversation[]> {
    const res = await fetch(`${API_BASE}/api/chat/conversations`, {
        headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Nu s-au putut încărca conversațiile.");
    return res.json();
}

// ── Get or create conversation for a parking spot ─────────────
export async function getOrCreateConversation(parkingSpotId: string): Promise<Conversation> {
    const res = await fetch(`${API_BASE}/api/chat/conversations`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ parkingSpotId }),
    });
    if (!res.ok) throw new Error("Nu s-a putut deschide conversația.");
    return res.json();
}

// ── Get messages for a conversation (paginated) ───────────────
export async function getMessages(
    conversationId: string,
    page: number = 0,
    size: number = 30
): Promise<{ content: ChatMessage[]; totalPages: number }> {
    const res = await fetch(
        `${API_BASE}/api/chat/conversations/${conversationId}/messages?page=${page}&size=${size}`,
        { headers: authHeaders() }
    );
    if (!res.ok) throw new Error("Nu s-au putut încărca mesajele.");
    return res.json();
}

// ── Mark conversation as read ─────────────────────────────────
export async function markAsRead(conversationId: string): Promise<void> {
    await fetch(`${API_BASE}/api/chat/conversations/${conversationId}/read`, {
        method: "POST",
        headers: authHeaders(),
    });
}

// ── WebSocket connection ──────────────────────────────────────
export function createChatSocket(
    conversationId: string,
    onMessage: (message: ChatMessage) => void,
    onError?: () => void
): WebSocket {
    const token = getToken();
    const ws = new WebSocket(
        `${WS_BASE}/ws/chat/${conversationId}?token=${token}`
    );

    ws.onmessage = (event) => {
        try {
            const message: ChatMessage = JSON.parse(event.data);
            onMessage(message);
        } catch {
            // ignore malformed messages
        }
    };

    ws.onerror = () => onError?.();

    return ws;
}

// ── Send message via WebSocket ────────────────────────────────
export function sendMessage(ws: WebSocket, content: string): void {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ content }));
    }
}