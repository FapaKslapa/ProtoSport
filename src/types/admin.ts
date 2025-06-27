export interface Servizio {
    id: number;
    nome: string;
    descrizione: string;
    prezzo: number;
    durata_minuti: number;
}

export interface Orario {
    id?: number;
    giorno_settimana: number;
    ora_inizio: string;
    ora_fine: string;
}

export type StatoPrenotazione = "richiesta" | "accettata" | "rifiutata";

export interface PrenotazioneAdmin {
    id: number;
    user_nome: string;
    user_cognome: string;
    servizio_nome: string;
    data_prenotazione: string;
    ora_inizio: string;
    ora_fine: string;
    stato: StatoPrenotazione;
    veicolo: string;
    targa: string;
}

export interface ModalState {
    servizi: boolean;
    nuovoServizio: boolean;
    modificaServizio: boolean;
    modificaOrario: boolean;
    prenotazioni: boolean;
    icsLinks: boolean;
}

export interface Message {
    text: string;
    type: "success" | "error";
}