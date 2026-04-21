import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, CalendarDays, Repeat } from "lucide-react";
import type { RentModalProps, ParkingSpotSlot, TimeSlot } from "./RentModal.types.ts";
import { SlotAvailabilityType } from "./RentModal.types.ts";
import { formatDate, getAllTimeSlots, manageSlots } from "../../../services/rentService.ts";
import SlotItem from "./Slotitem.tsx";
import "./RentModal.styles.css";
import { useBodyScrollLock } from "../../../hooks/useBodyScrollLock.ts";

type RecurrenceType = "none" | "daily" | "weekdays" | "weekly" | "biweekly";

const RECURRENCE_LABELS: Record<RecurrenceType, string> = {
    none:      "Selectează un interval din listă",
    daily:     "În fiecare zi",
    weekdays:  "Zilele lucrătoare",
    weekly:    "Săptămânal",
    biweekly:  "O dată la 2 săptămâni",
};

function generateDates(startDate: string, recurrence: RecurrenceType, stopDate: string): string[] {
    if (recurrence === "none" || !stopDate) return [startDate];

    const dates: string[] = [];
    const start = new Date(startDate);
    const stop = new Date(stopDate);

    const current = new Date(start);

    while (current <= stop) {
        const dayOfWeek = current.getDay(); // 0=Sun, 6=Sat

        if (recurrence === "daily") {
            dates.push(formatDate(current));
        } else if (recurrence === "weekdays" && dayOfWeek >= 1 && dayOfWeek <= 5) {
            dates.push(formatDate(current));
        } else if (recurrence === "weekly") {
            if (current.getDay() === start.getDay()) {
                dates.push(formatDate(current));
            }
        } else if (recurrence === "biweekly") {
            const diffMs = current.getTime() - start.getTime();
            const diffWeeks = Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));
            if (current.getDay() === start.getDay() && diffWeeks % 2 === 0) {
                dates.push(formatDate(current));
            }
        }

        current.setDate(current.getDate() + 1);
    }

    return dates.length > 0 ? dates : [startDate];
}

function RentModal({ isOpen, onClose, spotId, spotDescription, onUpdateTimeSlots }: RentModalProps) {
    useBodyScrollLock(isOpen);

    const [today, setToday] = useState<string>(formatDate(new Date()));
    const [selectedDate, setSelectedDate] = useState<string>(today);
    const [allSlots, setAllSlots] = useState<TimeSlot[]>([]);
    const [slotsForSpot, setSlotsForSpot] = useState<ParkingSpotSlot[]>([]);
    const [availabilityLoading, setAvailabilityLoading] = useState(false);

    const [slotsToAdd, setSlotsToAdd] = useState<TimeSlot[]>([]);
    const [slotsToDelete, setSlotsToDelete] = useState<TimeSlot[]>([]);

    const [recurrence, setRecurrence] = useState<RecurrenceType>("none");
    const [stopDate, setStopDate] = useState<string>("");
    const [recurrenceOpen, setRecurrenceOpen] = useState(false);

    const [error, setError] = useState("");
    const allSlotsLoadedRef = useRef(false);
    const lastFetchedDateRef = useRef<string>("");
    const recurrenceRef = useRef<HTMLDivElement>(null);

    const hasAdditions = slotsToAdd.length > 0;
    const hasDeletions = slotsToDelete.length > 0;
    const recurrenceActive = recurrence !== "none" && (hasAdditions || hasDeletions);
    const selectedDates = recurrenceActive && stopDate
        ? generateDates(selectedDate, recurrence, stopDate)
        : [selectedDate];

    // Close recurrence dropdown on outside click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (recurrenceRef.current && !recurrenceRef.current.contains(e.target as Node)) {
                setRecurrenceOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setToday(formatDate(new Date()));

        if (!isOpen || allSlotsLoadedRef.current) return;

        getAllTimeSlots()
            .then((slots) => { setAllSlots(slots); allSlotsLoadedRef.current = true; })
            .catch((err: unknown) => setError(err instanceof Error ? err.message : "Eroare la încărcarea intervalelor."));
    }, [isOpen]);

    // ── Load spot slots when date changes ─────────────────────
    useEffect(() => {
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
            setRecurrence("none");
            setStopDate("");
            setError("");
        }
    }, [isOpen]);

    const getSlotType = (slot: TimeSlot): SlotAvailabilityType => {
        const nowHour: number = new Date().getHours();
        const nowDate: string = formatDate(new Date());
        const past: boolean = slot.startHour < nowHour && selectedDate == nowDate;

        const spotSlot = slotsForSpot.find((s) => s.timeSlotId === slot.id);
        if (!spotSlot) {
            if (past)
                return  SlotAvailabilityType.UNAVAILABLE;

            return SlotAvailabilityType.AVAILABLE;
        }

        if (spotSlot.bookingId)
            return SlotAvailabilityType.BOOKED;

        return SlotAvailabilityType.OFFERED;
    };

    const handleToggle = (slot: TimeSlot): void => {
        const type = getSlotType(slot);
        if (type === SlotAvailabilityType.BOOKED) return;
        if (type === SlotAvailabilityType.OFFERED) {
            setSlotsToDelete((prev) =>
                prev.find((s) => s.id === slot.id)
                    ? prev.filter((s) => s.id !== slot.id)
                    : [...prev, slot]
            );
        } else {
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
        onUpdateTimeSlots(spotId, selectedDates, slotsToAdd, slotsToDelete);
        onClose();
    };

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>): void => {
        if (e.target === e.currentTarget) onClose();
    };

    const hasChanges = slotsToAdd.length > 0 || slotsToDelete.length > 0;

    const summaryText = (): string => {
        const parts: string[] = [];
        if (hasAdditions) {
            if (recurrenceActive && stopDate && selectedDates.length > 1) {
                parts.push(`+${slotsToAdd.length * selectedDates.length} intervale pe ${selectedDates.length} zile`);
            } else {
                parts.push(`+${slotsToAdd.length} de adăugat`);
            }
        }
        if (hasDeletions) {
            if (recurrenceActive && stopDate && selectedDates.length > 1) {
                parts.push(`-${slotsToDelete.length * selectedDates.length} intervale pe ${selectedDates.length} zile`);
            } else {
                parts.push(`-${slotsToDelete.length} de șters`);
            }
        }
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

                    {/* Recurrence picker */}
                    <div className="rent-modal__recurrence-wrap" ref={recurrenceRef}>
                        <p className={`rent-modal__section-label ${!hasAdditions && !hasDeletions ? "rent-modal__section-label--disabled" : ""}`}>
                            <Repeat size={13} style={{ display: "inline", marginRight: "0.3rem" }} />
                            Recurență
                        </p>

                        {/* Custom dropdown */}
                        <button
                            className={`rent-modal__recurrence-btn ${recurrence !== "none" ? "rent-modal__recurrence-btn--active" : ""}`}
                            onClick={() => (hasAdditions || hasDeletions) && setRecurrenceOpen((p) => !p)}
                            disabled={!hasAdditions && !hasDeletions}
                            type="button"
                        >
                            <Repeat size={13} />
                            {RECURRENCE_LABELS[recurrence]}
                            <span className="rent-modal__recurrence-chevron">{recurrenceOpen ? "▲" : "▼"}</span>
                        </button>

                        {recurrenceOpen && (
                            <div className="rent-modal__recurrence-dropdown">
                                {(Object.keys(RECURRENCE_LABELS) as RecurrenceType[]).map((key) => (
                                    <button
                                        key={key}
                                        className={`rent-modal__recurrence-option ${recurrence === key ? "rent-modal__recurrence-option--selected" : ""}`}
                                        onClick={() => { setRecurrence(key); setRecurrenceOpen(false); }}
                                        type="button"
                                    >
                                        {RECURRENCE_LABELS[key]}
                                        {recurrence === key && <span>✓</span>}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Stop date — only when recurrence is active */}
                        {recurrence !== "none" && (hasAdditions || hasDeletions) && (
                            <div className="rent-modal__stop-date">
                                <p className="rent-modal__section-label" style={{ marginBottom: "0.3rem" }}>
                                    <CalendarDays size={13} style={{ display: "inline", marginRight: "0.3rem" }} />
                                    Până la
                                </p>
                                <input
                                    type="date"
                                    className="rent-modal__date-input"
                                    value={stopDate}
                                    min={selectedDate}
                                    onChange={(e) => setStopDate(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    {/* Slots */}
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


                                    return <SlotItem
                                        key={slot.id}
                                        slot={slot}
                                        slotAvailabilityType={getSlotType(slot)}
                                        isSelected={isSelected(slot)}
                                        onToggle={handleToggle}
                                        spotId={spotId}
                                    />
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