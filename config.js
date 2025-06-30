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


// récupère le nom du joueur
let playerName = "%PLAYER%";

let playerFace = "oupsi"

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
let fogEnabled = true; 


// Variables globales pour les distances
let fogMinDistance = 1280;  // Distance minimale (1 tuile)
let fogMaxDistance = 8192;  // Distance maximale (6-7 tuiles)

// Variables globales pour la couleur
let fogColorR = 20;  // Rouge
let fogColorG = 20;  // Vert
let fogColorB = 20;  // Bleu

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
    Sprite.terminalLog("Welcome in Oasis.JS ! (version BETA-06/25)")
    Sprite.terminalLog("")
    Sprite.terminalLog("HOW TO PLAY :")
    Sprite.terminalLog("'← ↑ → ↓' or walk, strafe and turn.")
    Sprite.terminalLog("'A' button or 'space' to interact/fight.")
    Sprite.terminalLog("'CHARACTER' to access your gear/stats.")
    Sprite.terminalLog("")
    Sprite.terminalLog("Go to 'MENU' to start a new game !");
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
// PORTE
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Variable statique pour le verrouillage global de la porte
    // Doit être définie en dehors de la fonction pour persister entre les appels
    let doorLockActive = false;
