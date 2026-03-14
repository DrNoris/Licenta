import type { ParkingSpot } from "../../../pages/ManageParkingSpots/ManageParkingSpots.types.ts";

export interface EditSpotModalProps {
    isOpen: boolean;
    spot: ParkingSpot;
    onClose: () => void;
    onEdit: (
        description: string,
        pricePerHour: number,
        pricePerDay: number,
        files: File[],
        publicIdsToDelete: string[]
    ) => Promise<void>;
}

export interface ExistingPhoto {
    publicId: string;
    signedUrl: string;
    markedForDeletion: boolean;
}

export interface EditSpotFormState {
    description: string;
    pricePerHour: string;
    pricePerDay: string;
    existingPhotos: ExistingPhoto[];
    newFiles: File[];
    photosLoading: boolean;
    error: string;
    loading: boolean;
}