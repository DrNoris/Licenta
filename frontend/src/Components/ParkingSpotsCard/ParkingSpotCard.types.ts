import type {ParkingSpot} from "../../pages/ManageParkingSpots/ManageParkingSpots.types.ts";

export interface ParkingSpotCardProps {
    spot: ParkingSpot;
    onDelete?: (id: string) => void;
    onAddTimeSlot?: (id: string, timeSlotIds: string[]) => void;
    isOwner?: boolean;
}

export type ImageAccessState = "idle" | "loading" | "loaded" | "locked";