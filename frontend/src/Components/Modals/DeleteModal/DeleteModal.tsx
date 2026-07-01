import { useState } from "react";
import { createPortal } from "react-dom";
import { Trash2, X } from "lucide-react";
import type { DeleteModalProps } from "./DeleteModal.types.ts";
import { useBodyScrollLock } from "../../../hooks/useBodyScrollLock.ts";
import "./DeleteModal.styles.css";
import toast from "react-hot-toast";

function DeleteModal({ isOpen, spotId, onDelete, onClose }: DeleteModalProps) {
    const [loading, setLoading] = useState(false);

    useBodyScrollLock(isOpen);

    if (!isOpen) return null;

    const handleDelete = async (): Promise<void> => {
        setLoading(true);

        const deletePromise = onDelete(spotId);

        toast.promise(deletePromise, {
            loading: "Se șterge locul de parcare...",
            success: "Locul de parcare a fost șters!",
            error: "Ștergerea a eșuat. Încearcă din nou.",
        });

        try {
            onClose();
            await deletePromise;
        } catch {
        } finally {
            setLoading(false);
        }
    };

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>): void => {
        if (e.target === e.currentTarget) onClose();
    };

    return createPortal(
        <div className="delete-overlay" onClick={handleOverlayClick}>
            <div className="delete-modal">

                <div className="delete-modal__header">
                    <h3 className="delete-modal__title">Șterge loc de parcare</h3>
                    <button className="delete-modal__close" onClick={onClose} aria-label="Închide">
                        <X size={20} />
                    </button>
                </div>

                <div className="delete-modal__body">
                    <div className="delete-modal__icon-wrap">
                        <Trash2 size={24} />
                    </div>
                    <p className="delete-modal__message">
                        Ești sigur că vrei să ștergi acest loc de parcare?
                    </p>
                    <p className="delete-modal__warning">
                        Această acțiune este ireversibilă.
                    </p>
                </div>

                <div className="delete-modal__footer">
                    <button
                        className="delete-modal__btn-cancel"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Anulează
                    </button>
                    <button
                        className="delete-modal__btn-delete"
                        onClick={handleDelete}
                        disabled={loading}
                    >
                        {loading ? "Se șterge..." : "Șterge"}
                    </button>
                </div>

            </div>
        </div>,
        document.body
    );
}

export default DeleteModal;