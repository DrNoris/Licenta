export interface ParkingSpot {
    id: string;
    description: string;
    address: string;
    pricePerHour: number;
    pricePerDay: number;
    latitude: number;
    longitude: number;
    imagePublicIds: string[];
    availableNow: boolean;
}

export type ManageStatus = "idle" | "loading" | "error";

export interface ManagePageState {
    spots: ParkingSpot[];
    status: ManageStatus;
    error: string;
}