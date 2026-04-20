import sharp from 'sharp';

export async function applyMorphology(
    buffer: Buffer,
    operation: string,
    params: Record<string, number>
): Promise<Buffer> {
    switch (operation) {
        case 'padding': {
            const size = params.size ?? 20;
            return sharp(buffer)
                .extend({ top: size, bottom: size, left: size, right: size, background: { r: 0, g: 0, b: 0, alpha: 1 } })
                .png().toBuffer();
        }

        case 'erosion': {
            const { data, info } = await sharp(buffer).grayscale().raw().toBuffer({ resolveWithObject: true });
            const result = erode(data, info.width, info.height, params.size ?? 3);
            return sharp(Buffer.from(result), { raw: { width: info.width, height: info.height, channels: 1 } }).png().toBuffer();
        }

        case 'dilation': {
            const { data, info } = await sharp(buffer).grayscale().raw().toBuffer({ resolveWithObject: true });
            const result = dilate(data, info.width, info.height, params.size ?? 3);
            return sharp(Buffer.from(result), { raw: { width: info.width, height: info.height, channels: 1 } }).png().toBuffer();
        }

        default:
            throw new Error(`Unknown morphology operation: ${operation}`);
    }
}

function erode(data: Buffer, width: number, height: number, size: number): Uint8Array {
    const out = new Uint8Array(width * height);
    const k = Math.floor(size / 2);
    for (let y = k; y < height - k; y++) {
        for (let x = k; x < width - k; x++) {
            let min = 255;
            for (let ky = -k; ky <= k; ky++)
                for (let kx = -k; kx <= k; kx++)
                    min = Math.min(min, data[(y + ky) * width + (x + kx)]);
            out[y * width + x] = min;
        }
    }
    return out;
}

function dilate(data: Buffer, width: number, height: number, size: number): Uint8Array {
    const out = new Uint8Array(width * height);
    const k = Math.floor(size / 2);
    for (let y = k; y < height - k; y++) {
        for (let x = k; x < width - k; x++) {
            let max = 0;
            for (let ky = -k; ky <= k; ky++)
                for (let kx = -k; kx <= k; kx++)
                    max = Math.max(max, data[(y + ky) * width + (x + kx)]);
            out[y * width + x] = max;
        }
    }
    return out;
}