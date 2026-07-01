import React, {useEffect, useRef, useState} from "react";
import { createPortal } from "react-dom";
import { X, DollarSign, Camera, Trash2, Loader } from "lucide-react";
import type {EditSpotFormState, EditSpotModalProps, ExistingPhoto} from "./EditSpotModal.types.ts";
import { getSignedImageUrls } from "../../../services/parkingSpotService.ts";
import PhotoUploader from "../../PhotoUploader/PhotoUploader.tsx";
import { useBodyScrollLock } from "../../../hooks/useBodyScrollLock.ts";
import "./EditSpotModal.styles.css";
import toast from "react-hot-toast";

function EditSpotModal({ isOpen, spot, onClose, onEdit }: EditSpotModalProps) {
    const [form, setForm] = useState<EditSpotFormState>({
        description: spot.description,
        pricePerHour: spot.pricePerHour.toString(),
        existingPhotos: [],
        newFiles: [],
        photosLoading: false,
        error: "",
        loading: false,
    });
    const mouseDownTargetRef = useRef<EventTarget | null>(null);


    useBodyScrollLock(isOpen);

    useEffect(() => {
        if (!isOpen) return;

        // eslint-disable-next-line react-hooks/set-state-in-effect
        setForm({
            description: spot.description,
            pricePerHour: spot.pricePerHour.toString(),
            existingPhotos: [],
            newFiles: [],
            photosLoading: spot.imagePublicIds.length > 0,
            error: "",
            loading: false,
        });

        if (spot.imagePublicIds.length === 0) return;

        getSignedImageUrls(spot.id)
            .then((urls) => {
                const photos: ExistingPhoto[] = spot.imagePublicIds.map((publicId, i) => ({
                    publicId,
                    signedUrl: urls[i] ?? "",
                    markedForDeletion: false,
                }));
                setForm((prev) => ({ ...prev, existingPhotos: photos, photosLoading: false }));
            })
            .catch(() => {
                setForm((prev) => ({ ...prev, photosLoading: false }));
            });
    }, [isOpen]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setForm((prev) => ({ ...prev, [e.target.id]: e.target.value, error: "" }));
    };

    const toggleDeleteExisting = (publicId: string): void => {
        setForm((prev) => ({
            ...prev,
            existingPhotos: prev.existingPhotos.map((p) =>
                p.publicId === publicId
                    ? { ...p, markedForDeletion: !p.markedForDeletion }
                    : p
            ),
        }));
    };

    const handleFilesChange = (files: File[]): void => {
        setForm((prev) => ({ ...prev, newFiles: files }));
    };

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();

        if (!form.description || form.description.length < 5) {
            toast.error("Descrierea este prea scurta, minim 10 caractere.");
            return;
        }

        if (!form.pricePerHour || parseFloat(form.pricePerHour) < 0.2) {
            toast.error("Prețul minim per oră este 0.2 lei.");
            return;
        }

        if (remainingSlots == 5) {
            toast.error("Este necesară minim o poză.");
            return;
        }

        if (!form.description || !form.pricePerHour) {
            setForm((prev) => ({ ...prev, error: "Completați toate câmpurile obligatorii." }));
            return;
        }

        const publicIdsToDelete = form.existingPhotos
            .filter((p) => p.markedForDeletion)
            .map((p) => p.publicId);

        setForm((prev) => ({ ...prev, loading: true, error: "" }));

        const editPromise = onEdit(
            form.description,
            parseFloat(form.pricePerHour),
            form.newFiles,
            publicIdsToDelete
        );

        toast.promise(editPromise, {
            loading: "Se salvează modificările...",
            success: "Locul de parcare a fost actualizat!",
            error: "Editarea a eșuat. Încearcă din nou.",
        });

        try {
            await editPromise;
            onClose();
        } catch {
            setForm((prev) => ({ ...prev, loading: false }));
        }
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>): void => {
        mouseDownTargetRef.current = e.target;
    };

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>): void => {
        if (e.target === e.currentTarget && mouseDownTargetRef.current === e.currentTarget) {
            onClose();
        }
    };

    const isFormValid = form.description && form.pricePerHour;
    const remainingSlots = 5 - (form.existingPhotos.filter((p) => !p.markedForDeletion).length);

    return createPortal(
        <div className="edit-spot-overlay" onClick={handleOverlayClick} onMouseDown={handleMouseDown}>
            <div className="edit-spot-modal">

                {/* ── Header ─────────────────────────────────────────── */}
                <div className="edit-spot-modal__header">
                    <div>
                        <h3 className="edit-spot-modal__title">Editează loc de parcare</h3>
                        <p className="edit-spot-modal__subtitle">{spot.address}</p>
                    </div>
                    <button className="edit-spot-modal__close" onClick={onClose} aria-label="Închide">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} noValidate style={{ display: "contents" }}>
                    <div className="edit-spot-modal__body">

                        <div>
                            <p className="edit-spot-modal__section-label">Detalii</p>
                            <div className="edit-spot-modal__field">
                                <label htmlFor="description" className="edit-spot-modal__label">
                                    Descriere *
                                </label>
                                <input
                                    id="description"
                                    className="edit-spot-modal__input"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="ex: Loc acoperit lângă centru"
                                    disabled={form.loading}
                                />
                            </div>
                        </div>

                        <hr className="edit-spot-modal__divider" />

                        <div>
                            <p className="edit-spot-modal__section-label">
                                <DollarSign size={13} style={{ display: "inline", marginRight: "0.3rem" }} />
                                Prețuri
                            </p>
                                <div className="edit-spot-modal__field">
                                    <label htmlFor="pricePerHour" className="edit-spot-modal__label">
                                        Preț / oră (lei) *
                                    </label>
                                    <input
                                        id="pricePerHour"
                                        type="number"
                                        min="0.2"
                                        step="0.01"
                                        className="edit-spot-modal__input"
                                        value={form.pricePerHour}
                                        onChange={handleChange}
                                        placeholder="ex: 5.00"
                                        disabled={form.loading}
                                    />
                                </div>
                        </div>

                        <hr className="edit-spot-modal__divider" />

                        <div>
                            <p className="edit-spot-modal__section-label">
                                <Camera size={13} style={{ display: "inline", marginRight: "0.3rem" }} />
                                Fotografii
                            </p>

                            {form.photosLoading && (
                                <div className="edit-spot-modal__photos-loading">
                                    <Loader size={18} className="edit-spot-modal__spinner" />
                                    <span>Se încarcă fotografiile...</span>
                                </div>
                            )}

                            {!form.photosLoading && form.existingPhotos.length > 0 && (
                                <>
                                    <p className="edit-spot-modal__hint">
                                        Apasă pe 🗑 pentru a marca o fotografie pentru ștergere.
                                    </p>
                                    <div className="edit-spot-modal__existing-photos">
                                        {form.existingPhotos.map((photo) => (
                                            <div
                                                key={photo.publicId}
                                                className={[
                                                    "edit-spot-modal__existing-photo",
                                                    photo.markedForDeletion ? "edit-spot-modal__existing-photo--deleted" : "",
                                                ].join(" ")}
                                            >
                                                <img
                                                    src={photo.signedUrl}
                                                    alt="existing"
                                                    className="edit-spot-modal__existing-photo-img"
                                                />
                                                <button
                                                    type="button"
                                                    className={[
                                                        "edit-spot-modal__existing-photo-btn",
                                                        photo.markedForDeletion ? "edit-spot-modal__existing-photo-btn--undo" : "",
                                                    ].join(" ")}
                                                    onClick={() => toggleDeleteExisting(photo.publicId)}
                                                    disabled={form.loading}
                                                >
                                                    {photo.markedForDeletion ? <X size={10} /> : <Trash2 size={10} />}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            {remainingSlots > 0 && (
                                <div style={{ marginTop: form.existingPhotos.length > 0 ? "0.75rem" : "0" }}>
                                    <p className="edit-spot-modal__hint">
                                        Adaugă până la {remainingSlots} fotografi{remainingSlots === 1 ? "e" : "i"} noi.
                                    </p>
                                    <PhotoUploader
                                        files={form.newFiles}
                                        onChange={handleFilesChange}
                                        disabled={form.loading}
                                        maxFiles={remainingSlots}
                                    />
                                </div>
                            )}
                        </div>

                        {form.error && (
                            <p className="edit-spot-modal__error">{form.error}</p>
                        )}
                    </div>

                    <div className="edit-spot-modal__footer">
                        <span className="edit-spot-modal__footer-info">* câmpuri obligatorii</span>
                        <div className="edit-spot-modal__footer-actions">
                            <button
                                type="button"
                                className="edit-spot-modal__btn-cancel"
                                onClick={onClose}
                                disabled={form.loading}
                            >
                                Anulează
                            </button>
                            <button
                                type="submit"
                                className="edit-spot-modal__btn-submit"
                                disabled={form.loading || !isFormValid}
                            >
                                {form.loading ? "Se salvează..." : "Salvează"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}

export default EditSpotModal;