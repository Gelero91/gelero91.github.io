const fs = require('fs');
const path = require('path');

// Chemin vers le fichier data.js
const dataJsFilePath = path.join(__dirname, 'data.js');

// Dossier de sortie pour les fichiers PNG extraits
const outputDir = path.join(__dirname, 'extracted_assets');

// Fonction pour créer le dossier de sortie s'il n'existe pas
function ensureOutputDir() {
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
        console.log(`Dossier de sortie créé : ${outputDir}`);
    }
}

// Fonction pour extraire le base64 d'une chaîne data URL
function extractBase64FromDataUrl(dataUrl) {
    const matches = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
    if (matches && matches.length === 3) {
        return {
            format: matches[1],
            base64: matches[2]
        };
    }
    return null;
}

// Fonction pour convertir base64 en fichier image
function saveBase64AsImage(fileName, base64Data, format = 'png') {
    const buffer = Buffer.from(base64Data, 'base64');
    const filePath = path.join(outputDir, `${fileName}.${format}`);
    
    fs.writeFileSync(filePath, buffer);
    return filePath;
}

// Fonction pour parser le fichier data.js et extraire l'objet IMAGES
function parseDataJsFile(content) {
    try {
        // Créer un contexte isolé pour évaluer le code
        const sandbox = {};
        
        // Utiliser une fonction pour capturer les variables
        const wrappedCode = `
            (function() {
                ${content}
                return typeof IMAGES !== 'undefined' ? IMAGES : null;
            })()
        `;
        
        // Évaluer le code de manière sécurisée
        const images = eval(wrappedCode);
        
        if (!images) {
            console.error('Aucun objet IMAGES trouvé dans le fichier data.js');
            return null;
        }
        
        return images;
    } catch (error) {
        console.error('Erreur lors du parsing du fichier data.js:', error.message);
        return null;
    }
}

// Fonction pour nettoyer les noms de fichiers
function sanitizeFileName(name) {
    // Remplacer les caractères problématiques
    return name.replace(/[<>:"/\\|?*]/g, '_');
}

// Fonction principale d'extraction
function extractAssets() {
    console.log(`=== Extraction des assets depuis data.js ===`);
    console.log(`Fichier source : ${dataJsFilePath}`);
    console.log(`Dossier de sortie : ${outputDir}\n`);
    
    // Vérifier que le fichier data.js existe
    if (!fs.existsSync(dataJsFilePath)) {
        console.error(`Erreur : Le fichier data.js n'existe pas : ${dataJsFilePath}`);
        return;
    }
    
    try {
        // Créer le dossier de sortie
        ensureOutputDir();
        
        // Lire le contenu du fichier data.js
        console.log('Lecture du fichier data.js...');
        const dataJsContent = fs.readFileSync(dataJsFilePath, 'utf-8');
        
        // Parser le fichier pour extraire l'objet IMAGES
        console.log('Analyse du contenu...\n');
        const images = parseDataJsFile(dataJsContent);
        
        if (!images || typeof images !== 'object') {
            console.error('Impossible de trouver ou parser l\'objet IMAGES dans data.js');
            return;
        }
        
        const imageCount = Object.keys(images).length;
        console.log(`${imageCount} image(s) trouvée(s) dans l'objet IMAGES\n`);
        
        // Extraire chaque image
        const extracted = [];
        const errors = [];
        
        for (const [name, dataUrl] of Object.entries(images)) {
            process.stdout.write(`Extraction de '${name}'... `);
            
            try {
                // Vérifier que c'est bien une data URL
                if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
                    throw new Error('Format de données invalide');
                }
                
                // Extraire le base64 et le format
                const imageData = extractBase64FromDataUrl(dataUrl);
                if (!imageData) {
                    throw new Error('Impossible d\'extraire les données base64');
                }
                
                // Sauvegarder l'image
                const fileName = sanitizeFileName(name);
                const filePath = saveBase64AsImage(fileName, imageData.base64, imageData.format);
                
                extracted.push({
                    name: name,
                    fileName: `${fileName}.${imageData.format}`,
                    format: imageData.format,
                    size: Buffer.from(imageData.base64, 'base64').length
                });
                
                console.log('✓');
            } catch (error) {
                console.log('✗');
                console.error(`  Erreur: ${error.message}`);
                errors.push({ name, error: error.message });
            }
        }
        
        // Afficher le résumé
        console.log(`\n=== Résumé de l'extraction ===`);
        console.log(`✓ Images extraites avec succès : ${extracted.length}`);
        
        if (extracted.length > 0) {
            console.log(`\nDétails des images extraites :`);
            extracted.forEach(img => {
                const sizeKB = (img.size / 1024).toFixed(2);
                console.log(`  - ${img.fileName} (${sizeKB} KB)`);
            });
        }
        
        if (errors.length > 0) {
            console.log(`\n✗ Erreurs lors de l'extraction : ${errors.length}`);
            errors.forEach(err => {
                console.log(`  - ${err.name}: ${err.error}`);
            });
        }
        
        console.log(`\n=== Extraction terminée ===`);
        if (extracted.length > 0) {
            console.log(`Les images ont été extraites dans : ${outputDir}`);
        }
        
    } catch (error) {
        console.error('\nErreur lors de l\'extraction des assets:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Fonction pour nettoyer le dossier de sortie avant extraction
function cleanOutputDir() {
    if (fs.existsSync(outputDir)) {
        const files = fs.readdirSync(outputDir);
        files.forEach(file => {
            const filePath = path.join(outputDir, file);
            if (fs.statSync(filePath).isFile() && file.match(/\.(png|jpg|jpeg|gif|webp)$/i)) {
                fs.unlinkSync(filePath);
            }
        });
        console.log('Dossier de sortie nettoyé\n');
    }
}

// Fonction principale avec options
function extractAssetsWithOptions(cleanFirst = false) {
    if (cleanFirst) {
        console.log('=== Nettoyage du dossier de sortie ===');
        cleanOutputDir();
    }
    
    extractAssets();
}

// Analyser les arguments de ligne de commande
const args = process.argv.slice(2);
const cleanFirst = args.includes('--clean') || args.includes('-c');
const helpRequested = args.includes('--help') || args.includes('-h');

// Afficher l'aide si demandée
if (helpRequested) {
    console.log(`
Utilisation: node ExtractAssetsFromDataJS.js [options]

Options:
  -c, --clean    Nettoyer le dossier de sortie avant l'extraction
  -h, --help     Afficher cette aide

Exemple:
  node ExtractAssetsFromDataJS.js --clean
    `);
    process.exit(0);
}

// Exécuter l'extraction
extractAssetsWithOptions(cleanFirst);