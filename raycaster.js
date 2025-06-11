
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// moteur de jeu
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class Raycaster {
    constructor(
        mainCanvas,
        displayWidth = 330,
        displayHeight = 190,
        tileSize = 1280,
        textureSize = 64,
        fovDegrees = 90
    ) {
        // Initialisation de la carte
        this.initMap(currentMap, mapData.map, mapData.eventA, mapData.eventB);
        
        // Propriétés de base
        // Largeur des rayons, cependant, les sprites ont du mal à être déte
        this.stripWidth = 1;
        this.rayCount = Math.ceil(displayWidth / this.stripWidth);




        this.ceilingHeight = 1;
        this.mainCanvas = mainCanvas;
        this.mapWidth = this.map[0].length;
        this.mapHeight = this.map.length;
        this.displayWidth = displayWidth;
        this.displayHeight = displayHeight;




        this.tileSize = tileSize;
        this.worldWidth = this.mapWidth * this.tileSize;
        this.worldHeight = this.mapHeight * this.tileSize;
        this.textureSize = textureSize;
        this.fovRadians = (fovDegrees * Math.PI) / 180;
        this.viewDist = (this.displayWidth >> 1) / Math.tan(this.fovRadians / 2);
        this.rayAngles = null;
        this.viewDistances = null;
        this.backBuffer = null;

        // Contexte et données d'image
        this.mainCanvasContext = null;
        this.screenImageData = null;
        this.textureIndex = 0;
        this.textureImageDatas = [];
        this.texturesLoadedCount = 0;
        this.texturesLoaded = false;

        // IA / Deplacement Ennemis
        this.enemyMoveCounter = 0;
        
        // NOUVEAU : Marqueur pour savoir si le jeu est prêt
        this.gameReady = false;
        
        // OPTIMISATION : Caches et tables de lookup
        this.textureCache = new Map();
        this.spriteSpatialIndex = new Map();
        this.sinTable = null;
        this.cosTable = null;
        this.tanTable = null;
        // Après les propriétés existantes comme this.sinTable, this.cosTable, etc.
        this.fogTable = null;
        this.angleNormTable = null;
        this.fishEyeTable = null;
        this.textureCoordTable = null;
        
        // OPTIMISATION : Constantes pré-calculées
        this.halfDisplayWidth = this.displayWidth >> 1;
        this.halfDisplayHeight = this.displayHeight >> 1;
        this.tileSizeSquared = this.tileSize * this.tileSize;
        this.maxDistanceSquared = (this.worldWidth * this.worldWidth) + (this.worldHeight * this.worldHeight);
        
// Initialisation synchrone
this.initPlayer();
this.initSprites(mapData.sprites);
this.player.bindKeysAndButtons();
this.initScreen(); // Cette méthode appelle loadFloorCeilingImages()
this.drawMiniMap();

// IMPORTANT : Ces deux méthodes DOIVENT être appelées en premier
this.createRayAngles();      // Crée this.rayAngles
this.createViewDistances();   // Crée this.viewDistances

// ENSUITE initialiser les tables qui en dépendent
this.initTrigTables();        // Utilise this.rayAngles
this.initFogTable();          // Table de brouillard
this.initAngleTable();        // Cache d'angles
this.initFishEyeTable();      // Utilise this.rayAngles
this.initTextureTable();      // Cache de textures
this.initFloorCeilingOptimizations()

this.past = Date.now();
        
        // NOUVEAU : Charger les ressources de manière asynchrone
        this.initializeResources().then(() => {
            this.gameReady = true;
            console.log("✅ Toutes les ressources sont chargées ! Le jeu peut démarrer.");
            
            // Optionnel : Cacher un écran de chargement si vous en avez un
            const loadingScreen = document.getElementById('loadingScreen');
            if (loadingScreen) {
                loadingScreen.style.display = 'none';
            }
        }).catch(error => {
            console.error("❌ Erreur lors du chargement des ressources:", error);
            // Optionnel : Afficher un message d'erreur à l'utilisateur
            const errorMessage = document.getElementById('errorMessage');
            if (errorMessage) {
                errorMessage.textContent = "Erreur lors du chargement du jeu. Veuillez rafraîchir la page.";
                errorMessage.style.display = 'block';
            }
        });
    }

    // OPTIMISATION : Initialiser les tables trigonométriques
    initTrigTables() {
        this.sinTable = new Float32Array(this.rayCount);
        this.cosTable = new Float32Array(this.rayCount);
        this.tanTable = new Float32Array(this.rayCount);
        
        for (let i = 0; i < this.rayCount; i++) {
            const angle = this.rayAngles[i];
            this.sinTable[i] = Math.sin(angle);
            this.cosTable[i] = Math.cos(angle);
            this.tanTable[i] = Math.tan(angle);
        }
        
        console.log("Tables trigonométriques initialisées");
    }


///// EFFETS VISUELS

// Effet pour l'absorption par l'armure
static armorAbsorbFlash() {
    var element = document.getElementById("gameWindow");
    element.style.transition = "filter 0.3s";
    element.style.filter = "brightness(1.5) contrast(1.2)";
    
    setTimeout(function() {
        element.style.filter = "";
    }, 150);
}

// Effet pour l'esquive
static dodgeEffect() {
    var element = document.getElementById("mainCanvas");
    element.style.transition = "transform 0.3s ease-out";
    element.style.transform = "translateX(20px)";
    
    setTimeout(function() {
        element.style.transform = "translateX(-20px)";
        setTimeout(function() {
            element.style.transform = "";
        }, 150);
    }, 150);
}

// Dans Sprite.js, ajouter l'effet de mort :
// Dans Sprite.js, modifier la méthode deathEffect pour sauvegarder l'état initial :
static deathEffect() {
    const gameWindow = document.getElementById("gameWindow");
    const mainCanvas = document.getElementById("mainCanvas");
    
    // Sauvegarder les styles originaux si pas déjà fait
    if (!window.originalCanvasStyles) {
        window.originalCanvasStyles = {
            transform: mainCanvas.style.transform || '',
            opacity: mainCanvas.style.opacity || '1',
            transition: mainCanvas.style.transition || ''
        };
    }
    
    // Effet de rotation et fade
    mainCanvas.style.transition = "transform 2s ease-in, opacity 2s ease-in";
    mainCanvas.style.transform = "rotate(15deg) scale(0.8)";
    mainCanvas.style.opacity = "0.3";
    
    // Pulsation rouge
    let pulseCount = 0;
    const pulseInterval = setInterval(() => {
        if (pulseCount >= 3) {
            clearInterval(pulseInterval);
            return;
        }
        
        gameWindow.style.backgroundColor = "rgba(100, 0, 0, 0.5)";
        setTimeout(() => {
            gameWindow.style.backgroundColor = "";
        }, 200);
        
        pulseCount++;
    }, 400);
}

// Dans Raycaster.js, ajouter une méthode pour réinitialiser les effets visuels :
static resetVisualEffects() {
    const gameWindow = document.getElementById("gameWindow");
    const mainCanvas = document.getElementById("mainCanvas");
    
    // Réinitialiser le gameWindow
    gameWindow.style.backgroundColor = "";
    gameWindow.style.transform = "";
    gameWindow.style.filter = "";
    
    // Réinitialiser le canvas en utilisant les styles sauvegardés
    if (window.originalCanvasStyles) {
        mainCanvas.style.transform = window.originalCanvasStyles.transform;
        mainCanvas.style.opacity = window.originalCanvasStyles.opacity;
        mainCanvas.style.transition = window.originalCanvasStyles.transition;
    } else {
        // Valeurs par défaut si pas de sauvegarde
        mainCanvas.style.transform = "";
        mainCanvas.style.opacity = "1";
        mainCanvas.style.transition = "";
    }
}

///// NOUVELLES OPTIS

initTextureTable() {
    console.log("Initialisation du cache de coordonnées de texture...");
    
    // Initialiser le cache
    this.textureCoordCache = new Map();
    this.textureCoordCacheLimit = 2000;
    
    // Table de modulo pour les puissances de 2 (optionnel)
    this.moduloTable = new Uint16Array(256);
    for (let i = 0; i < 256; i++) {
        this.moduloTable[i] = i % this.textureSize;
    }
    
    console.log("Cache de coordonnées de texture initialisé");
}

// Méthode à ajouter dans la classe Raycaster
initFogTable() {
    console.log("Initialisation de la table de brouillard...");
    
    // Configuration
    const maxDistance = this.tileSize * 20; // Couvre jusqu'à 20 tuiles
    const step = 50; // Résolution de la table (plus petit = plus précis mais plus de mémoire)
    const tableSize = Math.ceil(maxDistance / step) + 1;
    
    this.fogTable = new Float32Array(tableSize);
    this.fogTableStep = step;
    
    // Précalculer tous les facteurs de brouillard
    for (let i = 0; i < tableSize; i++) {
        const distance = i * step;
        
        // Utiliser la fonction globale calculateFogFactor de config.js
        if (typeof calculateFogFactor === 'function') {
            this.fogTable[i] = calculateFogFactor(distance);
        } else {
            // Fallback si la fonction n'est pas disponible
            if (!fogEnabled) {
                this.fogTable[i] = 0;
            } else if (distance <= fogMinDistance) {
                this.fogTable[i] = 0;
            } else if (distance >= fogMaxDistance) {
                this.fogTable[i] = fogDensity;
            } else {
                const range = fogMaxDistance - fogMinDistance;
                const distFromMin = distance - fogMinDistance;
                this.fogTable[i] = (distFromMin / range) * fogDensity;
            }
        }
    }
    
    console.log(`Table de brouillard créée : ${tableSize} entrées`);
}

// Méthode helper pour obtenir rapidement un facteur de brouillard
getFogFactorFast(distance) {
    if (!fogEnabled) return 0;
    
    const index = (distance / this.fogTableStep) | 0;
    
    // Si hors limites, calculer normalement
    if (index >= this.fogTable.length) {
        return fogDensity;
    }
    
    // Interpolation linéaire pour plus de précision
    const remainder = distance - (index * this.fogTableStep);
    const t = remainder / this.fogTableStep;
    
    if (index + 1 < this.fogTable.length) {
        // Interpoler entre deux valeurs de la table
        return this.fogTable[index] * (1 - t) + this.fogTable[index + 1] * t;
    }
    
    return this.fogTable[index];
}

// Cache pour la normalisation d'angles
initAngleTable() {
    console.log("Initialisation du cache de normalisation d'angles...");
    
    // Utiliser un Map pour le cache avec une limite de taille
    this.angleNormCache = new Map();
    this.angleNormCacheLimit = 5000;
    
    // Vérifier que rayAngles existe
    if (!this.rayAngles) {
        console.warn("rayAngles non initialisé, skip précalcul");
        return;
    }
    
    // Précalculer les angles courants (angles des rayons)
    for (let i = 0; i < this.rayCount; i++) {
        const angle = this.rayAngles[i];
        this.cacheNormalizedAngle(angle);
        
        // Précalculer aussi avec différentes rotations du joueur
        for (let rot = 0; rot < Raycaster.TWO_PI; rot += Math.PI / 8) {
            this.cacheNormalizedAngle(angle + rot);
        }
    }
    
    console.log(`Cache d'angles initialisé avec ${this.angleNormCache.size} entrées`);
}

// Helper pour mettre en cache un angle normalisé
cacheNormalizedAngle(angle) {
    const key = ((angle * 10000) | 0); // Précision à 4 décimales
    
    if (!this.angleNormCache.has(key)) {
        const normalized = ((angle % Raycaster.TWO_PI) + Raycaster.TWO_PI) % Raycaster.TWO_PI;
        
        // Vérifier la limite du cache
        if (this.angleNormCache.size >= this.angleNormCacheLimit) {
            // Supprimer les entrées les plus anciennes (FIFO)
            const firstKey = this.angleNormCache.keys().next().value;
            this.angleNormCache.delete(firstKey);
        }
        
        this.angleNormCache.set(key, normalized);
    }
}

// Version optimisée de normalizeAngle
static normalizeAngleFast(angle, raycaster) {
    // Essayer le cache d'abord
    if (raycaster && raycaster.angleNormCache) {
        const key = ((angle * 10000) | 0);
        const cached = raycaster.angleNormCache.get(key);
        
        if (cached !== undefined) {
            return cached;
        }
        
        // Si pas dans le cache, calculer et mettre en cache
        const normalized = ((angle % Raycaster.TWO_PI) + Raycaster.TWO_PI) % Raycaster.TWO_PI;
        if (raycaster.angleNormCache) {
            raycaster.angleNormCache.set(key, normalized);
        }
        return normalized;
    }
    
    // Fallback vers la méthode statique normale
    return Raycaster.normalizeAngle(angle);
}

// Table pour la correction de l'effet fish-eye
initFishEyeTable() {
    console.log("Initialisation de la table de correction fish-eye...");
    
    this.fishEyeTable = new Float32Array(this.rayCount);
    
    // Précalculer le cosinus pour chaque angle de rayon
    for (let i = 0; i < this.rayCount; i++) {
        this.fishEyeTable[i] = Math.cos(this.rayAngles[i]);
    }
    
    console.log(`Table fish-eye créée : ${this.rayCount} entrées`);
}

// Helper pour obtenir le facteur de correction
getFishEyeCorrection(stripIdx) {
    if (stripIdx >= 0 && stripIdx < this.fishEyeTable.length) {
        return this.fishEyeTable[stripIdx];
    }
    // Fallback si index invalide
    return Math.cos(this.rayAngles[stripIdx] || 0);
}

// 3. FONCTION HELPER : Initialisation des tables d'optimisation
// À appeler dans le constructeur ou après changement de configuration
initFloorCeilingOptimizations() {
    // Forcer la recréation des caches de distance
    this.floorDistanceCache = null;
    this.ceilingDistanceCache = null;
    
    // Pré-calculer les masques bit à bit
    this.tileSizeMask = this.tileSize - 1;
    
    // Vérifier que les tables trigonométriques sont initialisées
    if (!this.cosTable || !this.sinTable) {
        console.warn("Tables trigonométriques non initialisées pour l'optimisation sol/plafond");
    }
    
    console.log("Optimisations sol/plafond initialisées");
}

/////// FIN NOUVELLES

    // NOUVELLE MÉTHODE : Initialisation asynchrone des ressources
    async initializeResources() {
        console.log("🔄 Début du chargement des ressources...");
        
        try {
            // Charger toutes les textures (sol, plafond, murs, sprites)
            await this.loadFloorCeilingImages();
            
            // Vous pouvez ajouter d'autres chargements asynchrones ici si nécessaire
            // Par exemple :
            // await this.loadSoundEffects();
            // await this.loadMusic();
            // await this.preloadLevelData();
            
            console.log("✅ Chargement des ressources terminé");
        } catch (error) {
            console.error("❌ Erreur lors du chargement des ressources:", error);
            throw error; // Propager l'erreur pour la gérer dans le constructeur
        }
    }
    
    static get TWO_PI() {
        return Math.PI * 2;
    }

    static get MINIMAP_SCALE() {
        return 8;
    }
    
    // OPTIMISATION : Normalisation d'angle optimisée
    static normalizeAngle(angle) {
        // Version optimisée avec une seule opération modulo
        return ((angle % Raycaster.TWO_PI) + Raycaster.TWO_PI) % Raycaster.TWO_PI;
    }

    //////////////////////////////////////////////////////////////////////////////
    /// HORLOGE DU JEUX / GAMECYCLE
    //////////////////////////////////////////////////////////////////////////////

    gameCycle() {
        // NOUVEAU : Vérifier si le jeu est prêt avant de continuer
        if (!this.gameReady) {
            // Optionnel : Afficher un indicateur de chargement
            const loadingIndicator = document.getElementById('loadingIndicator');
            if (loadingIndicator && !this.loadingMessageShown) {
                loadingIndicator.textContent = "Chargement des textures...";
                this.loadingMessageShown = true;
            }
            
            // Rappeler gameCycle à la prochaine frame
            window.requestAnimationFrame(() => this.gameCycle());
            return;
        }
        
        // Le reste du code existant continue normalement
        const now = Date.now();
        let timeElapsed = now - this.past;
        this.past = now;
        
        // OPTIMISATION : Mettre à jour l'index spatial avant le mouvement
        this.updateSpriteSpatialIndex();
        
        this.player.move(timeElapsed, this.map, this.mapEventA, this.mapEventB, this.sprites);
        this.updateMiniMap();
        
        let rayHits = [];
        this.resetSpriteHits();
        this.castRays(rayHits);
        this.sortRayHits(rayHits);
        this.drawWorld(rayHits);
        
        // IA / Deplacements ennemis
        this.enemyMoveCounter = (this.enemyMoveCounter || 0) + timeElapsed;
        const baseInterval = 1500;
        if (this.enemyMoveCounter >= baseInterval) {
            this.enemyMoveCounter = 0;
            
            for (let sprite of this.sprites) {
                if (sprite.spriteType === "A" && sprite.hp > 0) {
                    sprite.moveRandomlyOrChase(this.map, this.sprites, this.player);
                }
            }
        }
        
        // Mise à jour des stats du joueur
        this.player.statsUpdate(this.player);
        
        // Gestion du temps
        totalTimeElapsed += timeElapsed;
        const oneSecond = 1000;
        timeSinceLastSecond += timeElapsed;
        if (timeSinceLastSecond >= oneSecond) {
            this.player.turn = true;
            timeSinceLastSecond -= oneSecond;
        }
        
        // Contrôle du fog - optimisé pour éviter les logs répétitifs
        if (ceilingRender !== this.lastCeilingRender) {
            this.lastCeilingRender = ceilingRender;
            if (ceilingRender) {
                console.log("Fog enabled");
                enableFog();
            } else {
                console.log("Fog disabled");
                disableFog();
            }
        }
        
        // ====== COMPTEUR FPS CORRIGÉ ======
        if (!this.fpsCounter) {
            this.fpsCounter = { frames: 0, lastTime: performance.now() };
        }
        
        this.fpsCounter.frames++;
        const nowPerf = performance.now();
        
        // opti

        if (nowPerf - this.fpsCounter.lastTime >= 1000) {  // Correction ici !
            console.log(`FPS: ${this.fpsCounter.frames}`);
            this.fpsCounter.frames = 0;
            this.fpsCounter.lastTime = nowPerf;
        }

        // Ajouter après le compteur FPS
        if (!this.perfTested && this.fpsCounter && this.fpsCounter.frames > 100) {
            console.log("=== Test de performance des optimisations ===");
            
            const iterations = 10000;
            
            // Test brouillard
            const fogStart = performance.now();
            for (let i = 0; i < iterations; i++) {
                this.getFogFactorFast(Math.random() * 10000);
            }
            console.log(`Fog lookup: ${(performance.now() - fogStart).toFixed(2)}ms pour ${iterations} appels`);
            
            // Test angles
            const angleStart = performance.now();
            for (let i = 0; i < iterations; i++) {
                Raycaster.normalizeAngleFast(Math.random() * Math.PI * 4, this);
            }
            console.log(`Angle normalization: ${(performance.now() - angleStart).toFixed(2)}ms pour ${iterations} appels`);
            
            this.perfTested = true;
        }
        
        // FIN OPTI

        // Rappel pour la prochaine frame
        let this2 = this;
        window.requestAnimationFrame(function() {
            this2.gameCycle();
        });

        // Debug temporaire au début de gameCycle
        if (!this.tablesChecked) {
            console.log("Vérification des tables de lookup:");
            console.log("- fogTable:", this.fogTable ? "OK" : "MANQUANT");
            console.log("- angleNormCache:", this.angleNormCache ? "OK" : "MANQUANT");
            console.log("- fishEyeTable:", this.fishEyeTable ? "OK" : "MANQUANT");
            console.log("- textureCoordCache:", this.textureCoordCache ? "OK" : "MANQUANT");
            console.log("- getTextureCoordFast:", typeof this.getTextureCoordFast === 'function' ? "OK" : "MANQUANT");
            this.tablesChecked = true;
        }
    }
        
    // OPTIMISATION : Mettre à jour l'index spatial des sprites
    updateSpriteSpatialIndex() {
        this.spriteSpatialIndex.clear();
        
        for (let sprite of this.sprites) {
            const cellX = (sprite.x / this.tileSize) | 0;
            const cellY = (sprite.y / this.tileSize) | 0;
            const cellKey = `${cellX},${cellY}`;
            
            if (!this.spriteSpatialIndex.has(cellKey)) {
                this.spriteSpatialIndex.set(cellKey, []);
            }
            this.spriteSpatialIndex.get(cellKey).push(sprite);
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Carte
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    initMap(mapID, map, mapEventA, mapEventB) {

        // Variable permettant de sauvegarder sprite et changer de carte
        this.mapID = mapID;

        console.log("load map ID : " + mapID);

        this.map = map;
        this.mapEventA = mapEventA;
        this.mapEventB = mapEventB;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Joueur
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    initPlayer() {
        const tileSizeHalf = this.tileSize >> 1;

        this.player = new Player(
            "Alakir",
            mapData.playerStart.X * this.tileSize + tileSizeHalf,
            mapData.playerStart.Y * this.tileSize + tileSizeHalf,
            mapData.playerStart.Orientation,
            this // Passage de l'instance de Raycaster à Player
        );


        // ajout de "this.statsUpdate", pour remplacer les manipulations HTML redondantes
        // Test de la méthode statique giveItem
        Item.giveItem(this.player, 1); // Donne "Short Sword and Shield" au joueur
        Item.giveItem(this.player, 2); // Donne "Quilted jacket" au joueur
        console.log(this.player.inventory);

        // Test de la méthode statique giveSpell
        Spell.giveSpell(this.player, 1); // Donne "Heal I" au joueur
        Spell.giveSpell(this.player, 2); // Donne "Sparks" au joueur
        console.log(this.player.spells);

        // Donner la quête prédéfinie au joueur
        Quest.giveQuest(this.player, 1);
        console.log(this.player.quests);

        // ajout de "this.statsUpdate", pour remplacer les manipulations HTML redondantes
        this.player.statsUpdate(this.player)

        // Initialiser l'or du joueur
        this.player.gold = 100; // Montant initial
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // NEW GAME / MENU / GAMEOVER
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Fonction resetShowGameOver corrigée
    static resetShowGameOver() {
        const mainCanvas = document.getElementById("mainCanvas");
        const cinematicWindow = document.getElementById("cinematicWindow");

        mainCanvas.style.display = "block";
        cinematicWindow.style.display = "none";
    }

    // Fonction showMainMenu corrigée
    static showMainMenu() {
        const renderWindow = document.getElementById("renderWindow");
        const cinematicWindow = document.getElementById("cinematicWindow");
        const mainMenuWindow = document.getElementById("mainMenuWindow");

        renderWindow.style.display = "none";
        cinematicWindow.style.display = "none";
        mainMenuWindow.style.display = "block";
    }

    // Fonction showRenderWindow corrigée
    static showRenderWindow() {
        const renderWindow = document.getElementById("renderWindow");
        const cinematicWindow = document.getElementById("cinematicWindow");
        const mainMenuWindow = document.getElementById("mainMenuWindow");
        const mainCanvas = document.getElementById("mainCanvas");

        renderWindow.style.display = "block";
        cinematicWindow.style.display = "none";
        mainMenuWindow.style.display = "none";
        mainCanvas.style.display = "block"; // S'assurer que le canvas est visible
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // MAPS AND NEW GAME
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    loadMap(mapID) {
        if (isChangingMap) {
            console.log("Changement de carte déjà en cours, opération annulée.");
            return; // Empêche l'appel si un changement de carte est déjà en cours
        }

        isChangingMap = true; // Active le verrou de changement de carte

        // Sauvegarder l'état du jeu avant de charger la nouvelle carte
        // this.saveGameState();

        currentMap = mapID;
        mapData = getMapDataByID(currentMap);

        this.initMap(currentMap, mapData.map, mapData.eventA, mapData.eventB);
        this.initSprites(mapData.sprites);
        this.loadMapSprites(currentMap);
        
        // OPTIMISATION : Réinitialiser les caches
        this.textureCache.clear();
        this.spriteSpatialIndex.clear();

        // Libérer le verrou après le chargement
        isChangingMap = false;
    }

    startMap(mapID) {
        // sauvegarder les sprites
        this.saveGameState();

        this.mapID = mapID; // Mise à jour de this.mapID

        const mapData = getMapDataByID(this.mapID); // Utilisation de this.mapID

        if (!mapData) {
            console.error(`Aucune donnée trouvée pour la carte avec l'ID ${this.mapID}`);
            return;
        }

        ceilingHeight = mapData.playerStart.ceilingHeight;
        ceilingRender = mapData.playerStart.ceilingRender;
        ceilingTexture = mapData.playerStart.ceilingTexture;
        floorTexture = mapData.playerStart.floorTexture;
        this.loadFloorCeilingImages();

        this.initMap(this.mapID, mapData.map, mapData.eventA, mapData.eventB);
        this.initSprites(mapData.sprites);
        this.loadMapSprites(this.mapID);
        this.player.x = mapData.playerStart.X * this.tileSize + (this.tileSize >> 1);
        this.player.y = mapData.playerStart.Y * this.tileSize + (this.tileSize >> 1);
        this.player.rot = mapData.playerStart.Orientation;
    }

    nextMap() {
        // Incrémenter l'ID de la carte pour charger la suivante
        this.mapID += 1;

        currentMap = this.mapID;

        const mapData = getMapDataByID(currentMap); // Utilisation de this.mapID


        if (!mapData) {
            console.error(`Aucune donnée trouvée pour la carte avec l'ID ${currentMap}`);
            // back to the current ID
            this.mapID -= 1;
            currentMap = this.mapID;
            return;
        }

        console.log("before nextMap():")
        console.log(this.player.x);
        console.log(this.player.y);
        console.log(this.player.rot);

        this.player.x = mapData.playerStart.X * this.tileSize + (this.tileSize >> 1);
        this.player.y = mapData.playerStart.Y * this.tileSize + (this.tileSize >> 1);
        this.player.rot = mapData.playerStart.Orientation;

        console.log("after nextMap():")
        console.log(this.player.x);
        console.log(this.player.y);
        console.log(this.player.rot);

        // Charger la nouvelle carte
        this.initMap(currentMap, mapData.map, mapData.eventA, mapData.eventB);
        this.initSprites(mapData.sprites);

        ceilingHeight = mapData.playerStart.ceilingHeight;
        ceilingRender = mapData.playerStart.ceilingRender;
        ceilingTexture = mapData.playerStart.ceilingTexture;
        floorTexture = mapData.playerStart.floorTexture;
        this.loadFloorCeilingImages();
        
        // OPTIMISATION : Réinitialiser les caches
        this.textureCache.clear();
        this.spriteSpatialIndex.clear();

    }

    newGame() {

        Raycaster.resetVisualEffects()

        currentMap = 1;
        mapData = getMapDataByID(currentMap);

        this.initPlayer();
        this.player.x = mapData.playerStart.X * this.tileSize + (this.tileSize >> 1);
        this.player.y = mapData.playerStart.Y * this.tileSize + (this.tileSize >> 1);
        this.player.rot = mapData.playerStart.Orientation;

        gameOver = false;

        // S'assurer que la cinématique est cachée
        const cinematicWindow = document.getElementById("cinematicWindow");
        if (cinematicWindow) {
            cinematicWindow.style.display = "none";
        }

        ceilingHeight = mapData.playerStart.ceilingHeight;
        ceilingRender = mapData.playerStart.ceilingRender;
        ceilingTexture = mapData.playerStart.ceilingTexture;
        floorTexture = mapData.playerStart.floorTexture;
        this.loadFloorCeilingImages();

        this.initMap(currentMap, mapData.map, mapData.eventA, mapData.eventB);
        this.initSprites(mapData.sprites);
        
        // OPTIMISATION : Réinitialiser les caches
        this.textureCache.clear();
        this.spriteSpatialIndex.clear();

        Raycaster.showRenderWindow();

        // xyz
        const mainCanvas = document.getElementById("mainCanvas");

        // Cacher le canvas et montrer l'image cinématique
        mainCanvas.style.display = "none";
        cinematicWindow.style.display = "block";
        Sprite.showIntroCinematic()


        // Relier de nouveau les boutons et touches après avoir démarré une nouvelle partie
        this.player.bindKeysAndButtons();
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // SAUVEGARGE ET CHARGEMENT
    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Fonction de sauvegarde complète (joueur + sprites)
    saveGameState() {
        if (this.player) {

            // Exclure explicitement l'instance de Raycaster
            const {
                raycaster,
                ...playerState
            } = this.player;

            // Sauvegarder l'or
            playerState.gold = this.player.gold;

            // Créer un objet de sauvegarde pour l'état du joueur
            playerState.inventory = this.player.inventory.map(item => ({
                id: item.id,
                equipped: item.equipped,
            }));
            playerState.spells = this.player.spells.map(spell => spell.id);
            playerState.quests = this.player.quests.map(quest => ({
                id: quest.id,
                completed: quest.completed
            }));
            playerState.ceilingHeight = ceilingHeight;
            playerState.ceilingRender = ceilingRender;
            playerState.floorTexture = floorTexture;
            playerState.ceilingTexture = ceilingTexture;
            playerState.mapID = this.mapID; // S'assurer que l'ID de la carte est bien sauvegardé

            // Sauvegarde l'état des sprites
            const spritesState = this.sprites.map(sprite => ({
                id: sprite.id,
                x: sprite.x,
                y: sprite.y,
                z: sprite.z,
                w: sprite.w,
                h: sprite.h,
                ang: sprite.ang,
                spriteType: sprite.spriteType,
                spriteTexture: sprite.spriteTexture,
                isBlocking: sprite.isBlocking,
                attackable: sprite.attackable,
                hp: sprite.hp,
                dmg: sprite.dmg,
                turn: sprite.turn,
                animationProgress: sprite.animationProgress,
                spriteName: sprite.spriteName,
                spriteFace: sprite.spriteFace,
                spriteTalk: sprite.spriteTalk,
                spriteSell: sprite.spriteSell,
                lootClass: sprite.lootClass  // Ajout de la classe de loot
            }));

            // Créer un objet global pour stocker l'état du jeu
            const gameState = {
                playerState: playerState,
                spritesState: spritesState
            };

            // Sauvegarde dans le localStorage
            localStorage.setItem('gameState', JSON.stringify(gameState));
            console.log('Données sauvegardées localement');
        }
    }

    async loadGameState() {
        if (isLoading) {
            console.log("Chargement déjà en cours, opération annulée.");
            return; // Empêche l'appel si un chargement est déjà en cours
        }

        isLoading = true; // Active le verrou de chargement

        const savedState = localStorage.getItem('gameState');
        if (savedState) {
            try {
                const gameState = JSON.parse(savedState);
                console.log('Données chargées localement', gameState);

                // Charger l'état du joueur et vérifier l'ID de la carte
                const savedMapID = gameState.playerState.mapID; // Récupérer l'ID de la carte sauvegardée
                console.log('map to load:', savedMapID);

                if (savedMapID === this.mapID) {
                    this.updatePlayerState(gameState.playerState);
                    this.updateSpritesState(gameState.spritesState);
                } else {
                    console.log(`Changement de carte de ${this.mapID} vers ${savedMapID}`);
                    this.loadMap(savedMapID); // Charger la bonne carte
                    this.updatePlayerState(gameState.playerState);
                    this.updateSpritesState(gameState.spritesState);
                }
            } catch (error) {
                console.error("Erreur lors du chargement de l'état du jeu :", error);
            } finally {
                isLoading = false; // Libérer le verrou après chargement
            }
        } else {
            console.error('Aucune donnée trouvée dans le localStorage');
            isLoading = false; // Libérer le verrou même en cas d'erreur
        }
    }

    // Mise à jour de l'état du joueur
    updatePlayerState(loadedState) {
        ceilingHeight = loadedState.ceilingHeight;
        ceilingRender = loadedState.ceilingRender;
        floorTexture = loadedState.floorTexture;
        ceilingTexture = loadedState.ceilingTexture;
        this.loadFloorCeilingImages();

        // Mise à jour des propriétés du joueur
        for (const key in loadedState) {
            if (loadedState.hasOwnProperty(key) && this.player.hasOwnProperty(key)) {
                this.player[key] = loadedState[key];
            }
        }

        // Restauration des objets, sorts et quêtes à partir des IDs
        this.player.inventory = loadedState.inventory.map(itemData => {
            const item = Item.getItemById(itemData.id);
            if (itemData.equipped) {
                item.equipped = true;
            }
            return item;
        });

        // Restaurer l'or
        this.player.gold = loadedState.gold || 0;

        this.player.spells = loadedState.spells.map(id => Spell.getSpellById(id));
        this.player.quests = loadedState.quests.map(q => {
            const quest = Quest.getQuestById(q.id);
            if (quest) {
                quest.completed = q.completed;
            }
            return quest;
        });

        // Rééquiper les objets après le chargement
        this.player.inventory.forEach(item => {
            if (item.equipped) {
                item.equip(this.player);
            }
        });

        // Mise à jour des statistiques du joueur
        // this.statsUpdate(this.player);
        Sprite.resetToggle();
    }

    // Mise à jour de l'état des sprites
    updateSpritesState(loadedSpritesState) {
        // Clear existing sprites before loading new ones
        this.sprites = [];

        // Load the saved state of the sprites
        loadedSpritesState.forEach(state => {
            const sprite = new Sprite(
                state.x,
                state.y,
                state.z,
                state.w,
                state.h,
                state.ang,
                state.spriteType,
                state.spriteTexture,
                state.isBlocking,
                state.attackable,
                state.turn,
                state.hp,
                state.dmg,
                state.animationProgress,
                state.spriteName,
                state.spriteFace,
                state.spriteTalk,
                state.spriteSell,
                state.id,
                state.lootClass  // Ajout de la classe de loot
            );
            this.sprites.push(sprite);
        });

        // IMPORTANT: Recréer le sprite d'animation de combat
        const tileSizeHalf = this.tileSize >> 1;
        Sprite.combatAnimationSprite = new Sprite(
            tileSizeHalf, // x
            tileSizeHalf, // y
            0, // z
            640, // w
            640, // h
            0, // ang
            2, // spriteType
            19, // spriteTexture (animation slash par défaut)
            false, // isBlocking
            false, // attackable
            true, // turn
            0, // hp
            0, // dmg
            0, // animationProgress
            "combatAnimationSprite", // spriteName
            1, // spriteFace
            "", // spriteTalk
            [], // spriteSell
            0, // id
            0, // step
            null  // lootClass
        );
        
        // Ajouter le sprite d'animation aux sprites du jeu
        this.sprites.push(Sprite.combatAnimationSprite);

        console.log(this.sprites.length + " sprites loaded.");
    }

    // Chargement des sprites pour une carte spécifique
    loadMapSprites(mapID) {
        const gameState = localStorage.getItem('gameState');
        if (gameState) {
            try {
                const loadedState = JSON.parse(gameState);
                if (loadedState.playerState.mapID === mapID) { // Vérification du bon mapID
                    this.updateSpritesState(loadedState.spritesState);
                } else {
                    console.warn(`Aucune sauvegarde trouvée pour la carte avec l'ID ${mapID}.`);
                }
            } catch (error) {
                console.error("Erreur lors du chargement des sprites :", error);
            }
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // ANIMATION JOUEUR
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    static playerDamageFlash() {
        var element = document.getElementById("gameWindow");

        // Ajout de l'effet de transition CSS
        element.style.transition = "background-color 0.5s, filter 0.5s";

        // Changement de couleur en rouge
        element.style.backgroundColor = "rgba(255, 0, 0, 0.2)";
        element.style.filter = "drop-shadow(0 0 15px red)";

        // Rétablissement de la couleur d'origine après 0.1 seconde (100 millisecondes)
        setTimeout(function() {
            // laisser vide pour éviter de cumuler style et classe
            element.style.backgroundColor = "";
            element.style.filter = "";
        }, 100);
    }

    static playerHealFlash() {
        var element = document.getElementById("gameWindow");

        // Ajout de l'effet de transition CSS
        element.style.transition = "background-color 0.5s, filter 0.5s";

        // Changement de couleur en turquoise
        element.style.backgroundColor = "rgba(64, 224, 208, 0.3)";
        element.style.filter = "drop-shadow(0 0 15px turquoise)";

        // Rétablissement de la couleur d'origine après 0.1 seconde (100 millisecondes)
        setTimeout(function() {
            // laisser vide pour éviter de cumuler style et classe
            element.style.backgroundColor = "";
            element.style.filter = "";
        }, 100);
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Initialisation des sprites
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // vide la liste des sprites pour permettre de changer de carte
    clearSprites() {
        this.sprites = []
    }

    initSprites(spriteList) {
        this.clearSprites();

        const tileSizeHalf = this.tileSize >> 1;
        let spritePositions = spriteList;
        this.sprites = [];

        let additionalDecoration = [];
        let additionalDecorationCount = 0;
        let additionalDecorationSpriteCount = 0;

        for (let pos of spritePositions) {
            let id = pos[0];
            let x = pos[1] * this.tileSize + tileSizeHalf;
            let y = pos[2] * this.tileSize + tileSizeHalf;

            let type = pos[3];
            let texture = pos[4];
            let face = pos[5];
            let name = pos[6];
            let dialogue = pos[7];
            let spriteSell = pos[8] || [];

            // valeur par defaut des ennemis
            let hp = pos[9] || 4;
            let dmg = pos[10] || 3;
            let lootClass = pos[11] || null; // Nouveau paramètre pour la classe de loot

            if (type === 10) {
                for (let j = 0; j < 2; j++) {
                    let newX = x + (Math.random() * 2 - 1) * tileSizeHalf;
                    let newY = y + (Math.random() * 2 - 1) * tileSizeHalf;

                    let newDecoration = new Sprite(newX, newY, 0, this.tileSize, this.tileSize, 0, 0, 13, false, false, true, 1, 0, 0, "Décoration", null, [], [], 0, 0, null);
                    newDecoration.spriteTexture = 13;
                    newDecoration.spriteType = 1;
                    newDecoration.isBlocking = false;
                    newDecoration.id = 0;

                    additionalDecoration.push(newDecoration);
                    additionalDecorationCount++;
                }
                additionalDecorationSpriteCount++;
            } else {
                if (typeof id !== 'number' || id <= 0) {
                    console.error("Invalid ID for sprite. Each sprite must have a unique positive ID.");
                    continue;
                }

                // Déterminer la lootClass finale
                let finalLootClass;
                if (lootClass === null || lootClass === 0 || lootClass === undefined) {
                    if (type === "A") {
                        // Calcul automatique pour les ennemis
                        const calculatedClass = Sprite.calculateLootClass(hp, dmg);
                        const classLetters = ["a", "b", "c", "d", "e", "f"];
                        finalLootClass = classLetters[calculatedClass];
                        console.log(`Enemy lootClass calculated: ${finalLootClass} for ${name}`);
                    } else if (type === 6) {
                        // Classe par défaut pour les coffres si non spécifiée
                        finalLootClass = "c"; // Coffre de classe moyenne par défaut
                        console.log(`Chest default lootClass: ${finalLootClass} for ${name}`);
                    } else {
                        finalLootClass = null; // Pas de loot pour les autres sprites
                    }
                } else {
                    finalLootClass = lootClass;
                    console.log(`Sprite lootClass from data: ${finalLootClass} for ${name}`);
                }

                let isBlocking = true;
                // Créer le sprite avec la lootClass finale
                this.sprites.push(new Sprite(
                    x, y, 0, this.tileSize, this.tileSize, 0, type, texture, 
                    isBlocking, false, true, hp, dmg, 0, name, face, dialogue, 
                    spriteSell, id, 0, finalLootClass  // lootClass en dernier paramètre
                ));
            }

            if (!dialogue && !face && !name) {
                type = 1;
            }
        }

        for (let newDecoration of additionalDecoration) {
            newDecoration.id = 0; // ID pour les décorations
            this.sprites.push(newDecoration);
        }

        // Définition du sprite de combat avec l'ID 0
        this.sprites.push(Sprite.combatAnimationSprite = new Sprite(
            tileSizeHalf, // x
            tileSizeHalf, // y
            0, // z
            640, // w
            640, // h
            0, // ang
            2, // spriteType
            19, // spriteTexture
            false, // isBlocking
            false, // attackable
            true, // turn
            0, // hp
            0, // dmg
            0, // animationProgress
            "combatAnimationSprite", // spriteName
            1, // spriteFace
            "", // spriteTalk
            [], // spriteSell
            0, // id
            0, // step
            null  // lootClass (null car ce n'est pas un ennemi à looter)
        ));

        Sprite.combatAnimationSprite.spriteTexture = 19;

        console.log(this.sprites.length + " sprites créés.");
        console.log(additionalDecorationCount + " sprites décoratifs générés pour " + additionalDecorationSpriteCount + " cases de décorations.");
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Méthode intersection rayon avec sprite
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    resetSpriteHits() {
        for (let sprite of this.sprites) {
            sprite.hit = false;
            sprite.screenPosition = null;
        }
    }

    // OPTIMISATION : Utilisation de l'index spatial pour la recherche de sprites
    findSpritesInCell(cellX, cellY, onlyNotHit = false) {
        const cellKey = `${cellX},${cellY}`;
        const sprites = this.spriteSpatialIndex.get(cellKey) || [];
        
        if (onlyNotHit) {
            return sprites.filter(sprite => !sprite.hit);
        }
        
        return sprites;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    // Canvas 
    ///////////////////////////////////////////////////////////////////////////////////////////////


    /**
     * https://stackoverflow.com/a/35690009/1645045
     */
    static setPixel(imageData, x, y, r, g, b, a) {
        let index = (x + y * imageData.width) << 2;
        imageData.data[index] = r;
        imageData.data[index + 1] = g;
        imageData.data[index + 2] = b;
        imageData.data[index + 3] = a;
    }

    static getPixel(imageData, x, y) {
        let index = (x + y * imageData.width) << 2;
        return {
            r: imageData.data[index],
            g: imageData.data[index + 1],
            b: imageData.data[index + 2],
            a: imageData.data[index + 3],
        };
    }

    initScreen() {
        this.mainCanvasContext = this.mainCanvas.getContext("2d");
        let screen = document.getElementById("screen");
        //faible resolution
        screen.style.width = this.displayWidth * 2 + "px";
        screen.style.height = this.displayHeight * 2 + "px";
        //screen.style.width = this.displayWidth + "px";
        //screen.style.height = this.displayHeight + "px";
        this.mainCanvas.width = this.displayWidth;
        this.mainCanvas.height = this.displayHeight;
        this.loadFloorCeilingImages();
    }

    // Dans la classe Raycaster, méthode loadFloorCeilingImages()
    // Voici la portion qui charge les textures des sprites :

    async loadFloorCeilingImages() {
        // Fonction pour charger une image depuis base64
        const loadImageFromBase64 = (base64String) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = base64String;
            });
        };

        // Crée un canvas temporaire pour obtenir les pixels des images
        let canvas = document.createElement("canvas");
        canvas.width = this.textureSize * 2;
        canvas.height = this.textureSize * 24;
        let context = canvas.getContext("2d");

        try {
            // Skybox
            if (IMAGES.skybox1) {
                const skyboxImg = await loadImageFromBase64(IMAGES.skybox1);
                context.drawImage(skyboxImg, 0, 0, skyboxImg.width, skyboxImg.height);
                this.skyboxImageData = context.getImageData(0, 0, this.textureSize * 2, this.textureSize * 3);
            }

            // Chargement des textures de sol
            const floorTextures = {
                1: "floorimg1",
                2: "floorimg2", 
                3: "floorimg3",
                4: "floorimg4"
            };
            
            if (floorTextures[floorTexture] && IMAGES[floorTextures[floorTexture]]) {
                const floorImg = await loadImageFromBase64(IMAGES[floorTextures[floorTexture]]);
                context.drawImage(floorImg, 0, 0, floorImg.width, floorImg.height);
                this.floorImageData = context.getImageData(0, 0, this.textureSize, this.textureSize);
            }

            // Chargement des textures de plafond
            const ceilingTextures = {
                1: "ceilingimg1",
                2: "ceilingimg2",
                3: "ceilingimg3"
            };
            
            if (ceilingTextures[ceilingTexture] && IMAGES[ceilingTextures[ceilingTexture]]) {
                const ceilingImg = await loadImageFromBase64(IMAGES[ceilingTextures[ceilingTexture]]);
                context.drawImage(ceilingImg, 0, 0, ceilingImg.width, ceilingImg.height);
                this.ceilingImageData = context.getImageData(0, 0, this.textureSize, this.textureSize);
            }

            // Chargement des textures de mur
            if (IMAGES.wallsImage) {
                const wallsImage = await loadImageFromBase64(IMAGES.wallsImage);
                context.drawImage(wallsImage, 0, 0, wallsImage.width, wallsImage.height);
                this.wallsImageData = context.getImageData(0, 0, wallsImage.width, wallsImage.height);
            }

            // Chargement des sprites
            const spriteIds = [
                "sprite1", "sprite2", "sprite3", "sprite4", "sprite5",
                "sprite6", "sprite7", "sprite8", "sprite9", "sprite10",
                "sprite11", "sprite12", "sprite13", "sprite14", "sprite15",
                "sprite16", "sprite17", "sprite18", "sprite19", "sprite20",
                "sprite21", "sprite22", "sprite23"
            ];

            for (let i = 0; i < spriteIds.length; i++) {
                const spriteId = spriteIds[i];
                if (IMAGES[spriteId]) {
                    const spriteImage = await loadImageFromBase64(IMAGES[spriteId]);
                    let spriteCanvas = document.createElement("canvas");
                    let spriteContext = spriteCanvas.getContext("2d");
                    spriteCanvas.width = spriteImage.width;
                    spriteCanvas.height = spriteImage.height;
                    spriteContext.drawImage(spriteImage, 0, 0, spriteImage.width, spriteImage.height);
                    this["spriteImageData" + (i + 1)] = spriteContext.getImageData(0, 0, spriteImage.width, spriteImage.height);
                    console.log(`✅ Texture ${i + 1} (${spriteId}) chargée avec succès`);
                }
            }

            console.log(`🎯 Chargement des textures terminé`);
        } catch (error) {
            console.error("Erreur lors du chargement des textures:", error);
        }
    }


    stripScreenHeight(screenDistance, correctDistance, heightInGame) {
        return Math.round((screenDistance / correctDistance) * heightInGame);
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    // gestion prototype des differentes texture et hauteur
    ///////////////////////////////////////////////////////////////////////////////////////////////

    drawTexturedRect(
        imgdata,
        srcX,
        srcY,
        srcW,
        srcH,
        dstX,
        dstY,
        dstW,
        dstH,
        spriteFlash,
        distance // NOUVEAU : ajout du paramètre distance pour le brouillard
    ) {
        srcX = srcX | 0;
        srcY = srcY | 0;
        dstX = dstX | 0;
        dstY = dstY | 0;
        const dstEndX = (dstX + dstW) | 0;
        const dstEndY = (dstY + dstH) | 0;
        const dx = dstEndX - dstX;
        const dy = dstEndY - dstY;

        // Nothing to draw
        if (dx === 0 || dy === 0) {
            return;
        }

        // Linear interpolation variables
        let screenStartX = dstX;
        let screenStartY = dstY;
        let texStartX = srcX;
        let texStartY = srcY;
        const texStepX = srcW / dx;
        const texStepY = srcH / dy;

        // Skip top pixels off screen
        if (screenStartY < 0) {
            texStartY = srcY + (0 - screenStartY) * texStepY;
            screenStartY = 0;
        }

        // Skip left pixels off screen
        if (screenStartX < 0) {
            texStartX = srcX + (0 - screenStartX) * texStepX;
            screenStartX = 0;
        }

        // dessin de chaque sprite
        // y compris les étapes d'animation
        for (
            let texY = texStartY, screenY = screenStartY; screenY < dstEndY && screenY < this.displayHeight; screenY++, texY += texStepY
        ) {
            for (
                let texX = texStartX, screenX = screenStartX; screenX < dstEndX && screenX < this.displayWidth; screenX++, texX += texStepX
            ) {
                let textureX = texX | 0;
                let textureY = texY | 0;

                // Récupère le temps actuel en millisecondes
                let currentTime = performance.now();

                // Vérifiez si 250 ms se sont écoulées depuis la dernière vérification
                if (currentTime - lastTime >= 333) {
                    // Incrémentez animationProgress pour chaque sprite
                    spriteAnimationProgress += 1;
                    if (spriteAnimationProgress === 3) {
                        spriteAnimationProgress = 0;
                    }
                    // Mettez à jour le dernier temps de vérification

                    // LAST TIME DOIT ETRE STOCKE DANS LE SPRITE
                    lastTime = currentTime;
                }

                /*
                  // METTRE VARIABLE DANS CHAQUE INSTANCE DE SPRITE POUR GERER LES ANIMATIONS
                  const currentTime = new Date().getSeconds();
                */

                // Vérifiez si le sprite est assez large pour être animé
                // si c'est supérieur à 128, ça ne peut pas être un mur.
                if (imgdata.width > 128) {
                    // Calcul de l'animation basée sur le temps
                    // pour éviter les conflits, on crée une valeur de référence
                    // on ajoute directement les valeurs des pixels à incrémenter dans la fonction GetPixel
                    let srcPixel = Raycaster.getPixel(
                        imgdata,
                        textureX + 64 * spriteAnimationProgress,
                        textureY
                    );

                    if (srcPixel.a && spriteFlash > 0) {
                        // Augmenter temporairement les composantes de couleur (par exemple, ajouter 50)
                        let flashIntensity = spriteFlash;

                        let flashedPixel = {
                            r: Math.min(srcPixel.r + flashIntensity, 255),
                            g: Math.min(srcPixel.g + flashIntensity, 255),
                            b: Math.min(srcPixel.b + flashIntensity, 255),
                            a: srcPixel.a, // Utilisez srcPixel.a pour la transparence
                        };

                        // NOUVEAU : Appliquer le brouillard après le flash
                        const foggedPixel = applyFog(flashedPixel.r, flashedPixel.g, flashedPixel.b, distance);

                        // Mettre à jour l'image en utilisant setPixel (sans modifier la fonction elle-même)
                        Raycaster.setPixel(
                            this.backBuffer,
                            screenX,
                            screenY,
                            foggedPixel.r,
                            foggedPixel.g,
                            foggedPixel.b,
                            255
                        );
                    } else if (srcPixel.a) {
                        // NOUVEAU : Appliquer le brouillard
                        const foggedPixel = applyFog(srcPixel.r, srcPixel.g, srcPixel.b, distance);
                        
                        Raycaster.setPixel(
                            this.backBuffer,
                            screenX,
                            screenY,
                            foggedPixel.r,
                            foggedPixel.g,
                            foggedPixel.b,
                            255
                        );
                    }
                } else {
                    // Si le sprite n'est pas assez large pour être animé, traitez-le sans animation
                    let srcPixel = Raycaster.getPixel(imgdata, textureX, textureY);

                    if (srcPixel.a && spriteFlash > 0) {
                        // Augmenter temporairement les composantes de couleur (par exemple, ajouter 50)
                        let flashIntensity = spriteFlash;

                        let flashedPixel = {
                            r: Math.min(srcPixel.r + flashIntensity, 255),
                            g: Math.min(srcPixel.g + flashIntensity, 255),
                            b: Math.min(srcPixel.b + flashIntensity, 255),
                            a: srcPixel.a, // Utilisez srcPixel.a pour la transparence
                        };

                        // NOUVEAU : Appliquer le brouillard après le flash
                        const foggedPixel = applyFog(flashedPixel.r, flashedPixel.g, flashedPixel.b, distance);

                        // Mettre à jour l'image en utilisant setPixel (sans modifier la fonction elle-même)
                        Raycaster.setPixel(
                            this.backBuffer,
                            screenX,
                            screenY,
                            foggedPixel.r,
                            foggedPixel.g,
                            foggedPixel.b,
                            255
                        );
                    } else if (srcPixel.a) {
                        // NOUVEAU : Appliquer le brouillard
                        const foggedPixel = applyFog(srcPixel.r, srcPixel.g, srcPixel.b, distance);
                        
                        Raycaster.setPixel(
                            this.backBuffer,
                            screenX,
                            screenY,
                            foggedPixel.r,
                            foggedPixel.g,
                            foggedPixel.b,
                            255
                        );
                    }
                }
            }
        }
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    // fonction drawsprite : ou les textures des sprites sont gérées
    ///////////////////////////////////////////////////////////////////////////////////////////////

    drawSpriteStrip(rayHit) {
        if (!rayHit.sprite.screenPosition) {
            rayHit.sprite.screenPosition = this.spriteScreenPosition(rayHit.sprite);
        }
        let rc = rayHit.sprite.screenPosition;

        // sprite first strip is ahead of current strip
        if (rc.x > rayHit.strip) {
            return;
        }

        // sprite last strip is before current strip
        if (rc.x + rc.w < rayHit.strip) {
            return;
        }

        let diffX = (rayHit.strip - rc.x) | 0;
        let dstX = rc.x + diffX; // skip left parts of sprite already drawn
        let srcX = ((diffX / rc.w) * this.textureSize) | 0;
        let srcW = 1;

        if (srcX >= 0 && srcX < this.textureSize) {
            // Récupérer le numéro de texture du sprite
            const spriteTexture = rayHit.sprite.spriteTexture;
            const spriteFlash = rayHit.sprite.spriteFlash;
            
            // Nom de la propriété qui contient les données de texture
            const spriteDataName = "spriteImageData" + spriteTexture;
            
            // Vérifier que les données de texture existent
            if (this[spriteDataName]) {
                this.drawTexturedRect(
                    this[spriteDataName], 
                    srcX, 
                    0, 
                    srcW,
                    this.textureSize, 
                    dstX, 
                    rc.y, 
                    this.stripWidth, 
                    rc.h, 
                    spriteFlash,
                    rayHit.distance // NOUVEAU : passer la distance pour le brouillard
                );
            } else {
                // Log d'avertissement uniquement si on n'a pas déjà signalé cette texture manquante
                if (!this.warnedMissingTextures) {
                    this.warnedMissingTextures = new Set();
                }
                
                if (!this.warnedMissingTextures.has(spriteTexture)) {
                    console.warn(`⚠ Texture sprite${spriteTexture} non chargée pour sprite ID ${rayHit.sprite.id} (${rayHit.sprite.spriteName})`);
                    this.warnedMissingTextures.add(spriteTexture);
                }
                
                // Optionnel : utiliser une texture par défaut (sprite1)
                if (this.spriteImageData1) {
                    this.drawTexturedRect(
                        this.spriteImageData1, // Texture par défaut
                        srcX, 
                        0, 
                        srcW,
                        this.textureSize, 
                        dstX, 
                        rc.y, 
                        this.stripWidth, 
                        rc.h, 
                        spriteFlash,
                        rayHit.distance // NOUVEAU : passer la distance pour le brouillard
                    );
                }
            }
        }
    }

    //////////////////////////////////////////////////////////////////////
    // MURS
    //////////////////////////////////////////////////////////////////////

    drawWallStrip(rayHit, textureX, textureY, wallScreenHeight) {
        let swidth = 4;
        let sheight = 64;
        let imgx = rayHit.strip * this.stripWidth;
        let imgy = (this.displayHeight - wallScreenHeight) >> 1;
        let imgw = this.stripWidth;
        let imgh = wallScreenHeight;
        const TextureUnit = 64;

        // Configuration des textures avec des nombres pour identifier les types de murs
        const wallConfig = {
            1: { // stoneWall
                singleFloorTexture: 0 * TextureUnit, // Texture spéciale si un seul étage (mur en pierre)
                groundTexture: 18 * TextureUnit, // Texture pour le rez-de-chaussée (mur en pierre)
                firstFloorTexture: 17 * TextureUnit, // Texture pour les étages intermédiaires (mur en pierre)
                topFloorTexture: 17 * TextureUnit, // Texture pour le dernier étage (mur en pierre)
                roofTexture: 16 * TextureUnit // Texture pour le toit (mur en pierre)
            },
            2: { // ornateWall
                singleFloorTexture: 1 * TextureUnit, // Texture spéciale si un seul étage (mur orné)
                groundTexture: 21 * TextureUnit, // Texture pour le rez-de-chaussée (mur orné)
                firstFloorTexture: 20 * TextureUnit, // Texture pour les étages intermédiaires (mur orné)
                topFloorTexture: 19 * TextureUnit, // Texture pour le dernier étage (mur orné)
                roofTexture: 0 * TextureUnit
            },
            3: { // Rocks
                singleFloorTexture: 2 * TextureUnit, // Texture spéciale si un seul étage
                groundTexture: 11 * TextureUnit, // Texture pour le rez-de-chaussée
                firstFloorTexture: 10 * TextureUnit, // Texture pour les étages intermédiaires
                topFloorTexture: 10 * TextureUnit, // Texture pour le dernier étage
                roofTexture: 9 * TextureUnit // Texture pour le toit
            },
            4: { // templeDoor
                singleFloorTexture: 5 * TextureUnit, // Porte du temple pour un seul étage
                groundTexture: 5 * TextureUnit, // Texture porte du temple (rez-de-chaussée)
                firstFloorTexture: 1 * TextureUnit, // Texture intermédiaire (premier étage du temple)
                topFloorTexture: 1 * TextureUnit, // Texture pour le dernier étage
                roofTexture: 0 * TextureUnit // Texture pour le toit (ou pas de toit pour le temple)
            },
            5: { // forest
                singleFloorTexture: 23 * TextureUnit, // Texture spéciale pour la forêt (un seul étage)
                groundTexture: 23 * TextureUnit, // Texture de forêt (rez-de-chaussée)
                firstFloorTexture: 22 * TextureUnit, // Texture intermédiaire pour les étages de la forêt
                topFloorTexture: 22 * TextureUnit, // Texture pour le dernier étage
                roofTexture: 0 // Texture transparente pour le toit
            },
            6: { // house
                singleFloorTexture: 14 * TextureUnit, // Texture maison spéciale pour un étage
                groundTexture: 14 * TextureUnit, // Texture maison (rez-de-chaussée)
                firstFloorTexture: 14 * TextureUnit, // Texture répétée pour les étages intermédiaires
                topFloorTexture: 14 * TextureUnit, // Texture pour le dernier étage de la maison
                roofTexture: 12 * TextureUnit // Texture du toit de la maison
            },
            7: { // houseWindow
                singleFloorTexture: 13 * TextureUnit, // Fenêtre de la maison (un seul étage)
                groundTexture: 13 * TextureUnit, // Fenêtre de la maison (rez-de-chaussée)
                firstFloorTexture: 13 * TextureUnit, // Fenêtre répétée pour les étages intermédiaires
                topFloorTexture: 13 * TextureUnit, // Texture pour le dernier étage avec fenêtre
                roofTexture: 12 * TextureUnit // Texture du toit de la maison avec fenêtre
            },
            8: { // houseDoor
                singleFloorTexture: 15 * TextureUnit, // Texture de la porte de la maison (un seul étage)
                groundTexture: 15 * TextureUnit, // Texture pour la porte de la maison (rez-de-chaussée)
                firstFloorTexture: 14 * TextureUnit, // Texture répétée pour les étages intermédiaires
                topFloorTexture: 14 * TextureUnit, // Texture pour le dernier étage avec porte
                roofTexture: 12 * TextureUnit // Texture du toit de la maison avec porte
            },
            9: { // Prison door
                singleFloorTexture: 7 * TextureUnit, // Variation du mur de pierre pour un seul étage
                groundTexture: 8 * TextureUnit, // Texture variation mur de pierre (rez-de-chaussée)
                firstFloorTexture: 8 * TextureUnit, // Texture répétée pour les étages intermédiaires
                topFloorTexture: 7 * TextureUnit, // Texture pour le dernier étage de la variation de mur en pierre
                roofTexture: 0 * TextureUnit // Texture pour le toit de la variation de mur en pierre
            }
            // Tu peux ajouter d'autres configurations si besoin pour atteindre les 24.
        };


        // Récupérer la configuration du mur en fonction de `textureY`
        // +1, car 0 vaut pour un vide
        const wallType = ((textureY / TextureUnit) | 0) + 1; // Ajustement pour correspondre à un index 0-based

        // On suppose que textureY est un multiple de TextureUnit
        const config = wallConfig[wallType] || wallConfig[1]; // 3 correspond au "default"

        if (this.ceilingHeight === 1) {
            // Utilisation de la texture spéciale pour un étage
            this.drawTexturedRect(this.wallsImageData, textureX, config.singleFloorTexture, swidth, sheight, imgx, imgy, imgw, imgh, 0, rayHit.correctDistance);
        } else {
            // Dessiner le rez-de-chaussée (groundTexture)
            this.drawTexturedRect(this.wallsImageData, textureX, config.groundTexture, swidth, sheight, imgx, imgy, imgw, imgh, 0, rayHit.correctDistance);

            // Si plusieurs étages, dessiner les étages intermédiaires et le dernier étage
            for (let level = 1; level < this.ceilingHeight - 1; ++level) {
                // Répéter la texture des étages intermédiaires
                this.drawTexturedRect(this.wallsImageData, textureX, config.firstFloorTexture, swidth, sheight, imgx, imgy - level * wallScreenHeight, imgw, imgh, 0, rayHit.correctDistance);
            }

            // Dernier étage (topFloorTexture)
            this.drawTexturedRect(this.wallsImageData, textureX, config.topFloorTexture, swidth, sheight, imgx, imgy - (this.ceilingHeight - 1) * wallScreenHeight, imgw, imgh, 0, rayHit.correctDistance);

            // Si un toit est configuré, on le dessine au-dessus du dernier étage
            if (config.roofTexture) {
                this.drawTexturedRect(this.wallsImageData, textureX, config.roofTexture, swidth, sheight, imgx, imgy - this.ceilingHeight * wallScreenHeight, imgw, imgh, 0, rayHit.correctDistance);
            }
        }
    }

    //////////////////////////////////////////////////////////////////////
    // fades
    //////////////////////////////////////////////////////////////////////

    // FADE TO BLACK

// Fonction 1 : Transition vers le noir
static async fadeToBlack(duration) {
    const screen = document.getElementById('mainCanvas');
    if (!screen) {
        console.error("screen element not found!");
        return;
    }
    
    return new Promise((resolve) => {
        // Sauvegarder les styles originaux
        const originalTransition = screen.style.transition;
        const originalFilter = screen.style.filter;
        
        // Appliquer la transition
        screen.style.transition = `filter ${duration}ms ease-in-out`;
        
        // Attendre un frame pour que la transition soit appliquée
        requestAnimationFrame(() => {
            // Fondu vers le noir
            screen.style.filter = 'brightness(0)';
            
            setTimeout(() => {
                // Restaurer la transition originale
                screen.style.transition = originalTransition || '';
                resolve();
            }, duration);
        });
    });
}

// Fonction 2 : Transition du noir vers normal
static async fadeFromBlack(duration) {
    const screen = document.getElementById('mainCanvas');
    if (!screen) {
        console.error("screen element not found!");
        return;
    }
    
    return new Promise((resolve) => {
        // Sauvegarder les styles originaux
        const originalTransition = screen.style.transition;
        
        // Appliquer la transition
        screen.style.transition = `filter ${duration}ms ease-in-out`;
        
        // Attendre un frame pour que la transition soit appliquée
        requestAnimationFrame(() => {
            // Retour à la normale
            screen.style.filter = '';
            
            setTimeout(() => {
                // Restaurer la transition originale
                screen.style.transition = originalTransition || '';
                resolve();
            }, duration);
        });
    });
}

    //////////////////////////////////////////////////////////////////////
    // sol
    //////////////////////////////////////////////////////////////////////

    drawSolidFloor() {
        for (let y = this.halfDisplayHeight; y < this.displayHeight; ++y) {
            for (let x = 0; x < this.displayWidth; ++x) {
                // NOUVEAU : Appliquer le brouillard au sol solide
                const distance = (y - this.halfDisplayHeight) * 100; // Distance approximative
                const foggedColor = applyFog(111, 71, 59, distance);
                Raycaster.setPixel(this.backBuffer, x, y, foggedColor.r, foggedColor.g, foggedColor.b, 255);
            }
        }
    }

    // OPTIMISATION : Utilisation du cache de texture
    getTextureCoord(worldX, worldY) {
        const key = `${(worldX | 0)},${(worldY | 0)}`;
        if (this.textureCache.has(key)) {
            return this.textureCache.get(key);
        }
        
        let textureX = (worldX | 0) % this.tileSize;
        let textureY = (worldY | 0) % this.tileSize;
        
        if (this.tileSize != this.textureSize) {
            textureX = ((textureX / this.tileSize) * this.textureSize) | 0;
            textureY = ((textureY / this.tileSize) * this.textureSize) | 0;
        }
        
        const result = { x: textureX, y: textureY };
        
        // Limiter la taille du cache
        if (this.textureCache.size > 1000) {
            this.textureCache.clear();
        }
        
        this.textureCache.set(key, result);
        return result;
    }

    // 1. VERSION OPTIMISÉE de drawTexturedFloor
    drawTexturedFloor(rayHits) {
        const centerY = this.halfDisplayHeight;
        const eyeHeight = (this.tileSize >> 1) + this.player.z;
        
        // OPTIMISATION 1: Pré-calculer les distances une fois par frame
        if (!this.floorDistanceCache || this.floorDistanceCacheHeight !== eyeHeight) {
            this.floorDistanceCache = new Float32Array(this.displayHeight);
            this.floorDistanceCacheHeight = eyeHeight;
            
            for (let y = centerY; y < this.displayHeight; y++) {
                const dy = y - centerY;
                if (dy > 0) {
                    this.floorDistanceCache[y] = eyeHeight / dy;
                }
            }
        }
        
        // OPTIMISATION 2: Créer une lookup table pour les coordonnées de texture
        const textureSizeReciprocal = 1 / this.tileSize;
        const textureScale = this.textureSize * textureSizeReciprocal;
        
        // OPTIMISATION 3: Pré-calculer les constantes de distance
        const NEAR_DISTANCE = this.tileSize << 2;    // * 4
        const MID_DISTANCE = this.tileSize * 6;
        const FAR_DISTANCE = this.tileSize << 3;     // * 8
        const VERY_FAR_DISTANCE = this.tileSize * 10;
        
        // OPTIMISATION 4: Buffer temporaire pour stocker les pixels d'une colonne
        const columnBuffer = new Uint8Array(this.displayHeight * 4);
        
        for (let i = 0; i < rayHits.length; i++) {
            const rayHit = rayHits[i];
            const wallScreenHeight = this.stripScreenHeight(
                this.viewDist,
                rayHit.correctDistance,
                this.tileSize
            );
            
            const screenX = rayHit.strip * this.stripWidth;
            const currentViewDistance = this.viewDistances[rayHit.strip];
            
            // OPTIMISATION 5: Utiliser les tables trigonométriques si disponibles
            const stripIdx = rayHit.strip;
            const rayAngle = this.player.rot + this.rayAngles[stripIdx];
            const cosRayAngle = Math.cos(rayAngle);
            const sinRayAngle = Math.sin(rayAngle);
            
            // OPTIMISATION 6: Pré-calculer les facteurs de direction (sans la distance!)
            const xFactor = cosRayAngle;
            const yFactor = -sinRayAngle;
            
            let screenY = Math.max(
                centerY,
                ((this.displayHeight - wallScreenHeight) >> 1) + wallScreenHeight
            ) | 0;
            
            let lastPixel = null;
            let lastPixelStep = 1;
            let bufferIdx = 0;
            
            // OPTIMISATION 7: Dérouler partiellement la boucle pour les cas courants
            while (screenY < this.displayHeight) {
                const baseDistance = this.floorDistanceCache[screenY];
                const floorDistance = baseDistance * currentViewDistance;
                
                // OPTIMISATION 8: Détermination rapide du pixelStep
                let pixelStep;
                if (floorDistance < NEAR_DISTANCE) {
                    pixelStep = 1;
                } else if (floorDistance < MID_DISTANCE) {
                    pixelStep = 1;
                } else if (floorDistance < FAR_DISTANCE) {
                    pixelStep = 2;
                } else if (floorDistance < VERY_FAR_DISTANCE) {
                    pixelStep = 2;
                } else {
                    pixelStep = 4;
                }
                 
                // OPTIMISATION 9: Éviter le modulo coûteux
                const shouldCalculate = (pixelStep === 1) || 
                                        ((screenY & (pixelStep - 1)) === 0);
                
                if (shouldCalculate) {
                    const worldX = this.player.x + floorDistance * xFactor;
                    const worldY = this.player.y + floorDistance * yFactor;
                    
                    if (worldX >= 0 && worldY >= 0 && 
                        worldX < this.worldWidth && worldY < this.worldHeight) {
                        
                        // OPTIMISATION 10: Calcul direct des coordonnées de texture
                        // Gérer les valeurs négatives du modulo
                        let texX = ((worldX | 0) % this.tileSize);
                        let texY = ((worldY | 0) % this.tileSize);
                        if (texX < 0) texX += this.tileSize;
                        if (texY < 0) texY += this.tileSize;
                        texX = (texX * textureScale) | 0;
                        texY = (texY * textureScale) | 0;
                        
                        // OPTIMISATION 11: Accès direct aux données de texture
                        const srcIdx = (texY * this.textureSize + texX) << 2;
                        
                        let r = this.floorImageData.data[srcIdx];
                        let g = this.floorImageData.data[srcIdx + 1];
                        let b = this.floorImageData.data[srcIdx + 2];
                        
                        // OPTIMISATION 12: Brouillard simplifié
                        const fogFactor = this.getFogFactorFast(floorDistance);
                        if (fogFactor > 0) {
                            const invFog = 1 - fogFactor;
                            r = (r * invFog + fogColorR * fogFactor) | 0;
                            g = (g * invFog + fogColorG * fogFactor) | 0;
                            b = (b * invFog + fogColorB * fogFactor) | 0;
                        }
                        
                        // Stocker dans le buffer temporaire
                        columnBuffer[bufferIdx] = r;
                        columnBuffer[bufferIdx + 1] = g;
                        columnBuffer[bufferIdx + 2] = b;
                        columnBuffer[bufferIdx + 3] = 255;
                        
                        lastPixel = bufferIdx;
                        lastPixelStep = pixelStep;
                    }
                } else if (lastPixel !== null) {
                    // Réutiliser le dernier pixel calculé
                    columnBuffer[bufferIdx] = columnBuffer[lastPixel];
                    columnBuffer[bufferIdx + 1] = columnBuffer[lastPixel + 1];
                    columnBuffer[bufferIdx + 2] = columnBuffer[lastPixel + 2];
                    columnBuffer[bufferIdx + 3] = 255;
                }
                
                bufferIdx += 4;
                screenY++;
                
                // OPTIMISATION 13: Remplissage rapide pour les grandes distances
                if (pixelStep > 1 && lastPixel !== null) {
                    const fillEnd = Math.min(screenY + pixelStep - 1, this.displayHeight);
                    const lastR = columnBuffer[lastPixel];
                    const lastG = columnBuffer[lastPixel + 1];
                    const lastB = columnBuffer[lastPixel + 2];
                    
                    while (screenY < fillEnd) {
                        columnBuffer[bufferIdx] = lastR;
                        columnBuffer[bufferIdx + 1] = lastG;
                        columnBuffer[bufferIdx + 2] = lastB;
                        columnBuffer[bufferIdx + 3] = 255;
                        bufferIdx += 4;
                        screenY++;
                    }
                }
            }
            
            // OPTIMISATION 14: Copie en bloc vers le backbuffer
            const startY = Math.max(
                centerY,
                ((this.displayHeight - wallScreenHeight) >> 1) + wallScreenHeight
            ) | 0;
            
            for (let y = startY, srcIdx = 0; y < this.displayHeight; y++, srcIdx += 4) {
                const dstIdx = (y * this.displayWidth + screenX) << 2;
                this.backBuffer.data[dstIdx] = columnBuffer[srcIdx];
                this.backBuffer.data[dstIdx + 1] = columnBuffer[srcIdx + 1];
                this.backBuffer.data[dstIdx + 2] = columnBuffer[srcIdx + 2];
                this.backBuffer.data[dstIdx + 3] = 255;
            }
        }
    }

    //////////////////////////////////////////////////////////////////////
    // Plafond/SkyBox
    //////////////////////////////////////////////////////////////////////

    // Version simplifiée sans le cache pour commencer
    getTextureCoordFast(worldX, worldY) {
        // Initialisation de secours si le cache n'existe pas
        if (!this.textureCoordCache) {
            console.warn("textureCoordCache non initialisé, création...");
            this.textureCoordCache = new Map();
            this.textureCoordCacheLimit = 2000;
        }
        
        const key = `${(worldX | 0)},${(worldY | 0)}`;
        
        // Vérifier le cache
        const cached = this.textureCoordCache.get(key);
        if (cached) {
            return cached;
        }
        
        // Calculer les coordonnées
        let textureX = (worldX | 0) % this.tileSize;
        let textureY = (worldY | 0) % this.tileSize;
        
        if (this.tileSize != this.textureSize) {
            textureX = ((textureX / this.tileSize) * this.textureSize) | 0;
            textureY = ((textureY / this.tileSize) * this.textureSize) | 0;
        }
        
        const result = { x: textureX, y: textureY };
        
        // Gérer la limite du cache
        if (this.textureCoordCache.size >= this.textureCoordCacheLimit) {
            // Supprimer la première entrée (FIFO)
            const firstKey = this.textureCoordCache.keys().next().value;
            this.textureCoordCache.delete(firstKey);
        }
        
        this.textureCoordCache.set(key, result);
        return result;
    }

    // Remplacer les méthodes existantes dans la classe Raycaster

    // 2. VERSION OPTIMISÉE de drawTexturedCeiling
    drawTexturedCeiling(rayHits) {
    const centerY = this.halfDisplayHeight;
    const eyeHeight = (this.tileSize >> 1) + this.player.z;
    const currentCeilingHeight = this.tileSize * this.ceilingHeight;
    const ceilingDelta = currentCeilingHeight - eyeHeight;
    
    // Pré-calculer les distances pour le plafond
    if (!this.ceilingDistanceCache || 
        this.ceilingDistanceCacheHeight !== ceilingDelta) {
        this.ceilingDistanceCache = new Float32Array(this.displayHeight);
        this.ceilingDistanceCacheHeight = ceilingDelta;
        
        for (let y = 0; y < centerY; y++) {
            const dy = centerY - y;
            if (dy > 0) {
                this.ceilingDistanceCache[y] = ceilingDelta / dy;
            }
        }
    }
    
    const textureSizeReciprocal = 1 / this.tileSize;
    const textureScale = this.textureSize * textureSizeReciprocal;
    
    const NEAR_DISTANCE = this.tileSize << 1;    // * 2
    const MID_DISTANCE = this.tileSize << 2;     // * 4
    const FAR_DISTANCE = this.tileSize * 6;
    const VERY_FAR_DISTANCE = this.tileSize << 3; // * 8
    
    const columnBuffer = new Uint8Array(centerY * 4);
    
    for (let i = 0; i < rayHits.length; i++) {
        const rayHit = rayHits[i];
        const wallScreenHeight = this.stripScreenHeight(
            this.viewDist,
            rayHit.correctDistance,
            this.tileSize
        );
        
        const screenX = rayHit.strip * this.stripWidth;
        const currentViewDistance = this.viewDistances[rayHit.strip];
        
        const stripIdx = rayHit.strip;
        const rayAngle = this.player.rot + this.rayAngles[stripIdx];
        const cosRayAngle = Math.cos(rayAngle);
        const sinRayAngle = Math.sin(rayAngle);
        
        const xFactor = cosRayAngle;
        const yFactor = -sinRayAngle;
        
        let screenY = Math.min(
            centerY - 1,
            ((this.displayHeight - wallScreenHeight) >> 1) - 1
        ) | 0;
        
        let lastPixel = null;
        let bufferIdx = screenY * 4;
        
        // Boucle inversée pour le plafond
        while (screenY >= 0) {
            const baseDistance = this.ceilingDistanceCache[screenY];
            const ceilingDistance = baseDistance * currentViewDistance;
            
            let pixelStep;
            if (ceilingDistance < NEAR_DISTANCE) {
                pixelStep = 1;
            } else if (ceilingDistance < MID_DISTANCE) {
                pixelStep = 1;
            } else if (ceilingDistance < FAR_DISTANCE) {
                pixelStep = 2;
            } else if (ceilingDistance < VERY_FAR_DISTANCE) {
                pixelStep = 2;
            } else {
                pixelStep = 4;
            }
            
            const shouldCalculate = (pixelStep === 1) || 
                                    ((screenY & (pixelStep - 1)) === 0);
            
            if (shouldCalculate) {
                const worldX = this.player.x + ceilingDistance * xFactor;
                const worldY = this.player.y + ceilingDistance * yFactor;
                
                if (worldX >= 0 && worldY >= 0 && 
                    worldX < this.worldWidth && worldY < this.worldHeight) {
                    
                    let texX = ((worldX | 0) % this.tileSize);
                    let texY = ((worldY | 0) % this.tileSize);
                    if (texX < 0) texX += this.tileSize;
                    if (texY < 0) texY += this.tileSize;
                    texX = (texX * textureScale) | 0;
                    texY = (texY * textureScale) | 0;
                    
                    const srcIdx = (texY * this.textureSize + texX) << 2;
                    
                    let r = this.ceilingImageData.data[srcIdx];
                    let g = this.ceilingImageData.data[srcIdx + 1];
                    let b = this.ceilingImageData.data[srcIdx + 2];
                    
                    const fogFactor = this.getFogFactorFast(ceilingDistance);
                    if (fogFactor > 0) {
                        const invFog = 1 - fogFactor;
                        r = (r * invFog + fogColorR * fogFactor) | 0;
                        g = (g * invFog + fogColorG * fogFactor) | 0;
                        b = (b * invFog + fogColorB * fogFactor) | 0;
                    }
                    
                    columnBuffer[bufferIdx] = r;
                    columnBuffer[bufferIdx + 1] = g;
                    columnBuffer[bufferIdx + 2] = b;
                    columnBuffer[bufferIdx + 3] = 255;
                    
                    lastPixel = bufferIdx;
                }
            } else if (lastPixel !== null) {
                columnBuffer[bufferIdx] = columnBuffer[lastPixel];
                columnBuffer[bufferIdx + 1] = columnBuffer[lastPixel + 1];
                columnBuffer[bufferIdx + 2] = columnBuffer[lastPixel + 2];
                columnBuffer[bufferIdx + 3] = 255;
            }
            
            screenY--;
            bufferIdx -= 4;
            
            // Remplissage rapide pour le plafond
            if (pixelStep > 1 && lastPixel !== null && screenY >= 0) {
                const fillEnd = Math.max(screenY - pixelStep + 1, 0);
                const lastR = columnBuffer[lastPixel];
                const lastG = columnBuffer[lastPixel + 1];
                const lastB = columnBuffer[lastPixel + 2];
                
                while (screenY > fillEnd) {
                    columnBuffer[bufferIdx] = lastR;
                    columnBuffer[bufferIdx + 1] = lastG;
                    columnBuffer[bufferIdx + 2] = lastB;
                    columnBuffer[bufferIdx + 3] = 255;
                    screenY--;
                    bufferIdx -= 4;
                }
            }
        }
        
        // Copie en bloc vers le backbuffer
        const endY = Math.min(
            centerY - 1,
            ((this.displayHeight - wallScreenHeight) >> 1) - 1
        ) | 0;
        
        for (let y = 0, srcIdx = 0; y <= endY; y++, srcIdx += 4) {
            const dstIdx = (y * this.displayWidth + screenX) << 2;
            this.backBuffer.data[dstIdx] = columnBuffer[srcIdx];
            this.backBuffer.data[dstIdx + 1] = columnBuffer[srcIdx + 1];
            this.backBuffer.data[dstIdx + 2] = columnBuffer[srcIdx + 2];
            this.backBuffer.data[dstIdx + 3] = 255;
        }
    }
}
    // Méthode optionnelle pour ajuster les seuils de distance dynamiquement
    setAdaptiveRenderingThresholds(near, mid, far, veryFar) {
        this.NEAR_DISTANCE = this.tileSize * near;
        this.MID_DISTANCE = this.tileSize * mid;
        this.FAR_DISTANCE = this.tileSize * far;
        this.VERY_FAR_DISTANCE = this.tileSize * veryFar;
    }

    // Paramètres de la skybox configurable
    // Ces variables peuvent être définies comme des propriétés de la classe Raycaster
    // ou conservées dans un objet de configuration séparé
    drawSkybox() {
        // Variables d'ajustement de la skybox - modifiez ces valeurs pour ajuster le comportement
        const cloudSpeed = 0.05;          // Vitesse du mouvement autonome des nuages
        const rotationFactor = -1.0;     // Facteur de rotation relative au joueur (-1.0 = sens opposé)
        
        // Calculer les facteurs d'échelle pour les coordonnées de texture
        let scaleX = this.skyboxImageData.width / this.displayWidth;
        let scaleY = this.skyboxImageData.height / this.displayHeight;

        // Initialiser la variable d'animation si elle n'existe pas encore
        if (!this.skyboxAnimationOffset) {
            this.skyboxAnimationOffset = 0;
        }
        
        // Animation autonome des nuages
        this.skyboxAnimationOffset += cloudSpeed;
        
        // Empêcher le débordement de la variable
        this.skyboxAnimationOffset = this.skyboxAnimationOffset % this.skyboxImageData.width;
        
        // Compensation pour la rotation du joueur
        let playerRotationOffset = rotationFactor * Math.floor((this.player.rot / (2 * Math.PI)) * this.skyboxImageData.width);
        
        // Décalage total = mouvement autonome + effet de rotation
        let totalOffsetX = Math.floor(this.skyboxAnimationOffset) + playerRotationOffset;
        
        for (let y = 0; y < this.displayHeight / 2; ++y) {
            // Calculer les coordonnées de texture pour cette ligne de pixels
            let textureY = Math.floor(y * scaleY);

            for (let x = 0; x < this.displayWidth; ++x) {
                // Calculer les coordonnées de texture pour ce pixel
                // Assurons-nous que textureX est toujours dans les limites de l'image
                let rawTextureX = Math.floor(x * scaleX) + totalOffsetX;
                let textureX = rawTextureX % this.skyboxImageData.width;
                
                // Correction pour les valeurs négatives
                if (textureX < 0) textureX += this.skyboxImageData.width;

                // S'assurer que les coordonnées sont entières et dans les limites
                textureX = Math.max(0, Math.min(Math.floor(textureX), this.skyboxImageData.width - 1));
                textureY = Math.max(0, Math.min(Math.floor(textureY), this.skyboxImageData.height - 1));

                // Trouver l'index du pixel dans le tableau de données de l'image
                let index = (textureX + textureY * this.skyboxImageData.width) * 4;
                
                // Vérifier les limites du tableau pour éviter les erreurs
                if (index >= 0 && index + 3 < this.skyboxImageData.data.length) {
                    // Extraire les valeurs de couleur du pixel
                    let r = this.skyboxImageData.data[index];
                    let g = this.skyboxImageData.data[index + 1];
                    let b = this.skyboxImageData.data[index + 2];
                    let a = this.skyboxImageData.data[index + 3];

                    // Trouver l'index du pixel dans le tableau de données du backBuffer
                    let backBufferIndex = (x + y * this.displayWidth) * 4;
                    
                    // Vérifier les limites du backBuffer également
                    if (backBufferIndex >= 0 && backBufferIndex + 3 < this.backBuffer.data.length) {
                        // Modifier les données du backBuffer pour mettre à jour le pixel
                        this.backBuffer.data[backBufferIndex] = r;
                        this.backBuffer.data[backBufferIndex + 1] = g;
                        this.backBuffer.data[backBufferIndex + 2] = b;
                        this.backBuffer.data[backBufferIndex + 3] = a;
                    }
                }
            }
        }
    }
    
    //////////////////////////////////////////////////////////////////////
    // détection des murs
    //////////////////////////////////////////////////////////////////////

    drawWorld(rayHits) {
        this.ceilingHeight = ceilingHeight;

        if (!this.backBuffer) {
            this.backBuffer = this.mainCanvasContext.createImageData(
                this.displayWidth,
                this.displayHeight
            );
        }

        let texturedFloorOn = true;

        if (texturedFloorOn) {
            this.drawTexturedFloor(rayHits);
        } else {
            this.drawSolidFloor();
        }

        let texturedCeilingOn = ceilingRender;

        if (texturedCeilingOn) {
            this.drawTexturedCeiling(rayHits);
        } else {
            //SKYBOX
            this.drawSkybox();
            // this.drawSolidCeiling()
        }
        for (let rayHit of rayHits) {
            if (rayHit.sprite) {
                this.drawSpriteStrip(rayHit);
            } else {
                let wallScreenHeight = Math.round(
                    (this.viewDist / rayHit.correctDistance) * this.tileSize
                );
                let textureX =
                    (rayHit.horizontal ? this.textureSize : 0) +
                    (rayHit.tileX / this.tileSize) * this.textureSize;
                let textureY = this.textureSize * (rayHit.wallType - 1);
                this.drawWallStrip(rayHit, textureX, textureY, wallScreenHeight);
            }
        }
        this.mainCanvasContext.putImageData(this.backBuffer, 0, 0);
    }

    // OPTIMISATION : Utilisation de Float32Array
    createRayAngles() {
        if (!this.rayAngles) {
            this.rayAngles = new Float32Array(this.rayCount);
            for (let i = 0; i < this.rayCount; i++) {
                let screenX = (this.rayCount / 2 - i) * this.stripWidth;
                let rayAngle = Math.atan(screenX / this.viewDist);
                this.rayAngles[i] = rayAngle;
            }
            console.log("No. of ray angles=" + this.rayAngles.length);
        }
    }

    // OPTIMISATION : Utilisation de Float32Array
    createViewDistances() {
        if (!this.viewDistances) {
            this.viewDistances = new Float32Array(this.rayCount);
            for (let x = 0; x < this.rayCount; x++) {
                let dx = (this.rayCount / 2 - x) * this.stripWidth;
                let currentViewDistance = Math.sqrt(
                    dx * dx + this.viewDist * this.viewDist
                );
                this.viewDistances[x] = currentViewDistance;
            }
            console.log("No. of view distances=" + this.viewDistances.length);
        }
    }

    sortRayHits(rayHits) {
        rayHits.sort(function(a, b) {
            return a.distance > b.distance ? -1 : 1;
        });
    }

    // OPTIMISATION : Utilisation des tables trigonométriques pré-calculées
    castRays(rayHits) {
        for (let i = 0; i < this.rayAngles.length; i++) {
            let rayAngle = this.rayAngles[i];
            this.castSingleRay(rayHits, this.player.rot + rayAngle, i);
        }
    }

    // OPTIMISATION : Calcul de distance sans sqrt
    onCellHit(ray) {
        let vx = ray.vx,
            vy = ray.vy,
            hx = ray.hx,
            hy = ray.hy;
        let up = ray.up,
            right = ray.right;
        let cellX = ray.cellX,
            cellY = ray.cellY;
        let wallHit = ray.wallHit;
        let horizontal = ray.horizontal;
        let wallFound = false;
        let stripIdx = ray.strip;
        let rayAngle = ray.rayAngle;
        let rayHits = ray.rayHits;

        // Check for sprites in cell - OPTIMISÉ avec index spatial
        let spritesFound = this.findSpritesInCell(cellX, cellY, true);
        for (let sprite of spritesFound) {
            let spriteHit = RayHit.spriteRayHit(
                sprite,
                this.player.x - sprite.x,
                this.player.y - sprite.y,
                stripIdx,
                rayAngle
            );
            if (spriteHit.distance) {
                rayHits.push(spriteHit);
            }
        }

        // Handle cell walls - OPTIMISÉ
        if (this.map[cellY][cellX] > 0) {
            // OPTIMISATION : Une seule vérification pour horizontal
            const x = horizontal ? hx : vx;
            const y = horizontal ? hy : vy;
            const dx = this.player.x - x;
            const dy = this.player.y - y;
            const squaredDistance = dx * dx + dy * dy;
            
            if (!wallHit.distance || squaredDistance < wallHit.distance) {
                wallFound = true;
                wallHit.distance = squaredDistance;
                wallHit.horizontal = horizontal;
                wallHit.x = x;
                wallHit.y = y;
                
                if (horizontal) {
                    wallHit.tileX = hx % this.tileSize;
                    // Facing down, flip image
                    if (!up) {
                        wallHit.tileX = this.tileSize - wallHit.tileX;
                    }
                } else {
                    wallHit.tileX = vy % this.tileSize;
                    // Facing left, flip image
                    if (!right) {
                        wallHit.tileX = this.tileSize - wallHit.tileX;
                    }
                }
                wallHit.wallType = this.map[cellY][cellX];
            }
        }
        return !wallFound;
    }

    onRayEnd(ray) {
        let rayAngle = ray.rayAngle;
        let rayHits = ray.rayHits;
        let stripIdx = ray.strip;
        let wallHit = ray.wallHit;
        if (wallHit.distance) {
            wallHit.distance = Math.sqrt(wallHit.distance);
            // OPTI NEEEW
            wallHit.correctDistance = wallHit.distance * this.getFishEyeCorrection(ray.strip);
            wallHit.strip = stripIdx;
            wallHit.rayAngle = rayAngle;
            this.drawRay(wallHit.x, wallHit.y);
            rayHits.push(wallHit);
        }
    }

    castSingleRay(rayHits, rayAngle, stripIdx) {
        // OPTIMISATION : Normalisation d'angle optimisée
        rayAngle = Raycaster.normalizeAngleFast(rayAngle, this);

        //   2  |  1
        //  ----+----
        //   3  |  4
        let right =
            (rayAngle < Raycaster.TWO_PI * 0.25 && rayAngle >= 0) || // Quadrant 1
            rayAngle > Raycaster.TWO_PI * 0.75; // Quadrant 4
        let up = rayAngle < Raycaster.TWO_PI * 0.5 && rayAngle >= 0; // Quadrant 1 and 2

        let ray = new RayState(rayAngle, stripIdx);
        ray.rayHits = rayHits;
        ray.right = right;
        ray.up = up;
        ray.wallHit = new RayHit();

        // Process current player cell
        ray.cellX = (this.player.x / this.tileSize) | 0;
        ray.cellY = (this.player.y / this.tileSize) | 0;
        this.onCellHit(ray);

        // closest vertical line
        ray.vx = right ?
            ((this.player.x / this.tileSize) | 0) * this.tileSize + this.tileSize :
            ((this.player.x / this.tileSize) | 0) * this.tileSize - 1;
        ray.vy = this.player.y + (this.player.x - ray.vx) * Math.tan(rayAngle);

        // closest horizontal line
        ray.hy = up ?
            ((this.player.y / this.tileSize) | 0) * this.tileSize - 1 :
            ((this.player.y / this.tileSize) | 0) * this.tileSize + this.tileSize;
        ray.hx = this.player.x + (this.player.y - ray.hy) / Math.tan(rayAngle);

        // vector for next vertical line
        let stepvx = right ? this.tileSize : -this.tileSize;
        let stepvy = this.tileSize * Math.tan(rayAngle);

        // vector for next horizontal line
        let stephy = up ? -this.tileSize : this.tileSize;
        let stephx = this.tileSize / Math.tan(rayAngle);

        // tan() returns positive values in Quadrant 1 and Quadrant 4
        // But window coordinates need negative coordinates for Y-axis so we reverse them
        if (right) {
            stepvy = -stepvy;
        }

        // tan() returns stepx as positive in quadrant 3 and negative in quadrant 4
        // This is the opposite of horizontal window coordinates so we need to reverse the values
        // when angle is facing down
        if (!up) {
            stephx = -stephx;
        }

        // Vertical lines
        ray.vertical = true;
        ray.horizontal = false;
        while (
            ray.vx >= 0 &&
            ray.vx < this.worldWidth &&
            ray.vy >= 0 &&
            ray.vy < this.worldHeight
        ) {
            ray.cellX = (ray.vx / this.tileSize) | 0;
            ray.cellY = (ray.vy / this.tileSize) | 0;
            if (this.onCellHit(ray)) {
                ray.vx += stepvx;
                ray.vy += stepvy;
            } else {
                break;
            }
        }

        // Horizontal lines
        ray.vertical = false;
        ray.horizontal = true;
        while (
            ray.hx >= 0 &&
            ray.hx < this.worldWidth &&
            ray.hy >= 0 &&
            ray.hy < this.worldHeight
        ) {
            ray.cellX = (ray.hx / this.tileSize) | 0;
            ray.cellY = (ray.hy / this.tileSize) | 0;
            if (this.onCellHit(ray)) {
                ray.hx += stephx;
                ray.hy += stephy;
            } else {
                break;
            }
        }

        this.onRayEnd(ray);
    }

    spriteScreenPosition(sprite) {
        let rc = {
            x: 0,
            y: 0,
            w: 0,
            h: 0,
        };

        // Calculate angle between player and sprite
        // We use atan2() to find the sprite's angle if the player rotation was 0 degrees
        // Then we deduct the player's current rotation from it
        // Note that plus (+) is used to "deduct" instead of minus (-) because it takes
        // into account these facts:
        //   a) dx and dy use world coordinates, while atan2() uses cartesian coordinates.
        //   b) atan2() can return positive or negative angles based on the circle quadrant

        let dx = sprite.x - this.player.x;
        let dy = sprite.y - this.player.y;
        let totalAngle = Math.atan2(dy, dx);
        let spriteAngle = totalAngle + this.player.rot;

        // x distance from center line
        let x = Math.tan(spriteAngle) * this.viewDist;

        let spriteDistance = Math.sqrt(dx * dx + dy * dy);
        let centerDistance = Math.cos(spriteAngle) * spriteDistance;

        // spriteScreenWidth   spriteWorldWidth
        // ----------------- = ----------------
        //      viewDist        centerDistance
        let spriteScreenWidth = (this.tileSize * this.viewDist) / centerDistance;
        let spriteScreenHeight = spriteScreenWidth; // assume both width and height are the same

        rc.x =
            this.halfDisplayWidth +
            x - // get distance from left of screen
            (spriteScreenWidth >> 1); // deduct half of sprite width because x is center of sprite
        rc.y = (this.displayHeight - spriteScreenWidth) / 2.0;
        rc.w = spriteScreenWidth;
        rc.h = spriteScreenHeight;

        return rc;
    }

    drawRay(rayX, rayY) {
        let miniMapObjects = document.getElementById("minimapobjects");
        let objectCtx = miniMapObjects.getContext("2d");

        rayX = (rayX / (this.mapWidth * this.tileSize)) * 100;
        rayX = (rayX / 100) * Raycaster.MINIMAP_SCALE * this.mapWidth;
        rayY = (rayY / (this.mapHeight * this.tileSize)) * 100;
        rayY = (rayY / 100) * Raycaster.MINIMAP_SCALE * this.mapHeight;

        let playerX = (this.player.x / (this.mapWidth * this.tileSize)) * 100;
        playerX = (playerX / 100) * Raycaster.MINIMAP_SCALE * this.mapWidth;

        let playerY = (this.player.y / (this.mapHeight * this.tileSize)) * 100;
        playerY = (playerY / 100) * Raycaster.MINIMAP_SCALE * this.mapHeight;

        objectCtx.strokeStyle = "rgba(0,100,0,0.3)";
        objectCtx.lineWidth = 0.5;
        objectCtx.beginPath();
        objectCtx.moveTo(playerX, playerY);
        objectCtx.lineTo(rayX, rayY);
        objectCtx.closePath();
        objectCtx.stroke();
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    // Minimap et dessin du canvas minimap
    ///////////////////////////////////////////////////////////////////////////////////////////////

    updateMiniMap() {
        let miniMap = document.getElementById("minimap");
        let miniMapObjects = document.getElementById("minimapobjects");

        let objectCtx = miniMapObjects.getContext("2d");

        miniMapObjects.width = miniMapObjects.width;

        let playerX = (this.player.x / (this.mapWidth * this.tileSize)) * 100;
        playerX = (playerX / 100) * Raycaster.MINIMAP_SCALE * this.mapWidth;

        let playerY = (this.player.y / (this.mapHeight * this.tileSize)) * 100;
        playerY = (playerY / 100) * Raycaster.MINIMAP_SCALE * this.mapHeight;

        objectCtx.fillStyle = "red";
        objectCtx.fillRect(
            // draw a dot at the current player position
            playerX - 2,
            playerY - 2,
            4,
            4
        );

        objectCtx.strokeStyle = "red";
        objectCtx.beginPath();
        objectCtx.moveTo(playerX, playerY);
        objectCtx.lineTo(
            playerX + Math.cos(this.player.rot) * 4 * Raycaster.MINIMAP_SCALE,
            playerY + -Math.sin(this.player.rot) * 4 * Raycaster.MINIMAP_SCALE
        );
        objectCtx.closePath();
        objectCtx.stroke();
    }

    drawMiniMap() {
        let miniMap = document.getElementById("minimap"); // the actual map
        let miniMapCtr = document.getElementById("minimapcontainer"); // the container div element
        let miniMapObjects = document.getElementById("minimapobjects"); // the canvas used for drawing the objects on the map (player character, etc)

        miniMap.width = this.mapWidth * Raycaster.MINIMAP_SCALE; // resize the internal canvas dimensions
        miniMap.height = this.mapHeight * Raycaster.MINIMAP_SCALE; // of both the map canvas and the object canvas
        miniMapObjects.width = miniMap.width;
        miniMapObjects.height = miniMap.height;

        let w = this.mapWidth * Raycaster.MINIMAP_SCALE + "px"; // minimap CSS dimensions
        let h = this.mapHeight * Raycaster.MINIMAP_SCALE + "px";
        miniMap.style.width =
            miniMapObjects.style.width =
            miniMapCtr.style.width =
            w;
        miniMap.style.height =
            miniMapObjects.style.height =
            miniMapCtr.style.height =
            h;

        let ctx = miniMap.getContext("2d");
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, miniMap.width, miniMap.height);

        // loop through all blocks on the map
        for (let y = 0; y < this.mapHeight; y++) {
            for (let x = 0; x < this.mapWidth; x++) {
                let wall = this.map[y][x];
                if (wall > 0) {
                    // if there is a wall block at this (x,y) ...
                    ctx.fillStyle = "rgb(200,200,200)";
                    ctx.fillRect(
                        // ... then draw a block on the minimap
                        x * Raycaster.MINIMAP_SCALE,
                        y * Raycaster.MINIMAP_SCALE,
                        Raycaster.MINIMAP_SCALE,
                        Raycaster.MINIMAP_SCALE
                    );
                }
            }
        }

        this.updateMiniMap();
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Classe d'un rayon (raycaster)
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Holds information about a wall hit from a single ray
class RayHit {
    constructor() {
        this.x = 0; // world coordinates of hit
        this.y = 0;
        this.strip = 0; // screen column
        this.tileX = 0; // // wall hit position, used for texture mapping
        this.distance = 0; // distance between player and wall
        this.correctDistance = 0; // distance to correct for fishbowl effect
        this.vertical = false; // vertical cell hit
        this.horizontal = false; // horizontal cell hit
        this.wallType = 0; // type of wall
        this.rayAngle = 0; // angle of ray hitting the wall
        this.sprite = null; // save sprite hit
    }

    static spriteRayHit(sprite, distX, distY, strip, rayAngle) {
        let squaredDistance = distX * distX + distY * distY;
        let rayHit = new RayHit();
        rayHit.sprite = sprite;

        rayHit.sprite.spriteTexture = sprite.spriteTexture;
        rayHit.strip = strip;
        rayHit.rayAngle = rayAngle;
        rayHit.distance = Math.sqrt(squaredDistance);
        return rayHit;
    }
}

class RayState {
    constructor(rayAngle, strip) {
        this.rayAngle = rayAngle;
        this.strip = strip;
        this.cellX = 0;
        this.cellY = 0;
        this.rayHits = [];
        this.vx = 0;
        this.vy = 0;
        this.hx = 0;
        this.hy = 0;
        this.vertical = false;
        this.horizontal = false;
    }
}