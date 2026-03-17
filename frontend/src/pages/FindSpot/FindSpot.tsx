import {useEffect, useRef, useState} from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {Search, Calendar, Clock, SlidersHorizontal, X, ParkingSquare, ArrowLeft} from "lucide-react";
import type {ParkingSpot} from "../ManageParkingSpots/ManageParkingSpots.types.ts";
import type {TimeSlot} from "../../Components/Modals/RentModal/RentModal.types.ts";
import {searchParkingSpots} from "../../services/parkingSpotService.ts";
import {getAllTimeSlots, formatDate, formatHour} from "../../services/rentService.ts";
import "./FindSpot.styles.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import {type BoundingBox, EMPTY_FILTERS, type FindSpotFilters} from "./FindSpot.types.ts";
import SpotPopup from "../../Components/SpotPopup/SpotPopup.tsx";
import {Link} from "react-router-dom";
import {DEFAULT_MAP_SETTINGS} from "../../Components/LocationPicker/LocationPicker.types.ts";
import {getSlots} from "../../services/parkingSpotSlotService.ts";
import {createCheckoutSession} from "../../services/bookingService.ts";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow});

function FindSpot() {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markersLayerRef = useRef<L.LayerGroup | null>(null);
    const dateInputRef = useRef<HTMLInputElement>(null);

    const [spots, setSpots] = useState<ParkingSpot[]>([]);
    const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
    const [filters, setFilters] = useState<FindSpotFilters>(EMPTY_FILTERS);
    const [allTimeSlots, setAllTimeSlots] = useState<TimeSlot[]>([]);
    const [showSlotPanel, setShowSlotPanel] = useState(false);
    const [searching, setSearching] = useState(false);
    const [mapMoved, setMapMoved] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);

    // Keep filters in a ref so map event handlers always see latest value
    const filtersRef = useRef<FindSpotFilters>(EMPTY_FILTERS);
    filtersRef.current = filters;

    const today = formatDate(new Date());

    // Fetch available slots when a spot is selected
    useEffect(() => {
        if (!selectedSpot || !filters.date) {
            setAvailableSlots([]);
            return;
        }

        getSlots(selectedSpot.id, filters.date)
            .then((data) => {
                setAvailableSlots(data.availableSlots);
            })
            .catch(() => setAvailableSlots([]));
    }, [selectedSpot, filters.date]);
    // ── Init map ──────────────────────────────────────────────
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        const map = L.map(mapContainerRef.current, DEFAULT_MAP_SETTINGS);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        L.control.zoom({position: "bottomright"}).addTo(map);

        markersLayerRef.current = L.layerGroup().addTo(map);

        map.on("movestart", () => {
            // Only show search button if a date is already selected
            if (filtersRef.current.date) setMapMoved(true);
        });

        // Close popup and slot panel on map click
        map.on("click", () => {
            setSelectedSpot(null);
            setShowSlotPanel(false);
        });

        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    // ── Load all time slots for filter ────────────────────────
    useEffect(() => {
        getAllTimeSlots().then(setAllTimeSlots).catch(() => {
        });
    }, []);

    // ── Render markers ────────────────────────────────────────
    useEffect(() => {
        if (!markersLayerRef.current) return;
        markersLayerRef.current.clearLayers();

        spots.forEach((spot) => {
            const el = document.createElement("div");
            el.className = `find-spot__marker ${selectedSpot?.id === spot.id ? "find-spot__marker--active" : ""}`;

            const marker = L.marker([spot.latitude, spot.longitude], {
                icon: L.divIcon({
                    html: el,
                    className: "",
                    iconAnchor: [40, 16],
                }),
            });

            marker.on("click", (e) => {
                L.DomEvent.stopPropagation(e);
                setSelectedSpot(spot);
                setShowSlotPanel(false);
            });

            marker.addTo(markersLayerRef.current!);
        });
    }, [spots, selectedSpot]);

    // ── Search ────────────────────────────────────────────────
    const triggerSearch = async (map?: L.Map) => {
        const m = map ?? mapRef.current;
        if (!m || !filtersRef.current.date) return;

        const bounds = m.getBounds();
        const boundingBox: BoundingBox = {
            swLat: bounds.getSouthWest().lat,
            swLng: bounds.getSouthWest().lng,
            neLat: bounds.getNorthEast().lat,
            neLng: bounds.getNorthEast().lng,
        };

        setSearching(true);
        setMapMoved(false);
        setSelectedSpot(null);

        try {
            const results = await searchParkingSpots({boundingBox, filters: filtersRef.current});
            setSpots(results);
            setHasSearched(true);
        } catch {
            // silently fail
        } finally {
            setSearching(false);
        }
    };

    // ── Toggle time slot filter ───────────────────────────────
    const toggleSlot = (id: string) => {
        setFilters((prev) => ({
            ...prev,
            timeSlotIds: prev.timeSlotIds.includes(id)
                ? prev.timeSlotIds.filter((s) => s !== id)
                : [...prev.timeSlotIds, id],
        }));
    };

    const clearFilters = () => {
        setFilters(EMPTY_FILTERS);
        setShowSlotPanel(false);
        setSpots([]);
        setHasSearched(false);
        setMapMoved(false);
    };

    const hasActiveFilters =
        !!filters.date || filters.timeSlotIds.length > 0 ||
        !!filters.minPricePerHour || !!filters.maxPricePerHour;

    const handleBook = async (spot: ParkingSpot, selectedSlots: TimeSlot[]) => {
        try {
            const url = await createCheckoutSession(
                spot.id,
                filters.date,
                selectedSlots.map((s) => s.id)
            );
            window.location.href = url;
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="find-spot">
            {/* ── Filter bar ─────────────────────────────────────── */}
            <div className="find-spot__filters">
                {/*Back*/}
                <Link to="/">
                    <button
                        className={`find-spot__filter-btn ${filters.date ? "find-spot__filter-btn--active" : "find-spot__filter-btn--highlighted"}`}
                        onClick={() => dateInputRef.current?.showPicker()}
                    >
                        <ArrowLeft size={14}/>
                    </button>
                </Link>

                {/* Date — gate filter */}
                <button
                    className={`find-spot__filter-btn ${filters.date ? "find-spot__filter-btn--active" : "find-spot__filter-btn--highlighted"}`}
                    onClick={() => dateInputRef.current?.showPicker()}
                >
                    <Calendar size={14}/>
                    <span>{filters.date || "Selectează data"}</span>
                    <input
                        ref={dateInputRef}
                        type="date"
                        className="find-spot__filter-input--hidden"
                        value={filters.date}
                        min={today}
                        onChange={(e) => setFilters((prev) => ({...prev, date: e.target.value}))}
                    />
                </button>

                {/* Only show remaining filters if date is selected */}
                {filters.date && (
                    <>
                        <div className="find-spot__filter-divider"/>

                        {/* Time slots */}
                        <button
                            className={`find-spot__filter-btn ${filters.timeSlotIds.length > 0 ? "find-spot__filter-btn--active" : ""}`}
                            onClick={() => setShowSlotPanel((p) => !p)}
                        >
                            <Clock size={14}/>
                            {filters.timeSlotIds.length > 0
                                ? `${filters.timeSlotIds.length} interval${filters.timeSlotIds.length > 1 ? "e" : ""}`
                                : "Intervale"}
                        </button>

                        <div className="find-spot__filter-divider"/>

                        {/* Price */}
                        <button
                            className={`find-spot__filter-btn ${filters.minPricePerHour || filters.maxPricePerHour ? "find-spot__filter-btn--active" : ""}`}>
                            <SlidersHorizontal size={14}/>
                            <div className="find-spot__filter-price-wrap">
                                <input
                                    type="number"
                                    className="find-spot__filter-price-input"
                                    placeholder="Min"
                                    value={filters.minPricePerHour}
                                    onChange={(e) => setFilters((prev) => ({...prev, minPricePerHour: e.target.value}))}
                                    min={0}
                                />
                                <span style={{color: "#9ca3af"}}>—</span>
                                <input
                                    type="number"
                                    className="find-spot__filter-price-input"
                                    placeholder="Max"
                                    value={filters.maxPricePerHour}
                                    onChange={(e) => setFilters((prev) => ({...prev, maxPricePerHour: e.target.value}))}
                                    min={0}
                                />
                                <span style={{fontSize: "0.8rem", color: "#6b7280"}}>lei/h</span>
                            </div>
                        </button>
                    </>
                )}

                {/* Clear */}
                {hasActiveFilters && (
                    <>
                        <div className="find-spot__filter-divider"/>
                        <button className="find-spot__filter-btn" onClick={clearFilters} title="Șterge filtrele">
                            <X size={14}/>
                        </button>
                    </>
                )}
            </div>

            {/* ── Time slot panel ─────────────────────────────────── */}
            {showSlotPanel && (
                <div className="find-spot__slot-panel">
                    <p className="find-spot__slot-panel-title">Selectează intervalele</p>
                    {allTimeSlots.map((slot) => (
                        <div
                            key={slot.id}
                            className={`find-spot__slot-chip ${filters.timeSlotIds.includes(slot.id) ? "find-spot__slot-chip--selected" : ""}`}
                            onClick={() => toggleSlot(slot.id)}
                        >
                            <span>{formatHour(slot.startHour)} → {formatHour(slot.endHour)}</span>
                            {filters.timeSlotIds.includes(slot.id) && <X size={12}/>}
                        </div>
                    ))}
                </div>
            )}

            {/* ── Map ─────────────────────────────────────────────── */}
            <div ref={mapContainerRef} className="find-spot__map"/>

            {/* ── Empty hint — shown before date is selected ───────── */}
            {!filters.date && (
                <div className="find-spot__hint">
                    <ParkingSquare size={32} strokeWidth={1.5}/>
                    <p>Selectează o dată pentru a vedea locurile disponibile</p>
                </div>
            )}

            {/* ── No results after search ───────────────────────────── */}
            {hasSearched && spots.length === 0 && !searching && (
                <div className="find-spot__hint find-spot__hint--no-results">
                    <ParkingSquare size={32} strokeWidth={1.5}/>
                    <p>Niciun loc disponibil în această zonă pentru filtrele selectate</p>
                </div>
            )}

            {/* ── Search in area button ────────────────────────────── */}
            {mapMoved && filters.date && (
                <button
                    className="find-spot__search-btn"
                    onClick={() => triggerSearch()}
                    disabled={searching}
                >
                    <Search size={16}/>
                    {searching ? "Se caută..." : "Caută în această zonă"}
                </button>
            )}

            {/* ── Spot popup ───────────────────────────────────────── */}
            {selectedSpot && (
                <SpotPopup
                    spot={selectedSpot}
                    date={filters.date}
                    availableSlots={availableSlots}
                    onBook={handleBook}
                />
            )}
        </div>
    );
}

export default FindSpot;