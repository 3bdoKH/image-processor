import sharp from 'sharp';

export async function applyCompression(
    buffer: Buffer,
    operation: string,
    params: Record<string, number>
): Promise<Buffer> {
    switch (operation) {
        case 'compress_quality':
            return sharp(buffer).jpeg({ quality: params.quality ?? 50 }).toBuffer();

        case 'quantize': {
            const colors = params.colors ?? 16;
            // Use sharp's PNG palette quantization
            return sharp(buffer).png({ palette: true, colors }).toBuffer();
        }

        default:
            throw new Error(`Unknown compression operation: ${operation}`);
    }
}