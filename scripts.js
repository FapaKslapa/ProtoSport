const fs = require('fs');
const path = require('path');

// Percorsi file
const inputPath = path.join(process.cwd(), 'data', 'VeicoliOld.json');
const outputPath = path.join(process.cwd(), 'data', 'catalogo-auto-pulito.json');

try {
    // Leggi il file JSON originale
    const veicoliOriginali = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
    console.log(`Letti ${veicoliOriginali.length} veicoli dal file originale`);

    // Verifica che sia un array
    if (!Array.isArray(veicoliOriginali)) {
        throw new Error('Il file JSON non contiene un array di veicoli');
    }

    // Struttura catalogo
    const catalogoPulito = {};

    // Elabora ogni veicolo
    veicoliOriginali.forEach(veicolo => {
        // Estrai i dati necessari (con controlli di sicurezza)
        const marca = veicolo.make || '';
        const modello = veicolo.basemodel || veicolo.model || '';
        const anno = veicolo.year ? parseInt(veicolo.year) : null;
        const tipo = veicolo.vclass || veicolo.drive || 'automobile';
        const cilindrata = veicolo.displ ? Math.round(veicolo.displ * 1000) : null; // converte da litri a cc

        // Salta veicoli con dati mancanti
        if (!marca || !modello || !anno || !tipo || !cilindrata) {
            return;
        }

        // Inizializza la marca se non esiste
        if (!catalogoPulito[marca]) {
            catalogoPulito[marca] = {};
        }

        // Inizializza il modello se non esiste
        if (!catalogoPulito[marca][modello]) {
            catalogoPulito[marca][modello] = {
                anni: [],
                tipo: tipo,
                cilindrate: []
            };
        }

        // Aggiungi l'anno se non è già presente
        if (!catalogoPulito[marca][modello].anni.includes(anno)) {
            catalogoPulito[marca][modello].anni.push(anno);
        }

        // Aggiungi la cilindrata se non è già presente
        if (!catalogoPulito[marca][modello].cilindrate.includes(cilindrata)) {
            catalogoPulito[marca][modello].cilindrate.push(cilindrata);
        }
    });

    // Ordina gli array anni e cilindrate
    for (const marca in catalogoPulito) {
        for (const modello in catalogoPulito[marca]) {
            catalogoPulito[marca][modello].anni.sort((a, b) => a - b);
            catalogoPulito[marca][modello].cilindrate.sort((a, b) => a - b);
        }
    }

    // Salva il catalogo pulito
    fs.writeFileSync(outputPath, JSON.stringify(catalogoPulito, null, 2), 'utf8');

    console.log(`Catalogo pulito salvato in ${outputPath}`);
    console.log(`Marche: ${Object.keys(catalogoPulito).length}`);
    console.log(`Modelli totali: ${Object.values(catalogoPulito).reduce((acc, modelli) =>
        acc + Object.keys(modelli).length, 0)}`);

} catch (error) {
    console.error('Errore durante la pulizia del catalogo:', error);
}