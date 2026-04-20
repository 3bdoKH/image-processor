'use client';
import { useCallback } from 'react';
import { Upload, ImageIcon, RefreshCw } from 'lucide-react';

interface ImageUploaderProps {
  originalImage: string | null;
  onUpload: (file: File) => void;
}

export default function ImageUploader({ originalImage, onUpload }: ImageUploaderProps) {
  const processFile = useCallback(
    (file: File | undefined) => { if (file) onUpload(file); },
    [onUpload]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => processFile(e.target.files?.[0]),
    [processFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => { e.preventDefault(); processFile(e.dataTransfer.files[0]); },
    [processFile]
  );

  return (
    <div className="panel flex flex-col">
      <p className="panel-title">
        <ImageIcon className="panel-title-icon" size={14} />
        Input Image
      </p>

      <label
        className="upload-zone"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {originalImage ? (
          <img
            src={originalImage}
            className="max-h-72 w-full object-contain rounded-xl"
            alt="original"
          />
        ) : (
          <div className="upload-placeholder">
            <div className="upload-icon-wrap">
              <Upload size={22} />
            </div>
            <p className="upload-primary">Drop an image or click to browse</p>
            <p className="upload-secondary">PNG · JPG · WebP · any size</p>
          </div>
        )}
        <input type="file" accept="image/*" className="hidden" onChange={handleChange} />
      </label>

      {originalImage && (
        <label className="change-btn">
          <RefreshCw size={13} />
          Change Image
          <input type="file" accept="image/*" className="hidden" onChange={handleChange} />
        </label>
      )}
    </div>
  );
}
