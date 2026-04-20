'use client';
import { Loader2, Download, ImageOff } from 'lucide-react';

interface ResultViewerProps {
  resultImage: string | null;
  loading: boolean;
}

export default function ResultViewer({ resultImage, loading }: ResultViewerProps) {
  return (
    <div className="panel flex flex-col">
      <p className="panel-title">
        <ImageOff className="panel-title-icon" size={14} />
        Result
      </p>

      <div className={`result-zone ${resultImage && !loading ? 'result-zone--filled' : ''}`}>
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="text-indigo-400 spinner" />
            <span className="text-sm text-indigo-300 font-medium tracking-wide">Processing…</span>
          </div>
        ) : resultImage ? (
          <img
            src={resultImage}
            className="max-h-72 w-full object-contain rounded-xl"
            alt="result"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-[var(--txt-3)]">
            <ImageOff size={36} strokeWidth={1.2} />
            <span className="text-sm">Result appears here</span>
          </div>
        )}
      </div>

      {resultImage && !loading && (
        <a href={resultImage} download="processed.png" className="download-btn">
          <Download size={14} />
          Download Result
        </a>
      )}
    </div>
  );
}
