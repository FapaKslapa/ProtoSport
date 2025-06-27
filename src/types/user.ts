export interface Veicolo {
    id: number;
    marca: string;
    modello: string;
    targa: string;
    tipo: string;
    anno?: number;
    cilindrata?: number;
}

export interface Servizio {
    id: number;
    nome: string;
    descrizione: string;
    durata_minuti: number;
    prezzo: number;
}

export interface PrenotazioneUtente {
    id: number;
    servizio_nome: string;
    data_prenotazione: string;
    ora_inizio: string;
    ora_fine: string;
    stato: string;
    veicolo: string;
    targa: string;
}

export interface Message {
    text: string;
    type: "success" | "error";
}