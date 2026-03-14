export interface PhotoUploaderProps {
    files: File[];
    onChange: (files: File[]) => void;
    disabled?: boolean;
    maxFiles?: number; // defaults to 5
}