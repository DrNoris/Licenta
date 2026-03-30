import type {UpcomingBooking} from "../../../pages/UpcomingBookings/UpcomingBookings.types.ts";

export interface BookingPhotosModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: UpcomingBooking | null;
}