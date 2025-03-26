export interface Cabinet {
  id: number;
  nom: string;
  adresse: string;
  latitude: number;
  longitude: number;
}

export interface Medecin {
  id: number;
  nom: string;
  prenom: string;
  cabinetId: number;
  visiteurId: number;
}

export interface Visite {
  id: number;
  date: string;
  surRendezVous: boolean;
  heureArrivee: string;
  heureDebut: string;
  heureDepart: string;
  medecinId: number;
  visiteurId: number;
  cabinet: Cabinet;
  medecin: Medecin;
}

export interface Visiteur {
  id: number;
  nom: string;
  prenom: string;
  token: string;
}