import type {ParkingSpot} from "../../pages/ManageParkingSpots/ManageParkingSpots.types.ts";
import type {TimeSlot} from "../Modals/RentModal/RentModal.types.ts";

export interface ParkingSpotCardProps {
    spot: ParkingSpot;
    onDelete?: (id: string) => void;
    onUpdateTimeSlots?: (parkingSpotId: string, selectedDates: string[], slotsToAdd: TimeSlot[], slotsToDelete: TimeSlot[]) => Promise<void>;
    onEdit?: (description: string, pricePerHour: number, newFiles: File[], publicIdsToDelete: string[]) => Promise<void>;
    isOwner?: boolean;
}

export type ImageAccessState = "idle" | "loading" | "loaded" | "locked";