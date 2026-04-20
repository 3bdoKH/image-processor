import { applyFilter } from './filters';
import { applyEdgeDetection } from './edges';
import { applyMorphology } from './morphology';
import { applySegmentation } from './segmentation';
import { applyCompression } from './compression';

export async function processImage(
    buffer: Buffer,
    operation: string,
    params: Record<string, number>
): Promise<Buffer> {
    const filterOps = ['grayscale', 'blur', 'sharpen', 'brightness', 'contrast', 'invert', 'sepia', 'median'];
    const edgeOps = ['sobel', 'prewitt', 'laplacian', 'canny'];
    const morphOps = ['padding', 'erosion', 'dilation'];
    const segOps = ['threshold', 'otsu', 'kmeans'];
    const compOps = ['compress_quality', 'quantize'];

    if (filterOps.includes(operation)) return applyFilter(buffer, operation, params);
    if (edgeOps.includes(operation)) return applyEdgeDetection(buffer, operation, params);
    if (morphOps.includes(operation)) return applyMorphology(buffer, operation, params);
    if (segOps.includes(operation)) return applySegmentation(buffer, operation, params);
    if (compOps.includes(operation)) return applyCompression(buffer, operation, params);

    throw new Error(`Unknown operation: ${operation}`);
}