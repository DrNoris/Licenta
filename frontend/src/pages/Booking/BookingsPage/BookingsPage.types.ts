import type {ParkingSpot} from "../../ManageParkingSpots/ManageParkingSpots.types.ts";
import type {TimeSlot} from "../../../Components/Modals/RentModal/RentModal.types.ts";

export type BookingTab = "upcoming" | "archive";

export interface UpcomingBooking {
    id: string;
    parkingSpot: ParkingSpot;
    date: string;
    slots: TimeSlot[];
    totalPrice: number;
    status: string;
}

export interface GroupedBookings {
    date: string;
    bookings: UpcomingBooking[];
}

export interface BookingsListProps {
    tab: BookingTab;
}

export interface BookingCardProps {
    booking: UpcomingBooking;
    onClick: (booking: UpcomingBooking) => void;
}

export interface BookingPhotosModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: UpcomingBooking | null;
}