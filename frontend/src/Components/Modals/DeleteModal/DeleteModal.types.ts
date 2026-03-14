export interface DeleteModalProps {
    isOpen: boolean;
    spotId: string;
    onDelete: (id: string) => void;
    onClose: () => void;
}