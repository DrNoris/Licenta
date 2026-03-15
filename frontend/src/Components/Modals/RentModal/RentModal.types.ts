export const SlotAvailabilityType = {
    AVAILABLE: "AVAILABLE",
    OFFERED: "OFFERED",
    BOOKED: "BOOKED",
} as const;

export type SlotAvailabilityType = typeof SlotAvailabilityType[keyof typeof SlotAvailabilityType];

export interface TimeSlot {
    id: string;
    startHour: number;
    endHour: number;
}

// Slot belonging to a specific parking spot on a specific date
export interface ParkingSpotSlot {
    id: string;
    timeSlotId: string;      // references TimeSlot.id
    date: string;
    parkingSpotId: string;
    bookingId: string | null; // null = offered but not booked
}

export interface SlotItemProps {
    slot: TimeSlot;
    slotAvailabilityType: SlotAvailabilityType | undefined;
    isSelected: boolean;
    onToggle: (slot: TimeSlot) => void;
}

export interface RentModalProps {
    isOpen: boolean;
    onClose: () => void;
    spotId: string;
    spotDescription: string;
    onUpdateTimeSlots: (spotId: string, date: string, slotsToAdd: TimeSlot[], slotsToDelete: TimeSlot[]) => void;
}