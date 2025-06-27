let htmlContent = fs.readFileSync(htmlFile, 'utf-8');

// 6. Supconst fs = require('fs');
const path = require('path');

// Fichiers d'entrée et sortie
const htmlFile = './index.html';
const mapsFile = './maps.txt';

console.log('=== Intégration simple des cartes ===');

// 1. Lire le fichier maps.txt
console.log('Lecture de maps.txt...');
const mapsContent = fs.readFileSync(mapsFile, 'utf-8');

// 2. Extraire le tableau de cartes
console.log('Extraction des cartes...');
const match = mapsContent.match(/const maps = (\[[\s\S]*?\]);/);
if (!match) {
    console.error('❌ Impossible de trouver "const maps = [...]" dans maps.txt');
    process.exit(1);
}

let mapsArrayString = match[1];

// 3. Nettoyer les commentaires JavaScript
console.log('Nettoyage des commentaires...');
mapsArrayString = mapsArrayString
    .replace(/\/\/.*$/gm, '')        // Supprimer les commentaires de ligne
    .replace(/\/\*[\s\S]*?\*\//g, '') // Supprimer les commentaires multi-lignes
    .replace(/,\s*([}\]])/g, '$1');   // Supprimer les virgules en trop

const mapsArray = JSON.parse(mapsArrayString);
console.log(`✅ ${mapsArray.length} cartes trouvées`);

// 4. Créer le script à insérer
const scriptToInsert = `<script id="embedded-maps">
// Cartes intégrées automatiquement
const EMBEDDED_MAPS = ${JSON.stringify(mapsArray, null, 2)};

// Fonction simple pour récupérer les cartes
function getEmbeddedMaps() {
    return EMBEDDED_MAPS;
}

console.log('🗺️ Cartes intégrées chargées:', EMBEDDED_MAPS.length);
</script>`;

// 5. Lire le fichier HTML
console.log('Lecture de index.html...');
let htmlContent = fs.readFileSync(htmlFile, 'utf-8');

// 5. Supprimer l'ancien script s'il existe
htmlContent = htmlContent.replace(/<script id="embedded-maps">[\s\S]*?<\/script>/g, '');

// 6. Insérer le nouveau script avant </head>
if (htmlContent.includes('</head>')) {
    htmlContent = htmlContent.replace('</head>', scriptToInsert + '\n</head>');
} else {
    htmlContent = htmlContent.replace('</body>', scriptToInsert + '\n</body>');
}

// 7. Sauvegarder le fichier HTML
console.log('Écriture de index.html...');
fs.writeFileSync(htmlFile, htmlContent);

console.log('✅ Terminé ! Les cartes sont maintenant intégrées dans index.html');
console.log(`📊 ${mapsArray.length} cartes disponibles via getEmbeddedMaps()`);