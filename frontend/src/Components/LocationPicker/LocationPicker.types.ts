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