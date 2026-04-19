import type {MessageBubbleProps} from "./MessageBubble.types.ts";
import "./MessageBubble.styles.css"

function formatTime(sentAt: string): string {
    return new Date(sentAt).toLocaleTimeString("ro-RO", {
        hour: "2-digit",
        minute: "2-digit",
    });
}

function MessageBubble({ message, isOwn }: MessageBubbleProps) {
    return (
        <div className={`message-bubble message-bubble--${isOwn ? "own" : "other"}`}>
            <div className="message-bubble__content">
                {message.content}
            </div>
            <span className="message-bubble__time">
                {formatTime(message.sentAt)}
                {isOwn && message.readAt && " ✓✓"}
                {isOwn && !message.readAt && " ✓"}
            </span>
        </div>
    );
}

export default MessageBubble;