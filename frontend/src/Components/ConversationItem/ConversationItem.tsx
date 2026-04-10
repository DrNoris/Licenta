import type {ConversationItemProps} from "./ConversationItem.types.ts";
import "./ConversationItem.styles.css"

function getInitials(name: string): string {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function formatTime(dateStr: string | null): string {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) return date.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" });
    return date.toLocaleDateString("ro-RO", { day: "numeric", month: "short" });
}

function ConversationItem({ conversation, onClick, isActive }: ConversationItemProps & { isActive: boolean }) {
    return (
        <div
            className={`conversation-item ${isActive ? "conversation-item--active" : ""}`}
            onClick={() => onClick(conversation)}
        >
            <div className="conversation-item__avatar">
                {getInitials(conversation.otherUserName)}
            </div>

            <div className="conversation-item__body">
                <p className="conversation-item__name">{conversation.otherUserName}</p>
                <p className="conversation-item__spot">📍 {conversation.parkingSpotAddress}</p>
                {conversation.lastMessage && (
                    <p className={`conversation-item__last ${conversation.unreadCount > 0 ? "conversation-item__last--unread" : ""}`}>
                        {conversation.lastMessage}
                    </p>
                )}
            </div>

            <div className="conversation-item__meta">
                <span className="conversation-item__time">
                    {formatTime(conversation.lastMessageAt)}
                </span>
                {conversation.unreadCount > 0 && (
                    <span className="conversation-item__badge">
                        {conversation.unreadCount}
                    </span>
                )}
            </div>
        </div>
    );
}

export default ConversationItem;