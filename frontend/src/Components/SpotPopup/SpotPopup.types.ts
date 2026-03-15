import type {ParkingSpot} from "../../pages/ManageParkingSpots/ManageParkingSpots.types.ts";
import type {TimeSlot} from "../Modals/RentModal/RentModal.types.ts";

export interface SpotPopupProps {
    spot: ParkingSpot;
    date: string;
    availableSlots: TimeSlot[];
    onBook: (spot: ParkingSpot, selectedSlots: TimeSlot[]) => void;
}

export interface AvailableSlotProps {
    date: string,
    availableSlots: TimeSlot[];
}