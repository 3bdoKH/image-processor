import sharp from 'sharp';

export async function applyEdgeDetection(
    buffer: Buffer,
    operation: string,
    params: Record<string, number>
): Promise<Buffer> {
    // Convert to grayscale first for edge detection
    const grayBuffer = await sharp(buffer).grayscale().raw().toBuffer({ resolveWithObject: true });
    const { data, info } = grayBuffer;
    const { width, height } = info;

    let result: Uint8Array;

    switch (operation) {
        case 'sobel':
            result = applySobel(data, width, height);
            break;
        case 'prewitt':
            result = applyPrewitt(data, width, height);
            break;
        case 'laplacian':
            result = applyLaplacian(data, width, height);
            break;
        case 'canny':
            result = applyCanny(data, width, height, params.low ?? 50, params.high ?? 150);
            break;
        default:
            throw new Error(`Unknown edge operation: ${operation}`);
    }

    return sharp(Buffer.from(result), {
        raw: { width, height, channels: 1 }
    }).png().toBuffer();
}

function convolve(data: Buffer, width: number, height: number, kernel: number[][]): number[] {
    const output: number[] = new Array(width * height).fill(0);
    const k = Math.floor(kernel.length / 2);

    for (let y = k; y < height - k; y++) {
        for (let x = k; x < width - k; x++) {
            let sum = 0;
            for (let ky = -k; ky <= k; ky++) {
                for (let kx = -k; kx <= k; kx++) {
                    sum += data[(y + ky) * width + (x + kx)] * kernel[ky + k][kx + k];
                }
            }
            output[y * width + x] = sum;
        }
    }
    return output;
}

function applySobel(data: Buffer, width: number, height: number): Uint8Array {
    const kx = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
    const ky = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];
    const gx = convolve(data, width, height, kx);
    const gy = convolve(data, width, height, ky);
    const out = new Uint8Array(width * height);
    for (let i = 0; i < out.length; i++) {
        out[i] = Math.min(255, Math.sqrt(gx[i] ** 2 + gy[i] ** 2));
    }
    return out;
}

function applyPrewitt(data: Buffer, width: number, height: number): Uint8Array {
    const kx = [[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]];
    const ky = [[-1, -1, -1], [0, 0, 0], [1, 1, 1]];
    const gx = convolve(data, width, height, kx);
    const gy = convolve(data, width, height, ky);
    const out = new Uint8Array(width * height);
    for (let i = 0; i < out.length; i++) {
        out[i] = Math.min(255, Math.sqrt(gx[i] ** 2 + gy[i] ** 2));
    }
    return out;
}

function applyLaplacian(data: Buffer, width: number, height: number): Uint8Array {
    const kernel = [[0, -1, 0], [-1, 4, -1], [0, -1, 0]];
    const g = convolve(data, width, height, kernel);
    const out = new Uint8Array(width * height);
    for (let i = 0; i < out.length; i++) {
        out[i] = Math.min(255, Math.abs(g[i]));
    }
    return out;
}

function applyCanny(data: Buffer, width: number, height: number, low: number, high: number): Uint8Array {
    // Step 1: Gaussian blur
    const blurred = convolve(data, width, height, [
        [1, 2, 1], [2, 4, 2], [1, 2, 1]
    ]).map(v => v / 16);

    // Step 2: Sobel gradients
    const kx = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
    const ky = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];
    const blurBuf = Buffer.from(blurred.map(v => Math.max(0, Math.min(255, v))));
    const gx = convolve(blurBuf, width, height, kx);
    const gy = convolve(blurBuf, width, height, ky);
    const mag = new Float32Array(width * height);
    const ang = new Float32Array(width * height);
    for (let i = 0; i < mag.length; i++) {
        mag[i] = Math.sqrt(gx[i] ** 2 + gy[i] ** 2);
        ang[i] = Math.atan2(gy[i], gx[i]) * 180 / Math.PI;
    }

    // Step 3: Double threshold + simple hysteresis
    const out = new Uint8Array(width * height);
    for (let i = 0; i < out.length; i++) {
        if (mag[i] >= high) out[i] = 255;
        else if (mag[i] >= low) out[i] = 128;
        else out[i] = 0;
    }
    return out;
}