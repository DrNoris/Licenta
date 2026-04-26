import { useRef, useState } from "react";
import { UploadCloud, X } from "lucide-react";
import type { PhotoUploaderProps } from "./PhotoUploader.types.ts";
import "./PhotoUploader.styles.css";

const ACCEPTED = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/heic", "image/heif"];

function PhotoUploader({ files, onChange, disabled = false, maxFiles = 5 }: PhotoUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);

    const addFiles = (incoming: FileList | null): void => {
        if (!incoming) return;
        const valid = Array.from(incoming)
            .filter((f) => ACCEPTED.includes(f.type))
            .slice(0, maxFiles - files.length);
        if (valid.length) onChange([...files, ...valid]);
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
                        disabled={disabled}
                        onChange={(e) => addFiles(e.target.files)}
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
        </div>
    );
}

export default PhotoUploader;