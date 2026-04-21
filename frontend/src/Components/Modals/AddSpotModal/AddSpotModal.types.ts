import type {ParkingSpot} from "../../../pages/ManageParkingSpots/ManageParkingSpots.types.ts";

export interface AddSpotFormState {
    description: string;
    pricePerHour: string;
    latitude: number | null;
    longitude: number | null;
    address: string;
    files: File[];
    error: string;
    loading: boolean;
}

export interface AddSpotModalProps {
    open: boolean;
    onClose: () => void;
    onAdd: (spot: ParkingSpot) => void;
}

export const EMPTY_FORM: AddSpotFormState = {
    description: "",
    pricePerHour: "",
    latitude: 0,
    longitude: 0,
    address: "",
    files: [],
    error: "",
    loading: false
};