export interface TimeSlot {
    id: string;
    startHour: number;
    endHour: number;
}

export interface AvailabilityResponse {
    date: string;
    availableSlots: TimeSlot[];
}

export interface BookingModalProps {
    open: boolean;
    onClose: () => void;
    spotId: string;
    spotDescription: string;
}

export interface ParkingSpotSlot {
    id: string;
    timeSlotId: string;
    date: string;
    parkingSpotId: string;
    bookingId: string | null;
}

export interface SlotItemProps {
    slot: TimeSlot;
    isAvailable: boolean;
    isSelected: boolean;
    onToggle: (slot: TimeSlot) => void;
}