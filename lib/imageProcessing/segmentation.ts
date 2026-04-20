import sharp from 'sharp';

export async function applySegmentation(
    buffer: Buffer,
    operation: string,
    params: Record<string, number>
): Promise<Buffer> {
    switch (operation) {
        case 'threshold': {
            const t = params.value ?? 128;
            const { data, info } = await sharp(buffer).grayscale().raw().toBuffer({ resolveWithObject: true });
            const out = new Uint8Array(data.length);
            for (let i = 0; i < data.length; i++) out[i] = data[i] >= t ? 255 : 0;
            return sharp(Buffer.from(out), { raw: { width: info.width, height: info.height, channels: 1 } }).png().toBuffer();
        }

        case 'otsu': {
            const { data, info } = await sharp(buffer).grayscale().raw().toBuffer({ resolveWithObject: true });
            const t = otsuThreshold(data);
            const out = new Uint8Array(data.length);
            for (let i = 0; i < data.length; i++) out[i] = data[i] >= t ? 255 : 0;
            return sharp(Buffer.from(out), { raw: { width: info.width, height: info.height, channels: 1 } }).png().toBuffer();
        }

        case 'kmeans': {
            const k = params.k ?? 4;
            const { data, info } = await sharp(buffer).raw().toBuffer({ resolveWithObject: true });
            const result = kmeansSegment(data, k, info.channels);
            return sharp(Buffer.from(result), { raw: { width: info.width, height: info.height, channels: info.channels } }).png().toBuffer();
        }

        default:
            throw new Error(`Unknown segmentation operation: ${operation}`);
    }
}

function otsuThreshold(data: Buffer): number {
    const hist = new Array(256).fill(0);
    for (const v of data) hist[v]++;
    const total = data.length;
    let sum = 0;
    for (let i = 0; i < 256; i++) sum += i * hist[i];
    let sumB = 0, wB = 0, max = 0, threshold = 0;
    for (let t = 0; t < 256; t++) {
        wB += hist[t];
        if (!wB) continue;
        const wF = total - wB;
        if (!wF) break;
        sumB += t * hist[t];
        const mB = sumB / wB;
        const mF = (sum - sumB) / wF;
        const between = wB * wF * (mB - mF) ** 2;
        if (between > max) { max = between; threshold = t; }
    }
    return threshold;
}

function kmeansSegment(data: Buffer, k: number, channels: number): Uint8Array {
    const pixels = data.length / channels;
    // Initialize k random centroids
    let centroids: number[][] = Array.from({ length: k }, () =>
        Array.from({ length: channels }, () => Math.floor(Math.random() * 256))
    );

    const labels = new Uint8Array(pixels);

    // 10 iterations
    for (let iter = 0; iter < 10; iter++) {
        // Assign step
        for (let i = 0; i < pixels; i++) {
            let minDist = Infinity, best = 0;
            for (let c = 0; c < k; c++) {
                let dist = 0;
                for (let ch = 0; ch < channels; ch++) {
                    dist += (data[i * channels + ch] - centroids[c][ch]) ** 2;
                }
                if (dist < minDist) { minDist = dist; best = c; }
            }
            labels[i] = best;
        }

        // Update step
        const sums = Array.from({ length: k }, () => new Array(channels).fill(0));
        const counts = new Array(k).fill(0);
        for (let i = 0; i < pixels; i++) {
            const c = labels[i];
            counts[c]++;
            for (let ch = 0; ch < channels; ch++) sums[c][ch] += data[i * channels + ch];
        }
        for (let c = 0; c < k; c++) {
            if (counts[c] > 0)
                centroids[c] = sums[c].map(s => Math.round(s / counts[c]));
        }
    }

    // Rebuild image with centroid colors
    const out = new Uint8Array(data.length);
    for (let i = 0; i < pixels; i++) {
        const c = labels[i];
        for (let ch = 0; ch < channels; ch++) out[i * channels + ch] = centroids[c][ch];
    }
    return out;
}