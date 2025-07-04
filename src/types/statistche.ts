export type Statistiche = {
  prenotazioniPerMese: { mese: string; count: number }[];
  profittiPerMese: { mese: string; profitto: number }[];
  utentiPerMese: { mese: string; count: number }[];
};