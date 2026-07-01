export interface PhotoUploaderProps {
    files: File[];
    onChange: (files: File[]) => void;
    disabled?: boolean;
    maxFiles?: number;
}