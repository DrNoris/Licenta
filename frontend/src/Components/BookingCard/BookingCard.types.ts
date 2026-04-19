import type {UpcomingBooking} from "../../pages/Booking/BookingsPage/BookingsPage.types.ts";

export interface BookingCardProps {
    booking: UpcomingBooking;
    onClick: ((booking: UpcomingBooking) => void) | null;
    isArchive: boolean;
}