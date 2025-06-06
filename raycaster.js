////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// OASIS.JS
// The RPG game engine using raycasting - OPTIMIZED VERSION WITH GLOBAL FOG
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Created by Gwendal LE ROUX,
// Engine made from scratch with no dependencies !
// Inspiration taken from Jacob Seidelin tutorial(ref : https://dev.opera.com/articles/3d-games-with-canvas-and-raycasting-part-1/)
// and Andrew Lim's architecture (ref : https://github.com/andrew-lim/html5-raycast)

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// VARIABLES GLOBALES
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

console.log("chargement du moteur de jeux.")

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SYSTEM

const DESIRED_FPS = 60;
const UPDATE_INTERVAL = Math.trunc(1000 / DESIRED_FPS);

let consoleContent = "";

let lastEntry = "";

let commandBlocking = false; // Variable globale pour bloquer les commandes pendant dialogues/cinématiques

var totalTimeElapsed = 0;
var timeSinceLastSecond = 0;

// animation referee : problème de gestion du temps, prends trop de ressource
let spriteAnimationProgress = 0;
let lastTime = new Date().getSeconds();

let gameOver = false;

// Variable globale pour empêcher les appels multiples
// (pour temporiser chargement/sauvegarde de partie)
let isLoading = false;
let isChangingMap = false;

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MOVE CONTROLS

const KEY_UP = 38;
const KEY_DOWN = 40;
const KEY_LEFT = 37;
const KEY_RIGHT = 39;

const KEY_W = 90;
const KEY_S = 83;
const KEY_A = 81;
const KEY_D = 68;

const KEY_F = 70;
const KEY_SPACE = 32;

let joystickForwardClicked = false;
let joystickBackwardClicked = false;
let joystickLeftClicked = false;
let joystickRightClicked = false;

const nord = Math.PI / 2;
const ouest = Math.PI;
const sud = (3 * Math.PI) / 2;
const est = 0;

var orientationTarget;

var moveTargetX;
var moveTargetY;



////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FOG SETTINGS - VARIABLES GLOBALES
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Variable globale pour activer/désactiver le brouillard
let fogEnabled = false; 


// Variables globales pour les distances
let fogMinDistance = 1280;  // Distance minimale (1 tuile)
let fogMaxDistance = 8192;  // Distance maximale (6-7 tuiles)

// Variables globales pour la couleur
let fogColorR = 20;  // Rouge
let fogColorG = 20;  // Vert
let fogColorB = 30;  // Bleu

// Variable globale pour la densité
let fogDensity = 0.8;  // 0 = transparent, 1 = opaque

// Fonction pour activer le brouillard
function enableFog() {
    fogEnabled = true;
}

// Fonction pour désactiver le brouillard
function disableFog() {
    fogEnabled = false;
}

// Fonction pour changer la couleur du brouillard
function setFogColor(r, g, b) {
    fogColorR = Math.max(0, Math.min(255, r));
    fogColorG = Math.max(0, Math.min(255, g));
    fogColorB = Math.max(0, Math.min(255, b));
}

// Fonction pour ajuster les distances
function setFogDistance(min, max) {
    fogMinDistance = Math.max(0, min);
    fogMaxDistance = Math.max(fogMinDistance + 1, max);
}

// Fonction pour ajuster la densité
function setFogDensity(density) {
    fogDensity = Math.max(0, Math.min(1, density));
}

// Présets de brouillard
function setFogPreset(preset) {
    switch(preset) {
        case 'night':
            setFogColor(20, 20, 30);
            setFogDensity(0.8);
            break;
        case 'mist':
            setFogColor(128, 128, 128);
            setFogDensity(0.6);
            break;
        case 'toxic':
            setFogColor(30, 80, 30);
            setFogDensity(0.7);
            break;
        case 'fire':
            setFogColor(80, 20, 20);
            setFogDensity(0.9);
            break;
        case 'underwater':
            setFogColor(20, 40, 60);
            setFogDensity(0.85);
            break;
        case 'clear':
            disableFog();
            break;
    }
}

// Fonction pour calculer le facteur de brouillard
function calculateFogFactor(distance) {
    if (!fogEnabled) return 0;
    
    if (distance <= fogMinDistance) return 0;
    if (distance >= fogMaxDistance) return fogDensity;
    
    // Interpolation linéaire entre minDistance et maxDistance
    const range = fogMaxDistance - fogMinDistance;
    const distFromMin = distance - fogMinDistance;
    return (distFromMin / range) * fogDensity;
}

// Fonction pour appliquer le brouillard à une couleur
function applyFog(r, g, b, distance) {
    const fogFactor = calculateFogFactor(distance);
    if (fogFactor === 0) return { r, g, b };
    
    return {
        r: Math.round((1 - fogFactor) * r + fogFactor * fogColorR),
        g: Math.round((1 - fogFactor) * g + fogFactor * fogColorG),
        b: Math.round((1 - fogFactor) * b + fogFactor * fogColorB)
    };
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FONCTIONS GLOBALES
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Ingame 1sec Pause Timer
async function pause(ms) {
    console.log("pause putain");
    return new Promise(resolve => setTimeout(resolve, ms));
}

function updateProgressBar(id, value, max) {
    const progressBar = document.getElementById(id);
    const progress = progressBar.querySelector(".progress");
    const percentage = (value / max) * 100;
    progress.style.width = `${percentage}%`;
}

// initialisation du message d'intro du terminal
// Movable in the Raycaster initialization but, whatever...
document.addEventListener("DOMContentLoaded", function() {
    Sprite.terminalLog("Welcome in Oasis.JS ! (version pre-Alpha)")
    Sprite.terminalLog("")
    Sprite.terminalLog("HOW TO PLAY :")
    Sprite.terminalLog("'← ↑ → ↓' or use the joystick to move.")
    Sprite.terminalLog("'A' button or 'space' to interact/fight.")
    Sprite.terminalLog("'B' button to access your gear/stats.")
    Sprite.terminalLog("")
    Sprite.terminalLog("N.B. : the joystick is crappy, sorry ♥");
    Sprite.terminalLog("")
    Sprite.terminalLog("=========================================")
    Sprite.resetToggle()
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MAP | ENVIRONMENT || Make a class out of it ? Whatever...
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var currentMap = 1;

// Valeur hauteur de plafond
let ceilingHeight = 2;
let ceilingRender = false;

// Texture sol et plafond
let floorTexture = 1;
let ceilingTexture = 1;


// Sprites : comment ça marche ? xyz

/* 
Plus besoin de ça, on charge "maps.js" dans le script principal sur la page index.html
const maps = [];

toutes les classes sont à présent des fichiers JS
*/
console.log("fichier de maps.js : " + maps);

function getMapDataByID(mapID) {
    return maps.find(map => map.mapID === mapID);
}

// Exemple d'utilisation
var mapData = getMapDataByID(currentMap);



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
        this.stripWidth = 1;
        this.ceilingHeight = 1;
        this.mainCanvas = mainCanvas;
        this.mapWidth = this.map[0].length;
        this.mapHeight = this.map.length;
        this.displayWidth = displayWidth;
        this.displayHeight = displayHeight;
        this.rayCount = Math.ceil(displayWidth / this.stripWidth);
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
        this.createRayAngles();
        this.createViewDistances();
        this.initTrigTables(); // NOUVEAU : Initialiser les tables trigonométriques
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

        // contrôle du fog
        // Si en extérieur : pas de fog
        // Si intérieur (plafond) : fog
        if (ceilingRender == true) {
            console.log("fogEnabled = true ")
            enableFog();
        } else {
            console.log("fogEnabled = false ")
            disableFog();
        }

        
        // Rappel pour la prochaine frame
        let this2 = this;
        window.requestAnimationFrame(function() {
            this2.gameCycle();
        });
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

    drawTexturedFloor(rayHits) {
        const centerY = this.halfDisplayHeight;
        const eyeHeight = (this.tileSize >> 1) + this.player.z;
        
        for (let rayHit of rayHits) {
            const wallScreenHeight = this.stripScreenHeight(
                this.viewDist,
                rayHit.correctDistance,
                this.tileSize
            );
            const screenX = rayHit.strip * this.stripWidth;
            const currentViewDistance = this.viewDistances[rayHit.strip];
            const cosRayAngle = Math.cos(rayHit.rayAngle);
            const sinRayAngle = Math.sin(rayHit.rayAngle);
            let screenY = Math.max(
                centerY,
                ((this.displayHeight - wallScreenHeight) >> 1) + wallScreenHeight
            ) | 0;
            
            for (; screenY < this.displayHeight; screenY++) {
                let dy = screenY - centerY;
                let floorDistance = (currentViewDistance * eyeHeight) / dy;
                let worldX = this.player.x + floorDistance * cosRayAngle;
                let worldY = this.player.y + floorDistance * -sinRayAngle;
                
                if (
                    worldX < 0 ||
                    worldY < 0 ||
                    worldX >= this.worldWidth ||
                    worldY >= this.worldHeight
                ) {
                    continue;
                }
                
                // OPTIMISATION : Utiliser le cache de texture
                const texCoord = this.getTextureCoord(worldX, worldY);
                
                let srcPixel = Raycaster.getPixel(
                    this.floorImageData,
                    texCoord.x,
                    texCoord.y
                );
                
                // NOUVEAU : Appliquer le brouillard au sol texturé
                const foggedPixel = applyFog(srcPixel.r, srcPixel.g, srcPixel.b, floorDistance);
                
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
// FADE TO BLACK

// Fonction 1 : Transition vers le noir
static async fadeToBlack(duration = 150) {
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
static async fadeFromBlack(duration = 150) {
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
    // Plafond/SkyBox
    //////////////////////////////////////////////////////////////////////

    drawTexturedCeiling(rayHits) {
        const centerY = this.halfDisplayHeight;
        const eyeHeight = (this.tileSize >> 1) + this.player.z;
        const currentCeilingHeight = this.tileSize * this.ceilingHeight;
        
        for (let rayHit of rayHits) {
            const wallScreenHeight = this.stripScreenHeight(
                this.viewDist,
                rayHit.correctDistance,
                this.tileSize
            );
            const screenX = rayHit.strip * this.stripWidth;
            const currentViewDistance = this.viewDistances[rayHit.strip];
            const cosRayAngle = Math.cos(rayHit.rayAngle);
            const sinRayAngle = Math.sin(rayHit.rayAngle);
            let screenY = Math.min(
                centerY - 1,
                ((this.displayHeight - wallScreenHeight) >> 1) - 1
            ) | 0;
            
            for (; screenY >= 0; screenY--) {
                let dy = centerY - screenY;
                let ceilingDistance =
                    (currentViewDistance * (currentCeilingHeight - eyeHeight)) / dy;
                let worldX = this.player.x + ceilingDistance * cosRayAngle;
                let worldY = this.player.y + ceilingDistance * -sinRayAngle;
                
                if (
                    worldX < 0 ||
                    worldY < 0 ||
                    worldX >= this.worldWidth ||
                    worldY >= this.worldHeight
                ) {
                    continue;
                }
                
                // OPTIMISATION : Utiliser le cache de texture
                const texCoord = this.getTextureCoord(worldX, worldY);
                
                let srcPixel = Raycaster.getPixel(
                    this.ceilingImageData,
                    texCoord.x,
                    texCoord.y
                );
                
                // NOUVEAU : Appliquer le brouillard au plafond
                const foggedPixel = applyFog(srcPixel.r, srcPixel.g, srcPixel.b, ceilingDistance);
                
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
            wallHit.correctDistance =
                wallHit.distance * Math.cos(this.player.rot - rayAngle);
            wallHit.strip = stripIdx;
            wallHit.rayAngle = rayAngle;
            this.drawRay(wallHit.x, wallHit.y);
            rayHits.push(wallHit);
        }
    }

    castSingleRay(rayHits, rayAngle, stripIdx) {
        // OPTIMISATION : Normalisation d'angle optimisée
        rayAngle = Raycaster.normalizeAngle(rayAngle);

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