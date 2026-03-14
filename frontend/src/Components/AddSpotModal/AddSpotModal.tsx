import React, { useState } from "react";
import { X } from "lucide-react";
import {type AddSpotFormState, type AddSpotModalProps, EMPTY_FORM, type LatLng} from "./AddSpotModal.types.ts";
import {addParkingSpot} from "../../services/parkingSpotService.ts";
import LocationPicker from "../LocationPicker/LocationPicker.tsx";
import PhotoUploader from "../PhotoUploader/PhotoUploader.tsx";

function AddSpotModal({ open, onClose, onAdd }: AddSpotModalProps) {
    const [form, setForm] = useState<AddSpotFormState>(EMPTY_FORM);

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

        if (!form.description || !form.pricePerHour || !form.pricePerDay) {
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
                    pricePerHour: parseFloat(form.pricePerHour),
                    pricePerDay: parseFloat(form.pricePerDay),
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

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal">
                {/* Header */}
                <div className="modal__header">
                    <h3 className="modal__title">Adaugă loc de parcare</h3>
                    <button className="modal__close" onClick={onClose} aria-label="Închide">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} noValidate>
                    <div className="modal__body">

                        {/* Description */}
                        <div className="modal__field">
                            <label htmlFor="description" className="modal__label">Descriere *</label>
                            <input
                                id="description"
                                className="modal__input"
                                value={form.description}
                                onChange={handleChange}
                                placeholder="ex: Loc acoperit lângă centru"
                                disabled={form.loading}
                            />
                        </div>

                        {/* Prices */}
                        <div className="modal__field--row">
                            <div className="modal__field">
                                <label htmlFor="pricePerHour" className="modal__label">Preț / oră (lei) *</label>
                                <input
                                    id="pricePerHour"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="modal__input"
                                    value={form.pricePerHour}
                                    onChange={handleChange}
                                    placeholder="ex: 5.00"
                                    disabled={form.loading}
                                />
                            </div>
                            <div className="modal__field">
                                <label htmlFor="pricePerDay" className="modal__label">Preț / zi (lei) *</label>
                                <input
                                    id="pricePerDay"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="modal__input"
                                    value={form.pricePerDay}
                                    onChange={handleChange}
                                    placeholder="ex: 40.00"
                                    disabled={form.loading}
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div className="modal__field">
                            <label className="modal__label">Locație pe hartă *</label>
                            {form.address && (
                                <p className="modal__hint" style={{ marginBottom: "0.4rem" }}>
                                    📍 {form.address}
                                </p>
                            )}
                            <LocationPicker
                                value={form.latitude !== null && form.longitude !== null
                                    ? { lat: form.latitude, lng: form.longitude }
                                    : null
                                }
                                onChange={handleLocationChange}
                                disabled={form.loading}
                            />
                        </div>

                        {/* Photos */}
                        <div className="modal__field">
                            <label className="modal__label">Fotografii (opțional)</label>
                            <PhotoUploader
                                files={form.files}
                                onChange={handleFilesChange}
                                disabled={form.loading}
                            />
                        </div>

                        {form.error && <p className="modal__error">{form.error}</p>}
                    </div>

                    {/* Footer */}
                    <div className="modal__footer">
                        <button
                            type="button"
                            className="modal__btn-cancel"
                            onClick={onClose}
                            disabled={form.loading}
                        >
                            Anulează
                        </button>
                        <button
                            type="submit"
                            className="modal__btn-submit"
                            disabled={form.loading}
                        >
                            {form.loading ? "Se adaugă..." : "Adaugă"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddSpotModal;