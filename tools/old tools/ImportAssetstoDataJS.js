const fs = require('fs');
const path = require('path');

// Chemin vers le fichier data.js
const dataJsFilePath = path.join(__dirname, 'data.js');

// Dossier contenant les fichiers PNG
const assetsDir = path.join(__dirname, 'assets');

// Fonction pour convertir un fichier PNG en base64
function convertImageToBase64(filePath) {
    const imageBuffer = fs.readFileSync(filePath);
    return `data:image/png;base64,${imageBuffer.toString('base64')}`;
}

// Fonction pour créer un nom de variable valide à partir du nom de fichier
function createVariableName(fileName) {
    const name = path.parse(fileName).name;
    // Remplacer les caractères non valides par des underscores
    return name.replace(/[^a-zA-Z0-9_]/g, '_').replace(/^(\d)/, '_$1');
}

// Fonction pour générer le contenu du fichier data.js
function generateDataJsContent(imageData) {
    let content = '// Fichier généré automatiquement par ImportAssetsToDataJS.js\n';
    content += '// Ne pas modifier manuellement\n\n';
    
    // Créer l'objet IMAGES principal
    content += 'const IMAGES = {\n';
    
    // Ajouter chaque image
    const entries = [];
    for (const [varName, base64] of Object.entries(imageData)) {
        entries.push(`    ${varName}: "${base64}"`);
    }
    
    content += entries.join(',\n');
    content += '\n};\n\n';
    
    // Optionnel : créer des variables individuelles pour chaque image
    content += '// Variables individuelles pour accès direct (optionnel)\n';
    for (const [varName, base64] of Object.entries(imageData)) {
        content += `const IMG_${varName.toUpperCase()} = IMAGES.${varName};\n`;
    }
    
    return content;
}

// Fonction pour créer un backup
function createBackup() {
    if (!fs.existsSync(dataJsFilePath)) {
        console.log('Aucun fichier data.js existant, pas de backup nécessaire.');
        return true;
    }
    
    const backupPath = dataJsFilePath + '.backup.' + Date.now();
    try {
        fs.copyFileSync(dataJsFilePath, backupPath);
        console.log(`Backup créé : ${backupPath}`);
        return true;
    } catch (error) {
        console.error('Erreur lors de la création du backup:', error.message);
        return false;
    }
}

// Fonction principale
function rebuildAssets() {
    console.log(`=== Reconstruction des assets dans data.js ===`);
    console.log(`Fichier data.js : ${dataJsFilePath}`);
    console.log(`Dossier assets : ${assetsDir}`);
    
    // Vérifier que le dossier assets existe
    if (!fs.existsSync(assetsDir)) {
        console.error(`Erreur : Le dossier assets n'existe pas : ${assetsDir}`);
        return;
    }
    
    try {
        // Lire tous les fichiers PNG dans le dossier assets
        console.log(`\nLecture du dossier assets...`);
        const files = fs.readdirSync(assetsDir);
        const pngFiles = files.filter(file => path.extname(file).toLowerCase() === '.png');
        
        if (pngFiles.length === 0) {
            console.log('Aucun fichier PNG trouvé dans le dossier assets.');
            return;
        }
        
        console.log(`Fichiers PNG trouvés (${pngFiles.length}) :`);
        pngFiles.forEach(file => console.log(`  - ${file}`));
        
        // Convertir toutes les images en base64
        const imageData = {};
        const processedFiles = [];
        const errorFiles = [];
        
        console.log(`\nConversion des images en base64...`);
        pngFiles.forEach(file => {
            const filePath = path.join(assetsDir, file);
            const varName = createVariableName(file);
            
            try {
                process.stdout.write(`Traitement de ${file}... `);
                const base64Data = convertImageToBase64(filePath);
                imageData[varName] = base64Data;
                processedFiles.push(file);
                console.log('✓');
            } catch (error) {
                console.log('✗');
                console.error(`  Erreur: ${error.message}`);
                errorFiles.push(file);
            }
        });
        
        // Générer le contenu du fichier data.js
        console.log(`\nGénération du fichier data.js...`);
        const dataJsContent = generateDataJsContent(imageData);
        
        // Écrire le fichier
        fs.writeFileSync(dataJsFilePath, dataJsContent);
        
        // Afficher le résumé
        console.log(`\n=== Résumé du traitement ===`);
        console.log(`✓ Images traitées avec succès : ${processedFiles.length}`);
        if (errorFiles.length > 0) {
            console.log(`✗ Images en erreur : ${errorFiles.length}`);
            errorFiles.forEach(file => console.log(`  - ${file}`));
        }
        
        console.log(`\n=== Conversion terminée avec succès ===`);
        console.log(`Le fichier data.js a été créé/mis à jour avec ${processedFiles.length} images.`);
        
        // Afficher un exemple d'utilisation
        console.log(`\nExemple d'utilisation dans votre code :`);
        console.log(`  // Accès via l'objet IMAGES`);
        const firstVarName = Object.keys(imageData)[0];
        if (firstVarName) {
            console.log(`  const img = new Image();`);
            console.log(`  img.src = IMAGES.${firstVarName};`);
            console.log(`  // ou`);
            console.log(`  img.src = IMG_${firstVarName.toUpperCase()};`);
        }
        
    } catch (error) {
        console.error('\nErreur lors de la reconstruction des assets:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Fonction principale avec option de backup
function rebuildAssetsWithBackup(createBackupFirst = true) {
    if (createBackupFirst) {
        console.log('=== Création d\'un backup ===');
        if (!createBackup()) {
            console.log('Abandon de l\'opération à cause de l\'échec du backup.');
            return;
        }
        console.log('');
    }
    
    rebuildAssets();
}

// Ajouter une option pour surveiller les changements (optionnel)
function watchAssets() {
    console.log(`\n=== Mode surveillance activé ===`);
    console.log(`Surveillance du dossier : ${assetsDir}`);
    console.log('Appuyez sur Ctrl+C pour arrêter\n');
    
    fs.watch(assetsDir, (eventType, filename) => {
        if (filename && path.extname(filename).toLowerCase() === '.png') {
            console.log(`\nChangement détecté : ${filename}`);
            rebuildAssetsWithBackup(false);
        }
    });
}

// Analyser les arguments de ligne de commande
const args = process.argv.slice(2);
const watchMode = args.includes('--watch') || args.includes('-w');

// Exécuter la fonction principale
rebuildAssetsWithBackup(true);

// Si le mode watch est activé
if (watchMode) {
    watchAssets();
}