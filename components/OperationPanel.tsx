'use client';
import { type Operation, type OperationParam } from '@/lib/types';
import {
  Palette,
  ScanLine,
  Layers,
  PieChart,
  Archive,
  Loader2,
  AlertCircle,
  Zap,
  Settings2,
} from 'lucide-react';

const CATEGORIES = [
  { id: 'filters', label: 'Filters', Icon: Palette },
  { id: 'edges', label: 'Edges', Icon: ScanLine },
  { id: 'morphology', label: 'Morphology', Icon: Layers },
  { id: 'segmentation', label: 'Segment', Icon: PieChart },
  { id: 'compression', label: 'Compress', Icon: Archive },
];

interface OperationPanelProps {
  operations: Operation[];
  activeCategory: string;
  selectedOp: Operation | null;
  params: Record<string, number>;
  loading: boolean;
  error: string | null;
  hasImage: boolean;
  onCategoryChange: (id: string) => void;
  onSelectOperation: (op: Operation) => void;
  onParamChange: (name: string, value: number) => void;
  onApply: () => void;
}

function ParamSlider({
  param,
  value,
  onChange,
}: {
  param: OperationParam;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="param-row">
      <label className="param-label">
        <span>{param.label}</span>
        <span className="param-value">{value}</span>
      </label>
      <input
        type="range"
        min={param.min}
        max={param.max}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="slider"
      />
    </div>
  );
}

export default function OperationPanel({
  operations,
  activeCategory,
  selectedOp,
  params,
  loading,
  error,
  hasImage,
  onCategoryChange,
  onSelectOperation,
  onParamChange,
  onApply,
}: OperationPanelProps) {
  const filteredOps = operations.filter((op) => op.category === activeCategory);

  return (
    <div className="panel op-panel">
      <p className="panel-title">
        <Settings2 className="panel-title-icon" size={14} />
        Operation
      </p>

      {/* Category tabs */}
      <div className="category-tabs">
        {CATEGORIES.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => onCategoryChange(id)}
            className={`category-tab ${activeCategory === id ? 'category-tab--active' : ''}`}
          >
            <Icon size={12} className="category-tab-icon" />
            {label}
          </button>
        ))}
      </div>

      <div className="op-panel-body">
        {/* Left: operation list */}
        <div className="op-panel-left">
          <div className="op-list">
            {filteredOps.map((op) => (
              <button
                key={op.id}
                onClick={() => onSelectOperation(op)}
                className={`op-item ${selectedOp?.id === op.id ? 'op-item--active' : ''}`}
              >
                {op.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: params + apply */}
        <div className="op-panel-right">
          {selectedOp?.params ? (
            <div className="params-section" style={{ borderTop: 'none', paddingTop: 0 }}>
              <p className="params-title">Parameters — {selectedOp.label}</p>
              {selectedOp.params.map((param) => (
                <ParamSlider
                  key={param.name}
                  param={param}
                  value={params[param.name] ?? (param.default as number)}
                  onChange={(v) => onParamChange(param.name, v)}
                />
              ))}
            </div>
          ) : selectedOp ? (
            <p className="op-no-params">No parameters for this operation.</p>
          ) : (
            <p className="op-no-params">Select an operation from the list.</p>
          )}

          <div className="mt-auto pt-4">
            <button onClick={onApply} disabled={!hasImage || !selectedOp || loading} className="apply-btn">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 size={15} className="spinner" />
                  Processing…
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Zap size={15} />
                  Apply Operation
                </span>
              )}
            </button>

            {error && (
              <div className="error-box">
                <AlertCircle size={14} className="flex-shrink-0 mt-px" />
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
