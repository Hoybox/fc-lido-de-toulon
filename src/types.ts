// src/types.ts

// 🔹 Rôles utilisateur
export enum Role {
  Admin = 'Admin',
  Editor = 'Editor',
}

// 🔹 Utilisateur connecté
export interface User {
  username: string;
  role: Role;
}

// 🔹 Joueur (fiche du club)
export interface Player {
  id: number;
  firstName: string;
  lastName: string;
  nickname: string;
  position: string;
  age: number;
  height: number;
  strongFoot: 'Droit' | 'Gauche' | 'Ambidextre';
  anecdote: string;
  awards: string[];
  goals: number;
  assists: number;
  photoUrl: string;
  pac: number;
  sho: number;
  pas: number;
  dri: number;
  def: number;
  phy: number;
  unassignedPoints: number;
}

// 🔹 Statistiques d’équipe (pour la page Classement)
export interface TeamStats {
  rank: number;
  name: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

// 🔹 Matchs
export interface Match {
  id: number;
  date: string;
  opponent: string;
  home: boolean;
  score: string;
  result: 'W' | 'D' | 'L';
  scorers: string[];
  summary: string;
  photos: string[];
}

// 🔹 Types d’événements du calendrier
export enum EventType {
  Match = 'Match',
  Training = 'Entraînement',
  Tournament = 'Tournoi',
  Break = 'Trêve',
  Extra = 'Extra',
}

// 🔹 Événement du calendrier
export interface CalendarEvent {
  id: number;
  date: Date;
  title: string;
  type: EventType;
}

// 🔹 Actualités du club
export interface NewsItem {
  id: number;
  title: string;
  content: string;
  date: string;
}

// 🔹 Informations générales du club
export interface ClubInfo {
  president: string;
  treasurer: string;
  coach: string;
  steward: string;
  awards: string[];
  news: NewsItem[];
}

// 🔹 Pages de l’application
export enum Page {
  Home = 'Accueil',
  Players = 'Joueurs',
  Ranking = 'Classement',
  Media = 'Médias',
  Calendar = 'Calendrier',
  Club = 'Club',
  Panini = 'Panini',
  Penalty = 'Penalty Game',
}

// 🔹 Médias (photos/vidéos)
export interface MediaItem {
  id: number;
  type: 'photo' | 'video';
  url: string;
  title: string;
}

// 🔹 Classement individuel (Penalty Game)
export interface LeaderboardEntry {
  name: string;
  score: number;
}

// 🔹 --- PANINI ALBUM ---
export interface PaniniPlayer {
  id: number;
  name: string;
  country: string;
  description: string;
}

export interface PaniniCardData extends PaniniPlayer {
  generatedImageUrl: string;
}

export interface AlbumSlotData {
  player: PaniniPlayer;
  placedCard: PaniniCardData | null;
}

export interface TeamSlot {
  id: string;         
  label: string;      
  gridArea: string;   
  card: PaniniCardData | null;
}

export interface PlayerCollection {
  albumSlots: AlbumSlotData[];
  lastReveal: string;
  cardInventory: PaniniCardData[];
}

export interface AllCollections {
  [playerName: string]: PlayerCollection;
}
