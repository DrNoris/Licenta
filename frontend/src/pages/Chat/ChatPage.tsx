import { useEffect, useState } from "react";
import { MessageSquare, PanelLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../Components/Header/Header.tsx";
import { getConversations } from "../../services/chatService.ts";
import ChatThread from "../../Components/ChatThread/ChatThread.tsx";
import ConversationItem from "../../Components/ConversationItem/ConversationItem.tsx";
import "./ChatPage.styles.css";
import type { Conversation } from "../../Components/ConversationItem/ConversationItem.types.ts";

function ChatPage() {
    const { conversationId } = useParams<{ conversationId?: string }>();
    const navigate = useNavigate();

    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        getConversations()
            .then((data) => {
                setConversations(data);
                if (conversationId) {
                    const found = data.find((c) => c.id === conversationId);
                    if (found) setSelectedConversation(found);
                }
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            getConversations()
                .then(setConversations)
                .catch(() => {});
        }, 30_000);
        return () => clearInterval(interval);
    }, []);

    const handleSelectConversation = (conversation: Conversation): void => {
        setSelectedConversation(conversation);
        navigate(`/chat/${conversation.id}`);
        setConversations((prev) =>
            prev.map((c) =>
                c.id === conversation.id ? { ...c, unreadCount: 0 } : c
            )
        );
    };

    const handleBack = (): void => {
        setSelectedConversation(null);
        navigate("/chat");
    };

    const showMobileSidebar = !selectedConversation;

    return (
        <div className="chat-page">
            <Header />

            <div className="chat-page__body">
                {/* ── Sidebar ── */}
                <aside
                    className={`chat-sidebar ${
                        sidebarOpen ? "" : "chat-sidebar--collapsed"
                    } ${showMobileSidebar ? "chat-sidebar--mobile-visible" : ""}`}
                >
                    <div className="chat-sidebar__header">
                        <h2 className="chat-sidebar__title">Mesaje</h2>
                    </div>

                    <div className="chat-sidebar__list">
                        {loading && (
                            <div className="chat-sidebar__empty">
                                <div className="chat-spinner" />
                            </div>
                        )}

                        {!loading && conversations.length === 0 && (
                            <div className="chat-sidebar__empty">
                                <MessageSquare size={26} strokeWidth={1.4} />
                                <span>Nicio conversație încă</span>
                            </div>
                        )}

                        {conversations.map((conv) => (
                            <ConversationItem
                                key={conv.id}
                                conversation={conv}
                                isActive={selectedConversation?.id === conv.id}
                                onClick={handleSelectConversation}
                            />
                        ))}
                    </div>
                </aside>

                {/* ── Main area ── */}
                <main className="chat-main">
                    {/* Top bar */}
                    <div className="chat-main__topbar">
                        <button
                            className="chat-main__toggle"
                            onClick={() => setSidebarOpen((prev) => !prev)}
                            aria-label="Toggle sidebar"
                        >
                            <PanelLeft size={18} />
                        </button>

                        {selectedConversation && (
                            <button
                                className="chat-main__back"
                                onClick={handleBack}
                                aria-label="Înapoi"
                            >
                                ← Înapoi
                            </button>
                        )}
                    </div>

                    {/* Thread or empty state */}
                    {selectedConversation ? (
                        <ChatThread
                            conversation={selectedConversation}
                        />
                    ) : (
                        <div className="chat-main__empty">
                            <div className="chat-main__empty-icon">
                                <MessageSquare size={28} strokeWidth={1.2} />
                            </div>
                            <p>Selectează o conversație</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

export default ChatPage;