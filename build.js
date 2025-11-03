// build.js
const esbuild = require('esbuild');
const fs = require('fs-extra');
const path = require('path');

async function build() {
    const distPath = path.join(__dirname, 'dist');
    
    try {
        // 1. Assurer que le dossier 'dist' est propre et existe.
        console.log("Nettoyage du dossier 'dist'...");
        await fs.emptyDir(distPath);
        console.log("Dossier 'dist' nettoyé.");

        // 2. Construire le code TypeScript/React en un seul bundle.
        console.log("Construction du bundle JavaScript avec esbuild...");
        await esbuild.build({
            entryPoints: ['index.tsx'],
            bundle: true,
            outfile: path.join(distPath, 'bundle.js'),
            // Configuration robuste pour TypeScript et React
            loader: { '.ts': 'ts', '.tsx': 'tsx' },
            resolveExtensions: ['.tsx', '.ts', '.js', '.json'], 
            jsx: 'automatic',
            tsconfig: 'tsconfig.json',
            minify: true,
            sourcemap: true,

            // 🎯 CORRECTION MAJEURE : Indiquer à esbuild de cibler le navigateur.
            platform: 'browser',
            target: 'es2020',

            // ❌ CORRECTION: On supprime 'react' et 'react-dom' des external. 
            // Nous voulons qu'ils soient inclus et transpilés dans le bundle.js.
            // On garde uniquement les dépendances Node.js du serveur (qui ne doivent pas être dans le frontend).
            external: ['@google/genai'],
        });
        console.log("Bundle JavaScript créé avec succès.");

        // 3. Copier le fichier index.html principal dans le dossier 'dist'.
        console.log("Copie de index.html vers 'dist'...");
        const sourceHtmlPath = path.join(__dirname, 'index.html');
        const destHtmlPath = path.join(distPath, 'index.html');
        await fs.copy(sourceHtmlPath, destHtmlPath);

        // 4. Modifier le tag <script> dans le fichier HTML copié.
        console.log("Modification du tag <script> dans dist/index.html...");
        let htmlContent = await fs.readFile(destHtmlPath, 'utf-8');
        htmlContent = htmlContent.replace(
            '<script type="module" src="/index.tsx"></script>',
            '<script type="module" src="/bundle.js"></script>'
        );


        await fs.writeFile(destHtmlPath, htmlContent);
        console.log("Tag <script> mis à jour.");

        console.log("\n✅ Build terminé avec succès ! Prêt pour le déploiement.");

    } catch (error) {
        console.error("❌ Une erreur est survenue pendant le build :", error);
        process.exit(1);
    }
}

build();