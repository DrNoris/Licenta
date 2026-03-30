import { useEffect, useState } from "react";
import { MapPin, ImageOff, Navigation } from "lucide-react";
import type { TimeSlot } from "../../Components/Modals/RentModal/RentModal.types.ts";
import { formatHour } from "../../services/rentService.ts";
import { getSignedImageUrls } from "../../services/parkingSpotService.ts";
import "./BookingCard.styles.css";
import type {BookingCardProps} from "./BookingCard.types.ts";

function BookingCard({ booking, onClick, isArchive }: BookingCardProps) {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Fetch first signed image for preview
    useEffect(() => {
        getSignedImageUrls(booking.parkingSpot.id)
            .then((urls) => {
                if (urls.length > 0) setPreviewUrl(urls[0]);
            })
            .catch(() => {});
    }, [booking.parkingSpot.id]);

    const mapsUrl = `https://www.google.com/maps?q=${booking.parkingSpot.latitude},${booking.parkingSpot.longitude}`;

    return (
        <div className="booking-card" onClick={() => onClick?.(booking)}>
            {/* Preview image */}
            {!isArchive && (<div className="booking-card__image">
                {previewUrl ? (
                    <img src={previewUrl} alt={booking.parkingSpot.description}/>
                ) : (
                    <ImageOff size={24}/>
                )}
            </div>)}

            {/* Body */}
            <div className="booking-card__body">
                <p className="booking-card__address">
                    <MapPin size={11} style={{ display: "inline", marginRight: "0.2rem" }} />
                    {booking.parkingSpot.address}
                </p>
                <p className="booking-card__description">{booking.parkingSpot.description}</p>

                {/* Time slots */}
                <div className="booking-card__slots">
                    {booking.slots.map((slot: TimeSlot) => (
                        <span key={slot.id} className="booking-card__slot">
                            {formatHour(slot.startHour)} → {formatHour(slot.endHour)}
                        </span>
                    ))}
                </div>

                {/* Footer */}
                <div className="booking-card__footer">
                    <span className="booking-card__price">
                        {booking.totalPrice.toFixed(2)} lei
                    </span>
                    {!isArchive && (<a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="booking-card__maps-btn"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Navigation size={12}/>
                        Maps
                    </a>)}
                </div>
            </div>
        </div>
    );
}

export default BookingCard;