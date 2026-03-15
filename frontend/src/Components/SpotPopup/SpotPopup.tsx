import { useState } from "react";
import { Clock, MapPin } from "lucide-react";
import type { SpotPopupProps } from "./SpotPopup.types.ts";
import type { TimeSlot } from "../../Components/Modals/RentModal/RentModal.types.ts";
import { formatHour } from "../../services/rentService.ts";
import "./SpotPopup.styles.css";

function SpotPopup({ spot, date, availableSlots, onBook }: SpotPopupProps) {
    const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);

    const toggleSlot = (slot: TimeSlot): void => {
        setSelectedSlots((prev) =>
            prev.find((s) => s.id === slot.id)
                ? prev.filter((s) => s.id !== slot.id)
                : [...prev, slot]
        );
    };

    const isSelected = (slot: TimeSlot): boolean =>
        !!selectedSlots.find((s) => s.id === slot.id);

    return (
        <div className="spot-popup">
            <div className="spot-popup__body">

                {/* Header */}
                <div className="spot-popup__header">
                    <div>
                        <p className="spot-popup__description">{spot.description}</p>
                        <p className="spot-popup__address">
                            <MapPin size={12} />
                            {spot.address}
                        </p>
                    </div>
                </div>

                {/* Prices */}
                <div className="spot-popup__prices">
                    <div className="spot-popup__price">
                        <span className="spot-popup__price-label">/ oră</span>
                        <span className="spot-popup__price-value">{spot.pricePerHour.toFixed(2)} lei</span>
                    </div>
                    <div className="spot-popup__price">
                        <span className="spot-popup__price-label">/ zi</span>
                        <span className="spot-popup__price-value">{spot.pricePerDay.toFixed(2)} lei</span>
                    </div>
                </div>

                {/* Available slots — horizontal scrollable, selectable */}
                <div className="spot-popup__slots">
                    <p className="spot-popup__slots-label">
                        <Clock size={12} />
                        {date} — selectează intervalele
                    </p>
                    {availableSlots.length === 0 ? (
                        <p className="spot-popup__slots-empty">Niciun interval disponibil</p>
                    ) : (
                        <div className="spot-popup__slots-list">
                            {availableSlots.map((slot) => (
                                <button
                                    key={slot.id}
                                    className={`spot-popup__slot-chip ${isSelected(slot) ? "spot-popup__slot-chip--selected" : ""}`}
                                    onClick={() => toggleSlot(slot)}
                                    type="button"
                                >
                                    {formatHour(slot.startHour)} → {formatHour(slot.endHour)}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Book button */}
                <button
                    className="spot-popup__btn-book"
                    onClick={() => onBook(spot, selectedSlots)}
                    disabled={selectedSlots.length === 0}
                >
                    Rezervă {selectedSlots.length > 0 ? `(${selectedSlots.length})` : ""}
                </button>
            </div>
        </div>
    );
}

export default SpotPopup;