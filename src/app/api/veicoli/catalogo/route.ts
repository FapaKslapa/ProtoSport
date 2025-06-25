// src/app/api/veicoli/catalogo/route.ts
import {NextResponse} from 'next/server';
import fs from 'fs';
import path from 'path';
import {parse} from 'csv-parse/sync';

export async function GET() {
    try {
        // Scegli il formato appropriato (JSON o CSV)
        const filePath = path.join(process.cwd(), 'data', 'catalogo-auto-pulito.json');

        if (filePath.endsWith('.json')) {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            return NextResponse.json({success: true, data});
        } else if (filePath.endsWith('.csv')) {
            const content = fs.readFileSync(filePath, 'utf8');
            const records = parse(content, {
                columns: true,
                skip_empty_lines: true
            });
            return NextResponse.json({success: true, data: records});
        }
    } catch (error) {
        console.error('Errore nel caricamento del catalogo:', error);
        return NextResponse.json(
            {success: false, error: 'Errore nel caricamento del catalogo'},
            {status: 500}
        );
    }
}