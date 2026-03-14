import React, { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./LocationPicker.styles.css";

// Fix Leaflet's default marker icon paths broken by bundlers
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import type {LatLng} from "../AddSpotModal/AddSpotModal.types.ts";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

interface LocationPickerProps {
    value: LatLng | null;
    onChange: (latlng: LatLng, address: string) => void;
    disabled?: boolean;
}

interface NominatimResult {
    lat: string;
    lon: string;
    display_name: string;
}

const DEFAULT_CENTER: LatLng = { lat: 46.7712, lng: 23.6236 }; // Cluj-Napoca

function LocationPicker({ value, onChange, disabled = false }: LocationPickerProps) {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const markerRef = useRef<L.Marker | null>(null);

    const [query, setQuery] = useState("");
    const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
    const [searching, setSearching] = useState(false);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── Init map ────────────────────────────────────────────────
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;

        const map = L.map(mapContainerRef.current).setView(
            value ? [value.lat, value.lng] : [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng],
            14
        );

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        // Place initial marker
        if (value) {
            markerRef.current = L.marker([value.lat, value.lng], { draggable: true }).addTo(map);
            markerRef.current.on("dragend", handleMarkerDrag);
        }

        // Click to place/move marker
        map.on("click", (e: L.LeafletMouseEvent) => {
            placeMarker({ lat: e.latlng.lat, lng: e.latlng.lng });
            reverseGeocode({ lat: e.latlng.lat, lng: e.latlng.lng });
        });

        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, []);

    function handleMarkerDrag(this: L.Marker) {
        const pos = this.getLatLng();
        reverseGeocode({ lat: pos.lat, lng: pos.lng });
    }

    function placeMarker(latlng: LatLng) {
        if (!mapRef.current) return;
        if (markerRef.current) {
            markerRef.current.setLatLng([latlng.lat, latlng.lng]);
        } else {
            markerRef.current = L.marker([latlng.lat, latlng.lng], { draggable: true }).addTo(mapRef.current);
            markerRef.current.on("dragend", function (this: L.Marker) {
                const pos = this.getLatLng();
                reverseGeocode({ lat: pos.lat, lng: pos.lng });
            });
        }
        onChange(latlng, "");
    }

    async function reverseGeocode(latlng: LatLng) {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latlng.lat}&lon=${latlng.lng}&format=json`
            );
            const data = await res.json();
            onChange(latlng, data.display_name ?? "");
        } catch {
            onChange(latlng, "");
        }
    }

    // ── Address search with debounce ────────────────────────────
    const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        setSuggestions([]);

        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!val.trim()) return;

        debounceRef.current = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&limit=5`
                );
                const data: NominatimResult[] = await res.json();
                setSuggestions(data);
            } catch {
                setSuggestions([]);
            } finally {
                setSearching(false);
            }
        }, 400);
    };

    const handleSuggestionClick = (result: NominatimResult) => {
        const latlng: LatLng = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
        mapRef.current?.setView([latlng.lat, latlng.lng], 16);
        placeMarker(latlng);
        onChange(latlng, result.display_name);
        setQuery(result.display_name);
        setSuggestions([]);
    };

    return (
        <div className="location-picker">
            {/* Search */}
            <div className="location-picker__search-wrap">
                <Search size={15} className="location-picker__search-icon" />
                <input
                    type="text"
                    className="location-picker__search"
                    placeholder="Caută adresa..."
                    value={query}
                    onChange={handleSearchInput}
                    disabled={disabled}
                    autoComplete="off"
                />
                {searching && <span className="location-picker__searching">Se caută...</span>}
                {suggestions.length > 0 && (
                    <ul className="location-picker__suggestions">
                        {suggestions.map((s, i) => (
                            <li
                                key={i}
                                className="location-picker__suggestion"
                                onClick={() => handleSuggestionClick(s)}
                            >
                                {s.display_name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Map */}
            <div ref={mapContainerRef} className="location-picker__map" />

            {/* Coordinates */}
            {value && (
                <div className="location-picker__coords">
                    <div className="location-picker__coord">
                        Lat: <span>{value.lat.toFixed(6)}</span>
                    </div>
                    <div className="location-picker__coord">
                        Lng: <span>{value.lng.toFixed(6)}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LocationPicker;