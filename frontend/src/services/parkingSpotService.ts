import { getToken } from "./authService";
import type {ParkingSpot} from "../pages/ManageParkingSpots/ManageParkingSpots.types.ts";
import type {FindSpotSearchParams} from "../pages/FindSpot/FindSpot.types.ts";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
interface CachedUrls {
    urls: string[];
    expiresAt: number;
}
const signedUrlCache = new Map<string, CachedUrls>();
const expirationBUffer: number = 30000;

function authHeaders(): HeadersInit {
    return {
        Authorization: `Bearer ${getToken()}`,
    };
}

export function jsonAuthHeaders(): Record<string, string> {
    const token = getToken();
    return {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
    };
}

export async function getMyParkingSpots(): Promise<ParkingSpot[]> {
    const res = await fetch(`${API_BASE}/api/parking-spot/manage`, {
        headers: jsonAuthHeaders(),
    });
    if (!res.ok) throw new Error("Nu s-au putut încărca locurile de parcare.");
    return res.json();
}

export async function addParkingSpot(spot: Omit<ParkingSpot, "id" | "imagePublicIds" | "availableNow">, files: File[]): Promise<ParkingSpot> {
    const formData: FormData = new FormData();

    formData.append(
        "data",
        new Blob([JSON.stringify(spot)], { type: "application/json" })
    );

    files.forEach((file) => formData.append("images", file));

    const res: Response = await fetch(`${API_BASE}/api/parking-spot`, {
        method: "POST",
        headers: authHeaders(),
        body: formData,
    });

    if (!res.ok)
        throw new Error("Adăugarea a eșuat.");

    return res.json();
}

export async function editParkingSpotPatch(spotId: string, data: { description: string; pricePerHour: number; }, newFiles: File[], publicIdsToDelete: string[]): Promise<ParkingSpot> {
    const formData: FormData = new FormData();

    formData.append(
        "data",
        new Blob([JSON.stringify({
            ...data,
            publicIdsToDelete,
        })], { type: "application/json" })
    );

    newFiles.forEach((file) => formData.append("images", file));

    const res: Response = await fetch(`${API_BASE}/api/parking-spot/${spotId}`, {
        method: "PATCH",
        headers: authHeaders(),
        body: formData,
    });

    if (!res.ok)
        throw new Error("Editarea a eșuat.");

    return res.json();
}

export async function deleteParkingSpot(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/api/parking-spot/${id}`, {
        method: "DELETE",
        headers: jsonAuthHeaders(),
    });

    if (res.status === 409)
        throw new Error("Nu poți șterge un loc cu rezervări viitoare.");

    if (!res.ok)
        throw new Error("Ștergerea a eșuat.");
}

function getExpiryFromUrl(url: string): number {
    try {
        const match = url.match(/[?&]expires_at=(\d+)/);
        if (match) {
            return parseInt(match[1]) * 1000;
        }
        return Date.now() + 4 * 60 * 1000;
    } catch {
        return Date.now() + 4 * 60 * 1000;
    }
}

export async function getSignedImageUrls(spotId: string): Promise<string[]> {
    const cached = signedUrlCache.get(spotId);
    if (cached && cached.expiresAt > Date.now()) {
        return cached.urls;
    }

    const res = await fetch(`${API_BASE}/api/parking-spot/${spotId}/images`, {
        headers: jsonAuthHeaders(),
    });
    if (res.status === 403) return [];
    if (!res.ok) throw new Error("Nu s-au putut încărca imaginile.");

    const urls: string[] = await res.json();

    if (urls.length > 0) {
        signedUrlCache.set(spotId, {
            urls,
            expiresAt: getExpiryFromUrl(urls[0]) - expirationBUffer
        });
    }

    return urls;
}

export async function searchParkingSpots(params: FindSpotSearchParams): Promise<ParkingSpot[]> {
    const { boundingBox, filters } = params;

    const query = new URLSearchParams({
        swLat: boundingBox.swLat.toString(),
        swLng: boundingBox.swLng.toString(),
        neLat: boundingBox.neLat.toString(),
        neLng: boundingBox.neLng.toString(),
        ...(filters.date && { date: filters.date }),
        ...(filters.minPricePerHour && { minPricePerHour: filters.minPricePerHour }),
        ...(filters.maxPricePerHour && { maxPricePerHour: filters.maxPricePerHour }),
    });

    filters.timeSlotIds.forEach((id) => query.append("timeSlotIds", id));

    const res = await fetch(`${API_BASE}/api/parking-spot/search?${query}`, {
        headers: jsonAuthHeaders(),
    });

    if (!res.ok) throw new Error("Căutarea a eșuat.");
    return res.json();
}