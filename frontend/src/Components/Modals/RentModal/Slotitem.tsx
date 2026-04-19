import { Clock, Plus, Trash2, CalendarCheck } from "lucide-react";
import type { SlotItemProps } from "./RentModal.types.ts";
import { formatHour } from "../../../services/rentService.ts";
import { SlotAvailabilityType } from "./RentModal.types.ts";
import type { ReactElement } from "react";

interface BadgeConfig {
    label: string;
    className: string;
    icon: ReactElement;
}

function SlotItem({ slot, slotAvailabilityType, isSelected, onToggle }: SlotItemProps) {
    const isBooked  = slotAvailabilityType === SlotAvailabilityType.BOOKED;
    const isOffered = slotAvailabilityType === SlotAvailabilityType.OFFERED;

    const handleClick = (): void => {
        if (!isBooked) onToggle(slot);
    };

    const badgeConfig = (): BadgeConfig => {
        if (isBooked)  return { label: "Rezervat", className: "slot-item__badge--booked",  icon: <CalendarCheck size={11} /> };
        if (isOffered) return { label: "Oferit",   className: "slot-item__badge--offered", icon: <Trash2 size={11} /> };
        return               { label: "Adaugă",    className: "slot-item__badge--addable", icon: <Plus size={11} /> };
    };

    const { label, className, icon } = badgeConfig();

    const itemClass = [
        "slot-item",
        isSelected && !isOffered ? "slot-item--selected"  : "",
        isBooked                  ? "slot-item--booked"    : "",
        isOffered && isSelected   ? "slot-item--delete"    : "",
    ].filter(Boolean).join(" ");

    return (
        <div
            className={itemClass}
            onClick={handleClick}
            role="button"
            aria-disabled={isBooked}
        >
            <div className="slot-item__time">
                <Clock size={14} />
                {formatHour(slot.startHour)}
                <span className="slot-item__separator">→</span>
                {formatHour(slot.endHour)}
            </div>
            <span className={`slot-item__badge ${className} ${isSelected ? "slot-item__badge--active" : ""}`}>
                {icon}
                {label}
            </span>
        </div>
    );
}

export default SlotItem;