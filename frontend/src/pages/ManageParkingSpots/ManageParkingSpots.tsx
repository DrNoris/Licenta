import { useEffect, useState } from "react";
import { Plus, ParkingSquare } from "lucide-react";
import type {ManagePageState, ParkingSpot} from "./ManageParkingSpots.types.ts";
import {deleteParkingSpot, getMyParkingSpots} from "../../services/parkingSpotService.ts";
import ParkingSpotCard from "../../Components/ParkingSpotsCard/ParkingSpotCard.tsx";
import AddSpotModal from "../../Components/AddSpotModal/AddSpotModal.tsx";
import "./ManageParkingSpots.styles.css"
import Header from "../../Components/Header/Header.tsx";

function ManageParkingSpots() {
    const [state, setState] = useState<ManagePageState>({
        spots: [],
        status: "loading",
        error: "",
    });

    const [addSpotModalOpen, setAddSpotModalOpen] = useState(false);

    // ── Fetch on mount ──────────────────────────────────────────
    useEffect(() => {
        getMyParkingSpots()
            .then((spots) => setState({ spots, status: "idle", error: "" }))
            .catch((err: unknown) => {
                const message = err instanceof Error ? err.message : "Eroare necunoscută.";
                setState({ spots: [], status: "error", error: message });
            });
    }, []);

    // ── Delete ──────────────────────────────────────────────────
    const handleDelete = async (id: string): Promise<void> => {
        try {
            await deleteParkingSpot(id);
            setState((prev) => ({
                ...prev,
                spots: prev.spots.filter((s) => s.id !== id),
            }));
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Ștergerea a eșuat.";
            setState((prev) => ({ ...prev, error: message }));
        }
    };

    const handleAddTimeSlot = async (id: string, timeSlotsIds: string[]): Promise<void> => {
        console.log(id, timeSlotsIds);
    };

    // ── Add ─────────────────────────────────────────────────────
    const handleAdd = (spot: ParkingSpot): void => {
        setState((prev) => ({ ...prev, spots: [spot, ...prev.spots] }));
    };

    return (<>
        <Header/>
        <div className="manage-page">
            <div className="manage-page__container">

                {/* Page header */}
                <div className="manage-page__header">
                    <div>
                        <h1 className="manage-page__title">Locurile mele de parcare</h1>
                        <p className="manage-page__subtitle">
                            {state.spots.length > 0
                                ? `${state.spots.length} loc${state.spots.length > 1 ? "uri" : ""} înregistrat${state.spots.length > 1 ? "e" : ""}`
                                : "Niciun loc înregistrat încă"}
                        </p>
                    </div>
                    <button className="manage-page__add-btn" onClick={() => setAddSpotModalOpen(true)}>
                        <Plus size={18} />
                        Adaugă loc
                    </button>
                </div>

                {/* Loading */}
                {state.status === "loading" && (
                    <div className="manage-page__loading">
                        <div className="manage-page__spinner" />
                        <p>Se încarcă locurile de parcare...</p>
                    </div>
                )}

                {/* Error */}
                {state.status === "error" && (
                    <div className="manage-page__error">
                        <p>{state.error}</p>
                    </div>
                )}

                {/* Empty */}
                {state.status === "idle" && state.spots.length === 0 && (
                    <div className="manage-page__empty">
                        <ParkingSquare size={48} strokeWidth={1.5} />
                        <p>Nu ai niciun loc de parcare adăugat.</p>
                        <button className="manage-page__add-btn" onClick={() => setAddSpotModalOpen(true)}>
                            <Plus size={18} />
                            Adaugă primul loc
                        </button>
                    </div>
                )}

                {/* Grid */}
                {state.status === "idle" && state.spots.length > 0 && (
                    <div className="manage-page__grid">
                        {state.spots.map((spot) => (
                            <ParkingSpotCard key={spot.id} spot={spot} onDelete={handleDelete} onAddTimeSlot={handleAddTimeSlot} isOwner={true} />
                        ))}
                    </div>
                )}

            </div>

            {/* Add modal */}
            <AddSpotModal
                open={addSpotModalOpen}
                onClose={() => setAddSpotModalOpen(false)}
                onAdd={handleAdd}
            />
        </div>
        </>
    );
}

export default ManageParkingSpots;