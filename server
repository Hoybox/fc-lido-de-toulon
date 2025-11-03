// Use CommonJS syntax for Node.js backend
const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs'); // Import the 'fs' module for file system checks
const { GoogleGenAI, Modality } = require('@google/genai');

// 1. Load environment variables from a .env file
dotenv.config();

// 2. Critical check for the API key. The variable MUST be named API_KEY.
const apiKey = process.env.API_KEY;
if (!apiKey) {
    console.error("ERREUR CRITIQUE : La variable API_KEY n'est pas définie dans votre fichier .env ou dans les secrets du service.");
    process.exit(1); 
}

// 3. Initialize the GoogleGenAI client with the correct modern syntax
const ai = new GoogleGenAI({ apiKey });

const app = express();
// Render provides the PORT environment variable. Use it, otherwise fallback to 3001.
const port = process.env.PORT || 3001;

// 4. Enable CORS to allow requests from your frontend application
app.use(cors());
app.use(bodyParser.json());

// --- SERVE FRONTEND STATIC FILES ---
const buildPath = path.join(__dirname, 'dist');

// --- PRE-START CHECK ---
// Check if the build files exist before starting the server. This prevents the ENOENT error.
const indexPath = path.join(buildPath, 'index.html');
if (!fs.existsSync(indexPath)) {
    console.error("\n\n❌ ERREUR : Le fichier 'dist/index.html' est introuvable.");
    console.error("Cela signifie que le build de l'application n'a pas été effectué ou a échoué.");
    console.error("\n👉 VEUILLEZ SUIVRE CES ÉTAPES :");
    console.error("1. Arrêtez ce serveur (Ctrl+C), s'il est en cours d'exécution.");
    console.error("2. Exécutez la commande : npm run build");
    console.error("3. Assurez-vous qu'il n'y a pas d'erreurs pendant le build.");
    console.error("4. Si le build réussit, redémarrez le serveur : npm start\n");
    process.exit(1); // Stop the server from starting if build is missing.
}

app.use(express.static(buildPath));


// --- API ENDPOINTS ---

// Endpoint to generate a fun fact for a player
app.post("/generate-fun-fact", async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: "Le corps de la requête doit contenir un 'prompt'." });
        }
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.8,
                maxOutputTokens: 100,
            }
        });

        res.json({ fact: response.text.trim().replace(/^"|"$/g, '') });

    } catch (error) {
        console.error("Erreur lors de l'appel à l'API Gemini pour l'anecdote :", error);
        res.status(500).json({ error: "Échec de la génération de l'anecdote." });
    }
});

// Endpoint to generate a Panini-style image
app.post("/generate-panini-image", async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt) {
            return res.status(400).json({ error: "Le corps de la requête doit contenir un 'prompt'." });
        }

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [{ text: prompt }] },
            config: { responseModalities: [Modality.IMAGE] },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes = part.inlineData.data;
                const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
                return res.json({ imageUrl });
            }
        }

        throw new Error("Aucune donnée d'image trouvée dans la réponse de Gemini.");

    } catch (error) {
        console.error("Erreur lors de l'appel à l'API Gemini pour l'image Panini :", error);
        res.status(500).json({ error: "Échec de la génération de l'image Panini." });
    }
});

// --- FALLBACK FOR REACT ROUTER ---
// For any request that doesn't match an API endpoint or a static file,
// serve the main index.html file. This allows React to handle all the page routing.
app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
});


app.listen(port, () => {
    console.log(`⚽️ Serveur FC Lido lancé sur le port ${port}`);
    console.log("✅ Clé API chargée avec succès.");
    console.log("Frontend servi depuis le dossier 'dist'.");
    console.log("En attente des requêtes...");
});