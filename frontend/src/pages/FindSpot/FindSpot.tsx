import {useEffect, useRef, useState} from "react";
import { useSearchParams } from "react-router-dom";
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
import AuthGuard from "../../Components/AuthGuard/AuthGuard.tsx";
import toast from "react-hot-toast";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow});

const CLUJ_CENTER: [number, number] = [46.7712, 23.6236];
const DEFAULT_ZOOM = 17;

function FindSpot() {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markersLayerRef = useRef<L.LayerGroup | null>(null);
    const dateInputRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const [spots, setSpots] = useState<ParkingSpot[]>([]);
    const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
    const [searchParams, setSearchParams] = useSearchParams();

    const [filters, setFilters] = useState<FindSpotFilters>(() => ({
        date: searchParams.get("date") ?? "",
        timeSlotIds: searchParams.getAll("timeSlotIds"),
        minPricePerHour: searchParams.get("minPricePerHour") ?? "",
        maxPricePerHour: searchParams.get("maxPricePerHour") ?? "",
    }));

    const [allTimeSlots, setAllTimeSlots] = useState<TimeSlot[]>([]);
    const [showSlotPanel, setShowSlotPanel] = useState(false);
    const [searching, setSearching] = useState(false);
    const [mapMoved, setMapMoved] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [mapReady, setMapReady] = useState(false);
    const [filtersChanged, setFiltersChanged] = useState(false);

    // ── Initial bounds from URL — read once ──────────────────
    const initialBoundsRef = useRef({
        swLat: searchParams.get("swLat"),
        swLng: searchParams.get("swLng"),
        neLat: searchParams.get("neLat"),
        neLng: searchParams.get("neLng"),
        zoom:  searchParams.get("zoom"),
    });
    const hasBoundsInUrl = Object.values(initialBoundsRef.current)
        .filter((_, i) => i < 4) // doar swLat, swLng, neLat, neLng
        .every(Boolean);

    const filtersRef = useRef<FindSpotFilters>(EMPTY_FILTERS);
    filtersRef.current = filters;

    const today = formatDate(new Date());

    // ── Fetch available slots for selected spot ───────────────
    useEffect(() => {
        if (!selectedSpot || !filters.date) {
            setAvailableSlots([]);
            return;
        }
        getSlots(selectedSpot.id, filters.date)
            .then((data) => setAvailableSlots(data.availableSlots))
            .catch(() => setAvailableSlots([]));
    }, [selectedSpot, filters.date]);

    // ── Init map ──────────────────────────────────────────────
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        let initialCenter: [number, number] = CLUJ_CENTER;
        let initialZoom = DEFAULT_ZOOM;

        if (hasBoundsInUrl) {
            const swLat = Number(initialBoundsRef.current.swLat);
            const swLng = Number(initialBoundsRef.current.swLng);
            const neLat = Number(initialBoundsRef.current.neLat);
            const neLng = Number(initialBoundsRef.current.neLng);
            initialCenter = [(swLat + neLat) / 2, (swLng + neLng) / 2];
            initialZoom = initialBoundsRef.current.zoom
                ? Number(initialBoundsRef.current.zoom)
                : DEFAULT_ZOOM;
        }

        const map = L.map(mapContainerRef.current, {
            zoomControl: false,
            maxBounds: DEFAULT_MAP_SETTINGS.maxBounds,
            maxBoundsViscosity: DEFAULT_MAP_SETTINGS.maxBoundsViscosity,
            minZoom: DEFAULT_MAP_SETTINGS.minZoom,
            center: initialCenter,
            zoom: initialZoom,
        });
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        L.control.zoom({ position: "bottomright" }).addTo(map);

        markersLayerRef.current = L.layerGroup().addTo(map);

        map.on("movestart", () => {
            if (filtersRef.current.date) setMapMoved(true);
        });

        map.on("click", () => {
            setSelectedSpot(null);
            setShowSlotPanel(false);
        });

        mapRef.current = map;
        setMapReady(true);

        if (!hasBoundsInUrl && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    mapRef.current?.setView(
                        [pos.coords.latitude, pos.coords.longitude],
                        15,
                        { animate: true }
                    );
                },
                () => {
                },
                { timeout: 10000 }
            );
        }

        return () => {
            mapRef.current?.remove();
            mapRef.current = null;
        };
    }, []);

    // ── Load all time slots ───────────────────────────────────
    useEffect(() => {
        getAllTimeSlots().then(setAllTimeSlots).catch(() => {});
    }, []);

    // ── Render markers ────────────────────────────────────────
    useEffect(() => {
        if (!markersLayerRef.current) return;
        markersLayerRef.current.clearLayers();

        spots.forEach((spot) => {
            const el = document.createElement("div");
            const isActive = selectedSpot?.id === spot.id;
            const isMine = spot.imagePublicIds?.length > 0;

            if (isMine) {
                el.textContent = "🏠";
                el.className = "find-spot__marker-home";
            }
            else
                el.className = [
                    "find-spot__marker",
                    isActive ? "find-spot__marker--active" : "",
                    spot.availableNow ? "find-spot__marker--available-now" : "",
                ].filter(Boolean).join(" ");

            const marker = L.marker([spot.latitude, spot.longitude], {
                icon: L.divIcon({
                    html: el,
                    className: "",
                    iconSize: isMine ? [10, 10] : [32, 32],
                    iconAnchor: isMine ? [10, 10] : [16, 16],
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

    // ── Auto-search from URL params on mount ─────────────────
    useEffect(() => {
        if (!mapReady || !hasBoundsInUrl || !filters.date) return;

        const boundingBox: BoundingBox = {
            swLat: Number(initialBoundsRef.current.swLat),
            swLng: Number(initialBoundsRef.current.swLng),
            neLat: Number(initialBoundsRef.current.neLat),
            neLng: Number(initialBoundsRef.current.neLng),
        };

        setSearching(true);
        searchParkingSpots({ boundingBox, filters: filtersRef.current })
            .then((results) => { setSpots(results); setHasSearched(true); })
            .catch(() => {})
            .finally(() => setSearching(false));

    }, [mapReady, filters.date]);

    // ── Trigger search ────────────────────────────────────────
    const triggerSearch = async (map?: L.Map) => {
        setFiltersChanged(false);
        const m = map ?? mapRef.current;
        if (!m || !filtersRef.current.date) return;

        const bounds = m.getBounds();
        const boundingBox: BoundingBox = {
            swLat: bounds.getSouthWest().lat,
            swLng: bounds.getSouthWest().lng,
            neLat: bounds.getNorthEast().lat,
            neLng: bounds.getNorthEast().lng,
        };

        const params: Record<string, string | string[]> = {
            swLat: String(boundingBox.swLat),
            swLng: String(boundingBox.swLng),
            neLat: String(boundingBox.neLat),
            neLng: String(boundingBox.neLng),
            zoom:  String(m.getZoom()),
            date:  filtersRef.current.date,
        };
        if (filtersRef.current.timeSlotIds.length > 0)
            params.timeSlotIds = filtersRef.current.timeSlotIds;
        if (filtersRef.current.minPricePerHour)
            params.minPricePerHour = filtersRef.current.minPricePerHour;
        if (filtersRef.current.maxPricePerHour)
            params.maxPricePerHour = filtersRef.current.maxPricePerHour;

        setSearchParams(params as any, { replace: true });
        setSearching(true);
        setMapMoved(false);
        setSelectedSpot(null);

        const searchParlingSpotPromise = searchParkingSpots({ boundingBox, filters: filtersRef.current });

        toast.promise(searchParlingSpotPromise, {
            loading: "Se caută locuri de parcare..."
        });

        try {
            const results = await searchParlingSpotPromise;
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
        setFiltersChanged(false);
        setSearchParams({}, { replace: true });
        setShowSlotPanel(false);
        setSpots([]);
        setHasSearched(false);
        setMapMoved(false);
    };

    const hasActiveFilters =
        !!filters.date || filters.timeSlotIds.length > 0 ||
        !!filters.minPricePerHour || !!filters.maxPricePerHour;

    const handleBook = async (spot: ParkingSpot, selectedSlots: TimeSlot[]) => {
        const totalAmount = selectedSlots.length * spot.pricePerHour;

        if (totalAmount < 2) {
            toast.error("Suma minimă pentru o rezervare este de 2 lei.");
            return;
        }

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
            {/* ── Filter bar ── */}
            <div className="find-spot__filters">
                <Link to="/">
                    <button
                        className={`find-spot__filter-btn ${filters.date ? "find-spot__filter-btn--active" : "find-spot__filter-btn--highlighted"}`}
                        onClick={() => dateInputRef.current?.showPicker()}
                    >
                        <ArrowLeft size={14}/>
                    </button>
                </Link>

                <div className="find-spot__date-wrap" onClick={() => inputRef.current?.showPicker()}>
                    <Calendar size={14}/>
                    <input
                        ref = {inputRef}
                        type="date"
                        className="find-spot__date-input"
                        value={filters.date}
                        onKeyDown={(e) => e.preventDefault()}
                        min={today}
                        onChange={(e) => {
                            if (e.target.value < today) {
                                toast.error("Nu poți selecta o dată din trecut.");
                                return;
                            }
                            setFilters((prev) => ({...prev, date: e.target.value}));
                            setFiltersChanged(true);
                        }}
                    />
                </div>

                {filters.date && (
                    <>
                        <div className="find-spot__filter-divider"/>
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
                        <button className={`find-spot__filter-btn ${filters.minPricePerHour || filters.maxPricePerHour ? "find-spot__filter-btn--active" : ""}`}>
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

                {hasActiveFilters && (
                    <>
                        <div className="find-spot__filter-divider"/>
                        <button className="find-spot__filter-btn" onClick={clearFilters} title="Șterge filtrele">
                            <X size={14}/>
                        </button>
                    </>
                )}
            </div>

            {/* ── Time slot panel ── */}
            {showSlotPanel && (
                <div className="find-spot__slot-panel">
                    <p className="find-spot__slot-panel-title">Selectează intervalele</p>
                    {allTimeSlots.map((slot) => {
                        const now = new Date().getHours();
                        const nowDate = formatDate(new Date()) ;
                        if (slot.startHour < now && nowDate == filters.date) return null;
                        return (
                            <div
                                key={slot.id}
                                className={`find-spot__slot-chip ${filters.timeSlotIds.includes(slot.id) ? "find-spot__slot-chip--selected" : ""}`}
                                onClick={() => toggleSlot(slot.id)}
                            >
                                <span>{formatHour(slot.startHour)} → {formatHour(slot.endHour)}</span>
                                {filters.timeSlotIds.includes(slot.id) && <X size={12}/>}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Map ── */}
            <div ref={mapContainerRef} className="find-spot__map"/>

            {/* ── Empty hint ── */}
            {!filters.date && (
                <div className="find-spot__hint">
                    <ParkingSquare size={32} strokeWidth={1.5}/>
                    <p>Selectează o dată pentru a vedea locurile disponibile</p>
                </div>
            )}

            {/* ── No results ── */}
            {hasSearched && spots.length === 0 && !searching && !mapMoved && !filtersChanged && (
                <div className="find-spot__hint find-spot__hint--no-results">
                    <ParkingSquare size={32} strokeWidth={1.5}/>
                    <p>Niciun loc disponibil în această zonă pentru filtrele selectate</p>
                </div>
            )}

            {/* ── Search button ── */}
            {(mapMoved || filtersChanged) && filters.date && (
                <button
                    className="find-spot__search-btn"
                    onClick={() => triggerSearch()}
                    disabled={searching}
                >
                    <Search size={16}/>
                    {searching ? "Se caută..." : "Caută în această zonă"}
                </button>
            )}

            {/* ── Spot popup ── */}
            {selectedSpot && (
                <AuthGuard children={
                    <SpotPopup
                        spot={selectedSpot}
                        date={filters.date}
                        availableSlots={availableSlots}
                        onBook={handleBook}
                    />
                }/>
            )}
        </div>
    );
}

export default FindSpot;