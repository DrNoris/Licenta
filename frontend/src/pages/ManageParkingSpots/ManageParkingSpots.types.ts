export interface ParkingSpot {
    id: string;
    description: string;
    pricePerHour: number;
    pricePerDay: number;
    latitude: number;
    longitude: number;
    imageUrls: string[];
}

export type ManageStatus = "idle" | "loading" | "error";

export interface ManagePageState {
    spots: ParkingSpot[];
    status: ManageStatus;
    error: string;
}