import { Clock } from "lucide-react";
import type {SlotItemProps} from "./BookingModal.types.ts";
import {formatHour} from "../../services/bookingService.ts";

function SlotItem({ slot, isAvailable, isSelected, onToggle }: SlotItemProps) {
    const handleClick = () => {
        if (isAvailable) onToggle(slot);
    };

    const badgeLabel = isSelected ? "Selectat" : isAvailable ? "Disponibil" : "Indisponibil";
    const badgeClass = isSelected
        ? "slot-item__badge slot-item__badge--selected"
        : isAvailable
            ? "slot-item__badge slot-item__badge--available"
            : "slot-item__badge slot-item__badge--unavailable";

    const itemClass = [
        "slot-item",
        isSelected ? "slot-item--selected" : "",
        !isAvailable ? "slot-item--unavailable" : "",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={itemClass} onClick={handleClick} role="button" aria-disabled={!isAvailable}>
    <div className="slot-item__time">
    <Clock size={14} />
    {formatHour(slot.startHour)}
    <span className="slot-item__separator">→</span>
    {formatHour(slot.endHour)}
    </div>
    <span className={badgeClass}>{badgeLabel}</span>
        </div>
);
}

export default SlotItem;