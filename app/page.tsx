'use client';
import { useState, useRef, useCallback } from 'react';
import { OPERATIONS, type Operation } from '@/lib/types';
import ImageUploader from '@/components/ImageUploader';
import OperationPanel from '@/components/OperationPanel';
import ResultViewer from '@/components/ResultViewer';
import { Aperture } from 'lucide-react';

export default function Home() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [selectedOp, setSelectedOp] = useState<Operation | null>(null);
  const [activeCategory, setActiveCategory] = useState('filters');
  const [params, setParams] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<File | null>(null);

  const handleUpload = useCallback((file: File) => {
    fileRef.current = file;
    setResultImage(null);
    setError(null);
    const reader = new FileReader();
    reader.onload = (ev) => setOriginalImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const selectOperation = useCallback((op: Operation) => {
    setSelectedOp(op);
    const defaults: Record<string, number> = {};
    op.params?.forEach((p) => {
      if (typeof p.default === 'number') defaults[p.name] = p.default;
    });
    setParams(defaults);
    setResultImage(null);
  }, []);

  const handleParamChange = useCallback(
    (name: string, value: number) => setParams((p) => ({ ...p, [name]: value })),
    []
  );

  const handleApply = async () => {
    if (!fileRef.current || !selectedOp) return;
    setLoading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append('image', fileRef.current);
      form.append('operation', selectedOp.id);
      form.append('params', JSON.stringify(params));
      const res = await fetch('/api/process', { method: 'POST', body: form });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setResultImage(json.result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-root">
      <header className="app-header">
        <div className="header-logo">
          <Aperture size={24} />
        </div>
        <div>
          <h1 className="app-title">Image Processing Studio</h1>
          <p className="app-subtitle">Filters · Edges · Morphology · Segmentation · Compression</p>
        </div>
      </header>

      <main className="app-grid">
        <ImageUploader originalImage={originalImage} onUpload={handleUpload} />
        <ResultViewer resultImage={resultImage} loading={loading} />
        <OperationPanel
          operations={OPERATIONS}
          activeCategory={activeCategory}
          selectedOp={selectedOp}
          params={params}
          loading={loading}
          error={error}
          hasImage={!!originalImage}
          onCategoryChange={setActiveCategory}
          onSelectOperation={selectOperation}
          onParamChange={handleParamChange}
          onApply={handleApply}
        />
      </main>
    </div>
  );
}