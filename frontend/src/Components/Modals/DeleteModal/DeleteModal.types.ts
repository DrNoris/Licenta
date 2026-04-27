export interface DeleteModalProps {
    isOpen: boolean;
    spotId: string;
    onDelete: (spotId: string) => Promise<void>;
    onClose: () => void;
}