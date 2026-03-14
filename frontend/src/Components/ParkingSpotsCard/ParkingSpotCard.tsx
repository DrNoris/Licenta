import {type JSX, useEffect, useState} from "react";
import {Trash2, MapPin, ImageOff, Lock, Loader, AlarmClockPlus, Pencil} from "lucide-react";
import type {ImageAccessState, ParkingSpotCardProps} from "./ParkingSpotCard.types.ts";
import {getSignedImageUrls} from "../../services/parkingSpotService.ts";
import "./ParkingSpotCard.styles.css"
import RentModal from "../Modals/RentModal/RentModal.tsx";
import DeleteModal from "../Modals/DeleteModal/DeleteModal.tsx";
import EditSpotModal from "../Modals/EditSpotModal/EditSpotModal.tsx";

function ParkingSpotCard({ spot, onDelete, onAddTimeSlot, onEdit, isOwner = false }: ParkingSpotCardProps) {
    const [imageState, setImageState] = useState<ImageAccessState>("idle");
    const [signedUrls, setSignedUrls] = useState<string[]>([]);
    const [activeImage, setActiveImage] = useState(0);

    const [addTimeSlotModal, setAddTimeSlotModal] = useState<boolean>(false);
    const [deleteParkingSpotModal, setDeleteParkingSpotModal] = useState<boolean>(false);
    const [editParkingSpotModal, setEditParkingSpotModal] = useState<boolean>(false);

    const [blobUrls, setBlobUrls] = useState<string[]>([]);

    useEffect(() => {
        if (signedUrls.length === 0) return;

        let cancelled = false;

        Promise.all(
            signedUrls.map((url) =>
                fetch(url)
                    .then((res) => res.blob())
                    .then((blob) => URL.createObjectURL(blob))
            )
        ).then((blobs) => {
            if (!cancelled) setBlobUrls(blobs);
        });

        return () => {
            cancelled = true;
            // revoke blob URLs on cleanup to free memory
            blobUrls.forEach((url) => URL.revokeObjectURL(url));
        };
    }, [signedUrls]);

    useEffect(() => {
        if (signedUrls.length <= 1)
            return;

        const nextIndex: number = (activeImage + 1) % signedUrls.length;
        const img: HTMLImageElement = new Image();

        img.src = signedUrls[nextIndex];
    }, [activeImage, signedUrls]);

    useEffect(() => {
        if (spot.imagePublicIds.length === 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setImageState("locked");
            return;
        }

        setImageState("loading");

        getSignedImageUrls(spot.id)
            .then((urls) => {
                setSignedUrls(urls);
                setImageState(urls.length > 0 ? "loaded" : "locked");
            })
            .catch(() => setImageState("locked"));
    }, [spot.id]);

    const getFooter = (isOwner: undefined | boolean) => {
        if (!isOwner)
            return null;

        const buttons: JSX.Element[] = [];

        if (onEdit)
            buttons.push(<button
                className="spot-card__btn spot-card__btn__edit"
                onClick={() => setEditParkingSpotModal(true)}
            >
                <Pencil size={15}/>
            </button>)

        if (onAddTimeSlot)
            buttons.push(<button
                className="spot-card__btn spot-card__btn__add-time-slot"
                onClick={() => setAddTimeSlotModal(true)} //on click trebuie sa deschida un modal de add time slot ce sa primeasca ca params functia de onadd
            >
                <AlarmClockPlus size={15}/>
            </button>)

        if (onDelete)
            buttons.push(<button
                className="spot-card__btn spot-card__btn__delete"
                onClick={() => setDeleteParkingSpotModal(true)}
            >
                <Trash2 size={15}/>
            </button>)

        return <div className="spot-card__footer">
            {buttons}
        </div>
    }

    return (
        <div className="spot-card">
            {/* ── Image area ─────────────────────────────────────────── */}
            <div className="spot-card__image-wrap">

                {imageState === "loading" && (
                    <div className="spot-card__image-state">
                        <Loader size={28} className="spot-card__spinner-icon" />
                    </div>
                )}

                {imageState === "locked" && (
                    <div className="spot-card__image-state spot-card__image-state--locked">
                        <Lock size={28} />
                        <span>Imaginile sunt disponibile după rezervare</span>
                    </div>
                )}

                {imageState === "loaded" && blobUrls.length > 0 && (
                    <img
                        src={blobUrls[activeImage]}
                        alt={spot.description}
                        className="spot-card__image"
                        onClick={() => setActiveImage((activeImage + 1) % blobUrls.length)}
                    />
                )}
                        {/* Thumbnail strip */}
                        {/*{signedUrls.length > 1 && (*/}
                        {/*    <div className="spot-card__thumbnails">*/}
                        {/*        {signedUrls.map((url, i) => (*/}
                        {/*            <button*/}
                        {/*                key={i}*/}
                        {/*                className={`spot-card__thumb ${i === activeImage ? "spot-card__thumb--active" : ""}`}*/}
                        {/*                onClick={() => setActiveImage(i)}*/}
                        {/*            >*/}
                        {/*                <img src={url} alt={`thumb-${i}`} />*/}
                        {/*            </button>*/}
                        {/*        ))}*/}
                        {/*    </div>*/}
                        {/*)}*/}
                {/*    </>*/}
                {/*)}*/}

                {imageState === "idle" && (
                    <div className="spot-card__image-state">
                        <ImageOff size={28} />
                    </div>
                )}
            </div>

            {/* ── Body ───────────────────────────────────────────────── */}
            <div className="spot-card__body">
                <p className="spot-card__description">{spot.description}</p>
                <span className="spot-card__location">
          <MapPin size={13} />
                    {spot.address}
        </span>
                <div className="spot-card__prices">
                    <div className="spot-card__price">
                        <span className="spot-card__price-label">/ oră</span>
                        <span className="spot-card__price-value">{spot.pricePerHour.toFixed(2)} lei</span>
                    </div>
                    <div className="spot-card__price">
                        <span className="spot-card__price-label">/ zi</span>
                        <span className="spot-card__price-value">{spot.pricePerDay.toFixed(2)} lei</span>
                    </div>
                </div>
            </div>

            {onAddTimeSlot && (
                <RentModal
                    isOpen={addTimeSlotModal}
                    spotId={spot.id}
                    onAddTimeSlot={onAddTimeSlot}
                    onClose={() => setAddTimeSlotModal(false)}
                    spotDescription={spot.description}/>
            )}
            {onDelete && (
                <DeleteModal
                    isOpen={deleteParkingSpotModal}
                    spotId={spot.id}
                    onDelete={onDelete}
                    onClose={() => setDeleteParkingSpotModal(false)}
                />
            )}
            {onEdit && (
                <EditSpotModal
                    isOpen={editParkingSpotModal}
                    spot={spot}
                    onClose={() => setEditParkingSpotModal(false)}
                    onEdit={onEdit}
                />
            )}
            {/* ── Footer ─────────────────────────────────────────────── */}
            {getFooter(isOwner)}
        </div>
    );
}

export default ParkingSpotCard;