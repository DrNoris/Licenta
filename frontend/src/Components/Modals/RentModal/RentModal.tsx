import React, { useEffect, useRef, useState } from "react";
import {createPortal} from "react-dom";
import { X, CalendarDays } from "lucide-react";
import type {RentModalProps, ParkingSpotSlot, TimeSlot} from "./RentModal.types.ts";
import { formatDate, getAllTimeSlots, manageSlots } from "../../../services/rentService.ts";
import SlotItem from "./Slotitem.tsx";
import "./RentModal.styles.css";
import {useBodyScrollLock} from "../../../hooks/useBodyScrollLock.ts";

function RentModal({ isOpen, onClose, spotId, spotDescription, onAddTimeSlot }: RentModalProps) {
    useBodyScrollLock(isOpen);

    const today = formatDate(new Date());
    const [selectedDate, setSelectedDate] = useState<string>(today);

    const [allSlots, setAllSlots] = useState<TimeSlot[]>([]);
    const [slotsForSpotIds, setSlotsForSpotIds] = useState<Set<string>>(new Set());
    const [availabilityLoading, setAvailabilityLoading] = useState(false);
    const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
    const [error, setError] = useState("");

    // Track whether all slots have been fetched this session
    const allSlotsLoadedRef = useRef(false);
    // Track the date we last fetched availability for — prevents duplicate fetches
    const lastFetchedDateRef = useRef<string>("");

    // ── Load all slots once when modal first opens ────────────────
    useEffect(() => {
        if (!isOpen || allSlotsLoadedRef.current) return;

        getAllTimeSlots()
            .then((slots) => {
                setAllSlots(slots);
                allSlotsLoadedRef.current = true;
            })
            .catch((err: unknown) => {
                setError(err instanceof Error ? err.message : "Eroare la încărcarea intervalelor.");
            });
    }, [isOpen]);

    // ── Load availability when date changes ───────────────────────
    // Using a ref for the date comparison avoids putting loadAvailability
    // in the dependency array which caused the infinite loop
    useEffect(() => {
        if (!isOpen) return;
        if (lastFetchedDateRef.current === selectedDate) return;

        lastFetchedDateRef.current = selectedDate;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSelectedSlots([]);
        setError("");
        setAvailabilityLoading(true);

        manageSlots(spotId, selectedDate)
            .then((data) => {
                const takenIds = new Set<string>(data.map((parkingSpotSlot: ParkingSpotSlot) => parkingSpotSlot.timeSlotId));
                setSlotsForSpotIds(takenIds);
            })
            .catch((err: unknown) => {
                setError(err instanceof Error ? err.message : "Eroare la verificarea disponibilității.");
                setSlotsForSpotIds(new Set());
            })
            .finally(() => {
                setAvailabilityLoading(false);
            });
    }, [isOpen, selectedDate, spotId]);

    // ── Reset when modal closes so next open is fresh ─────────────
    useEffect(() => {
        if (!isOpen) {
            lastFetchedDateRef.current = "";
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSelectedDate(today);
            setSelectedSlots([]);
            setError("");
        }
    }, [isOpen]);

    const handleToggle = (slot: TimeSlot): void => {
        setSelectedSlots((prev) =>
            prev.find((s) => s.id === slot.id)
                ? prev.filter((s) => s.id !== slot.id)
                : [...prev, slot]
        );
    };

    const handleConfirm = (): void => {
        onAddTimeSlot(spotId, selectedDate, selectedSlots)
        onClose();
    };

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>): void => {
        if (e.target === e.currentTarget) onClose();
    };

    const getLastLetter = (length: number): string => {
        return length > 1 || length== 0 ? "e" : ""
    }

    if (!isOpen) return null;

    return createPortal(
        <div className="rent-overlay" onClick={handleOverlayClick}>
            <div className="rent-modal">

                {/* Header */}
                <div className="rent-modal__header">
                    <div>
                        <h3 className="rent-modal__title">Închireaza loc</h3>
                        <p className="rent-modal__subtitle">{spotDescription}</p>
                    </div>
                    <button className="rent-modal__close" onClick={onClose} aria-label="Închide">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="rent-modal__body">

                    {/* Date picker */}
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

                    {/* Slots */}
                    {/* Slots — wrap in slots-section so it takes remaining height */}
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
                            <div className="rent-modal__slots-empty">
                                Nu există intervale orare definite.
                            </div>
                        )}

                        {!availabilityLoading && !error && allSlots.length > 0 && (
                            <div className="rent-modal__slots-wrap">  {/* ← scrolls here */}
                                {allSlots.map((slot) => (
                                    <SlotItem
                                        key={slot.id}
                                        slot={slot}
                                        isAvailable={!slotsForSpotIds.has(slot.id)}
                                        isSelected={!!selectedSlots.find((s) => s.id === slot.id)}
                                        onToggle={handleToggle}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                </div>

                {/* Footer */}
                <div className="rent-modal__footer">
                    <p className="rent-modal__selection-info">
                        <strong>{selectedSlots.length}</strong> interval{getLastLetter(selectedSlots.length)} selectat{getLastLetter(selectedSlots.length)}
                    </p>
                    <div className="rent-modal__footer-actions">
                        <button className="rent-modal__btn-cancel" onClick={onClose}>
                            Anulează
                        </button>
                        <button
                            className="rent-modal__btn-confirm"
                            onClick={handleConfirm}
                            disabled={selectedSlots.length === 0}
                        >
                            Confirmă oferta
                        </button>
                    </div>
                </div>

            </div>
        </div>,
        document.body
    );
}

export default RentModal;