import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import "./BookingPhotoModal.styles.css";
import type {BookingPhotosModalProps} from "./BookingPhotoModal.types.ts";
import {useBodyScrollLock} from "../../../hooks/useBodyScrollLock.ts";
import {getSignedImageUrls} from "../../../services/parkingSpotService.ts";

function BookingPhotoModal({ isOpen, onClose, booking }: BookingPhotosModalProps) {
    const [signedUrls, setSignedUrls] = useState<string[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const [loading, setLoading] = useState(false);

    useBodyScrollLock(isOpen);

    useEffect(() => {
        if (!isOpen || !booking) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true);
        setActiveIndex(0);

        getSignedImageUrls(booking.parkingSpot.id)
            .then((urls) => setSignedUrls(urls))
            .catch(() => setSignedUrls([]))
            .finally(() => setLoading(false));
    }, [isOpen, booking]);

    useEffect(() => {
        if (!isOpen)
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSignedUrls([]);
    }, [isOpen]);

    if (!isOpen || !booking) return null;

    const prev = () => setActiveIndex((i) => (i - 1 + signedUrls.length) % signedUrls.length);
    const next = () => setActiveIndex((i) => (i + 1) % signedUrls.length);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowLeft") prev();
        if (e.key === "ArrowRight") next();
        if (e.key === "Escape") onClose();
    };

    return createPortal(
        <div
            className="photos-overlay"
            onClick={onClose}
            onKeyDown={handleKeyDown}
            tabIndex={0}
        >
            <div className="photos-modal" onClick={(e) => e.stopPropagation()}>

                <button className="photos-modal__close" onClick={onClose}>
                    <X size={18} />
                </button>

                {!loading && signedUrls.length === 0 && (
                    <div style={{ color: "#9ca3af", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                        <ImageOff size={40} />
                        <p>Nicio fotografie disponibilă</p>
                    </div>
                )}

                {!loading && signedUrls.length > 0 && (
                    <>
                        <img
                            src={signedUrls[activeIndex]}
                            alt={`photo-${activeIndex}`}
                            className="photos-modal__main"
                            onClick={next}
                        />

                        <span className="photos-modal__counter">
                            {activeIndex + 1} / {signedUrls.length}
                        </span>

                        {signedUrls.length > 1 && (
                            <div className="photos-modal__thumbs">
                                {signedUrls.map((url, i) => (
                                    <div
                                        key={i}
                                        className={`photos-modal__thumb ${i === activeIndex ? "photos-modal__thumb--active" : ""}`}
                                        onClick={() => setActiveIndex(i)}
                                    >
                                        <img src={url} alt={`thumb-${i}`} />
                                    </div>
                                ))}
                            </div>
                        )}

                        {signedUrls.length > 1 && (
                            <>
                                <button className="photos-modal__nav photos-modal__nav--prev" onClick={prev}>
                                    <ChevronLeft size={20} />
                                </button>
                                <button className="photos-modal__nav photos-modal__nav--next" onClick={next}>
                                    <ChevronRight size={20} />
                                </button>
                            </>
                        )}
                    </>
                )}
            </div>
        </div>,
        document.body
    );
}

export default BookingPhotoModal;