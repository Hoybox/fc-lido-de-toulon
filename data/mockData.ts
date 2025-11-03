import { Player, Match, TeamStats, CalendarEvent, EventType, ClubInfo } from '../types';

export const mockPlayers: Player[] = [
    {
        id: 1,
        firstName: 'Jean',
        lastName: 'Dupont',
        nickname: 'Le Roc',
        position: 'Défenseur Central',
        age: 28,
        height: 188,
        strongFoot: 'Droit',
        anecdote: 'On dit qu\'il pourrait arrêter un TGV avec un tacle. Personne n\'a jamais osé vérifier.',
        awards: ['Meilleur Tacleur 2023'],
        goals: 5,
        assists: 2,
        photoUrl: 'https://picsum.photos/seed/player1/400/500',
        pac: 55,
        sho: 35,
        pas: 55,
        dri: 50,
        def: 85,
        phy: 70,
        unassignedPoints: 0,
    },
    {
        id: 2,
        firstName: 'Léa',
        lastName: 'Martin',
        nickname: 'La Flèche',
        position: 'Attaquante',
        age: 23,
        height: 172,
        strongFoot: 'Gauche',
        anecdote: 'Sa vitesse est telle qu\'elle arrive souvent au stade avant le bus de l\'équipe.',
        awards: ['Soulier d\'Or Régional 2022'],
        goals: 25,
        assists: 15,
        photoUrl: 'https://picsum.photos/seed/player2/400/500',
        pac: 80,
        sho: 80,
        pas: 65,
        dri: 75,
        def: 25,
        phy: 55,
        unassignedPoints: 2,
    },
    {
        id: 3,
        firstName: 'Lucas',
        lastName: 'Bernard',
        nickname: 'Le Maestro',
        position: 'Milieu de Terrain',
        age: 26,
        height: 178,
        strongFoot: 'Ambidextre',
        anecdote: 'Il a une collection de plus de 200 paires de crampons, une pour chaque type de pelouse imaginable.',
        awards: ['Meilleur Passeur 2023'],
        goals: 12,
        assists: 22,
        photoUrl: 'https://picsum.photos/seed/player3/400/500',
        pac: 68,
        sho: 70,
        pas: 85,
        dri: 80,
        def: 45,
        phy: 52,
        unassignedPoints: 1,
    },
];

export const mockRanking: TeamStats[] = [
    { rank: 1, name: 'FC LIDO', played: 15, wins: 12, draws: 2, losses: 1, goalsFor: 45, goalsAgainst: 10, goalDifference: 35, points: 38 },
    { rank: 2, name: 'AS La Seyne', played: 15, wins: 10, draws: 3, losses: 2, goalsFor: 35, goalsAgainst: 15, goalDifference: 20, points: 33 },
    { rank: 3, name: 'US Ollioules', played: 15, wins: 9, draws: 4, losses: 2, goalsFor: 30, goalsAgainst: 12, goalDifference: 18, points: 31 },
    { rank: 4, name: 'Six-Fours FC', played: 15, wins: 8, draws: 2, losses: 5, goalsFor: 28, goalsAgainst: 20, goalDifference: 8, points: 26 },
];


const today = new Date();
const formatDate = (date: Date): string => date.toISOString().split('T')[0];
const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};


export const mockMatches: Match[] = [
    { id: 1, date: formatDate(addDays(today, -7)), opponent: 'AS La Seyne', home: true, score: '3-1', result: 'W', scorers: ['Léa Martin (2)', 'Lucas Bernard'], summary: 'Superbe victoire à domicile...', photos: ['https://picsum.photos/seed/match1/800/600', 'https://picsum.photos/seed/match1-2/800/600'] },
    { id: 2, date: formatDate(addDays(today, -14)), opponent: 'US Ollioules', home: false, score: '1-1', result: 'D', scorers: ['Léa Martin'], summary: 'Match nul arraché à l\'extérieur...', photos: ['https://picsum.photos/seed/match2/800/600'] },
    { id: 3, date: formatDate(addDays(today, -21)), opponent: 'Six-Fours FC', home: true, score: '2-0', result: 'W', scorers: ['Lucas Bernard', 'Jean Dupont'], summary: 'Victoire maîtrisée...', photos: ['https://picsum.photos/seed/match3/800/600', 'https://picsum.photos/seed/match3-2/800/600'] },
];

export const mockCalendarEvents: CalendarEvent[] = [
    { id: 1, date: addDays(today, 7), title: 'Match vs AS La Seyne', type: EventType.Match },
    { id: 2, date: addDays(today, 2), title: 'Entraînement tactique', type: EventType.Training },
    { id: 3, date: addDays(today, 18), title: 'Tournoi de l\'été', type: EventType.Tournament },
    { id: 4, date: addDays(today, 45), title: 'Trêve estivale', type: EventType.Break },
    { id: 5, date: addDays(today, -5), title: 'Réunion de bureau', type: EventType.Extra },
];

export const mockClubInfo: ClubInfo = {
    president: 'M. Le Président',
    treasurer: 'Mme. La Trésorière',
    coach: 'Coach Tactico',
    steward: 'M. L\'Intendant',
    awards: ['Champion Régional 2021', 'Coupe du Var 2019'],
    news: [
        { id: 1, title: 'Le FC LIDO recrute !', content: 'Nous cherchons de nouveaux talents pour la saison prochaine. Contactez-nous !', date: formatDate(addDays(today, -3)) },
        { id: 2, title: 'Nouveau maillot dévoilé', content: 'Découvrez nos nouvelles couleurs pour la saison 2024-2025 : le rose et noir sont à l\'honneur !', date: formatDate(addDays(today, -10)) },
    ]
};