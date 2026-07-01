import React, {useEffect, useState} from "react";
import { createPortal } from "react-dom";
import { X, DollarSign, MapPin, Camera } from "lucide-react";
import { type AddSpotFormState, type AddSpotModalProps, EMPTY_FORM } from "./AddSpotModal.types.ts";
import { addParkingSpot } from "../../../services/parkingSpotService.ts";
import LocationPicker from "../../LocationPicker/LocationPicker.tsx";
import PhotoUploader from "../../PhotoUploader/PhotoUploader.tsx";
import { useBodyScrollLock } from "../../../hooks/useBodyScrollLock.ts";
import "./AddSpotModal.styles.css";
import type {LatLng} from "../../LocationPicker/LocationPicker.types.ts";
import toast from "react-hot-toast";

function AddSpotModal({ open, onClose, onAdd }: AddSpotModalProps) {
    const [form, setForm] = useState<AddSpotFormState>(EMPTY_FORM);
    const [userLocation, setUserLocation] = useState<LatLng | null>(null);

    useEffect(() => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            (pos) => setUserLocation({
                lat: pos.coords.latitude,
                lng: pos.coords.longitude,
            }),
            () => {},
            { timeout: 10000 }
        );
    }, []);

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

        if (form.description.length < 5) {
            toast.error("Descrierea este prea scurta, minim 10 caractere.");
            return;
        }

        if (parseFloat(form.pricePerHour) < 0.2) {
            toast.error("Prețul minim per oră este 0.2 lei.");
            return;
        }

        if (form.files.length == 0) {
            toast.error("Este necesară minim o poză.");
            return;
        }

        if (
            form.latitude == null ||
            form.longitude == null ||
            form.latitude > 46.82445078216992 ||
            form.latitude < 46.728161 ||
            form.longitude < 23.454361 ||
            form.longitude > 23.715712
        ) {
            toast.error("Selectează o locație validă în Cluj-Napoca.");
            return;
        }

        setForm((prev) => ({ ...prev, loading: true, error: "" }));

        const addPromise = addParkingSpot(
            {
                description: form.description,
                address: form.address,
                pricePerHour: parseFloat(form.pricePerHour),
                latitude: form.latitude,
                longitude: form.longitude,
            },
            form.files
        );

        toast.promise(addPromise, {
            loading: "Se adaugă locul de parcare...",
            success: "Locul de parcare a fost adăugat!",
            error: "Adăugarea a eșuat. Încearcă din nou.",
        });

        try {
            const newSpot = await addPromise;
            onAdd(newSpot);
            setForm(EMPTY_FORM);
            onClose();
        } catch {
            setForm((prev) => ({ ...prev, loading: false }));
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

                <div className="add-spot-modal__header">
                    <h3 className="add-spot-modal__title">Adaugă loc de parcare</h3>
                    <button className="add-spot-modal__close" onClick={onClose} aria-label="Închide">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} noValidate style={{ display: "contents" }}>
                    <div className="add-spot-modal__body">

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
                                    min="0.2"
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

                        <div>
                            <p className="add-spot-modal__section-label">
                                <Camera size={13} style={{display: "inline", marginRight: "0.3rem"}}/>
                                Fotografii *
                            </p>
                            <PhotoUploader
                                files={form.files}
                                onChange={handleFilesChange}
                                disabled={form.loading}
                            />
                        </div>

                        <hr className="add-spot-modal__divider"/>

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
                                    ? { lat: form.latitude, lng: form.longitude }
                                    : null
                                }
                                onChange={handleLocationChange}
                                disabled={form.loading}
                                initialCenter={userLocation ?? undefined}
                            />
                        </div>

                        {form.error && (
                            <p className="add-spot-modal__error">{form.error}</p>
                        )}
                    </div>

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