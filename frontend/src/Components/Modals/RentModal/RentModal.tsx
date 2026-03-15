import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, CalendarDays } from "lucide-react";
import type { RentModalProps, ParkingSpotSlot, TimeSlot } from "./RentModal.types.ts";
import { SlotAvailabilityType } from "./RentModal.types.ts";
import { formatDate, getAllTimeSlots, manageSlots } from "../../../services/rentService.ts";
import SlotItem from "./Slotitem.tsx";
import "./RentModal.styles.css";
import { useBodyScrollLock } from "../../../hooks/useBodyScrollLock.ts";

function RentModal({ isOpen, onClose, spotId, spotDescription, onUpdateTimeSlots }: RentModalProps) {
    useBodyScrollLock(isOpen);

    const today = formatDate(new Date());
    const [selectedDate, setSelectedDate] = useState<string>(today);
    const [allSlots, setAllSlots] = useState<TimeSlot[]>([]);
    const [slotsForSpot, setSlotsForSpot] = useState<ParkingSpotSlot[]>([]);
    const [availabilityLoading, setAvailabilityLoading] = useState(false);

    // Slots selected by owner — split by intent
    const [slotsToAdd, setSlotsToAdd] = useState<TimeSlot[]>([]);
    const [slotsToDelete, setSlotsToDelete] = useState<TimeSlot[]>([]);

    const [error, setError] = useState("");
    const allSlotsLoadedRef = useRef(false);
    const lastFetchedDateRef = useRef<string>("");

    // ── Load all time slots once ──────────────────────────────
    useEffect(() => {
        if (!isOpen || allSlotsLoadedRef.current) return;
        getAllTimeSlots()
            .then((slots) => { setAllSlots(slots); allSlotsLoadedRef.current = true; })
            .catch((err: unknown) => setError(err instanceof Error ? err.message : "Eroare la încărcarea intervalelor."));
    }, [isOpen]);

    // ── Load spot slots when date changes ─────────────────────
    useEffect(() => {
        console.log("pula")
        if (!isOpen) return;
        if (lastFetchedDateRef.current === selectedDate) return;

        lastFetchedDateRef.current = selectedDate;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSlotsToAdd([]);
        setSlotsToDelete([]);
        setError("");
        setAvailabilityLoading(true);

        manageSlots(spotId, selectedDate)
            .then((data: ParkingSpotSlot[]) => setSlotsForSpot(data))
            .catch((err: unknown) => {
                setError(err instanceof Error ? err.message : "Eroare la verificarea disponibilității.");
                setSlotsForSpot([]);
            })
            .finally(() => setAvailabilityLoading(false));
    }, [isOpen, selectedDate, spotId]);

    // ── Reset on close ────────────────────────────────────────
    useEffect(() => {
        if (!isOpen) {
            lastFetchedDateRef.current = "";
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSelectedDate(today);
            setSlotsToAdd([]);
            setSlotsToDelete([]);
            setError("");
        }
    }, [isOpen]);

    const getSlotType = (slot: TimeSlot): SlotAvailabilityType | undefined => {
        const spotSlot = slotsForSpot.find((s) => s.timeSlotId === slot.id);
        if (!spotSlot)
            return SlotAvailabilityType.AVAILABLE;
        if (spotSlot.bookingId)
            return SlotAvailabilityType.BOOKED;
        return SlotAvailabilityType.OFFERED;
    };

    const handleToggle = (slot: TimeSlot): void => {
        const type = getSlotType(slot);

        if (type === SlotAvailabilityType.BOOKED) return; // cannot interact

        if (type === SlotAvailabilityType.OFFERED) {
            // Toggle for deletion
            setSlotsToDelete((prev) =>
                prev.find((s) => s.id === slot.id)
                    ? prev.filter((s) => s.id !== slot.id)
                    : [...prev, slot]
            );
        } else {
            // Toggle for addition
            setSlotsToAdd((prev) =>
                prev.find((s) => s.id === slot.id)
                    ? prev.filter((s) => s.id !== slot.id)
                    : [...prev, slot]
            );
        }
    };

    const isSelected = (slot: TimeSlot): boolean => {
        const type = getSlotType(slot);
        if (type === SlotAvailabilityType.OFFERED) return !!slotsToDelete.find((s) => s.id === slot.id);
        return !!slotsToAdd.find((s) => s.id === slot.id);
    };

    const handleConfirm = (): void => {
        onUpdateTimeSlots(spotId, selectedDate, slotsToAdd, slotsToDelete);
        onClose();
    };

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>): void => {
        if (e.target === e.currentTarget) onClose();
    };

    const hasChanges = slotsToAdd.length > 0 || slotsToDelete.length > 0;

    const summaryText = (): string => {
        const parts: string[] = [];
        if (slotsToAdd.length > 0) parts.push(`+${slotsToAdd.length} de adăugat`);
        if (slotsToDelete.length > 0) parts.push(`-${slotsToDelete.length} de șters`);
        return parts.length > 0 ? parts.join(" · ") : "Nicio modificare";
    };

    if (!isOpen) return null;

    return createPortal(
        <div className="rent-overlay" onClick={handleOverlayClick}>
            <div className="rent-modal">

                {/* Header */}
                <div className="rent-modal__header">
                    <div>
                        <h3 className="rent-modal__title">Gestionează intervale</h3>
                        <p className="rent-modal__subtitle">{spotDescription}</p>
                    </div>
                    <button className="rent-modal__close" onClick={onClose} aria-label="Închide">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="rent-modal__body">
                    <div>
                        <p className="rent-modal__section-label">
                            <CalendarDays size={13} style={{ display: "inline", marginRight: "0.3rem" }} />
                            Selectează data
                        </p>
                        <input
                            type="date"
                            className="rent-modal__date-input"
                            value={selectedDate}
                            min={today}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>

                    <div className="rent-modal__slots-section">
                        <p className="rent-modal__section-label">Intervale orare</p>

                        {availabilityLoading && (
                            <div className="rent-modal__slots-loading">
                                <div className="rent-modal__spinner" />
                                <span>Se verifică disponibilitatea...</span>
                            </div>
                        )}

                        {!availabilityLoading && error && (
                            <div className="rent-modal__slots-empty">{error}</div>
                        )}

                        {!availabilityLoading && !error && allSlots.length === 0 && (
                            <div className="rent-modal__slots-empty">Nu există intervale orare definite.</div>
                        )}

                        {!availabilityLoading && !error && allSlots.length > 0 && (
                            <div className="rent-modal__slots-wrap">
                                {allSlots.map((slot) => {
                                    const slotType = getSlotType(slot);
                                    return (
                                        <SlotItem
                                            key={slot.id}
                                            slot={slot}
                                            slotAvailabilityType={slotType}
                                            isSelected={isSelected(slot)}
                                            onToggle={handleToggle}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="rent-modal__footer">
                    <p className="rent-modal__selection-info">
                        <strong>{summaryText()}</strong>
                    </p>
                    <div className="rent-modal__footer-actions">
                        <button className="rent-modal__btn-cancel" onClick={onClose}>
                            Anulează
                        </button>
                        <button
                            className="rent-modal__btn-confirm"
                            onClick={handleConfirm}
                            disabled={!hasChanges}
                        >
                            Salvează
                        </button>
                    </div>
                </div>

            </div>
        </div>,
        document.body
    );
}

export default RentModal;