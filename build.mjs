import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';

// Gestion de __dirname (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔹 Nettoyage du dossier dist
const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
  console.log('🧹 Dossier "dist" nettoyé.');
}

// 🔹 Build du bundle JS/TS
await build({
  entryPoints: ['src/index.tsx'],
  bundle: true,
  minify: true,
  sourcemap: true,
  outdir: 'dist',
  target: ['es2017'],
  platform: 'browser',
  loader: {
    '.ts': 'ts',
    '.tsx': 'tsx',
  },
});

console.log('✅ Code compilé avec succès.');

// 🔹 Copie manuelle du dossier "public" → "dist"
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  fs.mkdirSync(distDir, { recursive: true });

  // Copie chaque fichier depuis public vers dist
  const copyRecursive = (src, dest) => {
    for (const file of fs.readdirSync(src)) {
      const srcPath = path.join(src, file);
      const destPath = path.join(dest, file);
      const stat = fs.statSync(srcPath);
      if (stat.isDirectory()) {
        fs.mkdirSync(destPath, { recursive: true });
        copyRecursive(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }
  };

  copyRecursive(publicDir, distDir);
  console.log('📂 Dossier "public" copié vers "dist".');
}

console.log('✅ Build terminé avec succès !');
