// build.mjs
import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Gestion de __dirname (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 🔹 Nettoyage du dossier dist
const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
  console.log('🧹 Dossier "dist" nettoyé.');
}

// 🔹 Étape 1 : Compiler TailwindCSS
console.log('🎨 Compilation de TailwindCSS...');
try {
  execSync('npx tailwindcss -i ./src/index.css -o ./dist/index.css --minify', { stdio: 'inherit' });
  console.log('✅ Fichier CSS généré avec Tailwind.');
} catch (err) {
  console.error('❌ Erreur pendant la compilation Tailwind:', err);
  process.exit(1);
}

// 🔹 Étape 2 : Build du bundle JS/TS
console.log('⚙️ Compilation du code React/TypeScript...');
await build({
  entryPoints: ['src/index.tsx'],
  bundle: true,
  minify: true,
  sourcemap: false,
  outdir: 'dist',
  target: ['es2017'],
  platform: 'browser',
  loader: {
    '.ts': 'ts',
    '.tsx': 'tsx',
    '.png': 'file',
    '.jpg': 'file',
    '.jpeg': 'file',
    '.svg': 'file',
  },
});
console.log('✅ Code compilé avec succès.');

// 🔹 Étape 3 : Copie du dossier public
const publicDir = path.join(__dirname, 'public');
if (fs.existsSync(publicDir)) {
  fs.mkdirSync(distDir, { recursive: true });

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

console.log('🚀 Build terminé avec succès !');
