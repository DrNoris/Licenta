import {getToken} from "./authService.ts";
import type {AvailableSlotProps} from "../Components/SpotPopup/SpotPopup.types.ts";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

function authHeaders(): HeadersInit {
    return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
    };
}

export async function getSlots(spotId: string, date: string): Promise<AvailableSlotProps> {
    const res = await fetch(
        `${API_BASE}/api/parking-spot-slots/${spotId}/availability?date=${date}`,
        { headers: authHeaders() }
    );
    if (!res.ok) throw new Error("Nu s-a putut verifica disponibilitatea.");
    return res.json();
}