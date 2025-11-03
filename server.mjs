// server.mjs
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

// ✅ Recrée __dirname pour ES modules :
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// 🔹 Sert les fichiers du dossier "dist"
app.use(express.static(path.join(__dirname, 'dist')));

// 🔹 Route principale (index.html)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur en ligne sur http://localhost:${PORT}`);
});
