import {Clock, Plus, Trash2, CalendarCheck, MessageSquare} from "lucide-react";
import type { SlotItemProps } from "./RentModal.types.ts";
import { formatHour } from "../../../services/rentService.ts";
import { SlotAvailabilityType } from "./RentModal.types.ts";
import type { ReactElement } from "react";
import {getOrCreateConversation} from "../../../services/chatService.ts";
import {useNavigate} from "react-router-dom";

interface BadgeConfig {
    label: string;
    className: string;
    icon: ReactElement;
}

function SlotItem({ slot, slotAvailabilityType, isSelected, onToggle, spotId}: SlotItemProps) {
    const isBooked  = slotAvailabilityType === SlotAvailabilityType.BOOKED;
    const isOffered = slotAvailabilityType === SlotAvailabilityType.OFFERED;
    const isAvailable = slotAvailabilityType === SlotAvailabilityType.AVAILABLE;
    const isUnavailable = slotAvailabilityType === SlotAvailabilityType.UNAVAILABLE;
    const navigate = useNavigate();

    const handleChat = async (e: React.MouseEvent): Promise<void> => {
        e.stopPropagation();
        const conv = await getOrCreateConversation(spotId);
        navigate(`/chat/${conv.id}`);
    };

    const handleClick = (): void => {
        if (!isBooked && !isUnavailable) onToggle(slot);
    };


    const badgeConfig = (): BadgeConfig => {
        if (isBooked)  return { label: "Rezervat", className: "slot-item__badge--booked",  icon: <CalendarCheck size={11} /> };
        if (isOffered) return { label: "Oferit",   className: "slot-item__badge--offered", icon: <Trash2 size={11} /> };
        if (isAvailable) return { label: "Adaugă",    className: "slot-item__badge--addable", icon: <Plus size={11} /> };

        return { label: "Expirat",  className: "slot-item__badge--booked",  icon: <Clock size={11} /> };
    };

    const { label, className, icon } = badgeConfig();

    const itemClass = [
        "slot-item",
        isSelected && !isOffered  ? "slot-item--selected" : "",
        isBooked || isUnavailable ? "slot-item--booked"   : "",
        isOffered && isSelected   ? "slot-item--delete"   : "",
    ].filter(Boolean).join(" ");

    return (
        <div className={itemClass} onClick={handleClick} role="button" aria-disabled={isBooked}>
            <div className="slot-item__time">
                <Clock size={14}/>
                {formatHour(slot.startHour)}
                <span className="slot-item__separator">→</span>
                {formatHour(slot.endHour)}
            </div>
            <div className="slot-item__right">
                {isBooked && (
                    <button className="slot-item__chat-btn" onClick={handleChat}>
                        <MessageSquare size={11}/>
                        Chat
                    </button>
                )}
                <span className={`slot-item__badge ${className} ${isSelected ? "slot-item__badge--active" : ""}`}>
                    {icon}
                    {label}
                </span>
            </div>
        </div>
    );
}

export default SlotItem;