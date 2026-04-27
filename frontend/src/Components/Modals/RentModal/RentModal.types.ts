export const SlotAvailabilityType = {
    AVAILABLE: "AVAILABLE",
    UNAVAILABLE: "UNAVAILABLE",
    OFFERED: "OFFERED",
    BOOKED: "BOOKED",
} as const;

export type SlotAvailabilityType = typeof SlotAvailabilityType[keyof typeof SlotAvailabilityType];

export interface TimeSlot {
    id: string;
    startHour: number;
    endHour: number;
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
    slotAvailabilityType: SlotAvailabilityType | undefined;
    isSelected: boolean;
    onToggle: (slot: TimeSlot) => void;
    spotId: string;
}

export interface RentModalProps {
    isOpen: boolean;
    onClose: () => void;
    spotId: string;
    spotDescription: string;
    onUpdateTimeSlots: (spotId: string, dates: string[], slotsToAdd: TimeSlot[], slotsToDelete: TimeSlot[]) => Promise<void>;
}