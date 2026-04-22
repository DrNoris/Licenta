import React, { useCallback, useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { getMessages, markAsRead } from "../../services/chatService.ts";
import { parseToken, getToken } from "../../services/authService.ts";
import type { ChatThreadProps } from "./ChatThread.types.ts";
import type { ChatMessage } from "../../pages/Chat/ChatPage.types.ts";
import MessageBubble from "../MessageBubble/MessageBubble.tsx";
import "./ChatThread.styles.css";

const WS_BASE = (import.meta.env.VITE_API_URL_CHAT ?? "http://localhost:8081")
    .replace("http", "ws");

function formatDateSeparator(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString("ro-RO", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });
}

function isSameDay(a: string, b: string): boolean {
    return new Date(a).toDateString() === new Date(b).toDateString();
}

function ChatThread({ conversation }: ChatThreadProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingOlder, setLoadingOlder] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [hasMorePages, setHasMorePages] = useState(true);
    const [input, setInput] = useState("");

    const wsRef = useRef<WebSocket | null>(null);
    const pendingRef = useRef<string[]>([]);
    const bottomRef = useRef<HTMLDivElement>(null);
    const sentinelRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const initialLoadDoneRef = useRef(false);

    const token = getToken();
    const payload = token ? parseToken<{ sub: string }>(token) : null;
    const currentUserId = payload?.sub ?? "";

    /* ══════════════════════════════════════════════════════════
       FETCH FIRST PAGE
    ══════════════════════════════════════════════════════════ */
    useEffect(() => {
        initialLoadDoneRef.current = false;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true);
        setMessages([]);
        setCurrentPage(0);
        setHasMorePages(true);

        getMessages(conversation.id, 0)
            .then((data) => {
                setMessages([...data.content].reverse());
                setHasMorePages(data.totalPages != 0);
                setCurrentPage(0);
            })
            .catch(() => {})
            .finally(() => {
                setLoading(false);
                requestAnimationFrame(() => {
                    bottomRef.current?.scrollIntoView({ behavior: "instant" });
                    setTimeout(() => {
                        initialLoadDoneRef.current = true;
                    }, 600);
                });
            });

        markAsRead(conversation.id).catch(() => {});
    }, [conversation.id]);

    const loadOlderMessages = useCallback(() => {
        if (loadingOlder || !hasMorePages) return;

        const nextPage = currentPage + 1;
        setLoadingOlder(true);

        const container = messagesContainerRef.current;
        const prevScrollHeight = container?.scrollHeight ?? 0;

        getMessages(conversation.id, nextPage)
            .then((data) => {
                const olderMessages = [...data.content].reverse();

                setMessages((prev) => {
                    const existingIds = new Set(prev.map((m) => m.id));
                    const unique = olderMessages.filter(
                        (m) => !existingIds.has(m.id)
                    );
                    return [...unique, ...prev];
                });

                setCurrentPage(nextPage);
                setHasMorePages(data.totalPages != nextPage);

                requestAnimationFrame(() => {
                    if (container) {
                        const newScrollHeight = container.scrollHeight;
                        container.scrollTop +=
                            newScrollHeight - prevScrollHeight;
                    }
                });
            })
            .catch(() => {})
            .finally(() => setLoadingOlder(false));
    }, [conversation.id, currentPage, hasMorePages, loadingOlder]);

    useEffect(() => {
        if (loading) return;

        const sentinel = sentinelRef.current;
        const container = messagesContainerRef.current;
        if (!sentinel || !container) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (
                    entries[0].isIntersecting &&
                    initialLoadDoneRef.current &&
                    hasMorePages &&
                    !loadingOlder
                ) {
                    loadOlderMessages();
                }
            },
            {
                root: container,
                rootMargin: "200px 0px 0px 0px",
                threshold: 0,
            }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [loading, hasMorePages, loadingOlder, loadOlderMessages]);

    useEffect(() => {
        let destroyed = false;
        let reconnectTimeout: ReturnType<typeof setTimeout>;
        let currentWs: WebSocket | null = null;

        const connect = () => {
            if (destroyed) return;
            const ws = new WebSocket(
                `${WS_BASE}/ws/chat/${conversation.id}?token=${getToken()}`
            );
            currentWs = ws;
            wsRef.current = ws;

            ws.onopen = () => {
                if (destroyed) {
                    ws.close();
                    return;
                }
                pendingRef.current.forEach((c) =>
                    ws.send(JSON.stringify({ content: c }))
                );
                pendingRef.current = [];
            };

            ws.onmessage = (event) => {
                try {
                    const msg: ChatMessage = JSON.parse(event.data);
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    if ((msg as unknown).type === "ping") return;
                    setMessages((prev) => {
                        if (prev.some((m) => m.id === msg.id)) return prev;
                        return [...prev, msg];
                    });
                } catch {
                    /* empty */
                }
            };

            ws.onerror = () => ws.close();

            ws.onclose = () => {
                if (!destroyed)
                    reconnectTimeout = setTimeout(connect, 3_000);
            };
        };

        connect();

        return () => {
            destroyed = true;
            clearTimeout(reconnectTimeout);
            if (currentWs) {
                currentWs.onclose = null;
                currentWs.close();
            }
            wsRef.current = null;
        };
    }, [conversation.id]);

    useEffect(() => {
        if (!initialLoadDoneRef.current) return;

        const container = messagesContainerRef.current;
        if (!container) return;

        const distFromBottom =
            container.scrollHeight -
            container.scrollTop -
            container.clientHeight;

        if (distFromBottom < 150) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSend = (): void => {
        const content = input.trim();
        if (!content) return;
        setInput("");

        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
        }

        const ws = wsRef.current;
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ content }));
        } else {
            pendingRef.current.push(content);
        }
    };

    const handleKeyDown = (
        e: React.KeyboardEvent<HTMLTextAreaElement>
    ): void => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLTextAreaElement>
    ): void => {
        setInput(e.target.value);
        const el = e.target;
        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
    };

    return (
        <div className="chat-thread">
            {/* ── Messages ── */}
            <div className="chat-thread__messages" ref={messagesContainerRef}>
                <div className="chat-thread__messages-inner">
                    {/* Sentinel — triggers older page load */}
                    <div
                        ref={sentinelRef}
                        className="chat-thread__sentinel"
                    />

                    {loadingOlder && (
                        <div className="chat-thread__loading-older">
                            <div className="chat-spinner" />
                        </div>
                    )}

                    {loading && (
                        <div className="chat-thread__loading">
                            <div className="chat-spinner" />
                        </div>
                    )}

                    {!loading &&
                        messages.map((msg, i) => {
                            const showSeparator =
                                i === 0 ||
                                !isSameDay(
                                    messages[i - 1].sentAt,
                                    msg.sentAt
                                );
                            return (
                                <React.Fragment key={msg.id}>
                                    {showSeparator && (
                                        <div className="chat-thread__date-sep">
                                            <span>
                                                {formatDateSeparator(
                                                    msg.sentAt
                                                )}
                                            </span>
                                        </div>
                                    )}
                                    <MessageBubble
                                        message={msg}
                                        isOwn={
                                            msg.senderId === currentUserId
                                        }
                                    />
                                </React.Fragment>
                            );
                        })}

                    <div ref={bottomRef} />
                </div>
            </div>

            {/* ── Input ── */}
            <div className="chat-thread__input-area">
                <div className="chat-thread__input-wrapper">
                    <textarea
                        ref={textareaRef}
                        className="chat-thread__textarea"
                        placeholder="Scrie un mesaj..."
                        value={input}
                        rows={1}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                    />
                    <button
                        className="chat-thread__send"
                        onClick={handleSend}
                        disabled={!input.trim()}
                        aria-label="Trimite"
                    >
                        <Send size={15} />
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ChatThread;