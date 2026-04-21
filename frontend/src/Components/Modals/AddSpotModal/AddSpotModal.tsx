import React, { useState } from "react";
import { createPortal } from "react-dom";
import { X, DollarSign, MapPin, Camera } from "lucide-react";
import { type AddSpotFormState, type AddSpotModalProps, EMPTY_FORM } from "./AddSpotModal.types.ts";
import { addParkingSpot } from "../../../services/parkingSpotService.ts";
import LocationPicker from "../../LocationPicker/LocationPicker.tsx";
import PhotoUploader from "../../PhotoUploader/PhotoUploader.tsx";
import { useBodyScrollLock } from "../../../hooks/useBodyScrollLock.ts";
import "./AddSpotModal.styles.css";
import type {LatLng} from "../../LocationPicker/LocationPicker.types.ts";

function AddSpotModal({ open, onClose, onAdd }: AddSpotModalProps) {
    const [form, setForm] = useState<AddSpotFormState>(EMPTY_FORM);

    useBodyScrollLock(open);

    if (!open) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
        setForm((prev) => ({ ...prev, [e.target.id]: e.target.value, error: "" }));
    };

    const handleLocationChange = (latlng: LatLng, address: string): void => {
        setForm((prev) => ({
            ...prev,
            latitude: latlng.lat,
            longitude: latlng.lng,
            address,
            error: "",
        }));
    };

    const handleFilesChange = (files: File[]): void => {
        setForm((prev) => ({ ...prev, files }));
    };

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();

        if (!form.description || !form.pricePerHour) {
            setForm((prev) => ({ ...prev, error: "Completați descrierea și prețurile." }));
            return;
        }
        if (form.latitude === null || form.longitude === null) {
            setForm((prev) => ({ ...prev, error: "Selectați locația pe hartă." }));
            return;
        }

        setForm((prev) => ({ ...prev, loading: true, error: "" }));

        try {
            const newSpot = await addParkingSpot(
                {
                    description: form.description,
                    address: form.address,
                    pricePerHour: parseFloat(form.pricePerHour),
                    latitude: form.latitude,
                    longitude: form.longitude,
                },
                form.files
            );
            onAdd(newSpot);
            setForm(EMPTY_FORM);
            onClose();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Adăugarea a eșuat.";
            setForm((prev) => ({ ...prev, error: message, loading: false }));
        }
    };

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>): void => {
        if (e.target === e.currentTarget) onClose();
    };

    const isFormValid = form.description && form.pricePerHour
        && form.latitude !== null && form.longitude !== null;

    return createPortal(
        <div className="add-spot-overlay" onClick={handleOverlayClick}>
            <div className="add-spot-modal">

                {/* ── Header ─────────────────────────────────────────── */}
                <div className="add-spot-modal__header">
                    <h3 className="add-spot-modal__title">Adaugă loc de parcare</h3>
                    <button className="add-spot-modal__close" onClick={onClose} aria-label="Închide">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} noValidate style={{ display: "contents" }}>
                    {/* ── Body ───────────────────────────────────────────── */}
                    <div className="add-spot-modal__body">

                        {/* Section: Details */}
                        <div>
                            <p className="add-spot-modal__section-label">
                                Detalii
                            </p>
                            <div className="add-spot-modal__field">
                                <label htmlFor="description" className="add-spot-modal__label">
                                    Descriere *
                                </label>
                                <input
                                    id="description"
                                    className="add-spot-modal__input"
                                    value={form.description}
                                    onChange={handleChange}
                                    placeholder="ex: Loc acoperit lângă centru"
                                    disabled={form.loading}
                                />
                            </div>
                        </div>

                        <hr className="add-spot-modal__divider"/>

                        {/* Section: Prices */}
                        <div>
                            <p className="add-spot-modal__section-label">
                                <DollarSign size={13} style={{display: "inline", marginRight: "0.3rem"}}/>
                                Prețuri
                            </p>
                            <div className="add-spot-modal__field">
                                <label htmlFor="pricePerHour" className="add-spot-modal__label">
                                    Preț / oră (lei) *
                                </label>
                                <input
                                    id="pricePerHour"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="add-spot-modal__input"
                                    value={form.pricePerHour}
                                    onChange={handleChange}
                                    placeholder="ex: 5.00"
                                    disabled={form.loading}
                                />
                            </div>
                        </div>

                        <hr className="add-spot-modal__divider"/>

                        {/* Section: Photos */}
                        <div>
                            <p className="add-spot-modal__section-label">
                                <Camera size={13} style={{display: "inline", marginRight: "0.3rem"}}/>
                                Fotografii
                            </p>
                            <PhotoUploader
                                files={form.files}
                                onChange={handleFilesChange}
                                disabled={form.loading}
                            />
                        </div>

                        <hr className="add-spot-modal__divider"/>

                        {/* Section: Location */}
                        <div>
                            <p className="add-spot-modal__section-label">
                                <MapPin size={13} style={{display: "inline", marginRight: "0.3rem"}}/>
                                Locație *
                            </p>
                            {form.address && (
                                <p className="add-spot-modal__hint" style={{marginBottom: "0.5rem"}}>
                                    📍 {form.address}
                                </p>
                            )}
                            <LocationPicker
                                value={form.latitude !== null && form.longitude !== null
                                    ? {lat: form.latitude, lng: form.longitude}
                                    : null
                                }
                                onChange={handleLocationChange}
                                disabled={form.loading}
                            />
                        </div>

                        {form.error && (
                            <p className="add-spot-modal__error">{form.error}</p>
                        )}
                    </div>

                    {/* ── Footer ─────────────────────────────────────────── */}
                    <div className="add-spot-modal__footer">
                        <span className="add-spot-modal__footer-info">
                            * câmpuri obligatorii
                        </span>
                        <div className="add-spot-modal__footer-actions">
                            <button
                                type="button"
                                className="add-spot-modal__btn-cancel"
                                onClick={onClose}
                                disabled={form.loading}
                            >
                                Anulează
                            </button>
                            <button
                                type="submit"
                                className="add-spot-modal__btn-submit"
                                disabled={form.loading || !isFormValid}
                            >
                                {form.loading ? "Se adaugă..." : "Adaugă"}
                            </button>
                        </div>
                    </div>
                </form>

            </div>
        </div>,
        document.body
    );
}

export default AddSpotModal;