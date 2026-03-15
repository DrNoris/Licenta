import L from "leaflet";

export interface LocationPickerProps {
    value: LatLng | null;
    onChange: (latlng: LatLng, address: string) => void;
    disabled?: boolean;
}

export interface NominatimResult {
    lat: string;
    lon: string;
    display_name: string;
}

export interface LatLng {
    lat: number;
    lng: number;
}

export const DEFAULT_CENTER: LatLng = { lat: 46.769379, lng: 23.589954 };

export const DEFAULT_MAP_SETTINGS = {
    center: DEFAULT_CENTER,
    zoom: 14,
    zoomControl: false,
    maxBounds: L.latLngBounds(
        L.latLng(46.728161, 23.454361),
        L.latLng(46.82445078216992, 23.715712)
    ),
    maxBoundsViscosity: 1.0,
    minZoom: 13
};