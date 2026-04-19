export interface BoundingBox {
    swLat: number;
    swLng: number;
    neLat: number;
    neLng: number;
}

export interface FindSpotFilters {
    date: string;
    timeSlotIds: string[];
    minPricePerHour: string;
    maxPricePerHour: string;
}

export interface FindSpotSearchParams {
    boundingBox: BoundingBox;
    filters: FindSpotFilters;
}

export const EMPTY_FILTERS: FindSpotFilters = {
    date: "",
    timeSlotIds: [],
    minPricePerHour: "",
    maxPricePerHour: "",
};