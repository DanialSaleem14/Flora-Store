import { useRef, useState, type DragEvent } from 'react';
import toast from 'react-hot-toast';
import { uploadImagesToStorage } from '../services/storageService';
import { getErrorMessage } from '../services/api';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  multiple?: boolean;
  folder?: string;
}

export function ImageUploader({ images, onChange, multiple = true, folder = 'store' }: ImageUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || !fileList.length) return;
    const files = Array.from(fileList).slice(0, multiple ? 10 : 1);

    setUploading(true);
    setProgress(0);
    try {
      const urls = await uploadImagesToStorage(files, folder, setProgress);
      onChange(multiple ? [...images, ...urls] : urls);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeAt = (idx: number) => onChange(images.filter((_, i) => i !== idx));

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center text-sm transition-colors ${
          dragActive ? 'border-[var(--store-accent)] bg-indigo-50' : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? `Uploading… ${progress}%` : 'Drag & drop images here, or click to browse'}
      </div>

      {images.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((src, idx) => (
            <div key={src + idx} className="group relative aspect-square overflow-hidden rounded-md border">
              <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeAt(idx)}
                className="absolute top-1 right-1 hidden h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs text-white group-hover:flex"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
