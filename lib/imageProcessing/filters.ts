import sharp from 'sharp';

export async function applyFilter(
    buffer: Buffer,
    operation: string,
    params: Record<string, number>
): Promise<Buffer> {
    let img = sharp(buffer);

    switch (operation) {
        case 'grayscale':
            return img.grayscale().png().toBuffer();

        case 'blur':
            return img.blur(params.sigma ?? 3).png().toBuffer();

        case 'sharpen':
            return img.sharpen({ sigma: params.sigma ?? 2 }).png().toBuffer();

        case 'brightness':
            return img.modulate({ brightness: 1 + (params.value ?? 0) / 100 }).png().toBuffer();

        case 'contrast': {
            // sharp doesn't have direct contrast
            const factor = 1 + (params.value ?? 0) / 100;
            const offset = 128 * (1 - factor);
            return img.linear(factor, offset).png().toBuffer();
        }

        case 'invert':
            return img.negate().png().toBuffer();

        case 'sepia':
            return img.grayscale().tint({ r: 112, g: 66, b: 20 }).png().toBuffer();

        case 'median':
            return img.median(params.size ?? 3).png().toBuffer();

        default:
            throw new Error(`Unknown filter: ${operation}`);
    }
}