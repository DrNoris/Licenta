import {jsonAuthHeaders} from "./parkingSpotService.ts";
import type {BookingTab, UpcomingBooking} from "../pages/Booking/BookingsPage/BookingsPage.types.ts";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

export async function createCheckoutSession(parkingSpotId: string, date: string, timeSlotIds: string[]): Promise<string> {
    const res = await fetch(`${API_BASE}/api/bookings/checkout`, {
        method: "POST",
        headers: jsonAuthHeaders(),
        body: JSON.stringify({ parkingSpotId, date, timeSlotIds }),
    });
    if (!res.ok) throw new Error("Nu s-a putut crea sesiunea de plată.");
    const { checkoutUrl } = await res.json();
    return checkoutUrl;
}

export async function getBookings(tab: BookingTab, page: number, pageSize: number): Promise<{
    content: UpcomingBooking[];
    totalPages: number;
    totalElements: number;
}> {
    const res = await fetch(`${API_BASE}/api/bookings/${tab.toString()}?page=${page}&size=${pageSize}`, {
        method: "GET",
        headers: jsonAuthHeaders(),
    });
    if (!res.ok) throw new Error("Nu s-au putut încărca rezervările.");
    return res.json();
}