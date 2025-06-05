const fs = require('fs');
const path = require('path');

// Chemin vers le fichier HTML
const htmlFilePath = path.join(__dirname, 'index.html');

// Dossier contenant les fichiers PNG
const assetsDir = path.join(__dirname, 'assets');

// Fonction pour convertir un fichier PNG en base64
function convertImageToBase64(filePath) {
    const imageBuffer = fs.readFileSync(filePath);
    return `data:image/png;base64,${imageBuffer.toString('base64')}`;
}

// Fonction pour générer une balise <img> avec style display:block
function generateImgTag(fileName, base64Data) {
    const id = path.parse(fileName).name; // Utiliser le nom du fichier sans extension comme ID
    return `    <img id="${id}" src="${base64Data}" style="display:block;" alt="${id}" />`;
}

// Fonction pour supprimer complètement la div#assets existante
function removeExistingAssetsDiv(htmlContent) {
    const divAssetsRegex = /<div[^>]*id=["']assets["'][^>]*>[\s\S]*?<\/div>/i;
    const match = htmlContent.match(divAssetsRegex);
    
    if (match) {
        console.log('Suppression de la div #assets existante...');
        return htmlContent.replace(divAssetsRegex, '');
    } else {
        console.log('Aucune div #assets existante trouvée.');
        return htmlContent;
    }
}

// Fonction pour créer une nouvelle div#assets avec toutes les images
function createNewAssetsDiv(imgTags) {
    if (imgTags.length === 0) {
        console.log('Aucune image à ajouter, la div #assets ne sera pas créée.');
        return '';
    }
    
    console.log(`Création d'une nouvelle div #assets avec ${imgTags.length} images...`);
    return `<div id="assets">\n${imgTags.join('\n')}\n</div>\n`;
}

// Fonction pour insérer la nouvelle div#assets avant </body>
function insertNewAssetsDiv(htmlContent, newAssetsDiv) {
    if (!newAssetsDiv) {
        return htmlContent;
    }
    
    return htmlContent.replace('</body>', `${newAssetsDiv}</body>`);
}

// Fonction principale
function rebuildAssets() {
    console.log(`=== Reconstruction complète des assets ===`);
    console.log(`Fichier HTML : ${htmlFilePath}`);
    console.log(`Dossier assets : ${assetsDir}`);
    
    // Vérifier que le fichier HTML existe
    if (!fs.existsSync(htmlFilePath)) {
        console.error(`Erreur : Le fichier HTML n'existe pas : ${htmlFilePath}`);
        return;
    }
    
    // Vérifier que le dossier assets existe
    if (!fs.existsSync(assetsDir)) {
        console.error(`Erreur : Le dossier assets n'existe pas : ${assetsDir}`);
        return;
    }
    
    try {
        // Lire le contenu du fichier HTML
        console.log(`Lecture du fichier HTML...`);
        let htmlContent = fs.readFileSync(htmlFilePath, 'utf-8');
        
        // Supprimer complètement la div#assets existante
        htmlContent = removeExistingAssetsDiv(htmlContent);
        
        // Lire tous les fichiers PNG dans le dossier assets
        console.log(`Lecture du dossier assets...`);
        const files = fs.readdirSync(assetsDir);
        const pngFiles = files.filter(file => path.extname(file).toLowerCase() === '.png');
        
        if (pngFiles.length === 0) {
            console.log('Aucun fichier PNG trouvé dans le dossier assets.');
            console.log('Le fichier HTML a été nettoyé (div #assets supprimée).');
        } else {
            console.log(`Fichiers PNG trouvés (${pngFiles.length}) : ${pngFiles.join(', ')}`);
            
            // Générer toutes les balises <img>
            const imgTags = [];
            const processedFiles = [];
            const errorFiles = [];
            
            pngFiles.forEach(file => {
                const filePath = path.join(assetsDir, file);
                const imageId = path.parse(file).name;
                
                try {
                    console.log(`Traitement de : ${file}`);
                    const base64Data = convertImageToBase64(filePath);
                    const imgTag = generateImgTag(file, base64Data);
                    imgTags.push(imgTag);
                    processedFiles.push(file);
                } catch (error) {
                    console.error(`Erreur lors du traitement de ${file}:`, error.message);
                    errorFiles.push(file);
                }
            });
            
            // Créer la nouvelle div#assets
            const newAssetsDiv = createNewAssetsDiv(imgTags);
            
            // Insérer la nouvelle div dans le HTML
            htmlContent = insertNewAssetsDiv(htmlContent, newAssetsDiv);
            
            // Afficher le résumé
            console.log(`\n=== Résumé du traitement ===`);
            console.log(`✓ Images traitées avec succès : ${processedFiles.length}`);
            if (errorFiles.length > 0) {
                console.log(`✗ Images en erreur : ${errorFiles.length} (${errorFiles.join(', ')})`);
            }
        }
        
        // Écrire le fichier mis à jour
        console.log(`\nÉcriture du fichier HTML mis à jour...`);
        fs.writeFileSync(htmlFilePath, htmlContent);
        
        console.log(`=== Reconstruction terminée avec succès ===`);
        if (pngFiles.length > 0) {
            console.log(`La div #assets a été reconstruite avec ${pngFiles.length} images.`);
        }
        
    } catch (error) {
        console.error('Erreur lors de la reconstruction des assets:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Option pour faire un backup avant la modification
function createBackup() {
    const backupPath = htmlFilePath + '.backup.' + Date.now();
    try {
        fs.copyFileSync(htmlFilePath, backupPath);
        console.log(`Backup créé : ${backupPath}`);
        return true;
    } catch (error) {
        console.error('Erreur lors de la création du backup:', error.message);
        return false;
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

// Exécuter la fonction principale
// Changez le paramètre à false si vous ne voulez pas de backup
rebuildAssetsWithBackup(true);