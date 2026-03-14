import { getToken } from "./authService";
import type {ParkingSpotSlot, TimeSlot} from "../Components/Modals/RentModal/RentModal.types.ts";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
const ALL_SLOTS_KEY = "cache_all_time_slots";

function authHeaders(): HeadersInit {
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
    };
}

// ── All time slots — cached in localStorage ───────────────────
export async function getAllTimeSlots(): Promise<TimeSlot[]> {
    const cached = localStorage.getItem(ALL_SLOTS_KEY);
    if (cached) {
        try {
            return JSON.parse(cached) as TimeSlot[];
        } catch {
            localStorage.removeItem(ALL_SLOTS_KEY);
        }
    }

    const res = await fetch(`${API_BASE}/api/time-slot`, {
        headers: authHeaders(),
    });
    if (!res.ok) throw new Error("Nu s-au putut încărca intervalele orare.");

    const slots: TimeSlot[] = await res.json();
    localStorage.setItem(ALL_SLOTS_KEY, JSON.stringify(slots));
    return slots;
}

export async function addParkingSpotSlot(parkingSpotId: string, selectedDate: string, timeslotIds: string[]): Promise<void> {
    const res = await fetch(`${API_BASE}/api/parking-spot-slots/${parkingSpotId}`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
            date: selectedDate,
            timeSlotIds: timeslotIds,
        }),
    });

    if (!res.ok) throw new Error("Adăugarea a eșuat.");
}

// ── Available slots for a spot on a given date ────────────────
export async function manageSlots(
    spotId: string,
    date: string // "YYYY-MM-DD"
): Promise<ParkingSpotSlot[]> {
    const res = await fetch(
        `${API_BASE}/api/parking-spot-slots/${spotId}/manage?date=${date}`,
        { headers: authHeaders() }
    );
    if (!res.ok) throw new Error("Nu s-a putut verifica disponibilitatea.");
    return res.json();
}

// ── Format hour integer to HH:MM string ──────────────────────
export function formatHour(hour: number): string {
    const h = Math.floor(hour);
    const m = Math.round((hour - h) * 60);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

// ── Format date to YYYY-MM-DD ─────────────────────────────────
export function formatDate(date: Date): string {
    return date.toISOString().split("T")[0];
}