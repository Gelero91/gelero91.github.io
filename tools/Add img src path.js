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
    return `<img id="${id}" src="${base64Data}" style="display:block;" alt="${id}" />\n`;
}

// Fonction pour ajouter ou créer une div#assets et y insérer les nouvelles balises <img>
function addImagesToAssetsDiv(htmlContent, imgTags) {
    const divId = 'assets';
    const divRegex = new RegExp(`<div[^>]+id=["']${divId}["'][^>]*>`, 'i');
    
    if (divRegex.test(htmlContent)) {
        // Si la div#assets existe déjà, insérer les nouvelles balises <img> dedans
        console.log(`Div #${divId} trouvée, ajout des nouvelles balises <img>.`);
        return htmlContent.replace(divRegex, match => `${match}\n${imgTags}`);
    } else {
        // Si la div#assets n'existe pas, la créer avant la fermeture de </body>
        console.log(`Div #${divId} non trouvée, création et ajout des nouvelles balises <img>.`);
        const newDiv = `<div id="${divId}">\n${imgTags}</div>\n`;
        return htmlContent.replace('</body>', `${newDiv}</body>`);
    }
}

// Lire le contenu du fichier HTML
console.log(`Lecture du fichier HTML : ${htmlFilePath}`);
fs.readFile(htmlFilePath, 'utf-8', (err, htmlContent) => {
    if (err) {
        console.error('Erreur lors de la lecture du fichier HTML:', err);
        return;
    }

    // Lire tous les fichiers PNG dans le dossier assets
    console.log(`Lecture du dossier assets : ${assetsDir}`);
    fs.readdir(assetsDir, (err, files) => {
        if (err) {
            console.error('Erreur lors de la lecture du dossier assets:', err);
            return;
        }

        // Filtrer pour ne garder que les fichiers PNG
        const pngFiles = files.filter(file => path.extname(file).toLowerCase() === '.png');
        console.log(`Fichiers PNG trouvés dans assets : ${pngFiles.join(', ')}`);

        // Générer les nouvelles balises <img>
        let newImgTags = '';
        pngFiles.forEach(file => {
            const filePath = path.join(assetsDir, file);
            const base64Data = convertImageToBase64(filePath);
            newImgTags += generateImgTag(file, base64Data);
            console.log(`Balise <img> générée pour le fichier : ${file}`);
        });

        // Ajouter ou créer la div#assets et y insérer les balises <img>
        const updatedHtmlContent = addImagesToAssetsDiv(htmlContent, newImgTags);

        // Écrire le nouveau contenu HTML dans le fichier original
        console.log(`Écriture des nouvelles balises <img> dans la div #assets du fichier HTML : ${htmlFilePath}`);
        fs.writeFile(htmlFilePath, updatedHtmlContent, (err) => {
            if (err) {
                console.error('Erreur lors de l\'enregistrement du fichier HTML mis à jour:', err);
                return;
            }
            console.log(`Les nouvelles balises <img> ont été ajoutées avec succès dans ${htmlFilePath}`);
        });
    });
});
