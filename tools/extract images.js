const fs = require('fs');
const path = require('path');

// Chemin vers le fichier HTML
const htmlFilePath = 'index.html';

// Dossier pour enregistrer les images
const assetsDir = path.join(__dirname, 'assets');

// Vérifier si le dossier "assets" existe, sinon le créer
if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir);
}

// Fonction pour extraire les images encodées en base64 avec un id obligatoire
function extractBase64ImagesWithId(htmlContent) {
    // Regex pour capturer les balises <img> avec id, gérant les sauts de ligne dans src
    const regex = /<img[^>]*?id=["']([^"']+)["'][^>]*?src=["']data:image\/[^;]+;base64,([^"']+)["']/gs;
    let match;
    const images = [];

    while ((match = regex.exec(htmlContent)) !== null) {
        const id = match[1];  // Récupérer l'attribut id de l'image
        const base64Content = match[2].replace(/\s+/g, '');  // Supprimer les sauts de ligne
        images.push({
            id: id,
            base64: base64Content
        });
    }

    return images;
}

// Fonction pour enregistrer une image base64 en tant que fichier PNG
function saveBase64ImageAsPng(imageId, base64Data) {
    const filePath = path.join(assetsDir, `${imageId}.png`);
    
    // Convertir base64 en buffer
    const imageBuffer = Buffer.from(base64Data, 'base64');
    
    // Écrire le buffer dans un fichier .png
    fs.writeFile(filePath, imageBuffer, (err) => {
        if (err) {
            console.error(`Erreur lors de l'enregistrement de ${imageId}.png:`, err);
            return;
        }
        console.log(`${imageId}.png a été enregistré avec succès.`);
    });
}

// Lire le fichier HTML
fs.readFile(htmlFilePath, 'utf-8', (err, htmlContent) => {
    if (err) {
        console.error('Erreur lors de la lecture du fichier HTML:', err);
        return;
    }

    // Extraire les images encodées en base64 avec un ID exact
    const base64Images = extractBase64ImagesWithId(htmlContent);

    // Enregistrer chaque image en tant que fichier PNG
    base64Images.forEach(image => {
        saveBase64ImageAsPng(image.id, image.base64);
    });
});
