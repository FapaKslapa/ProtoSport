import {NextResponse} from 'next/server';
import fs from 'fs';
import path from 'path';
import {parse} from 'csv-parse/sync';

export async function GET() {
    try {
        const filePath = path.join(process.cwd(), 'data', 'catalogo-auto-pulito.json');
        const ext = path.extname(filePath).toLowerCase();

        if (ext === '.json') {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            return NextResponse.json({success: true, data});
        }

        if (ext === '.csv') {
            const content = fs.readFileSync(filePath, 'utf8');
            const records = parse(content, {columns: true, skip_empty_lines: true});
            return NextResponse.json({success: true, data: records});
        }

        return NextResponse.json({success: false, error: 'Formato file non supportato'}, {status: 400});
    } catch (error) {
        console.error('Errore nel caricamento del catalogo:', error);
        return NextResponse.json({success: false, error: 'Errore nel caricamento del catalogo'}, {status: 500});
    }
}