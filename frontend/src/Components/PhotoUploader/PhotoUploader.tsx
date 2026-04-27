import { useRef, useState, useCallback } from "react";
import { UploadCloud, X } from "lucide-react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import type { PhotoUploaderProps } from "./PhotoUploader.types.ts";
import "./PhotoUploader.styles.css";

const ACCEPTED = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic", "image/heif"];

async function getCroppedFile(
    imageSrc: string,
    crop: Area,
    fileName: string
): Promise<File> {
    const image = new Image();
    image.src = imageSrc;
    await new Promise((res) => (image.onload = res));

    const canvas = document.createElement("canvas");
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d")!;

    ctx.drawImage(
        image,
        crop.x, crop.y, crop.width, crop.height,
        0, 0, crop.width, crop.height
    );

    const blob = await new Promise<Blob>((res) =>
        canvas.toBlob((b) => res(b!), "image/jpeg", 0.92)
    );
    return new File([blob], fileName, { type: "image/jpeg" });
}

function PhotoUploader({ files, onChange, disabled = false, maxFiles = 5 }: PhotoUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);

    const [cropSrc, setCropSrc] = useState<string | null>(null);
    const [cropFileName, setCropFileName] = useState("");
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedArea, setCroppedArea] = useState<Area | null>(null);
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);

    const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
        setCroppedArea(areaPixels);
    }, []);

    const openCropper = (file: File, remaining: File[]): void => {
        setCropSrc(URL.createObjectURL(file));
        setCropFileName(file.name);
        setPendingFiles(remaining);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setCroppedArea(null);
    };

    const handleConfirmCrop = async (): Promise<void> => {
        if (!cropSrc || !croppedArea) return;

        const croppedFile = await getCroppedFile(cropSrc, croppedArea, cropFileName);
        const updated = [...files, croppedFile];
        onChange(updated);

        URL.revokeObjectURL(cropSrc);
        setCropSrc(null);

        if (pendingFiles.length > 0 && updated.length < maxFiles) {
            const [next, ...rest] = pendingFiles;
            openCropper(next, rest);
        } else {
            setPendingFiles([]);
        }
    };

    const handleSkipCrop = (): void => {
        if (!cropSrc) return;
        URL.revokeObjectURL(cropSrc);
        setCropSrc(null);

        if (pendingFiles.length > 0 && files.length < maxFiles) {
            const [next, ...rest] = pendingFiles;
            openCropper(next, rest);
        } else {
            setPendingFiles([]);
        }
    };

    const addFiles = (incoming: FileList | null): void => {
        if (!incoming) return;
        const valid = Array.from(incoming)
            .filter((f) => ACCEPTED.includes(f.type))
            .slice(0, maxFiles - files.length);
        if (valid.length === 0) return;

        const [first, ...rest] = valid;
        openCropper(first, rest);
    };

    const removeFile = (index: number): void => {
        onChange(files.filter((_, i) => i !== index));
    };

    return (
        <div className="photo-uploader">
            {files.length < maxFiles && (
                <div
                    className={[
                        "photo-uploader__dropzone",
                        dragging ? "photo-uploader__dropzone--active" : "",
                        disabled ? "photo-uploader__dropzone--disabled" : "",
                    ].join(" ")}
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }}
                >
                    <input
                        ref={inputRef}
                        type="file"
                        accept={ACCEPTED.join(",")}
                        multiple
                        className="photo-uploader__input"
                        disabled={disabled || !!cropSrc}
                        onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
                    />
                    <UploadCloud size={28} className="photo-uploader__icon" />
                    <p className="photo-uploader__label">
                        Trage fotografiile aici sau <strong>apasă pentru a selecta</strong>
                    </p>
                    <p className="photo-uploader__hint">
                        Maxim {maxFiles} fotografii · {files.length}/{maxFiles} adăugate
                    </p>
                </div>
            )}

            {files.length > 0 && (
                <div className="photo-uploader__previews">
                    {files.map((file, i) => (
                        <div key={i} className="photo-uploader__preview">
                            <img
                                src={URL.createObjectURL(file)}
                                alt={`preview-${i}`}
                                className="photo-uploader__preview-img"
                            />
                            <button
                                type="button"
                                className="photo-uploader__remove"
                                onClick={() => removeFile(i)}
                                aria-label="Șterge fotografie"
                            >
                                <X size={10} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Crop Modal ── */}
            {cropSrc && (
                <div className="photo-uploader__crop-overlay">
                    <div className="photo-uploader__crop-modal">
                        <div className="photo-uploader__crop-container">
                            <Cropper
                                image={cropSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={4 / 3}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                            />
                        </div>
                        <div className="photo-uploader__crop-actions">
                            <button
                                type="button"
                                className="photo-uploader__crop-btn photo-uploader__crop-btn--skip"
                                onClick={handleSkipCrop}
                            >
                                Sari peste
                            </button>
                            <button
                                type="button"
                                className="photo-uploader__crop-btn photo-uploader__crop-btn--confirm"
                                onClick={handleConfirmCrop}
                            >
                                Confirmă
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PhotoUploader;