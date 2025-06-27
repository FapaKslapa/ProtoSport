const fs = require('fs');
const path = require('path');

const inputPath = path.join(process.cwd(), 'data', 'VeicoliOld.json');
const outputPath = path.join(process.cwd(), 'data', 'catalogo-auto-pulito.json');

function parseVeicolo(veicolo) {
    const marca = veicolo.make || '';
    const modello = veicolo.basemodel || veicolo.model || '';
    const anno = veicolo.year ? parseInt(veicolo.year) : null;
    const tipo = veicolo.vclass || veicolo.drive || 'automobile';
    const cilindrata = veicolo.displ ? Math.round(veicolo.displ * 1000) : null; // litri -> cc

    if (!marca || !modello || !anno || !tipo || !cilindrata) return null;
    return {marca, modello, anno, tipo, cilindrata};
}

function aggiungiAlCatalogo(catalogo, {marca, modello, anno, tipo, cilindrata}) {
    if (!catalogo[marca]) catalogo[marca] = {};
    if (!catalogo[marca][modello]) {
        catalogo[marca][modello] = {anni: [], tipo, cilindrate: []};
    }
    if (!catalogo[marca][modello].anni.includes(anno)) {
        catalogo[marca][modello].anni.push(anno);
    }
    if (!catalogo[marca][modello].cilindrate.includes(cilindrata)) {
        catalogo[marca][modello].cilindrate.push(cilindrata);
    }
}

function ordinaCatalogo(catalogo) {
    for (const marca in catalogo) {
        for (const modello in catalogo[marca]) {
            catalogo[marca][modello].anni.sort((a, b) => a - b);
            catalogo[marca][modello].cilindrate.sort((a, b) => a - b);
        }
    }
}

try {
    const rawData = fs.readFileSync(inputPath, 'utf8');
    const veicoliOriginali = JSON.parse(rawData);

    if (!Array.isArray(veicoliOriginali)) {
        throw new Error('Il file JSON non contiene un array di veicoli');
    }

    console.log(`Letti ${veicoliOriginali.length} veicoli dal file originale`);

    const catalogoPulito = {};

    veicoliOriginali.forEach(veicolo => {
        const dati = parseVeicolo(veicolo);
        if (dati) aggiungiAlCatalogo(catalogoPulito, dati);
    });

    ordinaCatalogo(catalogoPulito);

    fs.writeFileSync(outputPath, JSON.stringify(catalogoPulito, null, 2), 'utf8');

    const numMarche = Object.keys(catalogoPulito).length;
    const numModelli = Object.values(catalogoPulito).reduce(
        (acc, modelli) => acc + Object.keys(modelli).length, 0
    );

    console.log(`Catalogo pulito salvato in ${outputPath}`);
    console.log(`Marche: ${numMarche}`);
    console.log(`Modelli totali: ${numModelli}`);
} catch (error) {
    console.error('Errore durante la pulizia del catalogo:', error.message);
}