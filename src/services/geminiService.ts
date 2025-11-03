import { Player } from '../types';

// The backend server URL. All Gemini API calls will go through this server.
// For a unified deployment (backend serving frontend), a relative path is best.
const BACKEND_URL = '';

const backendConnectionError = `
******************************************************************
[ERREUR DE CONNEXION AU BACKEND]
Impossible de contacter le serveur à l'adresse : ${BACKEND_URL || 'locale'}

SOLUTION PROBABLE :
Le serveur backend n'est probablement pas démarré.
1. Ouvrez un nouveau terminal.
2. Naviguez jusqu'au dossier racine de ce projet.
3. Exécutez 'npm install' (si c'est la première fois).
4. Exécutez 'npm start' pour lancer le serveur.

Vous devriez voir le message "⚽️ Serveur backend du FC Lido lancé..."
dans le terminal du serveur.
******************************************************************
`;

const connectionErrorMessage = `La communication avec le serveur a échoué. Assurez-vous que le serveur backend est bien démarré (tapez 'npm start' dans le terminal du projet).`;


export const generateFunFact = async (player: Player): Promise<string> => {
    const prompt = `Génère une anecdote amusante, courte et originale (une seule phrase) pour un joueur de football fictif. L'anecdote doit être dans le style d'un fait "Le saviez-vous ?". Ne répète pas les informations fournies.

    Nom: ${player.firstName} ${player.lastName}
    Surnom: ${player.nickname}
    Poste: ${player.position}
    Âge: ${player.age}
    Pied fort: ${player.strongFoot}

    Exemple : "On dit qu'il peut lacer ses chaussures en moins de 3 secondes, même avec des gants de gardien."
    
    Ton anecdote :`;

    try {
        const response = await fetch(`${BACKEND_URL}/generate-fun-fact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Le serveur a répondu avec le statut ${response.status}`);
        }

        const data = await response.json();
        return data.fact;

    } catch (error) {
        console.error("Erreur de communication avec le backend pour l'anecdote:", error);
        console.error(backendConnectionError);
        throw new Error(connectionErrorMessage);
    }
};

/**
 * Removes diacritics from a string.
 * e.g., "Zlatan Ibrahimović" -> "Zlatan Ibrahimovic"
 */
function removeDiacritics(str: string): string {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export const generatePaniniImage = async (playerName: string): Promise<string> => {
    const sanitizedPlayerName = removeDiacritics(playerName);
    const prompt = `A Panini-style collectible sticker of the legendary football player ${sanitizedPlayerName}, in the aesthetic of the 1982 World Cup album. The image should look like a scanned vintage sticker, with a portrait of the player in their national team kit from that era. Include characteristic off-set printing artifacts and a slightly faded color palette. The background should be a simple, solid light blue color, typical of stickers from that period. The composition must be a head and shoulders portrait. Do not include any text, logos, or borders on the image itself.`;
    
    try {
        const response = await fetch(`${BACKEND_URL}/generate-panini-image`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Le serveur a répondu avec le statut ${response.status}`);
        }
        
        const data = await response.json();
        return data.imageUrl;

    } catch (error) {
        console.error(`Erreur de communication avec le backend pour l'image de ${playerName}:`, error);
        console.error(backendConnectionError);
        throw new Error(connectionErrorMessage);
    }
};