export type OperationCategory =
    | 'filters'
    | 'edges'
    | 'morphology'
    | 'segmentation'
    | 'compression';

export interface Operation {
    id: string;
    label: string;
    category: OperationCategory;
    params?: OperationParam[];
}

export interface OperationParam {
    name: string;
    label: string;
    type: 'range' | 'select';
    min?: number;
    max?: number;
    default: number | string;
    options?: { value: string; label: string }[];
}

export const OPERATIONS: Operation[] = [
    // Filters
    { id: 'grayscale', label: 'Grayscale', category: 'filters' },
    {
        id: 'blur', label: 'Gaussian Blur', category: 'filters',
        params: [{ name: 'sigma', label: 'Sigma', type: 'range', min: 1, max: 20, default: 3 }]
    },
    {
        id: 'sharpen', label: 'Sharpen', category: 'filters',
        params: [{ name: 'sigma', label: 'Amount', type: 'range', min: 1, max: 10, default: 2 }]
    },
    {
        id: 'brightness', label: 'Brightness', category: 'filters',
        params: [{ name: 'value', label: 'Value', type: 'range', min: -100, max: 100, default: 0 }]
    },
    {
        id: 'contrast', label: 'Contrast', category: 'filters',
        params: [{ name: 'value', label: 'Value', type: 'range', min: -100, max: 100, default: 0 }]
    },
    { id: 'invert', label: 'Invert', category: 'filters' },
    { id: 'sepia', label: 'Sepia', category: 'filters' },
    {
        id: 'median', label: 'Median Filter', category: 'filters',
        params: [{ name: 'size', label: 'Kernel Size', type: 'range', min: 1, max: 5, default: 3 }]
    },

    // Edge Detection
    { id: 'sobel', label: 'Sobel', category: 'edges' },
    { id: 'prewitt', label: 'Prewitt', category: 'edges' },
    { id: 'laplacian', label: 'Laplacian', category: 'edges' },
    {
        id: 'canny', label: 'Canny', category: 'edges',
        params: [
            { name: 'low', label: 'Low Threshold', type: 'range', min: 10, max: 100, default: 50 },
            { name: 'high', label: 'High Threshold', type: 'range', min: 50, max: 200, default: 150 },
        ]
    },

    // Morphology & Padding
    {
        id: 'padding', label: 'Padding / Extend', category: 'morphology',
        params: [{ name: 'size', label: 'Pixels', type: 'range', min: 5, max: 100, default: 20 }]
    },
    {
        id: 'erosion', label: 'Erosion', category: 'morphology',
        params: [{ name: 'size', label: 'Kernel', type: 'range', min: 1, max: 10, default: 3 }]
    },
    {
        id: 'dilation', label: 'Dilation', category: 'morphology',
        params: [{ name: 'size', label: 'Kernel', type: 'range', min: 1, max: 10, default: 3 }]
    },

    // Segmentation
    {
        id: 'threshold', label: 'Binary Threshold', category: 'segmentation',
        params: [{ name: 'value', label: 'Threshold', type: 'range', min: 0, max: 255, default: 128 }]
    },
    { id: 'otsu', label: 'Otsu Threshold', category: 'segmentation' },
    {
        id: 'kmeans', label: 'K-Means Color Seg.', category: 'segmentation',
        params: [{ name: 'k', label: 'K (clusters)', type: 'range', min: 2, max: 8, default: 4 }]
    },

    // Compression
    {
        id: 'compress_quality', label: 'JPEG Quality Compression', category: 'compression',
        params: [{ name: 'quality', label: 'Quality %', type: 'range', min: 1, max: 100, default: 50 }]
    },
    {
        id: 'quantize', label: 'Color Quantization', category: 'compression',
        params: [{ name: 'colors', label: 'Max Colors', type: 'range', min: 2, max: 64, default: 16 }]
    },
];