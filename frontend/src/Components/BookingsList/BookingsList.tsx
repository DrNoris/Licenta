import { useEffect, useState } from "react";
import { CalendarX2 } from "lucide-react";
import { getBookings } from "../../services/bookingService.ts";
import BookingCard from "../../Components/BookingCard/BookingCard.tsx";
import BookingPhotoModal from "../../Components/Modals/BookingPhotoModal/BookingPhotoModal.tsx";
import type {BookingsListProps, GroupedBookings, UpcomingBooking} from "../../pages/Booking/BookingsPage/BookingsPage.types.ts";
import "./BookingsList.styles.css"

const PAGE_SIZE = 5;

function formatDateLabel(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ro-RO", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
    });
}

function groupByDate(bookings: UpcomingBooking[]): GroupedBookings[] {
    const map = new Map<string, UpcomingBooking[]>();
    bookings.forEach((b) => {
        const existing = map.get(b.date) ?? [];
        map.set(b.date, [...existing, b]);
    });
    return Array.from(map.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, bookings]) => ({ date, bookings }));
}

function BookingsList({ tab }: BookingsListProps) {
    const [groups, setGroups] = useState<GroupedBookings[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [selectedBooking, setSelectedBooking] = useState<UpcomingBooking | null>(null);
    const [photosModalOpen, setPhotosModalOpen] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPage(0);
        setGroups([]);
    }, [tab]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true);
        const fetch = getBookings(tab, page, PAGE_SIZE);

        fetch
            .then((data) => {
                setGroups(groupByDate(data.content));
                setTotalPages(data.totalPages);
            })
            .catch(() => setGroups([]))
            .finally(() => setLoading(false));
    }, [tab, page]);

    const handleCardClick = (booking: UpcomingBooking): void => {
        setSelectedBooking(booking);
        setPhotosModalOpen(true);
    };

    const emptyMessage = tab === "upcoming" ? "Nu ai rezervări viitoare." : "Nu ai rezervări arhivate.";

    return (
        <>
            {loading && (
                <div className="bookings-page__loading">
                    <div className="bookings-page__spinner" />
                    <p>Se încarcă rezervările...</p>
                </div>
            )}

            {!loading && groups.length === 0 && (
                <div className="bookings-page__empty">
                    <CalendarX2 size={40} strokeWidth={1.5} />
                    <p>{emptyMessage}</p>
                </div>
            )}

            {!loading && groups.map((group) => (
                <div key={group.date} className="bookings-page__group">
                    <p className="bookings-page__date-label">
                        {formatDateLabel(group.date)}
                    </p>
                    <div className="bookings-page__group-cards">
                        {group.bookings.map((booking) => (
                            <BookingCard
                                key={booking.id}
                                booking={booking}
                                onClick={tab === "archive" ? null : handleCardClick}
                                isArchive={tab === "archive"}
                            />
                        ))}
                    </div>
                </div>
            ))}

            {!loading && totalPages > 1 && (
                <div className="bookings-page__pagination">
                    <button
                        className="bookings-page__page-btn"
                        onClick={() => setPage((p) => p - 1)}
                        disabled={page === 0}
                    >
                        ‹
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i}
                            className={`bookings-page__page-btn ${i === page ? "bookings-page__page-btn--active" : ""}`}
                            onClick={() => setPage(i)}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button
                        className="bookings-page__page-btn"
                        onClick={() => setPage((p) => p + 1)}
                        disabled={page === totalPages - 1}
                    >
                        ›
                    </button>
                </div>
            )}

            <BookingPhotoModal
                isOpen={photosModalOpen}
                onClose={() => setPhotosModalOpen(false)}
                booking={selectedBooking}
            />
        </>
    );
}

export default BookingsList;