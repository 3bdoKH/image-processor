import { NextRequest, NextResponse } from 'next/server';
import { processImage } from '@/lib/imageProcessing';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('image') as File;
        const operation = formData.get('operation') as string;
        const paramsRaw = formData.get('params') as string;

        if (!file || !operation) {
            return NextResponse.json({ error: 'Missing image or operation' }, { status: 400 });
        }

        const params: Record<string, number> = paramsRaw ? JSON.parse(paramsRaw) : {};
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const resultBuffer = await processImage(buffer, operation, params);
        const base64 = resultBuffer.toString('base64');

        return NextResponse.json({ result: `data:image/png;base64,${base64}` });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}