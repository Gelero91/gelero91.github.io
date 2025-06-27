        // Sprites de base pré-configurés
        // XYZ

// Sprites : Structure et fonctionnement

            // Types de sprites avec comportements spécifiques :
            // 0 = Décoration sans interaction (non bloquant)
            // 1 = Décoration alternative (bloquant)
            // 2 = PNJ avec dialogues
            // 3 = Marchand (boutique avec items)
            // 4 = Quest giver (donneur de quêtes - non implémenté)
            // 5 = Quest end (fin de quête/interaction spéciale)
            // 6 = Coffre au trésor (avec loot)
            // 10 = Sprites décoratifs multiples (génère 2 sprites herbe aléatoires)
            // "A" = Ennemi (combat, IA, loot)
            // "DOOR" = Porte intérieur/extérieur (téléportation 2 cases)
            // "EXIT" = Sortie vers carte suivante
            
            // Structure des données sprites : [ID, x, y, type, texture, face, name, dialogue, items, hp, dmg, lootClass]
            // ID : Identifiant unique (0 réservé pour type 10 et sprite de combat)
            // x, y : Position en coordonnées de grille
            // type : Type de comportement (voir ci-dessus)
            // texture : ID de texture (1-23) :
            //   1=PNJ1, 2=PNJ2, 3=Garde, 4=Roche, 5=Tonneau, 6=Buisson, 7=Pancarte,
            //   8=Slime, 9=Trésor, 10=Cadavre, 11=Statue, 12=Brasier, 13=Herbes,
            //   14=Gobelin, 15=Arbre, 16=Colonne, 17=Sac, 18=Sac (var),
            //   19=Animation slash, 20=Animation spark, 21=Coffre ouvert, 
            //   22=Chauve-souris, 23=liannes vivantes
            // face : Face pour dialogues (ex: "faceGuard", "facePlayer")
            // name : Nom du sprite
            // dialogue : Tableaux de dialogues [[face, nom, texte], ...]
            // items : Items vendus pour marchands [1,2,3,...]
            // hp : Points de vie (défaut: 4 pour ennemis)
            // dmg : Dégâts (défaut: 3 pour ennemis)
            // lootClass : Classe de loot (lettres a-f ou nombre direct pour item)

            // textures :
            // Textures disponibles pour les sprites

            /*
                1  = PNJ1               // voleur
                2  = garde              // garde
                3  = PNJ2               // marchant
                4  = Roche              // Roche
                5  = Tonneau            // Tonneau
                6  = Buisson            // Buisson
                7  = Pancarte           // Pancarte
                8  = Slime              // Slime
                9  = Trésor             // Coffre au trésor
                10 = Cadavre            // Cadavre ("dead enemy skull")
                11 = Statue             // Statue
                12 = Brasier            // Brasier
                13 = Herbes             // Herbes (weeds)
                14 = Gobelin            // Gobelin
                15 = Arbre              // Arbre
                16 = Colonne            // Colonne
                17 = Sac                // Sac
                18 = Sac (variante)     // Sac (autre version)
                19 = Animation slash    // Animation d'attaque slash
                20 = Animation spark    // Animation d'étincelles/magie
                21 = Coffre ouvert      // Coffre ouvert
                22 = chauve souris
                23 = liane vivante               
                */

       const BASE_SPRITES = {
    // PNJ, SHOP
    guard: {
        type: 2,
        texture: 3,  // ← Corrigé : texture Garde au lieu de PNJ2
        name: "Garde du Temple",
        face: "faceGuard",
        dialogues: [
            ["facePlayer", "Aventurier", "Bonjour, j'aimerais vous aider."],
            ["faceGuard", "Garde du Temple", "Salut aventurier ! Nous avons besoin d'aide dans le temple, les cryptes sont envahies par des créatures."],
            ["facePlayer", "Aventurier", "Merci pour l'info, je vais m'en occuper."]
        ],
        items: [],
        hp: 10,
        damage: 0,
        lootClass: 0
    },
    merchant: {
        type: 3,
        texture: 1,
        name: "Quill le Marchand",
        face: "faceMerchant",
        dialogues: [
            ["facePlayer", "Aventurier", "Salut !"],
            ["faceMerchant", "Quill le Marchand", "Hé mon pote ! Tu veux acheter quelque chose ?"],
            ["facePlayer", "Aventurier", "D'accord, peut-être plus tard."]
        ],
        items: [1, 2, 3, 4, 5, 6, 7, 8],
        hp: 1,
        damage: 0,
        lootClass: 0
    },

    villager: {
        type: 2,
        texture: 2,
        name: "Villageois",
        face: "faceThief",
        dialogues: [
            ["facePlayer", "%PLAYER%", "Bonjour, j'aimerais vous aider."],
            ["faceGuard", "villagegeois", "Salut aventurier ! Nous avons besoin d'aide dans le temple, les cryptes sont envahies par des créatures."],
            ["facePlayer", "%PLAYER%", "Merci pour l'info, je vais m'en occuper."]
        ],
        items: [],
        hp: 10,
        damage: 0,
        lootClass: 0
    },
    
    // ENNEMIS (avec lettres pour lootClass)
    slime: {
        type: 'A',
        texture: 8,  // Texture Imp pour slime
        name: "Slime",
        face: null,
        dialogues: [],
        items: [],
        hp: 4,
        damage: 2,
        lootClass: "b"  // ← 5-15 or, 10% chance item
    },
    bat: {
        type: 'A',
        texture: 22,
        name: "Chauve-souris",
        face: null,
        dialogues: [],
        items: [],
        hp: 2,
        damage: 1,
        lootClass: "b"  // ← 5-15 or, 10% chance item
    },
    gobelin: {
        type: 'A',
        texture: 14,  // Texture Imp pour gobelin
        name: "Gobelin",
        face: null,
        dialogues: [],
        items: [],
        hp: 5,
        damage: 3,
        lootClass: "c"  // ← 10-30 or, 20% chance item
    },
    imp: {
        type: 'A',
        texture: 23,
        name: "Plante Vivante",
        face: null,
        dialogues: [],
        items: [],
        hp: 3,
        damage: 6,
        lootClass: "d"  // ← 25-60 or, 30% chance item
    },

    // LOOTS - Coffres avec loot aléatoire
    chestA: {
        type: 6,
        texture: 9,
        name: "Coffre au Trésor commun",
        face: null,
        dialogues: [],
        items: [],
        hp: 1,
        damage: 0,
        lootClass: "b"  // ← 5-15 or, 10% chance item [1,2]
    },
    chestB: {
        type: 6,
        texture: 9,
        name: "Coffre au Trésor peu commun",
        face: null,
        dialogues: [],
        items: [],
        hp: 1,
        damage: 0,
        lootClass: "c"  // ← 10-30 or, 20% chance item [1,2,5]
    },
    chestC: {
        type: 6,
        texture: 9,
        name: "Coffre au Trésor rare",
        face: null,
        dialogues: [],
        items: [],
        hp: 1,
        damage: 0,
        lootClass: "d"  // ← 25-60 or, 30% chance item [1,2,3,5]
    },
    chestD: {
        type: 6,
        texture: 9,
        name: "Coffre au Trésor épique",
        face: null,
        dialogues: [],
        items: [],
        hp: 1,
        damage: 0,
        lootClass: "e"  // ← 50-120 or, 50% chance item [2,3,4,5]
    },
    chestE: {
        type: 6,
        texture: 9,
        name: "Coffre au Trésor incroyable",
        face: null,
        dialogues: [],
        items: [],
        hp: 1,
        damage: 0,
        lootClass: "f"  // ← 100-250 or, 70% chance item [3,4,5]
    },
    
    // DECORATION
    palm: {
        type: 0,  // Non bloquant
        texture: 15,  // Texture arbre
        name: "Palmier",
        face: null,
        dialogues: [],
        items: [],
        hp: 1,
        damage: 0,
        lootClass: 0
    },
    weeds: {
        type: 10,  // ← Type 10 génère 2 sprites herbe supplémentaires
        texture: 13,  // Texture herbes
        name: "Hautes herbes",
        face: null,
        dialogues: [],
        items: [],
        hp: 1,
        damage: 0,
        lootClass: 0
    },
    barrel: {
        type: 1,  // ← Type 1 pour tonneau bloquant
        texture: 5,  // Texture tonneau
        name: "Tonneau",
        face: null,
        dialogues: [],
        items: [],
        hp: 1,
        damage: 0,
        lootClass: 0
    },
    bag: {
        type: 1,  // Non bloquant (peut marcher dessus)
        texture: 17,  // Texture sac
        name: "Sac",
        face: null,
        dialogues: [],
        items: [],
        hp: 1,
        damage: 0,
        lootClass: 0
    },
    column: {
        type: 1,  // ← Type 1 pour colonne bloquante
        texture: 16,  // Texture colonne
        name: "Colonne",
        face: null,
        dialogues: [],
        items: [],
        hp: 1,
        damage: 0,
        lootClass: 0
    },
    statue: {
        type: 1,  // ← Type 1 pour statue bloquante
        texture: 11,  // Texture statue
        name: "Statue",
        face: null,
        dialogues: [],
        items: [],
        hp: 1,
        damage: 0,
        lootClass: 0
    },
    
    // SYSTEM
    door: {
        type: 'DOOR',
        texture: 16,  // Texture colonne utilisée comme porte
        name: "Porte",
        face: null,
        dialogues: [],
        items: [],
        hp: 1,
        damage: 0,
        lootClass: 0
    },
    exit: {
        type: 'EXIT',
        texture: 16,  // Texture colonne utilisée comme sortie
        name: "Sortie du Niveau",
        face: null,
        dialogues: [],
        items: [],
        hp: 1,
        damage: 0,
        lootClass: 0
    }
};// Application State
        
 // Fonction pour peupler dynamiquement la section des sprites de base
        function populateBaseSpritesSection() {
            const baseSpritesContainer = document.querySelector('.base-sprites-section');
            if (!baseSpritesContainer) return;

            // Effacer le contenu existant
            baseSpritesContainer.innerHTML = '<h4>⚡ Sprites Pré-configurés</h4>';

            // Catégories de sprites pour un meilleur regroupement
            const categories = {
                'PNJ et Shop': ['guard', 'merchant', 'villager'],
                'Ennemis': ['slime', 'bat', 'gobelin', 'imp'],
                'Coffres': ['chestA', 'chestB', 'chestC', 'chestD', 'chestE'],
                'Décoration': ['palm', 'weeds', 'barrel', 'bag', 'column', 'statue'],
                'Système': ['door', 'exit']
            };

            // Créer des sections par catégorie
            Object.entries(categories).forEach(([categoryName, spriteKeys]) => {
                const categorySection = document.createElement('div');
                categorySection.innerHTML = `<h5 style="margin-top: 10px; color: var(--success-color);">${categoryName}</h5>`;

                spriteKeys.forEach(spriteKey => {
                    const sprite = BASE_SPRITES[spriteKey];
                    if (!sprite) return;

                    const spriteItem = document.createElement('div');
                    spriteItem.className = 'base-sprite-item';
                    
                    // Déterminer l'emoji ou l'icône en fonction du type
                    let emoji = '❓';
                    switch(sprite.type) {
                        case 'A': emoji = '⚔️'; break;
                        case 2: emoji = '💬'; break;
                        case 3: emoji = '🏪'; break;
                        case 6: emoji = '📦'; break;
                        case 'EXIT': emoji = '🚪'; break;
                        case 'DOOR': emoji = '🔒'; break;
                        case 0: emoji = '🌿'; break;
                        case 1: emoji = '🧱'; break;
                    }

                    spriteItem.innerHTML = `
                        <span>${emoji} ${sprite.name}</span>
                        <button class="btn small" onclick="placeBaseSprite('${spriteKey}')">Placer</button>
                    `;

                    categorySection.appendChild(spriteItem);
                });

                baseSpritesContainer.appendChild(categorySection);
            });
        }

        // Modification de placeBaseSprite pour permettre le placement répétitif
        function placeBaseSprite(spriteKey) {
            if (!BASE_SPRITES[spriteKey]) {
                showStatus('Sprite de base non trouvé', 'error');
                return;
            }
            
            APP_STATE.baseSpriteMode = spriteKey;
            APP_STATE.spriteMode = 'place';
            APP_STATE.customSpritePlacementMode = false; // Assurer qu'on n'est pas en mode placement personnalisé
            showStatus(`Mode placement: ${BASE_SPRITES[spriteKey].name} (Mode répétitif)`, 'ok');
            updateToolDisplay(); // Pour montrer le mode actif
        }

        // Méthode pour ajouter dynamiquement de nouveaux sprites de base
        function addNewBaseSprite(spriteKey, spriteConfig) {
            if (BASE_SPRITES[spriteKey]) {
                console.warn(`Un sprite avec la clé ${spriteKey} existe déjà.`);
                return;
            }

            // Valider la configuration minimale
            const requiredFields = ['type', 'texture', 'name'];
            for (let field of requiredFields) {
                if (!spriteConfig[field]) {
                    console.error(`Le champ ${field} est obligatoire pour ajouter un sprite.`);
                    return;
                }
            }

            // Définir des valeurs par défaut
            spriteConfig = {
                face: null,
                dialogues: [],
                items: [],
                hp: 1,
                damage: 0,
                lootClass: 0,
                ...spriteConfig
            };

            // Ajouter le nouveau sprite à BASE_SPRITES
            BASE_SPRITES[spriteKey] = spriteConfig;

            // Regénérer la section des sprites de base
            populateBaseSpritesSection();

            // Notification
            showStatus(`Nouveau sprite "${spriteConfig.name}" ajouté`, 'ok');
        }

        // Méthode pour supprimer un sprite existant
        function removeBaseSprite(spriteKey) {
            if (!BASE_SPRITES[spriteKey]) {
                console.warn(`Aucun sprite trouvé avec la clé ${spriteKey}.`);
                return;
            }

            // Supprimer le sprite
            const spriteName = BASE_SPRITES[spriteKey].name;
            delete BASE_SPRITES[spriteKey];

            // Regénérer la section
            populateBaseSpritesSection();

            // Notification
            showStatus(`Sprite "${spriteName}" supprimé`, 'warning');
        }


const APP_STATE = {
            // Current tab and tool
            currentTab: 'terrain',
            currentSpriteSubtab: 'base',
            drawingTool: 'brush',
            selectedTerrain: 0,
            selectedFloorTexture: null,
            terrainMode: 'terrain', // 'terrain' ou 'floorTexture'
            spriteMode: 'place',
            selectedSpriteType: 0,
            
            // Current map
            currentMapId: null,
            map: Array(24).fill().map(() => Array(24).fill(0)),
            sprites: [],
            teleporters: [],
            
            // All maps storage
            allMaps: new Map(),
            
            // History
            history: [],
            historyIndex: -1,
            
            // Selection and drawing
            selectedCell: null,
            selectedSprite: null,
            selectedTeleporter: null,
            teleportPlacementMode: null,
            playerPositionMode: false,
            
            // Drawing state
            isDrawing: false,
            drawStart: null,
            currentMousePos: null,
            
            // UI state
            isDirty: false,
            
            // Sprite creation
            baseSpriteMode: null,
            customSpriteConfig: null,
            customSpritePlacementMode: false
        };

        // Faces disponibles pour les dialogues
        const AVAILABLE_FACES = [
            'facePlayer', 'faceGuard', 'faceMerchant', 'faceThief', 
            'faceWizard', 'faceKing', 'faceQueen', 'faceVillager'
        ];

        // Initialize the application
        function init() {
            initializeBorders();
            createGrid();
            createCoordinateLabels();
            loadAllMaps();
            createNewMap();
            updateDisplay();
            setupEventListeners();
            validateCurrentMap();
            updateToolDisplay();
            
            // Nouveau : peupler les sprites de base
            populateBaseSpritesSection();
        }

        // Create coordinate labels
        function createCoordinateLabels() {
            const coordX = document.getElementById('coord-x');
            const coordY = document.getElementById('coord-y');
            
            coordX.innerHTML = '';
            coordY.innerHTML = '';
            
            for (let i = 0; i < 24; i++) {
                const label = document.createElement('div');
                label.className = 'coord-label';
                label.textContent = i;
                coordX.appendChild(label);
            }
            
            for (let i = 0; i < 24; i++) {
                const label = document.createElement('div');
                label.className = 'coord-label';
                label.textContent = i;
                coordY.appendChild(label);
            }
        }

        // Initialize borders
        function initializeBorders() {
            for (let y = 0; y < 24; y++) {
                for (let x = 0; x < 24; x++) {
                    if (x === 0 || x === 23 || y === 0 || y === 23) {
                        APP_STATE.map[y][x] = 1;
                    }
                }
            }
        }

        // Create the grid
        function createGrid() {
            const grid = document.getElementById('map-grid');
            grid.innerHTML = '';
            
            for (let y = 0; y < 24; y++) {
                for (let x = 0; x < 24; x++) {
                    const cell = document.createElement('div');
                    cell.className = 'cell';
                    cell.dataset.x = x;
                    cell.dataset.y = y;
                    
                    cell.addEventListener('mousedown', (e) => handleCellMouseDown(x, y, e));
                    cell.addEventListener('mouseenter', (e) => {
                        handleCellMouseEnter(x, y, e);
                        updateCoordinates(x, y);
                    });
                    cell.addEventListener('mouseup', () => handleCellMouseUp(x, y));
                    cell.addEventListener('contextmenu', (e) => {
                        e.preventDefault();
                        handleRightClick(x, y);
                    });
                    
                    grid.appendChild(cell);
                }
            }
        }

        // Mouse event handlers
        function handleCellMouseDown(x, y, e) {
            e.preventDefault();
            
            if (APP_STATE.playerPositionMode) {
                handlePlayerPositionClick(x, y);
                return;
            }
            
            APP_STATE.isDrawing = true;
            APP_STATE.drawStart = {x, y};
            APP_STATE.currentMousePos = {x, y};
            
            if (APP_STATE.currentTab === 'terrain') {
                if (APP_STATE.drawingTool === 'brush' || APP_STATE.drawingTool === 'fill') {
                    handleTerrainClick(x, y);
                } else if (APP_STATE.drawingTool === 'rectangle' || APP_STATE.drawingTool === 'line') {
                    updateDrawingPreview();
                }
            } else if (APP_STATE.currentTab === 'sprites') {
                handleSpriteClick(x, y);
            } else if (APP_STATE.currentTab === 'teleports') {
                handleTeleportClick(x, y);
            }
        }

        function handleCellMouseEnter(x, y, e) {
            APP_STATE.currentMousePos = {x, y};
            
            if (APP_STATE.isDrawing) {
                if (APP_STATE.currentTab === 'terrain') {
                    if (APP_STATE.drawingTool === 'brush') {
                        handleTerrainClick(x, y, false);
                    } else if (APP_STATE.drawingTool === 'rectangle' || APP_STATE.drawingTool === 'line') {
                        updateDrawingPreview();
                    }
                }
            }
        }

        function handleCellMouseUp(x, y) {
            if (APP_STATE.isDrawing && APP_STATE.currentTab === 'terrain') {
                if (APP_STATE.drawingTool === 'rectangle' && APP_STATE.drawStart) {
                    saveToHistory();
                    const value = APP_STATE.terrainMode === 'floorTexture' ? APP_STATE.selectedFloorTexture : APP_STATE.selectedTerrain;
                    drawRectangle(APP_STATE.drawStart.x, APP_STATE.drawStart.y, x, y, value);
                    markDirty();
                    updateDisplay();
                    validateCurrentMap();
                } else if (APP_STATE.drawingTool === 'line' && APP_STATE.drawStart) {
                    saveToHistory();
                    const value = APP_STATE.terrainMode === 'floorTexture' ? APP_STATE.selectedFloorTexture : APP_STATE.selectedTerrain;
                    drawLine(APP_STATE.drawStart.x, APP_STATE.drawStart.y, x, y, value);
                    markDirty();
                    updateDisplay();
                    validateCurrentMap();
                }
            }
            
            APP_STATE.isDrawing = false;
            APP_STATE.drawStart = null;
            removeDrawingPreview();
        }

        // Drawing preview for rectangle and line tools
        function updateDrawingPreview() {
            removeDrawingPreview();
            
            if (!APP_STATE.drawStart || !APP_STATE.currentMousePos) return;
            
            const preview = document.createElement('div');
            preview.className = 'drawing-preview';
            preview.id = 'drawing-preview';
            
            if (APP_STATE.drawingTool === 'rectangle') {
                const x1 = Math.min(APP_STATE.drawStart.x, APP_STATE.currentMousePos.x);
                const y1 = Math.min(APP_STATE.drawStart.y, APP_STATE.currentMousePos.y);
                const x2 = Math.max(APP_STATE.drawStart.x, APP_STATE.currentMousePos.x);
                const y2 = Math.max(APP_STATE.drawStart.y, APP_STATE.currentMousePos.y);
                
                preview.style.left = `${x1 * 21 + 1}px`;
                preview.style.top = `${y1 * 21 + 1}px`;
                preview.style.width = `${(x2 - x1 + 1) * 21 - 1}px`;
                preview.style.height = `${(y2 - y1 + 1) * 21 - 1}px`;
            } else if (APP_STATE.drawingTool === 'line') {
                // Pour la ligne, on pourrait afficher les cellules traversées
                // Pour l'instant, on affiche juste un rectangle entre les deux points
                const x1 = Math.min(APP_STATE.drawStart.x, APP_STATE.currentMousePos.x);
                const y1 = Math.min(APP_STATE.drawStart.y, APP_STATE.currentMousePos.y);
                const x2 = Math.max(APP_STATE.drawStart.x, APP_STATE.currentMousePos.x);
                const y2 = Math.max(APP_STATE.drawStart.y, APP_STATE.currentMousePos.y);
                
                preview.style.left = `${x1 * 21 + 1}px`;
                preview.style.top = `${y1 * 21 + 1}px`;
                preview.style.width = `${(x2 - x1 + 1) * 21 - 1}px`;
                preview.style.height = `${(y2 - y1 + 1) * 21 - 1}px`;
                preview.style.opacity = '0.5';
            }
            
            document.querySelector('.grid').appendChild(preview);
        }

        function removeDrawingPreview() {
            const preview = document.getElementById('drawing-preview');
            if (preview) preview.remove();
        }

        // Terrain handling
        function handleTerrainClick(x, y, saveHistory = true) {
            if ((x === 0 || x === 23 || y === 0 || y === 23) && (APP_STATE.selectedTerrain === 0 || APP_STATE.terrainMode === 'floorTexture')) {
                showStatus('Les bordures doivent rester des murs', 'error');
                return;
            }
            
            if (saveHistory) saveToHistory();
            
            if (APP_STATE.terrainMode === 'floorTexture') {
                // Apply floor texture only to traversable cells
                if (Math.floor(APP_STATE.map[y][x]) === 0) {
                    switch (APP_STATE.drawingTool) {
                        case 'brush':
                            APP_STATE.map[y][x] = APP_STATE.selectedFloorTexture;
                            break;
                        case 'fill':
                            floodFillTexture(x, y, APP_STATE.selectedFloorTexture);
                            break;
                    }
                } else {
                    showStatus('Les textures de sol ne peuvent être appliquées que sur des cases traversables', 'warning');
                    return;
                }
            } else {
                switch (APP_STATE.drawingTool) {
                    case 'brush':
                        APP_STATE.map[y][x] = APP_STATE.selectedTerrain;
                        break;
                    case 'fill':
                        floodFill(x, y, APP_STATE.selectedTerrain);
                        break;
                }
            }
            
            markDirty();
            updateDisplay();
            validateCurrentMap();
        }

        // Flood fill algorithm
        function floodFill(startX, startY, newValue) {
            const originalValue = APP_STATE.map[startY][startX];
            if (originalValue === newValue) return;
            
            const stack = [{x: startX, y: startY}];
            const visited = new Set();
            
            while (stack.length > 0) {
                const {x, y} = stack.pop();
                const key = `${x},${y}`;
                
                if (visited.has(key)) continue;
                visited.add(key);
                
                if (x < 0 || x >= 24 || y < 0 || y >= 24) continue;
                if (APP_STATE.map[y][x] !== originalValue) continue;
                
                if ((x === 0 || x === 23 || y === 0 || y === 23) && newValue === 0) continue;
                
                APP_STATE.map[y][x] = newValue;
                
                stack.push({x: x+1, y}, {x: x-1, y}, {x, y: y+1}, {x, y: y-1});
            }
        }

        // Flood fill for floor textures
        function floodFillTexture(startX, startY, newValue) {
            const originalValue = APP_STATE.map[startY][startX];
            // Only fill if starting on a traversable cell
            if (Math.floor(originalValue) !== 0) return;
            
            const stack = [{x: startX, y: startY}];
            const visited = new Set();
            
            while (stack.length > 0) {
                const {x, y} = stack.pop();
                const key = `${x},${y}`;
                
                if (visited.has(key)) continue;
                visited.add(key);
                
                if (x < 0 || x >= 24 || y < 0 || y >= 24) continue;
                // Only fill traversable cells with same texture
                if (Math.floor(APP_STATE.map[y][x]) !== 0) continue;
                if (APP_STATE.map[y][x] === newValue) continue;
                
                // Don't fill borders
                if (x === 0 || x === 23 || y === 0 || y === 23) continue;
                
                APP_STATE.map[y][x] = newValue;
                
                stack.push({x: x+1, y}, {x: x-1, y}, {x, y: y+1}, {x, y: y-1});
            }
        }

        // Draw rectangle
        function drawRectangle(x1, y1, x2, y2, value) {
            const minX = Math.min(x1, x2);
            const maxX = Math.max(x1, x2);
            const minY = Math.min(y1, y2);
            const maxY = Math.max(y1, y2);
            
            for (let y = minY; y <= maxY; y++) {
                for (let x = minX; x <= maxX; x++) {
                    if ((x === 0 || x === 23 || y === 0 || y === 23) && (value === 0 || value < 1)) continue;
                    
                    if (APP_STATE.terrainMode === 'floorTexture') {
                        // Only apply texture to traversable cells
                        if (Math.floor(APP_STATE.map[y][x]) === 0) {
                            APP_STATE.map[y][x] = value;
                        }
                    } else {
                        APP_STATE.map[y][x] = value;
                    }
                }
            }
        }

        // Draw line
        function drawLine(x1, y1, x2, y2, value) {
            const dx = Math.abs(x2 - x1);
            const dy = Math.abs(y2 - y1);
            const sx = x1 < x2 ? 1 : -1;
            const sy = y1 < y2 ? 1 : -1;
            let err = dx - dy;
            
            let x = x1;
            let y = y1;
            
            while (true) {
                if (!((x === 0 || x === 23 || y === 0 || y === 23) && (value === 0 || value < 1))) {
                    if (APP_STATE.terrainMode === 'floorTexture') {
                        // Only apply texture to traversable cells
                        if (Math.floor(APP_STATE.map[y][x]) === 0) {
                            APP_STATE.map[y][x] = value;
                        }
                    } else {
                        APP_STATE.map[y][x] = value;
                    }
                }
                
                if (x === x2 && y === y2) break;
                
                const e2 = 2 * err;
                if (e2 > -dy) {
                    err -= dy;
                    x += sx;
                }
                if (e2 < dx) {
                    err += dx;
                    y += sy;
                }
            }
        }

        // Player position mode
        function setPlayerPositionMode() {
            APP_STATE.playerPositionMode = true;
            showStatus('Cliquez sur la grille pour placer la position de départ du joueur', 'ok');
            updateToolDisplay();
        }

        function handlePlayerPositionClick(x, y) {
            if (x === 0 || x === 23 || y === 0 || y === 23) {
                showStatus('Le joueur ne peut pas démarrer sur les bordures', 'error');
                return;
            }
            
            if (Math.floor(APP_STATE.map[y][x]) !== 0) {
                showStatus('Le joueur doit démarrer sur une case traversable', 'error');
                return;
            }
            
            document.getElementById('player-x').value = x;
            document.getElementById('player-y').value = y;
            
            APP_STATE.playerPositionMode = false;
            updatePlayerPosition();
            showStatus(`Position du joueur définie en [${y}, ${x}]`, 'ok');
            updateToolDisplay();
        }

        // Update player position display
        function updatePlayerPosition() {
            markDirty();
            updateDisplay();
            validateCurrentMap();
        }

        // Sprite subtab switching
        function switchSpriteSubtab(subtab) {
            document.querySelectorAll('.sprite-subtab').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.sprite-subcontent').forEach(content => content.classList.remove('active'));
            
            event.target.classList.add('active');
            document.getElementById(`sprite-${subtab}-content`).classList.add('active');
            
            APP_STATE.currentSpriteSubtab = subtab;
            
            if (subtab === 'base') {
                APP_STATE.spriteMode = 'place';
            }
            
            updateToolDisplay();
        }

        // Sprite type change handler
        function onSpriteTypeChange() {
            const type = document.getElementById('sprite-type-select').value;
            const configArea = document.getElementById('sprite-config-area');
            
            configArea.innerHTML = '';
            
            switch(type) {
                case 'A': // Ennemi
                    configArea.innerHTML = `
                        <div class="config-section">
                            <h4>Configuration Ennemi</h4>
                            <div class="form-group">
                                <label>Points de vie</label>
                                <input type="number" class="form-control" id="sprite-hp" value="2" min="1">
                            </div>
                            <div class="form-group">
                                <label>Dégâts</label>
                                <input type="number" class="form-control" id="sprite-damage" value="1" min="1">
                            </div>
                            <div class="form-group">
                                <label>Classe de loot</label>
                                <select class="form-control" id="sprite-lootclass">
                                    <option value="0">0 - Pas de loot</option>
                                    <option value="1">1 - Très faible (5-15 or)</option>
                                    <option value="2">2 - Faible (10-30 or)</option>
                                    <option value="3">3 - Moyen (25-60 or)</option>
                                    <option value="4">4 - Fort (50-120 or)</option>
                                    <option value="5">5 - Très fort (100-250 or)</option>
                                </select>
                            </div>
                        </div>
                    `;
                    break;
                    
                case '2': // PNJ avec dialogues
                case '4': // Quest Giver
                    configArea.innerHTML = `
                        <div class="config-section">
                            <h4>Dialogues</h4>
                            <div id="editor-dialog-container"></div>
                            <button class="btn small" onclick="addEditorDialog()">Ajouter Dialogue</button>
                            <div class="dialog-preview" id="editor-dialog-preview" style="display: none; margin-top: 10px;">
                                <h5 style="font-size: 12px; margin-bottom: 5px;">Aperçu :</h5>
                                <div id="editor-dialog-preview-content"></div>
                            </div>
                        </div>
                    `;
                    break;
                    
                case '3': // Marchand
                    configArea.innerHTML = `
                        <div class="config-section">
                            <h4>Configuration Marchand</h4>
                            <div class="form-group">
                                <label>Items en vente</label>
                                <select class="form-control" id="editor-shop-item-select" onchange="addEditorShopItem()">
                                    <option value="">-- Ajouter un item --</option>
                                    <option value="1">1 - Shortsword</option>
                                    <option value="2">2 - Cape</option>
                                    <option value="3">3 - Magic sword</option>
                                    <option value="4">4 - Tunic</option>
                                    <option value="5">5 - Club</option>
                                    <option value="6">6 - Staff</option>
                                    <option value="7">7 - Armor</option>
                                    <option value="8">8 - Dagger</option>
                                </select>
                                <div class="shop-items-list" id="editor-shop-items-list"></div>
                            </div>
                            <h4 style="margin-top: 15px;">Dialogues</h4>
                            <div id="editor-dialog-container"></div>
                            <button class="btn small" onclick="addEditorDialog()">Ajouter Dialogue</button>
                        </div>
                    `;
                    APP_STATE.editorShopItems = [];
                    break;
                    
                case '6': // Coffre
                    configArea.innerHTML = `
                        <div class="config-section">
                            <h4>Configuration Coffre</h4>
                            <div class="form-group">
                                <label>Classe de loot</label>
                                <select class="form-control" id="sprite-lootclass">
                                    <option value="0">0 - Pas de loot</option>
                                    <option value="1">1 - Très faible (5-15 or)</option>
                                    <option value="2">2 - Faible (10-30 or)</option>
                                    <option value="3">3 - Moyen (25-60 or)</option>
                                    <option value="4">4 - Fort (50-120 or)</option>
                                    <option value="5">5 - Très fort (100-250 or)</option>
                                </select>
                            </div>
                        </div>
                    `;
                    break;
            }
        }

        // Editor dialog functions
        function addEditorDialog() {
            const container = document.getElementById('editor-dialog-container');
            if (!container) return;
            
            const dialogDiv = document.createElement('div');
            dialogDiv.className = 'dialog-entry';
            
            dialogDiv.innerHTML = `
                <div class="form-group">
                    <label>Face</label>
                    <select class="form-control dialog-face" onchange="updateEditorDialogPreview()">
                        ${AVAILABLE_FACES.map(face => `<option value="${face}">${face}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Nom</label>
                    <input type="text" class="form-control dialog-name" placeholder="Nom du personnage" onchange="updateEditorDialogPreview()">
                </div>
                <div class="form-group">
                    <label>Texte</label>
                    <textarea class="form-control dialog-text" rows="2" placeholder="Texte du dialogue" onchange="updateEditorDialogPreview()"></textarea>
                </div>
                <div class="dialog-controls">
                    <div class="dialog-move-buttons">
                        <button type="button" class="btn small" onclick="moveDialogUp(this)">↑</button>
                        <button type="button" class="btn small" onclick="moveDialogDown(this)">↓</button>
                    </div>
                    <button type="button" class="btn small danger" onclick="removeEditorDialog(this)">Supprimer</button>
                </div>
            `;
            
            container.appendChild(dialogDiv);
            updateEditorDialogPreview();
        }

        function removeEditorDialog(button) {
            button.closest('.dialog-entry').remove();
            updateEditorDialogPreview();
        }

        function moveDialogUp(button) {
            const entry = button.closest('.dialog-entry');
            const prev = entry.previousElementSibling;
            if (prev) {
                entry.parentNode.insertBefore(entry, prev);
                updateEditorDialogPreview();
            }
        }

        function moveDialogDown(button) {
            const entry = button.closest('.dialog-entry');
            const next = entry.nextElementSibling;
            if (next) {
                entry.parentNode.insertBefore(next, entry);
                updateEditorDialogPreview();
            }
        }

        function updateEditorDialogPreview() {
            const container = document.getElementById('editor-dialog-container');
            if (!container) return;
            
            const preview = document.getElementById('editor-dialog-preview');
            const previewContent = document.getElementById('editor-dialog-preview-content');
            
            if (!preview || !previewContent) return;
            
            const dialogEntries = container.querySelectorAll('.dialog-entry');
            
            if (dialogEntries.length === 0) {
                preview.style.display = 'none';
                return;
            }
            
            preview.style.display = 'block';
            previewContent.innerHTML = '';
            
            dialogEntries.forEach(entry => {
                const face = entry.querySelector('.dialog-face').value;
                const name = entry.querySelector('.dialog-name').value || 'Sans nom';
                const text = entry.querySelector('.dialog-text').value || '...';
                
                const previewEntry = document.createElement('div');
                previewEntry.className = 'dialog-preview-entry';
                previewEntry.innerHTML = `<span class="dialog-preview-face">${name}:</span> ${text}`;
                previewContent.appendChild(previewEntry);
            });
        }

        // Shop items management
        function addEditorShopItem() {
            const select = document.getElementById('editor-shop-item-select');
            const itemId = parseInt(select.value);
            
            if (!itemId || !APP_STATE.editorShopItems) return;
            
            if (APP_STATE.editorShopItems.includes(itemId)) {
                showStatus('Cet item est déjà dans la liste', 'warning');
                select.value = '';
                return;
            }
            
            APP_STATE.editorShopItems.push(itemId);
            updateEditorShopItemsList();
            select.value = '';
        }

        function updateEditorShopItemsList() {
            const container = document.getElementById('editor-shop-items-list');
            if (!container) return;
            
            container.innerHTML = '';
            
            const itemNames = {
                1: "Shortsword",
                2: "Cape", 
                3: "Magic sword",
                4: "Tunic",
                5: "Club",
                6: "Staff",
                7: "Armor",
                8: "Dagger"
            };
            
            APP_STATE.editorShopItems.forEach(itemId => {
                const chip = document.createElement('div');
                chip.className = 'shop-item-chip';
                chip.innerHTML = `
                    ${itemId} - ${itemNames[itemId] || 'Item'}
                    <span class="remove" onclick="removeEditorShopItem(${itemId})">×</span>
                `;
                container.appendChild(chip);
            });
        }

        function removeEditorShopItem(itemId) {
            const index = APP_STATE.editorShopItems.indexOf(itemId);
            if (index > -1) {
                APP_STATE.editorShopItems.splice(index, 1);
                updateEditorShopItemsList();
            }
        }

        // Start placing custom sprite
        function startPlacingCustomSprite() {
            const type = document.getElementById('sprite-type-select').value;
            const texture = parseInt(document.getElementById('sprite-texture-select').value);
            const name = document.getElementById('sprite-name-input').value || `Sprite ${type}`;
            
            // Collecter la configuration selon le type
            const config = {
                type: type,
                texture: texture,
                name: name,
                face: null,
                dialogues: [],
                items: [],
                hp: 1,
                damage: 0,
                lootClass: 0
            };
            
            // Configuration spécifique par type
            switch(type) {
                case 'A': // Ennemi
                    config.hp = parseInt(document.getElementById('sprite-hp')?.value || 2);
                    config.damage = parseInt(document.getElementById('sprite-damage')?.value || 1);
                    config.lootClass = parseInt(document.getElementById('sprite-lootclass')?.value || 0);
                    break;
                    
                case '2': // PNJ
                case '4': // Quest Giver
                    config.face = 'facePlayer';
                    config.dialogues = collectEditorDialogs();
                    break;
                    
                case '3': // Marchand
                    config.face = 'faceMerchant';
                    config.dialogues = collectEditorDialogs();
                    config.items = APP_STATE.editorShopItems || [];
                    break;
                    
                case '6': // Coffre
                    config.lootClass = parseInt(document.getElementById('sprite-lootclass')?.value || 0);
                    break;
            }
            
            APP_STATE.customSpriteConfig = config;
            APP_STATE.customSpritePlacementMode = true;
            APP_STATE.spriteMode = 'place';
            
            showStatus(`Cliquez sur la grille pour placer: ${name}`, 'ok');
            updateToolDisplay();
        }

        function collectEditorDialogs() {
            const container = document.getElementById('editor-dialog-container');
            if (!container) return [];
            
            const dialogEntries = container.querySelectorAll('.dialog-entry');
            const dialogues = [];
            
            dialogEntries.forEach(entry => {
                const face = entry.querySelector('.dialog-face').value;
                const name = entry.querySelector('.dialog-name').value;
                const text = entry.querySelector('.dialog-text').value;
                
                if (face && name && text) {
                    dialogues.push([face, name, text]);
                }
            });
            
            return dialogues;
        }

        // Sprite handling
        function handleSpriteClick(x, y) {
            if (APP_STATE.spriteMode === 'erase') {
                const spriteIndex = APP_STATE.sprites.findIndex(s => s.x === x && s.y === y);
                if (spriteIndex !== -1) {
                    saveToHistory();
                    APP_STATE.sprites.splice(spriteIndex, 1);
                    APP_STATE.selectedSprite = null;
                    markDirty();
                    updateDisplay();
                    updateCounts();
                }
            } else if (APP_STATE.spriteMode === 'select') {
                const sprite = APP_STATE.sprites.find(s => s.x === x && s.y === y);
                if (sprite) {
                    APP_STATE.selectedSprite = sprite;
                    document.getElementById('edit-sprite-btn').disabled = false;
                    showStatus(`Sprite sélectionné: ${sprite.name}`, 'ok');
                    
                    // Si on est dans l'onglet base, ouvrir automatiquement le modal
                    if (APP_STATE.currentSpriteSubtab === 'base') {
                        editSelectedSprite();
                    }
                } else {
                    APP_STATE.selectedSprite = null;
                    document.getElementById('edit-sprite-btn').disabled = true;
                }
                updateDisplay();
            } else if (APP_STATE.spriteMode === 'place') {
                saveToHistory();
                
                // Remove existing sprite at this position
                const existingIndex = APP_STATE.sprites.findIndex(s => s.x === x && s.y === y);
                if (existingIndex !== -1) {
                    APP_STATE.sprites.splice(existingIndex, 1);
                }
                
                let newSprite;

                if (APP_STATE.baseSpriteMode && BASE_SPRITES[APP_STATE.baseSpriteMode]) {
                    newSprite = createBaseSpriteAt(x, y, APP_STATE.baseSpriteMode);
                    // Ne pas réinitialiser baseSpriteMode pour permettre le placement répétitif
                    showStatus(`${newSprite.name} placé (mode répétitif actif)`, 'ok');
                    
                } else if (APP_STATE.customSpritePlacementMode && APP_STATE.customSpriteConfig) {
                    newSprite = createCustomSpriteAt(x, y, APP_STATE.customSpriteConfig);
                    APP_STATE.customSpritePlacementMode = false;
                    APP_STATE.customSpriteConfig = null;
                    showStatus(`${newSprite.name} placé`, 'ok');
                } else {
                    newSprite = createSprite(x, y, APP_STATE.selectedSpriteType);
                }
                
                APP_STATE.sprites.push(newSprite);
                
                markDirty();
                updateDisplay();
                updateCounts();
                updateToolDisplay();
            }
        }

        // Create custom sprite at position
        function createCustomSpriteAt(x, y, config) {
            const id = Math.max(0, ...APP_STATE.sprites.map(s => s.id || 0)) + 1;
            
            return {
                id: id,
                x: x,
                y: y,
                type: config.type,
                texture: config.texture,
                name: config.name,
                face: config.face,
                dialogues: JSON.parse(JSON.stringify(config.dialogues)),
                items: [...config.items],
                hp: config.hp,
                damage: config.damage,
                lootClass: config.lootClass
            };
        }

        // Place base sprite
    function placeBaseSprite(spriteKey) {
        if (!BASE_SPRITES[spriteKey]) {
            showStatus('Sprite de base non trouvé', 'error');
            return;
        }
        
        APP_STATE.baseSpriteMode = spriteKey;
        APP_STATE.spriteMode = 'place';
        APP_STATE.customSpritePlacementMode = false; // Assurer qu'on n'est pas en mode placement personnalisé
        showStatus(`Mode placement: ${BASE_SPRITES[spriteKey].name} (Mode répétitif)`, 'ok');
        updateToolDisplay(); // Pour montrer le mode actif
    }

        // Add all base sprites
        function addAllBaseSprites() {
            if (confirm('Ajouter tous les sprites de base à la carte ? (Garde, Marchand, Chauve-souris, Coffre, Sortie)')) {
                saveToHistory();
                
                let addedCount = 0;
                const positions = [
                    {x: 5, y: 5}, {x: 18, y: 5}, {x: 5, y: 18}, {x: 18, y: 18}, {x: 12, y: 12}
                ];
                
                Object.keys(BASE_SPRITES).forEach((key, index) => {
                    if (positions[index]) {
                        const pos = positions[index];
                        if (APP_STATE.map[pos.y][pos.x] === 0 && !APP_STATE.sprites.find(s => s.x === pos.x && s.y === pos.y)) {
                            const sprite = createBaseSpriteAt(pos.x, pos.y, key);
                            APP_STATE.sprites.push(sprite);
                            addedCount++;
                        }
                    }
                });
                
                markDirty();
                updateDisplay();
                updateCounts();
                showStatus(`${addedCount} sprites de base ajoutés`, 'ok');
            }
        }

        // Create base sprite at position
        function createBaseSpriteAt(x, y, spriteKey) {
            const baseConfig = BASE_SPRITES[spriteKey];
            const id = Math.max(0, ...APP_STATE.sprites.map(s => s.id || 0)) + 1;
            
            return {
                id: id,
                x: x,
                y: y,
                type: baseConfig.type,
                texture: baseConfig.texture,
                name: baseConfig.name,
                face: baseConfig.face,
                dialogues: JSON.parse(JSON.stringify(baseConfig.dialogues)),
                items: [...baseConfig.items],
                hp: baseConfig.hp,
                damage: baseConfig.damage,
                lootClass: baseConfig.lootClass
            };
        }

        // Create sprite object
        function createSprite(x, y, type) {
            const texture = parseInt(document.getElementById('sprite-texture')?.value || 1);
            const id = Math.max(0, ...APP_STATE.sprites.map(s => s.id || 0)) + 1;
            
            const sprite = {
                id: id,
                x: x,
                y: y,
                type: type,
                texture: texture,
                name: `${getSpriteTypeName(type)} ${id}`,
                face: null,
                dialogues: [],
                items: [],
                hp: type === 'A' ? 2 : 1,
                damage: type === 'A' ? 1 : 0,
                lootClass: 0
            };
            
            return sprite;
        }

        // Get sprite type name
        function getSpriteTypeName(type) {
            const names = {
                0: 'Décoration',
                1: 'Décoration Alt',
                2: 'PNJ',
                3: 'Marchand',
                'A': 'Ennemi',
                4: 'Quest Giver',
                5: 'Quest End',
                6: 'Coffre',
                'EXIT': 'Sortie',
                'DOOR': 'Porte'
            };
            return names[type] || 'Sprite';
        }

        // Teleporter handling
        function handleTeleportClick(x, y) {
            if (!APP_STATE.teleportPlacementMode) {
                showStatus('Sélectionnez un mode de placement', 'warning');
                return;
            }
            
            if (!APP_STATE.selectedTeleporter) {
                showStatus('Aucun téléporteur sélectionné', 'warning');
                return;
            }
            
            saveToHistory();
            
            const teleporter = APP_STATE.selectedTeleporter;
            const point = APP_STATE.teleportPlacementMode;
            
            if (point === 'A') {
                teleporter.pointA = { 
                    x, 
                    y, 
                    direction: 'nord',
                    ceilingRender: false,
                    ceilingHeight: 2,
                    ceilingTexture: 1,
                    floorTexture: 1,
                    message: ''
                };
                // Update form with default values
                if (document.getElementById('teleport-point-A').style.display !== 'none') {
                    loadTeleportProperties();
                }
                // Update status
                const statusA = document.getElementById('teleport-status-a');
                if (statusA) {
                    statusA.textContent = `Point A: [${y}, ${x}]`;
                }
            } else {
                teleporter.pointB = { 
                    x, 
                    y,
                    direction: 'nord',
                    ceilingRender: false,
                    ceilingHeight: 2,
                    ceilingTexture: 1,
                    floorTexture: 1,
                    message: ''
                };
                // Update form with default values
                if (document.getElementById('teleport-point-B').style.display !== 'none') {
                    loadTeleportProperties();
                }
                // Update status
                const statusB = document.getElementById('teleport-status-b');
                if (statusB) {
                    statusB.textContent = `Point B: [${y}, ${x}]`;
                }
            }
            
            markDirty();
            updateDisplay();
            showStatus(`Point ${point} placé en [${y}, ${x}]`, 'ok');
        }

        // Right click handler
        function handleRightClick(x, y) {
            if (APP_STATE.currentTab === 'terrain' && !(x === 0 || x === 23 || y === 0 || y === 23)) {
                saveToHistory();
                // Reset to plain floor (0) when right-clicking
                APP_STATE.map[y][x] = 0;
                markDirty();
                updateDisplay();
                validateCurrentMap();
            } else if (APP_STATE.currentTab === 'sprites') {
                const spriteIndex = APP_STATE.sprites.findIndex(s => s.x === x && s.y === y);
                if (spriteIndex !== -1) {
                    saveToHistory();
                    APP_STATE.sprites.splice(spriteIndex, 1);
                    markDirty();
                    updateDisplay();
                    updateCounts();
                }
            }
        }

        // Update coordinates display
        function updateCoordinates(x, y) {
            document.getElementById('coordinates').textContent = `Position: [${y}, ${x}]`;
        }

        // Tab switching
        function switchTab(tab) {
            // Update tab buttons
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            event.target.classList.add('active');
            
            // Show/hide tab content
            document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');
            document.getElementById(`${tab}-tab`).style.display = 'block';
            
            APP_STATE.currentTab = tab;
            updateToolDisplay();
            
            // Clear selections when switching tabs
            if (tab !== 'sprites') {
                APP_STATE.selectedSprite = null;
                APP_STATE.baseSpriteMode = null;
                APP_STATE.customSpritePlacementMode = false;
                APP_STATE.customSpriteConfig = null;
            }
            if (tab !== 'teleports') {
                APP_STATE.teleportPlacementMode = null;
                updateTeleportButtons();
            }
            
            APP_STATE.playerPositionMode = false;
        }

        // Tool selection
        function setDrawingTool(tool) {
            document.querySelectorAll('#terrain-tab .tool-item').forEach(item => item.classList.remove('active'));
            event.target.classList.add('active');
            APP_STATE.drawingTool = tool;
            updateToolDisplay();
        }

        function selectTerrain(value) {
            // Clear previous selections
            document.querySelectorAll('[class*="terrain-"]').forEach(item => {
                if (item.classList.contains('tool-item')) {
                    item.classList.remove('active');
                }
            });
            document.querySelectorAll('[class*="floor-texture-"]').forEach(item => {
                if (item.classList.contains('tool-item')) {
                    item.classList.remove('active');
                }
            });
            
            APP_STATE.selectedTerrain = value;
            APP_STATE.terrainMode = 'terrain';
            APP_STATE.selectedFloorTexture = null;
            document.querySelectorAll('.terrain-' + value).forEach(item => item.classList.add('active'));
            updateToolDisplay();
        }

        function selectFloorTexture(value) {
            // Clear previous selections
            document.querySelectorAll('[class*="terrain-"]').forEach(item => {
                if (item.classList.contains('tool-item')) {
                    item.classList.remove('active');
                }
            });
            document.querySelectorAll('[class*="floor-texture-"]').forEach(item => {
                if (item.classList.contains('tool-item')) {
                    item.classList.remove('active');
                }
            });
            
            APP_STATE.selectedFloorTexture = value;
            APP_STATE.terrainMode = 'floorTexture';
            APP_STATE.selectedTerrain = 0; // Floor textures are applied to traversable cells
            
            // Convert decimal value to index (0.01 -> 1, 0.02 -> 2, etc.)
            const textureIndex = Math.round(value * 100);
            document.querySelectorAll('.floor-texture-' + textureIndex).forEach(item => item.classList.add('active'));
            updateToolDisplay();
        }

        function setSpriteMode(mode) {
            document.querySelectorAll('#sprite-base-content .tool-item').forEach(item => item.classList.remove('active'));
            event.target.classList.add('active');
            APP_STATE.spriteMode = mode;
            APP_STATE.baseSpriteMode = null;
            APP_STATE.customSpritePlacementMode = false;
            updateToolDisplay();
        }

        function selectSpriteType(type) {
            document.querySelectorAll('.sprite-' + APP_STATE.selectedSpriteType).forEach(item => item.classList.remove('active'));
            APP_STATE.selectedSpriteType = type;
            APP_STATE.baseSpriteMode = null;
            document.querySelectorAll('.sprite-' + type).forEach(item => item.classList.add('active'));
            updateToolDisplay();
        }

        // Update tool display
        function updateToolDisplay() {
            let toolText = '';
            
            if (APP_STATE.playerPositionMode) {
                toolText = 'Placement Position Joueur';
            } else {
                switch (APP_STATE.currentTab) {
                    case 'terrain':
                        if (APP_STATE.terrainMode === 'floorTexture') {
                            const floorTextureNames = {
                                0.01: 'Gris clair',
                                0.02: 'Jaune pâle',
                                0.03: 'Bleu clair',
                                0.04: 'Vert pâle',
                                0.05: 'Rose pâle',
                                0.06: 'Orange pâle',
                                0.07: 'Violet pâle',
                                0.08: 'Turquoise',
                                0.09: 'Lavande',
                                0.10: 'Menthe'
                            };
                            toolText = `${APP_STATE.drawingTool} - ${floorTextureNames[APP_STATE.selectedFloorTexture] || 'Texture'} (${APP_STATE.selectedFloorTexture})`;
                        } else {
                            const terrainNames = ['Sol', 'Pierre', 'Orné', 'Roche', 'Temple', 'Forêt', 'Maison', 'Fenêtre', 'Porte M.', 'Prison'];
                            toolText = `${APP_STATE.drawingTool} - ${terrainNames[APP_STATE.selectedTerrain]}`;
                        }
                        break;
                    case 'sprites':
                        if (APP_STATE.currentSpriteSubtab === 'base') {
                            if (APP_STATE.baseSpriteMode) {
                                toolText = `Placer ${BASE_SPRITES[APP_STATE.baseSpriteMode].name}`;
                            } else {
                                toolText = APP_STATE.spriteMode === 'select' ? 'Sélection sprite' : 'Effacer sprite';
                            }
                        } else {
                            if (APP_STATE.customSpritePlacementMode) {
                                toolText = `Placer ${APP_STATE.customSpriteConfig.name}`;
                            } else {
                                toolText = 'Éditeur de sprites';
                            }
                        }
                        break;
                    case 'teleports':
                        toolText = APP_STATE.teleportPlacementMode ? `Placer Point ${APP_STATE.teleportPlacementMode}` : 'Téléporteurs';
                        break;
                }
            }
            
            document.getElementById('current-tool').textContent = toolText;
        }

        function debugTeleporter() {
            if (!APP_STATE.selectedTeleporter) {
                console.log('Aucun téléporteur sélectionné');
                return;
            }
            
            console.log('=== DEBUG TELEPORTEUR ===');
            console.log('Téléporteur sélectionné:', APP_STATE.selectedTeleporter);
            console.log('Point A:', APP_STATE.selectedTeleporter.pointA);
            console.log('Point B:', APP_STATE.selectedTeleporter.pointB);
            console.log('Tous les téléporteurs:', APP_STATE.teleporters);
            
            // Show in alert for easier viewing
            alert(`Téléporteur ${APP_STATE.selectedTeleporter.id}:\n\n` +
                  `Point A: ${JSON.stringify(APP_STATE.selectedTeleporter.pointA, null, 2)}\n\n` +
                  `Point B: ${JSON.stringify(APP_STATE.selectedTeleporter.pointB, null, 2)}`);
        }

        // Update display
        function updateDisplay() {
            const cells = document.querySelectorAll('.cell');
            const playerX = parseInt(document.getElementById('player-x').value);
            const playerY = parseInt(document.getElementById('player-y').value);
            const playerOrientation = document.getElementById('player-orientation').value;
            
            cells.forEach(cell => {
                const x = parseInt(cell.dataset.x);
                const y = parseInt(cell.dataset.y);
                const value = APP_STATE.map[y][x];
                
                // Clear previous classes and content
                cell.className = 'cell';
                cell.innerHTML = '';
                
                // Set terrain
                if (value === 0) {
                    cell.classList.add('cell-floor');
                } else if (value < 1 && value > 0) {
                    // Floor texture (decimal values)
                    cell.classList.add('cell-floor');
                    const textureIndex = Math.round(value * 100);
                    cell.classList.add(`cell-floor-texture-${textureIndex}`);
                } else {
                    // Walls (integer values >= 1)
                    cell.classList.add(`cell-wall-${Math.floor(value)}`);
                    cell.textContent = Math.floor(value);
                }
                
                // Add player position overlay
                if (x === playerX && y === playerY) {
                    const playerOverlay = document.createElement('div');
                    playerOverlay.className = 'player-overlay';
                    const arrow = document.createElement('div');
                    arrow.className = `player-arrow ${playerOrientation}`;
                    playerOverlay.appendChild(arrow);
                    cell.appendChild(playerOverlay);
                }
                
                // Add sprite overlay
                const sprite = APP_STATE.sprites.find(s => s.x === x && s.y === y);
                if (sprite) {
                    const overlay = document.createElement('div');
                    overlay.className = `sprite-overlay sprite-type-${sprite.type}`;
                    
                    let spriteText = sprite.type;
                    if (sprite.type === 'A') spriteText = '⚔';
                    else if (sprite.type === 'EXIT') spriteText = '🚪';
                    else if (sprite.type === 'DOOR') spriteText = '🔀';
                    else if (sprite.type === 2) spriteText = '💬';
                    else if (sprite.type === 3) spriteText = '🏪';
                    else if (sprite.type === 6) spriteText = '📦';
                    else if (sprite.type === 4) spriteText = '❓';
                    else if (sprite.type === 5) spriteText = '✅';
                    
                    overlay.textContent = spriteText;
                    
                    if (sprite === APP_STATE.selectedSprite) {
                        overlay.style.border = '2px solid #fbbf24';
                        overlay.style.boxShadow = '0 0 8px rgba(251, 191, 36, 0.6)';
                    }
                    cell.appendChild(overlay);
                }
                
                // Add teleporter overlays
                APP_STATE.teleporters.forEach((teleporter, index) => {
                    if (teleporter.pointA && teleporter.pointA.x === x && teleporter.pointA.y === y) {
                        const overlay = document.createElement('div');
                        overlay.className = 'teleport-overlay teleport-a';
                        overlay.innerHTML = `<span style="position: absolute; top: 2px; left: 2px; font-size: 9px; font-weight: bold; color: #22c55e;">${teleporter.id}A</span>`;
                        cell.appendChild(overlay);
                    }
                    if (teleporter.pointB && teleporter.pointB.x === x && teleporter.pointB.y === y) {
                        const overlay = document.createElement('div');
                        overlay.className = 'teleport-overlay teleport-b';
                        overlay.innerHTML = `<span style="position: absolute; top: 2px; left: 2px; font-size: 9px; font-weight: bold; color: #3b82f6;">${teleporter.id}B</span>`;
                        cell.appendChild(overlay);
                    }
                });
            });
            
            updateCounts();
        }

        // Update counters
        function updateCounts() {
            document.getElementById('sprite-count').textContent = APP_STATE.sprites.length;
            document.getElementById('teleport-count').textContent = APP_STATE.teleporters.length;
        }

        // History management
        function saveToHistory() {
            APP_STATE.history = APP_STATE.history.slice(0, APP_STATE.historyIndex + 1);
            
            APP_STATE.history.push({
                map: APP_STATE.map.map(row => [...row]),
                sprites: JSON.parse(JSON.stringify(APP_STATE.sprites)),
                teleporters: JSON.parse(JSON.stringify(APP_STATE.teleporters))
            });
            
            APP_STATE.historyIndex++;
            
            if (APP_STATE.history.length > 50) {
                APP_STATE.history.shift();
                APP_STATE.historyIndex--;
            }
            
            updateHistoryButtons();
        }

        function undoAction() {
            if (APP_STATE.historyIndex <= 0) return;
            
            APP_STATE.historyIndex--;
            const state = APP_STATE.history[APP_STATE.historyIndex];
            
            APP_STATE.map = state.map.map(row => [...row]);
            APP_STATE.sprites = JSON.parse(JSON.stringify(state.sprites));
            APP_STATE.teleporters = JSON.parse(JSON.stringify(state.teleporters));
            
            markDirty();
            updateDisplay();
            updateHistoryButtons();
            validateCurrentMap();
            updateTeleportList();
        }

        function redoAction() {
            if (APP_STATE.historyIndex >= APP_STATE.history.length - 1) return;
            
            APP_STATE.historyIndex++;
            const state = APP_STATE.history[APP_STATE.historyIndex];
            
            APP_STATE.map = state.map.map(row => [...row]);
            APP_STATE.sprites = JSON.parse(JSON.stringify(state.sprites));
            APP_STATE.teleporters = JSON.parse(JSON.stringify(state.teleporters));
            
            markDirty();
            updateDisplay();
            updateHistoryButtons();
            validateCurrentMap();
            updateTeleportList();
        }

        function updateHistoryButtons() {
            document.getElementById('undo-btn').disabled = APP_STATE.historyIndex <= 0;
            document.getElementById('redo-btn').disabled = APP_STATE.historyIndex >= APP_STATE.history.length - 1;
        }

        // Map management
        function createNewMap() {
            const mapId = getNextMapId();
            const newMap = {
                mapID: mapId,
                name: `Carte ${mapId}`,
                map: Array(24).fill().map(() => Array(24).fill(0)),
                sprites: [],
                teleporters: [],
                playerStart: {
                    X: 12,
                    Y: 12,
                    Orientation: Math.PI / 2,
                    ceilingRender: false,
                    ceilingHeight: 2,
                    ceilingTexture: 1,
                    floorTexture: 3
                }
            };
            
            for (let y = 0; y < 24; y++) {
                for (let x = 0; x < 24; x++) {
                    if (x === 0 || x === 23 || y === 0 || y === 23) {
                        newMap.map[y][x] = 1;
                    }
                }
            }
            
            APP_STATE.allMaps.set(mapId, newMap);
            loadMapIntoEditor(mapId);
            saveAllMaps();
            showStatus(`Nouvelle carte créée (ID: ${mapId})`, 'ok');
        }

        function getNextMapId() {
            if (APP_STATE.allMaps.size === 0) return 1;
            return Math.max(...APP_STATE.allMaps.keys()) + 1;
        }

        function loadMapIntoEditor(mapId) {
            const mapData = APP_STATE.allMaps.get(mapId);
            if (!mapData) return;
            
            APP_STATE.currentMapId = mapId;
            APP_STATE.map = mapData.map.map(row => [...row]);
            APP_STATE.sprites = JSON.parse(JSON.stringify(mapData.sprites || []));
            APP_STATE.teleporters = JSON.parse(JSON.stringify(mapData.teleporters || []));
            
            document.getElementById('map-id').value = mapData.mapID;
            document.getElementById('player-x').value = mapData.playerStart.X;
            document.getElementById('player-y').value = mapData.playerStart.Y;
            
            const orientation = mapData.playerStart.Orientation;
            let orientationName = 'nord';
            if (Math.abs(orientation - 0) < 0.1) orientationName = 'est';
            else if (Math.abs(orientation - Math.PI) < 0.1) orientationName = 'ouest';
            else if (Math.abs(orientation - 3 * Math.PI / 2) < 0.1) orientationName = 'sud';
            
            document.getElementById('player-orientation').value = orientationName;
            document.getElementById('ceiling-render').checked = mapData.playerStart.ceilingRender || false;
            document.getElementById('ceiling-height').value = mapData.playerStart.ceilingHeight || 2;
            document.getElementById('ceiling-texture').value = mapData.playerStart.ceilingTexture || 1;
            document.getElementById('floor-texture').value = mapData.playerStart.floorTexture || 3;
            
            APP_STATE.history = [];
            APP_STATE.historyIndex = -1;
            saveToHistory();
            
            APP_STATE.isDirty = false;
            updateDisplay();
            updateCurrentMapInfo();
            updateTeleportList();
            validateCurrentMap();
            showStatus(`Carte ${mapId} chargée`, 'ok');
        }

        function saveCurrentMap() {
            if (!APP_STATE.currentMapId) return;
            
            const mapData = {
                mapID: parseInt(document.getElementById('map-id').value),
                name: `Carte ${APP_STATE.currentMapId}`,
                map: APP_STATE.map.map(row => [...row]),
                sprites: JSON.parse(JSON.stringify(APP_STATE.sprites)),
                teleporters: JSON.parse(JSON.stringify(APP_STATE.teleporters)),
                playerStart: {
                    X: parseInt(document.getElementById('player-x').value),
                    Y: parseInt(document.getElementById('player-y').value),
                    Orientation: getOrientationValue(document.getElementById('player-orientation').value),
                    ceilingRender: document.getElementById('ceiling-render').checked,
                    ceilingHeight: parseInt(document.getElementById('ceiling-height').value),
                    ceilingTexture: parseInt(document.getElementById('ceiling-texture').value),
                    floorTexture: parseInt(document.getElementById('floor-texture').value)
                }
            };
            
            APP_STATE.allMaps.set(APP_STATE.currentMapId, mapData);
            saveAllMaps();
            APP_STATE.isDirty = false;
            updateCurrentMapInfo();
            showStatus('Carte sauvegardée', 'ok');
        }

        function getOrientationValue(orientation) {
            const orientations = {
                'nord': Math.PI / 2,
                'est': 0,
                'sud': 3 * Math.PI / 2,
                'ouest': Math.PI
            };
            return orientations[orientation] || Math.PI / 2;
        }

        function updateMapProperty() {
            markDirty();
            validateCurrentMap();
        }

        function markDirty() {
            APP_STATE.isDirty = true;
            updateCurrentMapInfo();
        }

function updateCurrentMapInfo() {
    const info = document.getElementById('current-map-info');
    if (APP_STATE.currentMapId) {
        const dirtyIndicator = APP_STATE.isDirty ? ' *' : '';
        const fileIndicator = mapsFileHandle ? ' 📂' : '';
        info.innerHTML = `
            <div style="font-size: 14px; color: var(--text-primary);">Carte ${APP_STATE.currentMapId}${dirtyIndicator}${fileIndicator}</div>
            <div style="font-size: 12px; color: var(--text-secondary);">
                ${APP_STATE.sprites.length} sprites, ${APP_STATE.teleporters.length} téléporteurs
            </div>
            ${mapsFileHandle ? '<div style="font-size: 11px; color: var(--success-color);">Maps.js connecté</div>' : ''}
        `;
    } else {
        info.innerHTML = '<div style="font-size: 12px; color: var(--text-secondary);">Aucune carte chargée</div>';
    }
}

        // Validation
        function validateCurrentMap() {
            const errors = [];
            
            for (let i = 0; i < 24; i++) {
                if (Math.floor(APP_STATE.map[0][i]) === 0) errors.push(`Bordure haut manquante en [0,${i}]`);
                if (Math.floor(APP_STATE.map[23][i]) === 0) errors.push(`Bordure bas manquante en [23,${i}]`);
                if (Math.floor(APP_STATE.map[i][0]) === 0) errors.push(`Bordure gauche manquante en [${i},0]`);
                if (Math.floor(APP_STATE.map[i][23]) === 0) errors.push(`Bordure droite manquante en [${i},23]`);
            }
            
            const playerX = parseInt(document.getElementById('player-x').value);
            const playerY = parseInt(document.getElementById('player-y').value);
            
            if (playerX < 1 || playerX > 22 || playerY < 1 || playerY > 22) {
                errors.push('Position joueur hors limites');
            } else if (Math.floor(APP_STATE.map[playerY][playerX]) !== 0) {
                errors.push('Position joueur sur un mur');
            }
            
            APP_STATE.teleporters.forEach((teleporter, index) => {
                if (!teleporter.pointA) errors.push(`Téléporteur ${index + 1}: Point A manquant`);
                if (!teleporter.pointB) errors.push(`Téléporteur ${index + 1}: Point B manquant`);
            });
            
            updateValidationDisplay(errors);
        }

        function updateValidationDisplay(errors) {
            const container = document.getElementById('validation-results');
            container.innerHTML = '';
            
            if (errors.length === 0) {
                container.innerHTML = `
                    <div class="status-item">
                        <div class="status-indicator status-ok"></div>
                        <span>Carte valide</span>
                    </div>
                `;
            } else {
                errors.slice(0, 5).forEach(error => {
                    container.innerHTML += `
                        <div class="status-item">
                            <div class="status-indicator status-error"></div>
                            <span style="font-size: 11px;">${error}</span>
                        </div>
                    `;
                });
                
                if (errors.length > 5) {
                    container.innerHTML += `
                        <div class="status-item">
                            <div class="status-indicator status-warning"></div>
                            <span style="font-size: 11px;">+${errors.length - 5} autres erreurs</span>
                        </div>
                    `;
                }
            }
        }

        // Teleporter management
        function createNewTeleporter() {
            saveToHistory();
            
            const newTeleporter = {
                id: APP_STATE.teleporters.length + 1,
                name: `Téléporteur ${APP_STATE.teleporters.length + 1}`,
                pointA: null,
                pointB: null
            };
            
            APP_STATE.teleporters.push(newTeleporter);
            APP_STATE.selectedTeleporter = newTeleporter;
            
            markDirty();
            updateTeleportList();
            updateTeleportDisplay();
            showStatus('Nouveau téléporteur créé', 'ok');
        }

        function selectTeleporter() {
            const select = document.getElementById('teleport-select');
            const teleporterId = parseInt(select.value);
            
            if (teleporterId) {
                APP_STATE.selectedTeleporter = APP_STATE.teleporters.find(t => t.id === teleporterId);
                updateTeleportDisplay();
            } else {
                APP_STATE.selectedTeleporter = null;
                document.getElementById('teleport-placement').style.display = 'none';
                document.getElementById('teleport-properties').style.display = 'none';
            }
            
            updateTeleportButtons();
        }

        function deleteSelectedTeleporter() {
            if (!APP_STATE.selectedTeleporter) return;
            
            if (confirm('Supprimer ce téléporteur ?')) {
                saveToHistory();
                
                const index = APP_STATE.teleporters.indexOf(APP_STATE.selectedTeleporter);
                APP_STATE.teleporters.splice(index, 1);
                APP_STATE.selectedTeleporter = null;
                
                markDirty();
                updateTeleportList();
                updateTeleportDisplay();
                updateDisplay();
                showStatus('Téléporteur supprimé', 'ok');
            }
        }

        function updateTeleportList() {
            const select = document.getElementById('teleport-select');
            select.innerHTML = '<option value="">Aucun téléporteur</option>';
            
            APP_STATE.teleporters.forEach(teleporter => {
                const option = document.createElement('option');
                option.value = teleporter.id;
                
                // Add indicators for placed points
                let statusText = teleporter.name;
                if (teleporter.pointA && teleporter.pointB) {
                    statusText += ' ✓ (A+B)';
                } else if (teleporter.pointA) {
                    statusText += ' (A)';
                } else if (teleporter.pointB) {
                    statusText += ' (B)';
                } else {
                    statusText += ' (vide)';
                }
                
                option.textContent = statusText;
                select.appendChild(option);
            });
            
            if (APP_STATE.selectedTeleporter) {
                select.value = APP_STATE.selectedTeleporter.id;
            }
        }

        function updateTeleportDisplay() {
            const placementSection = document.getElementById('teleport-placement');
            const propertiesSection = document.getElementById('teleport-properties');
            
            if (APP_STATE.selectedTeleporter) {
                placementSection.style.display = 'block';
                propertiesSection.style.display = 'block';
                
                // Update status display
                const teleporter = APP_STATE.selectedTeleporter;
                const statusA = document.getElementById('teleport-status-a');
                const statusB = document.getElementById('teleport-status-b');
                
                if (statusA) {
                    statusA.textContent = teleporter.pointA 
                        ? `Point A: [${teleporter.pointA.y}, ${teleporter.pointA.x}]`
                        : 'Point A: Non placé';
                }
                
                if (statusB) {
                    statusB.textContent = teleporter.pointB 
                        ? `Point B: [${teleporter.pointB.y}, ${teleporter.pointB.x}]`
                        : 'Point B: Non placé';
                }
                
                // Reset to Point A tab by default
                document.querySelectorAll('.teleport-tab').forEach(tab => tab.classList.remove('active'));
                document.querySelector('.teleport-tab').classList.add('active');
                document.getElementById('teleport-point-A').style.display = 'block';
                document.getElementById('teleport-point-B').style.display = 'none';
                
                loadTeleportProperties();
            } else {
                placementSection.style.display = 'none';
                propertiesSection.style.display = 'none';
            }
            
            updateTeleportButtons();
        }

        function updateTeleportButtons() {
            document.getElementById('delete-teleport-btn').disabled = !APP_STATE.selectedTeleporter;
            
            if (APP_STATE.teleportPlacementMode) {
                document.getElementById('place-a-btn').classList.toggle('primary', APP_STATE.teleportPlacementMode === 'A');
                document.getElementById('place-b-btn').classList.toggle('primary', APP_STATE.teleportPlacementMode === 'B');
            } else {
                document.getElementById('place-a-btn').classList.remove('primary');
                document.getElementById('place-b-btn').classList.remove('primary');
            }
        }

        function setTeleportPlacement(point) {
            APP_STATE.teleportPlacementMode = point;
            updateTeleportButtons();
            showStatus(`Mode placement Point ${point} activé`, 'ok');
        }

        function clearTeleportPlacement() {
            APP_STATE.teleportPlacementMode = null;
            updateTeleportButtons();
            showStatus('Mode placement désactivé', 'ok');
        }

        function switchTeleportTab(point) {
            document.querySelectorAll('.teleport-tab').forEach(tab => tab.classList.remove('active'));
            event.target.classList.add('active');
            
            document.getElementById('teleport-point-A').style.display = point === 'A' ? 'block' : 'none';
            document.getElementById('teleport-point-B').style.display = point === 'B' ? 'block' : 'none';
            
            // Reload properties to ensure current tab shows correct values
            loadTeleportProperties();
        }

        function loadTeleportProperties() {
            if (!APP_STATE.selectedTeleporter) return;
            
            const teleporter = APP_STATE.selectedTeleporter;
            
            // Remove old event listeners first to avoid duplicates
            const fieldsA = ['teleport-a-direction', 'teleport-a-ceiling', 'teleport-a-height', 'teleport-a-ceiling-tex', 'teleport-a-floor-tex', 'teleport-a-message'];
            const fieldsB = ['teleport-b-direction', 'teleport-b-ceiling', 'teleport-b-height', 'teleport-b-ceiling-tex', 'teleport-b-floor-tex', 'teleport-b-message'];
            
            // Clear previous listeners
            fieldsA.forEach(id => {
                const elem = document.getElementById(id);
                if (elem) {
                    elem.onchange = null;
                }
            });
            
            fieldsB.forEach(id => {
                const elem = document.getElementById(id);
                if (elem) {
                    elem.onchange = null;
                }
            });
            
            // Load Point A properties
            if (teleporter.pointA) {
                document.getElementById('teleport-a-direction').value = teleporter.pointA.direction || 'nord';
                document.getElementById('teleport-a-ceiling').checked = teleporter.pointA.ceilingRender || false;
                document.getElementById('teleport-a-height').value = teleporter.pointA.ceilingHeight || 2;
                document.getElementById('teleport-a-ceiling-tex').value = teleporter.pointA.ceilingTexture || 1;
                document.getElementById('teleport-a-floor-tex').value = teleporter.pointA.floorTexture || 1;
                document.getElementById('teleport-a-message').value = teleporter.pointA.message || '';
            } else {
                // Reset fields if no point A
                document.getElementById('teleport-a-direction').value = 'nord';
                document.getElementById('teleport-a-ceiling').checked = false;
                document.getElementById('teleport-a-height').value = 2;
                document.getElementById('teleport-a-ceiling-tex').value = 1;
                document.getElementById('teleport-a-floor-tex').value = 1;
                document.getElementById('teleport-a-message').value = '';
            }
            
            // Load Point B properties
            if (teleporter.pointB) {
                document.getElementById('teleport-b-direction').value = teleporter.pointB.direction || 'nord';
                document.getElementById('teleport-b-ceiling').checked = teleporter.pointB.ceilingRender || false;
                document.getElementById('teleport-b-height').value = teleporter.pointB.ceilingHeight || 2;
                document.getElementById('teleport-b-ceiling-tex').value = teleporter.pointB.ceilingTexture || 1;
                document.getElementById('teleport-b-floor-tex').value = teleporter.pointB.floorTexture || 1;
                document.getElementById('teleport-b-message').value = teleporter.pointB.message || '';
            } else {
                // Reset fields if no point B
                document.getElementById('teleport-b-direction').value = 'nord';
                document.getElementById('teleport-b-ceiling').checked = false;
                document.getElementById('teleport-b-height').value = 2;
                document.getElementById('teleport-b-ceiling-tex').value = 1;
                document.getElementById('teleport-b-floor-tex').value = 1;
                document.getElementById('teleport-b-message').value = '';
            }
            
            // Add new event listeners for Point A
            fieldsA.forEach(id => {
                const elem = document.getElementById(id);
                if (elem) {
                    elem.onchange = function() {
                        saveTeleportProperties('A');
                    };
                }
            });
            
            // Add new event listeners for Point B
            fieldsB.forEach(id => {
                const elem = document.getElementById(id);
                if (elem) {
                    elem.onchange = function() {
                        saveTeleportProperties('B');
                    };
                }
            });
        }

        function saveTeleportProperties(point) {
            if (!APP_STATE.selectedTeleporter) return;
            
            const teleporter = APP_STATE.selectedTeleporter;
            const prefix = `teleport-${point.toLowerCase()}`;
            
            const properties = {
                direction: document.getElementById(`${prefix}-direction`).value,
                ceilingRender: document.getElementById(`${prefix}-ceiling`).checked,
                ceilingHeight: parseInt(document.getElementById(`${prefix}-height`).value),
                ceilingTexture: parseInt(document.getElementById(`${prefix}-ceiling-tex`).value),
                floorTexture: parseInt(document.getElementById(`${prefix}-floor-tex`).value),
                message: document.getElementById(`${prefix}-message`).value
            };
            
            if (point === 'A') {
                if (!teleporter.pointA) {
                    showStatus('Le point A doit être placé avant de définir ses propriétés', 'warning');
                    return;
                }
                // Preserve x,y coordinates and update other properties
                teleporter.pointA = {
                    ...teleporter.pointA,
                    ...properties
                };
            } else if (point === 'B') {
                if (!teleporter.pointB) {
                    showStatus('Le point B doit être placé avant de définir ses propriétés', 'warning');
                    return;
                }
                // Preserve x,y coordinates and update other properties
                teleporter.pointB = {
                    ...teleporter.pointB,
                    ...properties
                };
            }
            
            markDirty();
            
            // Debug log to verify values are saved correctly
            console.log(`Téléporteur ${teleporter.id} - Point ${point} sauvegardé:`, properties);
            console.log('État complet du téléporteur:', {
                id: teleporter.id,
                pointA: teleporter.pointA,
                pointB: teleporter.pointB
            });
        }

        // Sprite properties modal
        function editSelectedSprite() {
            if (!APP_STATE.selectedSprite) return;
            
            const sprite = APP_STATE.selectedSprite;
            
            document.getElementById('modal-sprite-name').value = sprite.name || '';
            document.getElementById('modal-sprite-type').value = sprite.type;
            document.getElementById('modal-sprite-texture').value = sprite.texture;
            
            // Reset shop items state for modal
            APP_STATE.modalShopItems = sprite.items ? [...sprite.items] : [];
            
            // Show/hide relevant sections
            document.getElementById('enemy-props').style.display = sprite.type === 'A' ? 'block' : 'none';
            document.getElementById('chest-props').style.display = sprite.type === 6 ? 'block' : 'none';
            document.getElementById('npc-props').style.display = (sprite.type === 2 || sprite.type === 4) ? 'block' : 'none';
            document.getElementById('shop-props').style.display = sprite.type === 3 ? 'block' : 'none';
            
            if (sprite.type === 'A') {
                document.getElementById('modal-sprite-hp').value = sprite.hp || 2;
                document.getElementById('modal-sprite-damage').value = sprite.damage || 1;
                document.getElementById('modal-sprite-lootclass').value = sprite.lootClass || 0;
            }
            
            if (sprite.type === 6) {
                document.getElementById('modal-chest-lootclass').value = sprite.lootClass || 0;
            }
            
            if (sprite.type === 2 || sprite.type === 4) {
                loadDialogs('dialog-container', sprite.dialogues || []);
                updateModalDialogPreview();
            }
            
            if (sprite.type === 3) {
                updateShopItemsList();
                loadDialogs('merchant-dialog-container', sprite.dialogues || []);
            }
            
            // Setup shop item select listener
            const shopSelect = document.getElementById('modal-shop-item-select');
            if (shopSelect) {
                shopSelect.onchange = function() {
                    addShopItem();
                };
            }
            
            document.getElementById('sprite-modal').style.display = 'flex';
        }

        function loadDialogs(containerId, dialogues) {
            const container = document.getElementById(containerId);
            container.innerHTML = '';
            
            dialogues.forEach((dialog, index) => {
                addDialogToContainer(container, dialog, index);
            });
        }

        function addDialogToContainer(container, dialog = null, index = -1) {
            const dialogDiv = document.createElement('div');
            dialogDiv.className = 'dialog-entry';
            
            dialogDiv.innerHTML = `
                <div class="form-group">
                    <label>Face</label>
                    <select class="form-control dialog-face" onchange="updateModalDialogPreview()">
                        ${AVAILABLE_FACES.map(face => `
                            <option value="${face}" ${(dialog?.[0] || 'facePlayer') === face ? 'selected' : ''}>${face}</option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Nom</label>
                    <input type="text" class="form-control dialog-name" value="${dialog?.[1] || ''}" placeholder="Nom du personnage" onchange="updateModalDialogPreview()">
                </div>
                <div class="form-group">
                    <label>Texte</label>
                    <textarea class="form-control dialog-text" rows="2" placeholder="Texte du dialogue" onchange="updateModalDialogPreview()">${dialog?.[2] || ''}</textarea>
                </div>
                <div class="dialog-controls">
                    <div class="dialog-move-buttons">
                        <button type="button" class="btn small" onclick="moveModalDialogUp(this)">↑</button>
                        <button type="button" class="btn small" onclick="moveModalDialogDown(this)">↓</button>
                    </div>
                    <button type="button" class="btn small danger" onclick="removeDialog(this)">Supprimer</button>
                </div>
            `;
            
            container.appendChild(dialogDiv);
        }

        function addDialog() {
            const container = document.getElementById('dialog-container');
            addDialogToContainer(container);
            updateModalDialogPreview();
        }

        function addMerchantDialog() {
            const container = document.getElementById('merchant-dialog-container');
            addDialogToContainer(container);
        }

        function removeDialog(button) {
            button.closest('.dialog-entry').remove();
            updateModalDialogPreview();
        }

        function moveModalDialogUp(button) {
            const entry = button.closest('.dialog-entry');
            const prev = entry.previousElementSibling;
            if (prev) {
                entry.parentNode.insertBefore(entry, prev);
                updateModalDialogPreview();
            }
        }

        function moveModalDialogDown(button) {
            const entry = button.closest('.dialog-entry');
            const next = entry.nextElementSibling;
            if (next) {
                entry.parentNode.insertBefore(next, entry);
                updateModalDialogPreview();
            }
        }

        function updateModalDialogPreview() {
            const container = document.getElementById('dialog-container');
            if (!container) return;
            
            const preview = document.getElementById('dialog-preview');
            const previewContent = document.getElementById('dialog-preview-content');
            
            if (!preview || !previewContent) return;
            
            const dialogEntries = container.querySelectorAll('.dialog-entry');
            
            if (dialogEntries.length === 0) {
                preview.style.display = 'none';
                return;
            }
            
            preview.style.display = 'block';
            previewContent.innerHTML = '';
            
            dialogEntries.forEach(entry => {
                const face = entry.querySelector('.dialog-face').value;
                const name = entry.querySelector('.dialog-name').value || 'Sans nom';
                const text = entry.querySelector('.dialog-text').value || '...';
                
                const previewEntry = document.createElement('div');
                previewEntry.className = 'dialog-preview-entry';
                previewEntry.innerHTML = `<span class="dialog-preview-face">${name}:</span> ${text}`;
                previewContent.appendChild(previewEntry);
            });
        }

        // Shop items management for modal
        function addShopItem() {
            const select = document.getElementById('modal-shop-item-select');
            const itemId = parseInt(select.value);
            
            if (!itemId) return;
            
            if (!APP_STATE.modalShopItems) {
                APP_STATE.modalShopItems = [];
            }
            
            if (APP_STATE.modalShopItems.includes(itemId)) {
                showStatus('Cet item est déjà dans la liste', 'warning');
                select.value = '';
                return;
            }
            
            APP_STATE.modalShopItems.push(itemId);
            updateShopItemsList();
            select.value = '';
        }

        function updateShopItemsList() {
            const container = document.getElementById('shop-items-list');
            if (!container) return;
            
            container.innerHTML = '';
            
            const itemNames = {
                1: "Shortsword",
                2: "Cape", 
                3: "Magic sword",
                4: "Tunic",
                5: "Club",
                6: "Staff",
                7: "Armor",
                8: "Dagger"
            };
            
            if (!APP_STATE.modalShopItems) {
                APP_STATE.modalShopItems = [];
            }
            
            APP_STATE.modalShopItems.forEach(itemId => {
                const chip = document.createElement('div');
                chip.className = 'shop-item-chip';
                chip.innerHTML = `
                    ${itemId} - ${itemNames[itemId] || 'Item'}
                    <span class="remove" onclick="removeShopItem(${itemId})">×</span>
                `;
                container.appendChild(chip);
            });
        }

        function removeShopItem(itemId) {
            if (!APP_STATE.modalShopItems) return;
            
            const index = APP_STATE.modalShopItems.indexOf(itemId);
            if (index > -1) {
                APP_STATE.modalShopItems.splice(index, 1);
                updateShopItemsList();
            }
        }

        function saveSpriteProperties() {
            if (!APP_STATE.selectedSprite) {
                closeSpriteModal();
                return;
            }
            
            const sprite = APP_STATE.selectedSprite;
            
            sprite.name = document.getElementById('modal-sprite-name').value;
            sprite.texture = parseInt(document.getElementById('modal-sprite-texture').value);
            
            if (sprite.type === 'A') {
                sprite.hp = parseInt(document.getElementById('modal-sprite-hp').value);
                sprite.damage = parseInt(document.getElementById('modal-sprite-damage').value);
                sprite.lootClass = parseInt(document.getElementById('modal-sprite-lootclass').value);
            }
            
            if (sprite.type === 6) {
                sprite.lootClass = parseInt(document.getElementById('modal-chest-lootclass').value);
            }
            
            if (sprite.type === 2 || sprite.type === 4) {
                sprite.dialogues = collectDialogs('dialog-container');
            }
            
            if (sprite.type === 3) {
                sprite.items = APP_STATE.modalShopItems ? [...APP_STATE.modalShopItems] : [];
                sprite.dialogues = collectDialogs('merchant-dialog-container');
            }
            
            markDirty();
            updateDisplay();
            closeSpriteModal();
            showStatus('Propriétés du sprite sauvegardées', 'ok');
        }

        function collectDialogs(containerId) {
            const container = document.getElementById(containerId);
            const dialogEntries = container.querySelectorAll('.dialog-entry');
            const dialogues = [];
            
            dialogEntries.forEach(entry => {
                const face = entry.querySelector('.dialog-face').value;
                const name = entry.querySelector('.dialog-name').value;
                const text = entry.querySelector('.dialog-text').value;
                
                if (face && name && text) {
                    dialogues.push([face, name, text]);
                }
            });
            
            return dialogues;
        }

        function closeSpriteModal() {
            document.getElementById('sprite-modal').style.display = 'none';
            APP_STATE.modalShopItems = [];
        }

        // Maps manager
        function showMapsManager() {
            updateMapsManagerList();
            document.getElementById('maps-manager-modal').style.display = 'flex';
        }

        function closeMapsManager() {
            document.getElementById('maps-manager-modal').style.display = 'none';
        }

        function updateMapsManagerList() {
            const container = document.getElementById('maps-list');
            container.innerHTML = '';
            
            APP_STATE.allMaps.forEach((mapData, mapId) => {
                const mapItem = document.createElement('div');
                mapItem.className = 'map-item';
                if (mapId === APP_STATE.currentMapId) {
                    mapItem.classList.add('active');
                }
                
                mapItem.innerHTML = `
                    <div class="map-item-info">
                        <div style="font-weight: bold;">Carte ${mapId}</div>
                        <div style="font-size: 11px; color: var(--text-secondary);">
                            ${mapData.sprites?.length || 0} sprites, ${mapData.teleporters?.length || 0} téléporteurs
                        </div>
                    </div>
                    <div class="map-item-controls">
                        <button class="btn small" onclick="loadMapFromManager(${mapId})">Charger</button>
                        <button class="btn small" onclick="exportSingleMap(${mapId})">Exporter</button>
                        <button class="btn small danger" onclick="deleteMapFromManager(${mapId})">×</button>
                    </div>
                `;
                
                container.appendChild(mapItem);
            });
            
            if (APP_STATE.allMaps.size === 0) {
                container.innerHTML = '<div style="text-align: center; color: var(--text-secondary); padding: 20px;">Aucune carte disponible</div>';
            }
        }

        function loadMapFromManager(mapId) {
            if (APP_STATE.isDirty) {
                if (!confirm('Vous avez des modifications non sauvegardées. Continuer ?')) {
                    return;
                }
            }
            
            loadMapIntoEditor(mapId);
            closeMapsManager();
        }

        function deleteMapFromManager(mapId) {
            if (confirm(`Supprimer définitivement la carte ${mapId} ?`)) {
                APP_STATE.allMaps.delete(mapId);
                saveAllMaps();
                
                if (mapId === APP_STATE.currentMapId) {
                    if (APP_STATE.allMaps.size > 0) {
                        const firstMapId = APP_STATE.allMaps.keys().next().value;
                        loadMapIntoEditor(firstMapId);
                    } else {
                        createNewMap();
                    }
                }
                
                updateMapsManagerList();
                showStatus(`Carte ${mapId} supprimée`, 'ok');
            }
        }

        function createNewMapInManager() {
            createNewMap();
            updateMapsManagerList();
        }

        function duplicateSelectedMap() {
            if (!APP_STATE.currentMapId) {
                showStatus('Aucune carte sélectionnée', 'warning');
                return;
            }
            
            const originalMap = APP_STATE.allMaps.get(APP_STATE.currentMapId);
            if (!originalMap) return;
            
            const newMapId = getNextMapId();
            const duplicatedMap = JSON.parse(JSON.stringify(originalMap));
            duplicatedMap.mapID = newMapId;
            duplicatedMap.name = `Carte ${newMapId} (copie)`;
            
            APP_STATE.allMaps.set(newMapId, duplicatedMap);
            saveAllMaps();
            updateMapsManagerList();
            showStatus(`Carte dupliquée (ID: ${newMapId})`, 'ok');
        }

        // Export to Maps.js format
function exportToMapsJS() {
    // Try to save directly if file is open
    if (mapsFileHandle) {
        saveMapsJSFile();
        return;
    }

    // Otherwise, download as before
    const allMapsData = [];
    
    // Save current map first
    if (APP_STATE.currentMapId) {
        saveCurrentMap();
    }
    
    // Collect all maps
    APP_STATE.allMaps.forEach((mapData, mapId) => {
        allMapsData.push(generateRaycastFormat(mapData));
    });
    
    // Sort by mapID for consistent order
    allMapsData.sort((a, b) => a.mapID - b.mapID);
    
    const mapsJSContent = generateMapsJSFormat(allMapsData);
    
    const blob = new Blob([mapsJSContent], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Maps.js';
    a.click();
    URL.revokeObjectURL(url);
    
    showStatus(`${allMapsData.length} carte(s) exportée(s) dans Maps.js`, 'ok');
}

        function exportAllMapsJS() {
            // This function is now redundant with exportToMapsJS, but kept for compatibility
            exportToMapsJS();
        }

        function generateMapsJSFormat(mapsArray) {
            let jsContent = 'const maps = [\n';
            
            mapsArray.forEach((map, index) => {
                jsContent += '    {\n';
                
                // mapID
                jsContent += `      "mapID": ${map.mapID},\n`;
                
                // map array with pretty formatting
                jsContent += '      "map": [\n';
                map.map.forEach((row, rowIndex) => {
                    jsContent += '  [';
                    row.forEach((cell, cellIndex) => {
                        // Format numbers with proper decimal places
                        let cellValue = cell;
                        if (typeof cell === 'number') {
                            if (cell % 1 === 0) {
                                cellValue = cell.toString();
                            } else {
                                cellValue = cell.toFixed(2);
                            }
                        }
                        // Pad single digit values for alignment
                        if (cellValue.length === 1) cellValue = ' ' + cellValue;
                        jsContent += cellValue;
                        if (cellIndex < row.length - 1) jsContent += ', ';
                    });
                    jsContent += ']';
                    if (rowIndex < map.map.length - 1) jsContent += ',';
                    jsContent += '\n';
                });
                jsContent += '],\n';
                
                // sprites array
                jsContent += '      "sprites": [\n';
                map.sprites.forEach((sprite, spriteIndex) => {
                    jsContent += '        [\n';
                    sprite.forEach((prop, propIndex) => {
                        jsContent += '          ';
                        if (typeof prop === 'string') {
                            jsContent += `"${prop}"`;
                        } else if (prop === null) {
                            jsContent += 'null';
                        } else if (Array.isArray(prop)) {
                            jsContent += JSON.stringify(prop, null, 0);
                        } else {
                            jsContent += prop;
                        }
                        if (propIndex < sprite.length - 1) jsContent += ',';
                        jsContent += '\n';
                    });
                    jsContent += '        ]';
                    if (spriteIndex < map.sprites.length - 1) jsContent += ',';
                    jsContent += '\n';
                });
                jsContent += '      ],\n';
                
                // eventA
                jsContent += '      "eventA": ';
                jsContent += JSON.stringify(map.eventA);
                jsContent += ',\n';
                
                // eventB
                jsContent += '      "eventB": ';
                jsContent += JSON.stringify(map.eventB);
                jsContent += ',\n';
                
                // playerStart
                jsContent += '      "playerStart": {\n';
                jsContent += `        "X": ${map.playerStart.X},\n`;
                jsContent += `        "Y": ${map.playerStart.Y},\n`;
                jsContent += `        "Orientation": ${map.playerStart.Orientation},\n`;
                jsContent += `        "ceilingRender": ${map.playerStart.ceilingRender},\n`;
                jsContent += `        "ceilingHeight": ${map.playerStart.ceilingHeight},\n`;
                jsContent += `        "ceilingTexture": ${map.playerStart.ceilingTexture},\n`;
                jsContent += `        "floorTexture": ${map.playerStart.floorTexture}\n`;
                jsContent += '      }\n';
                
                jsContent += '    }';
                if (index < mapsArray.length - 1) jsContent += ',';
                jsContent += '\n';
            });
            
            jsContent += '    ];\n\n';
            
            // Add export statement for ES6 modules compatibility
            jsContent += '// Export for ES6 modules\n';
            jsContent += 'if (typeof module !== "undefined" && module.exports) {\n';
            jsContent += '    module.exports = maps;\n';
            jsContent += '}\n';
            
            return jsContent;
        }

        function copyMapsJSToClipboard() {
            // Always copy ALL maps to clipboard
            const allMapsData = [];
            
            // Save current map first
            if (APP_STATE.currentMapId) {
                saveCurrentMap();
            }
            
            // Collect all maps
            APP_STATE.allMaps.forEach((mapData, mapId) => {
                allMapsData.push(generateRaycastFormat(mapData));
            });
            
            // Sort by mapID for consistent order
            allMapsData.sort((a, b) => a.mapID - b.mapID);
            
            const mapsJSContent = generateMapsJSFormat(allMapsData);
            
            navigator.clipboard.writeText(mapsJSContent).then(() => {
                showStatus(`Maps.js avec ${allMapsData.length} carte(s) copié dans le presse-papier`, 'ok');
            }).catch(() => {
                const textArea = document.createElement('textarea');
                textArea.value = mapsJSContent;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showStatus(`Maps.js avec ${allMapsData.length} carte(s) copié dans le presse-papier`, 'ok');
            });
        }
        function exportCurrentMap() {
            if (!APP_STATE.currentMapId) {
                showStatus('Aucune carte à exporter', 'warning');
                return;
            }
            
            saveCurrentMap();
            const mapData = generateRaycastFormat(APP_STATE.allMaps.get(APP_STATE.currentMapId));
            
            const blob = new Blob([JSON.stringify(mapData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `oasis_map_${APP_STATE.currentMapId}.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            showStatus('Carte exportée', 'ok');
        }

        function exportSingleMap(mapId) {
            const mapData = generateRaycastFormat(APP_STATE.allMaps.get(mapId));
            
            const blob = new Blob([JSON.stringify(mapData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `oasis_map_${mapId}.json`;
            a.click();
            URL.revokeObjectURL(url);
        }

        function exportAllMaps() {
            const allMapsData = [];
            
            APP_STATE.allMaps.forEach((mapData, mapId) => {
                allMapsData.push(generateRaycastFormat(mapData));
            });
            
            const exportData = {
                version: '4.0',
                maps: allMapsData,
                exportDate: new Date().toISOString()
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `oasis_maps_collection.json`;
            a.click();
            URL.revokeObjectURL(url);
            
            showStatus('Collection exportée', 'ok');
        }

        function generateRaycastFormat(mapData) {
            // Ensure decimal values are preserved in the export
            const exportMap = mapData.map.map(row => 
                row.map(cell => {
                    // Preserve decimal values for floor textures
                    if (cell > 0 && cell < 1) {
                        return Math.round(cell * 100) / 100; // Ensure 2 decimal places
                    }
                    return cell;
                })
            );
            
            const raycastSprites = mapData.sprites.map(sprite => [
                sprite.id,
                sprite.x,
                sprite.y,
                sprite.type,
                sprite.texture,
                sprite.face || null,
                sprite.name,
                sprite.dialogues || [],
                sprite.items || [],
                sprite.hp || 1,
                sprite.damage || 0,
                sprite.lootClass || 0
            ]);
            
            const eventA = [];
            const eventB = [];
            
            mapData.teleporters.forEach(teleporter => {
                if (teleporter.pointA && teleporter.pointB) {
                    eventA.push([
                        teleporter.pointA.x,
                        teleporter.pointA.y,
                        getOrientationValue(teleporter.pointA.direction),
                        teleporter.pointA.ceilingRender,
                        teleporter.pointA.ceilingTexture,
                        teleporter.pointA.ceilingHeight,
                        teleporter.pointA.floorTexture,
                        teleporter.pointA.message
                    ]);
                    
                    eventB.push([
                        teleporter.pointB.x,
                        teleporter.pointB.y,
                        getOrientationValue(teleporter.pointB.direction),
                        teleporter.pointB.ceilingRender,
                        teleporter.pointB.ceilingTexture,
                        teleporter.pointB.ceilingHeight,
                        teleporter.pointB.floorTexture,
                        teleporter.pointB.message
                    ]);
                }
            });
            
            return {
                mapID: mapData.mapID,
                map: exportMap,
                sprites: raycastSprites,
                eventA: eventA,
                eventB: eventB,
                playerStart: mapData.playerStart
            };
        }

        function copyExportToClipboard() {
            if (!APP_STATE.currentMapId) {
                showStatus('Aucune carte à exporter', 'warning');
                return;
            }
            
            saveCurrentMap();
            const mapData = generateRaycastFormat(APP_STATE.allMaps.get(APP_STATE.currentMapId));
            const jsonString = JSON.stringify(mapData, null, 2);
            
            navigator.clipboard.writeText(jsonString).then(() => {
                showStatus('JSON copié dans le presse-papier', 'ok');
            }).catch(() => {
                const textArea = document.createElement('textarea');
                textArea.value = jsonString;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showStatus('JSON copié dans le presse-papier', 'ok');
            });
        }

        function downloadMapFile() {
            exportCurrentMap();
        }

        function importFromFile() {
            document.getElementById('import-file-input').click();
        }

        function importMapFile() {
            document.getElementById('import-file-input').click();
        }

function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const content = e.target.result;
            
            // Check if it's a JavaScript file (Maps.js)
            if (file.name.endsWith('.js')) {
                if (parseMapsJSContent(content)) {
                    showStatus(`Maps.js importé avec succès (${APP_STATE.allMaps.size} cartes)`, 'ok');
                    updateMapsManagerList();
                    
                    // Load the first map
                    if (APP_STATE.allMaps.size > 0) {
                        const firstMapId = APP_STATE.allMaps.keys().next().value;
                        loadMapIntoEditor(firstMapId);
                    }
                }
            } else {
                // Parse as JSON
                const data = JSON.parse(content);
                
                if (data.grid && data.metadata) {
                    importDungeonData(data);
                } else if (data.maps) {
                    importMapsCollection(data.maps);
                } else if (data.mapID) {
                    importSingleMap(data);
                } else {
                    showStatus('Format de fichier non reconnu', 'error');
                }
            }
        } catch (error) {
            showStatus('Erreur lors de l\'importation', 'error');
            console.error('Import error:', error);
        }
    };
    reader.readAsText(file);
    
    event.target.value = '';
}

        function importSingleMap(mapData) {
            const editorMap = {
                mapID: mapData.mapID,
                name: `Carte ${mapData.mapID}`,
                map: mapData.map,
                sprites: mapData.sprites.map(s => ({
                    id: s[0],
                    x: s[1],
                    y: s[2],
                    type: s[3],
                    texture: s[4],
                    face: s[5],
                    name: s[6] || `Sprite ${s[0]}`,
                    dialogues: s[7] || [],
                    items: s[8] || [],
                    hp: s[9] || 1,
                    damage: s[10] || 0,
                    lootClass: s[11] || 0
                })),
                teleporters: [],
                playerStart: mapData.playerStart
            };
            
            if (mapData.eventA && mapData.eventB && mapData.eventA.length === mapData.eventB.length) {
                for (let i = 0; i < mapData.eventA.length; i++) {
                    const eventA = mapData.eventA[i];
                    const eventB = mapData.eventB[i];
                    
                    editorMap.teleporters.push({
                        id: i + 1,
                        name: `Téléporteur ${i + 1}`,
                        pointA: {
                            x: eventA[0],
                            y: eventA[1],
                            direction: getOrientationName(eventA[2]),
                            ceilingRender: eventA[3],
                            ceilingTexture: eventA[4],
                            ceilingHeight: eventA[5],
                            floorTexture: eventA[6],
                            message: eventA[7]
                        },
                        pointB: {
                            x: eventB[0],
                            y: eventB[1],
                            direction: getOrientationName(eventB[2]),
                            ceilingRender: eventB[3],
                            ceilingTexture: eventB[4],
                            ceilingHeight: eventB[5],
                            floorTexture: eventB[6],
                            message: eventB[7]
                        }
                    });
                }
            }
            
            APP_STATE.allMaps.set(mapData.mapID, editorMap);
            saveAllMaps();
            loadMapIntoEditor(mapData.mapID);
            showStatus(`Carte ${mapData.mapID} importée`, 'ok');
        }

        function importMapsCollection(maps) {
            let importedCount = 0;
            
            maps.forEach(mapData => {
                try {
                    importSingleMap(mapData);
                    importedCount++;
                } catch (error) {
                    console.error('Error importing map:', mapData.mapID, error);
                }
            });
            
            showStatus(`${importedCount} cartes importées`, 'ok');
        }

        function getOrientationName(value) {
            const orientations = {
                [Math.PI / 2]: 'nord',
                [0]: 'est',
                [3 * Math.PI / 2]: 'sud',
                [Math.PI]: 'ouest'
            };
            
            let closestOrientation = 'nord';
            let minDiff = Math.PI;
            
            Object.entries(orientations).forEach(([radians, name]) => {
                const diff = Math.abs(parseFloat(radians) - value);
                if (diff < minDiff) {
                    minDiff = diff;
                    closestOrientation = name;
                }
            });
            
            return closestOrientation;
        }

        // Import from dungeon generator
        function importDungeonGenerator() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            input.onchange = function(event) {
                const file = event.target.files[0];
                if (!file) return;
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        const data = JSON.parse(e.target.result);
                        importDungeonData(data);
                    } catch (error) {
                        showStatus('Erreur lors de l\'importation du donjon', 'error');
                        console.error('Import error:', error);
                    }
                };
                reader.readAsText(file);
            };
            input.click();
        }

        function importDungeonData(dungeonData) {
            if (!dungeonData.grid && !dungeonData.metadata) {
                showStatus('Format de donjon non reconnu', 'error');
                return;
            }
            
            const mapId = getNextMapId();
            const newMap = {
                mapID: mapId,
                name: `Donjon Généré ${mapId}`,
                map: [],
                sprites: [],
                teleporters: [],
                playerStart: {
                    X: 12,
                    Y: 12,
                    Orientation: Math.PI / 2,
                    ceilingRender: false,
                    ceilingHeight: 2,
                    ceilingTexture: 1,
                    floorTexture: 3
                }
            };
            
            const dungeonGrid = dungeonData.grid;
            const gridSize = dungeonGrid.length;
            
            newMap.map = Array(24).fill().map(() => Array(24).fill(1));
            
            const ratio = gridSize / 24;
            
            for (let y = 0; y < 24; y++) {
                for (let x = 0; x < 24; x++) {
                    if (x === 0 || x === 23 || y === 0 || y === 23) {
                        newMap.map[y][x] = 1;
                        continue;
                    }
                    
                    const sourceX = Math.floor(x * ratio);
                    const sourceY = Math.floor(y * ratio);
                    
                    if (sourceX < gridSize && sourceY < gridSize) {
                        newMap.map[y][x] = dungeonGrid[sourceY][sourceX] === 0 ? 0 : 1;
                    }
                }
            }
            
            const metadata = dungeonData.metadata;
            if (metadata && metadata.start && metadata.end) {
                const startX = Math.floor(metadata.start.x / ratio);
                const startY = Math.floor(metadata.start.y / ratio);
                const endX = Math.floor(metadata.end.x / ratio);
                const endY = Math.floor(metadata.end.y / ratio);
                
                if (startX > 0 && startX < 23 && startY > 0 && startY < 23) {
                    newMap.playerStart.X = startX;
                    newMap.playerStart.Y = startY;
                }
                
                if (endX > 0 && endX < 23 && endY > 0 && endY < 23) {
                    const exitSprite = createBaseSpriteAt(endX, endY, 'exit');
                    newMap.sprites.push(exitSprite);
                }
            }
            
            addRandomSpritesToDungeon(newMap);
            
            APP_STATE.allMaps.set(mapId, newMap);
            saveAllMaps();
            loadMapIntoEditor(mapId);
            
            showStatus(`Donjon importé (ID: ${mapId})`, 'ok');
        }

        function addRandomSpritesToDungeon(mapData) {
            const floorCells = [];
            
            for (let y = 1; y < 23; y++) {
                for (let x = 1; x < 23; x++) {
                    if (mapData.map[y][x] === 0) {
                        floorCells.push({x, y});
                    }
                }
            }
            
            const spriteTypes = ['guard', 'merchant', 'bat', 'chest'];
            const numSprites = Math.min(8, Math.floor(floorCells.length / 10));
            
            for (let i = 0; i < numSprites; i++) {
                if (floorCells.length === 0) break;
                
                const randomIndex = Math.floor(Math.random() * floorCells.length);
                const pos = floorCells.splice(randomIndex, 1)[0];
                const spriteType = spriteTypes[Math.floor(Math.random() * spriteTypes.length)];
                
                const sprite = createBaseSpriteAt(pos.x, pos.y, spriteType);
                mapData.sprites.push(sprite);
            }
        }

        // Storage
        function saveAllMaps() {
            const mapsData = {};
            APP_STATE.allMaps.forEach((mapData, mapId) => {
                mapsData[mapId] = mapData;
            });
            localStorage.setItem('oasis_editor_maps_v4', JSON.stringify(mapsData));
        }

        function loadAllMaps() {
            try {
                const saved = localStorage.getItem('oasis_editor_maps_v4');
                if (saved) {
                    const mapsData = JSON.parse(saved);
                    Object.entries(mapsData).forEach(([mapId, mapData]) => {
                        APP_STATE.allMaps.set(parseInt(mapId), mapData);
                    });
                }
            } catch (error) {
                console.error('Error loading maps:', error);
            }
        }

        // Utility functions
        function clearMap() {
            if (confirm('Vider complètement la carte ? Cette action est irréversible.')) {
                saveToHistory();
                
                APP_STATE.map = Array(24).fill().map(() => Array(24).fill(0));
                initializeBorders();
                
                APP_STATE.sprites = [];
                APP_STATE.teleporters = [];
                APP_STATE.selectedSprite = null;
                APP_STATE.selectedTeleporter = null;
                
                // Reset terrain mode to regular terrain
                APP_STATE.terrainMode = 'terrain';
                APP_STATE.selectedFloorTexture = null;
                
                markDirty();
                updateDisplay();
                updateTeleportList();
                validateCurrentMap();
                showStatus('Carte vidée', 'ok');
            }
        }

        function showStatus(message, type = 'ok') {
            const statusText = document.getElementById('status-text');
            const statusIndicator = statusText.parentElement.querySelector('.status-indicator');
            
            statusText.textContent = message;
            statusIndicator.className = `status-indicator status-${type}`;
            
            setTimeout(() => {
                statusText.textContent = 'Prêt';
                statusIndicator.className = 'status-indicator status-ok';
            }, 3000);
        }

        // Event listeners
        function setupEventListeners() {
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey) {
                    switch (e.key) {
                        case 'z':
                            e.preventDefault();
                            undoAction();
                            break;
                        case 'y':
                            e.preventDefault();
                            redoAction();
                            break;
                        case 's':
                            e.preventDefault();
                            if (e.shiftKey && mapsFileHandle) {
                                // Ctrl+Shift+S = Save to Maps.js
                                saveMapsJSFile();
                            } else {
                                // Ctrl+S = Save current map
                                saveCurrentMap();
                            }
                            break;
                        case 'n':
                            e.preventDefault();
                            if (confirm('Créer une nouvelle carte ?')) {
                                createNewMap();
                            }
                        case 'o':
                        e.preventDefault();
                        openMapsJSFile();
                        break;
                    }
                }
                
                // ESC pour annuler les modes
                if (e.key === 'Escape') {
                    APP_STATE.playerPositionMode = false;
                    APP_STATE.baseSpriteMode = null;
                    APP_STATE.customSpritePlacementMode = false;
                    APP_STATE.customSpriteConfig = null;
                    APP_STATE.teleportPlacementMode = null;
                    updateToolDisplay();
                    updateTeleportButtons();
                }
            });
            
            document.addEventListener('mouseup', () => {
                APP_STATE.isDrawing = false;
                APP_STATE.drawStart = null;
                removeDrawingPreview();
            });
            
            ['player-x', 'player-y', 'map-id'].forEach(id => {
                document.getElementById(id).addEventListener('input', validateCurrentMap);
            });
            
            // Initialize editor areas
            APP_STATE.editorShopItems = [];
        }

        // Initialize the application
        function init() {
            initializeBorders();
            createGrid();
            createCoordinateLabels();
            loadAllMaps();
            createNewMap();
            updateDisplay();
            setupEventListeners();
            validateCurrentMap();
            updateToolDisplay();
            
            // Nouveau : peupler les sprites de base
            populateBaseSpritesSection();

            // Add beforeunload handler
            window.addEventListener('beforeunload', (e) => {
                if (APP_STATE.isDirty && mapsFileHandle) {
                    e.preventDefault();
                    e.returnValue = 'Vous avez des modifications non sauvegardées dans Maps.js. Êtes-vous sûr de vouloir quitter ?';
                }
            });
        }

// File handle for direct Maps.js access
let mapsFileHandle = null;

// Open Maps.js file for direct editing
async function openMapsJSFile() {
    try {
        // Check if File System Access API is supported
        if (!('showOpenFilePicker' in window)) {
            // Fallback to regular file input
            importMapsJSFile();
            return;
        }

        // Open file picker
        const [fileHandle] = await window.showOpenFilePicker({
            types: [{
                description: 'JavaScript Files',
                accept: {'application/javascript': ['.js']}
            }],
            multiple: false
        });

        mapsFileHandle = fileHandle;
        
        // Read the file
        const file = await fileHandle.getFile();
        const content = await file.text();
        
        // Parse the Maps.js content
        if (parseMapsJSContent(content)) {
            showStatus(`Maps.js chargé avec succès (${APP_STATE.allMaps.size} cartes)`, 'ok');
            updateMapsManagerList();
            
            // Update file status indicator
            document.getElementById('file-status').style.display = 'flex';
            
            // Load the first map
            if (APP_STATE.allMaps.size > 0) {
                const firstMapId = APP_STATE.allMaps.keys().next().value;
                loadMapIntoEditor(firstMapId);
            }
        }
    } catch (err) {
        if (err.name !== 'AbortError') {
            showStatus('Erreur lors de l\'ouverture du fichier', 'error');
            console.error(err);
        }
    }
}

// Save directly to Maps.js file
async function saveMapsJSFile() {
    if (!mapsFileHandle) {
        showStatus('Aucun fichier Maps.js ouvert. Utilisez "Ouvrir Maps.js" d\'abord', 'warning');
        return;
    }

    try {
        // Save current map first
        if (APP_STATE.currentMapId) {
            saveCurrentMap();
        }

        // Generate Maps.js content
        const allMapsData = [];
        APP_STATE.allMaps.forEach((mapData, mapId) => {
            allMapsData.push(generateRaycastFormat(mapData));
        });
        allMapsData.sort((a, b) => a.mapID - b.mapID);
        
        const mapsJSContent = generateMapsJSFormat(allMapsData);

        // Create a writable stream
        const writable = await mapsFileHandle.createWritable();
        await writable.write(mapsJSContent);
        await writable.close();

        showStatus(`Maps.js sauvegardé avec succès (${allMapsData.length} cartes)`, 'ok');
        APP_STATE.isDirty = false;
        updateCurrentMapInfo();
    } catch (err) {
        showStatus('Erreur lors de la sauvegarde', 'error');
        console.error(err);
    }
}

// Parse Maps.js content
function parseMapsJSContent(content) {
    try {
        // Extract the maps array from the JavaScript content
        // Look for "const maps = [" pattern
        const mapsMatch = content.match(/const\s+maps\s*=\s*\[([\s\S]*?)\];/);
        if (!mapsMatch) {
            showStatus('Format Maps.js non reconnu', 'error');
            return false;
        }

        // Create a safe evaluation context
        const mapsArrayString = '[' + mapsMatch[1] + ']';
        
        // Use Function constructor for safer evaluation
        const maps = new Function('return ' + mapsArrayString)();

        // Clear existing maps
        APP_STATE.allMaps.clear();

        // Import each map
        maps.forEach(mapData => {
            const editorMap = {
                mapID: mapData.mapID,
                name: `Carte ${mapData.mapID}`,
                map: mapData.map,
                sprites: mapData.sprites.map(s => ({
                    id: s[0],
                    x: s[1],
                    y: s[2],
                    type: s[3],
                    texture: s[4],
                    face: s[5],
                    name: s[6] || `Sprite ${s[0]}`,
                    dialogues: s[7] || [],
                    items: s[8] || [],
                    hp: s[9] || 1,
                    damage: s[10] || 0,
                    lootClass: s[11] || 0
                })),
                teleporters: [],
                playerStart: mapData.playerStart
            };

            // Convert eventA/eventB to teleporters
            if (mapData.eventA && mapData.eventB && mapData.eventA.length === mapData.eventB.length) {
                for (let i = 0; i < mapData.eventA.length; i++) {
                    const eventA = mapData.eventA[i];
                    const eventB = mapData.eventB[i];
                    
                    editorMap.teleporters.push({
                        id: i + 1,
                        name: `Téléporteur ${i + 1}`,
                        pointA: {
                            x: eventA[0],
                            y: eventA[1],
                            direction: getOrientationName(eventA[2]),
                            ceilingRender: eventA[3],
                            ceilingTexture: eventA[4],
                            ceilingHeight: eventA[5],
                            floorTexture: eventA[6],
                            message: eventA[7]
                        },
                        pointB: {
                            x: eventB[0],
                            y: eventB[1],
                            direction: getOrientationName(eventB[2]),
                            ceilingRender: eventB[3],
                            ceilingTexture: eventB[4],
                            ceilingHeight: eventB[5],
                            floorTexture: eventB[6],
                            message: eventB[7]
                        }
                    });
                }
            }

            APP_STATE.allMaps.set(mapData.mapID, editorMap);
        });

        return true;
    } catch (err) {
        showStatus('Erreur lors du parsing du fichier Maps.js', 'error');
        console.error(err);
        return false;
    }
}

// Import Maps.js file (fallback for browsers without File System Access API)
function importMapsJSFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.js';
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const content = e.target.result;
                if (parseMapsJSContent(content)) {
                    showStatus(`Maps.js importé avec succès (${APP_STATE.allMaps.size} cartes)`, 'ok');
                    updateMapsManagerList();
                    
                    // Load the first map
                    if (APP_STATE.allMaps.size > 0) {
                        const firstMapId = APP_STATE.allMaps.keys().next().value;
                        loadMapIntoEditor(firstMapId);
                    }
                }
            } catch (error) {
                showStatus('Erreur lors de l\'importation de Maps.js', 'error');
                console.error('Import error:', error);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// Close Maps.js file connection
function closeMapsJSFile() {
    mapsFileHandle = null;
    document.getElementById('file-status').style.display = 'none';
    updateCurrentMapInfo();
    showStatus('Connexion Maps.js fermée', 'ok');
}
        
        // Initialize the application
        window.addEventListener('DOMContentLoaded', init);