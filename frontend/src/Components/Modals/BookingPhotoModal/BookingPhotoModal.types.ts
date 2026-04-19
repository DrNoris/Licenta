import type {UpcomingBooking} from "../../../pages/Booking/BookingsPage/BookingsPage.types.ts";

export interface BookingPhotosModalProps {
    isOpen: boolean;
    onClose: () => void;
    booking: UpcomingBooking | null;
}