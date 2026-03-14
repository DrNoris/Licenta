export interface TimeSlot {
    id: string;
    startHour: number;
    endHour: number;
}

export interface AvailabilityResponse {
    date: string;
    availableSlots: TimeSlot[];
}

export interface RentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddTimeSlot: (id: string, selectedDate: string, timeSlotIds: TimeSlot[]) => void;
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