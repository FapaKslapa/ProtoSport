import {NextRequest, NextResponse} from 'next/server';
import {getDb} from '@/lib/db';

export async function GET(req: NextRequest) {
    const {searchParams} = new URL(req.url);
    const marca = searchParams.get('marca');
    const modello = searchParams.get('modello');
    const anno = searchParams.get('anno');
    if (!marca || !modello) {
        return NextResponse.json({error: 'Parametri mancanti'}, {status: 400});
    }
    const base64 = getCarImageBase64(marca, modello, anno ? Number(anno) : undefined);
    return NextResponse.json({base64});
}

export async function POST(req: NextRequest) {
    const body = await req.json();
    const {marca, modello, anno, base64} = body;
    if (!marca || !modello || !base64) {
        return NextResponse.json({error: 'Parametri mancanti'}, {status: 400});
    }
    if (base64.startsWith('data:image/gif')) {
        return NextResponse.json({ok: true, skipped: true});
    }
    saveCarImageBase64(marca, modello, anno ?? null, base64);
    return NextResponse.json({ok: true});
}

function getCarImageBase64(marca: string, modello: string, anno?: number): string | null {
    const db = getDb();
    const row = db.prepare(
        `SELECT base64
         FROM immagini_auto
         WHERE marca = ?
           AND modello = ?
           AND (anno IS ? OR anno = ?)`
    ).get(marca, modello, anno ?? null, anno ?? null);
    return row && typeof row === 'object' && 'base64' in row ? (row as { base64: string }).base64 : null;
}

function saveCarImageBase64(marca: string, modello: string, anno: number | null, base64: string) {
    const db = getDb();
    db.prepare(
        `INSERT
        OR REPLACE INTO immagini_auto (marca, modello, anno, base64) VALUES (?, ?, ?, ?)`
    ).run(marca, modello, anno, base64);
}
