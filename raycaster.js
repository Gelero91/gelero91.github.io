////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// OASIS.JS
// The RPG game engine using raycasting
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// Created by Gwendal LE ROUX,
// Engine made from scratch with no dependencies !
// Inspiration taken from Jacob Seidelin tutorial(ref : https://dev.opera.com/articles/3d-games-with-canvas-and-raycasting-part-1/)
// and Andrew Lim's architecture (ref : https://github.com/andrew-lim/html5-raycast)

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// VARIABLES GLOBALES
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

var currentMap = 2;

// Valeur hauteur de plafond
let ceilingHeight = 2;
let ceilingRender = false;

// Texture sol et plafond
let floorTexture = 3;
let ceilingTexture = 1;

// Sprites : comment ça marche ?
            // Il y a des types de sprites avec des comportements définis.
            // 1 = objet/sans intéraction/bloquant, 10 = sprites décoratifs (ex : herbe)
            // 2 = XXX , 3 = XXX, 4 = XXX, 5 = XXX
            // "A" = ennemis, "DOOR" = porte intérieur/exterieur, "EXIT" = map suivante
            // les variables sont organisées de la sorte:
            // ID (ne peut être en double, sauf 0 qui ne marche que pour type 10)
            // ID, x, y, type, texture (etc...)

var maps = [
        {
            mapID: 1,
            map: [[3,3,4,3,3,3,3,1,1,1,1,1,5,5,5,1,9,1,5,5,5,5,5,5],[3,0,0,0,3,3,3,1,1,1,5,5,5,0,0,0,0,0,0,0,5,5,5,5],[3,0,0,0,3,3,3,1,5,5,0,0,0,0,0,0,0,0,0,0,0,5,5,5],[3,0,0,0,0,0,3,5,0,0,0,0,0,0,0,0,0,0,0,0,0,5,5,5],[3,0,0,0,3,0,3,6,6,7,6,0,0,0,0,0,0,0,0,0,0,0,5,5],[3,0,0,0,3,0,3,6,0,0,7,0,0,0,0,0,0,0,0,0,0,0,5,5],[3,3,3,3,3,0,3,6,0,0,6,0,0,0,0,0,0,0,0,0,0,5,5,5],[3,3,3,0,0,0,3,6,6,0,6,7,0,0,0,0,0,0,0,0,0,5,5,5],[3,0,0,0,0,0,3,6,0,0,0,6,0,0,0,0,0,0,0,0,0,5,5,5],[3,0,3,3,3,3,3,6,0,0,0,8,0,0,0,0,0,0,0,0,0,5,5,5],[3,0,0,0,0,3,3,6,0,0,0,6,0,0,0,0,0,0,0,0,0,5,5,5],[3,3,0,0,0,3,3,6,6,7,6,7,0,0,0,0,0,0,0,0,0,0,5,5],[3,3,0,0,0,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5],[3,3,3,4,3,3,3,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5],[1,1,1,0,1,1,1,1,3,3,0,0,0,0,0,0,0,0,0,0,0,0,5,5],[1,1,0,0,0,1,1,1,3,3,0,0,0,0,0,0,0,0,0,0,0,0,5,5],[1,1,0,0,0,0,0,1,3,3,0,0,0,0,0,0,0,0,0,0,0,0,0,5],[1,1,0,0,0,1,0,1,1,1,3,0,0,0,0,0,0,0,0,0,0,0,3,3],[1,1,1,1,1,1,0,1,0,0,3,3,0,0,0,0,0,0,0,0,0,0,3,1],[1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,0,0,1,1,1,3,3,1],[2,2,2,2,0,0,0,0,0,0,0,1,0,0,1,2,4,2,1,0,0,1,1,1],[2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],[2,2,2,2,0,0,0,0,0,0,0,1,0,0,1,0,0,0,1,0,0,0,0,1],[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]],
            sprites: [[1,2,1,"EXIT",16],[2,1,2,1,12],[3,1,3,5,9],[4,3,3,"A",14,null,"Sprite 3,3",[],[],2,1],[5,18,3,1,13],[6,1,4,1,12],[7,13,4,1,13],[8,5,5,"A",14,null,"Sprite 5,5",[],[],2,1],[9,8,5,1,17],[10,9,5,1,17],[11,12,5,1,15],[12,14,7,1,13],[13,20,7,2,2,"facePlayer","Sprite 20,7",[["faceGuard","Gwen","Le plus dur ? C'est de se tenir à un objectif. Le developpement d'un jeux video est un défis qu'on sous-estime facilement."],["faceGuard","Gwen","Par chance, j'ai pu présenter mon projet au public, donc ça m'a encourage."],["faceGuard","Gwen","Finalement je l'ai présenté comme projet de fin d'étude.\nJ'arrive pas à croire que j'ai reussi."]]],[14,3,8,"A",14,null,"Sprite 3,8",[],[],2,1],[15,8,8,1,5],[16,12,8,3,1,"faceMerchant","Sprite 12,8",[],[3]],[17,17,8,1,13],[18,8,9,2,2,"facePlayer","Sprite 8,9",[["faceThief","Pnj aux cheveux bleux","On a réussi à faire fonctionner l'éditeur ?\nJ'arrive pas à y croire..."]]],[19,11,9,"DOOR",2],[20,2,10,"A",14,null,"Sprite 2,10",[],[],2,1],[21,8,10,1,17],[22,10,10,1,5],[23,18,10,1,15],[24,12,11,1,17],[25,19,11,1,6],[26,12,12,1,13],[27,18,13,1,13],[28,19,13,1,13],[29,15,14,1,1],[30,18,14,1,6],[31,2,15,1,5],[32,13,15,1,6],[33,11,16,1,13],[34,3,17,1,17],[35,4,17,1,17],[36,17,17,1,6],[37,21,17,1,13],[38,20,18,1,15],[39,4,20,1,12],[40,7,20,1,12],[41,12,20,1,16],[42,13,20,1,16],[43,16,20,"DOOR",2],[44,22,21,1,5],[45,4,22,1,12],[46,7,22,1,12],[47,12,22,1,16],[48,13,22,1,16],[49,15,22,1,12],[50,17,22,1,12],[51,19,22,1,5]],
            eventA: [[3,14, 4.71238898038469,true,2,1,2,"Moving out..."]],
            eventB: [[3,12, 1.57,true,1,2,1,"Moving in..."]],
            playerStart: {
            X: 16,
            Y: 1,
            Orientation: 4.71238898038469,
            ceilingRender: false,
            ceilingHeight: 2,
            ceilingTexture: 1,
            floorTexture: 3
            }
        },
        {
            mapID: 2,
            map: [
                [1, 1, 1, 1, 1, 1, 1, 1, 5, 5, 5, 5, 5, 1, 9, 9, 1, 5, 5, 5, 5, 5, 5, 5],
                [2, 2, 0, 0, 0, 0, 0, 2, 5, 5, 0, 0, 0, 1, 0, 0, 1, 0, 0, 5, 5, 5, 5, 5],
                [2, 2, 0, 0, 0, 0, 0, 2, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 5, 5],
                [2, 2, 0, 0, 0, 0, 0, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 6, 6, 6, 5],
                [1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 6, 3],
                [2, 2, 0, 0, 0, 0, 0, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 8, 0, 0, 0, 6, 3],
                [2, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 7, 0, 0, 0, 6, 3],
                [2, 2, 0, 0, 0, 0, 0, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 6, 6, 6, 6, 3],
                [1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5],
                [1, 0, 0, 0, 0, 0, 0, 1, 5, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 3],
                [1, 0, 0, 0, 1, 1, 0, 1, 5, 0, 0, 0, 7, 8, 7, 6, 0, 0, 5, 5, 5, 5, 5, 3],
                [1, 0, 0, 0, 1, 0, 0, 0, 1, 5, 0, 0, 6, 0, 0, 0, 7, 0, 5, 3, 3, 3, 3, 3],
                [1, 0, 0, 0, 1, 0, 0, 0, 1, 5, 0, 7, 0, 0, 0, 0, 6, 5, 3, 3, 0, 0, 3, 3],
                [1, 2, 4, 2, 1, 1, 1, 1, 1, 3, 5, 6, 0, 0, 0, 0, 6, 3, 3, 3, 0, 0, 0, 3],
                [3, 3, 0, 3, 3, 3, 3, 3, 3, 3, 3, 0, 6, 6, 6, 6, 6, 3, 0, 0, 3, 0, 0, 3],
                [3, 0, 0, 3, 3, 3, 0, 0, 3, 3, 3, 0, 3, 3, 3, 3, 3, 0, 0, 0, 3, 3, 0, 3],
                [3, 0, 3, 3, 0, 0, 0, 0, 0, 3, 3, 3, 0, 0, 0, 0, 0, 0, 3, 0, 0, 3, 3, 3],
                [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 3, 0, 0, 0, 3, 3],
                [3, 3, 3, 3, 0, 0, 0, 0, 0, 3, 3, 3, 3, 3, 0, 0, 0, 3, 0, 0, 3, 0, 3, 3],
                [3, 0, 0, 3, 3, 3, 0, 3, 3, 3, 0, 0, 0, 3, 0, 0, 0, 3, 0, 3, 3, 0, 3, 3],
                [3, 0, 0, 3, 3, 3, 0, 3, 0, 0, 0, 0, 0, 3, 0, 0, 0, 3, 0, 3, 0, 0, 0, 3],
                [3, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 3, 3, 0, 3, 3, 0, 3, 0, 0, 0, 3],
                [3, 0, 0, 3, 3, 3, 3, 3, 3, 3, 0, 0, 0, 3, 3, 0, 0, 0, 0, 3, 0, 0, 0, 3],
                [3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 9, 3, 3]
            ],
    
            sprites: [
                [1, 17, 6, 2, 1, "faceThief", "Tarik the Thief", [
                        ["facePlayer", "Alakir", "Hello there! What's the news?"],
                        ["faceThief", "Tarik the Thief", "Welcome adventurer! <br>You should talk to the guards, near the temple. They have a situation."],
                        ["facePlayer", "Alakir", "Thanks for the info, I'll head there right away."]
                    ],
                    [], 5, 3
                ],
                [2, 9, 5, 2, 2, "faceGuard", "Guard", [
                        ["facePlayer", "Alakir", "Hello, I'm an adventurer. <br>Do you need any help?"],
                        ["faceGuard", "Guard", "Hello adventurer. <br>We need help in the temple, the crypts are invaded by critters."],
                        ["facePlayer", "Alakir", "Thanks for the info, I'll take care of that."]
                    ],
                    [], 4, 2
                ],
                [3, 4, 1, 2, 2, "faceGuard", "Guard", [
                        ["facePlayer", "Alakir", "Hello, I'm an adventurer. <br>Do you need any help?"],
                        ["faceGuard", "Guard", "Hello adventurer. <br>We need help in the temple, the crypts are invaded by critters."],
                        ["facePlayer", "Alakir", "Thanks for the info, I'll take care of that."]
                    ],
                    [], 4, 2
                ],
                [4, 14, 13, 3, 3, "faceMerchant", "Quill the Merchant", [
                        ["facePlayer", "Alakir", "Hey!"],
                        ["faceMerchant", "Quill the Merchant", "Oy mate! Want to buy something?"],
                        ["facePlayer", "Alakir", "Oh, okay. Maybe later."]
                    ],
                    [1, 2, 3, 4, 5, 6, 7, 8, 9], 6, 4
                ],
    
                [5, 15, 18, 5, 9],
    
                // basic ennemies : bats
                // le dialogue n'est pas nécessaire, il devrait être ajouté après la fonction de décès
                [6, 4, 17, "A", "A", null, "Bat", [], null, null, null],
                [7, 19, 15, "A", "A", null, "Bat", [], null, null, null],
                [8, 21, 20, "A", "A", null, "Bat", [], null, null, null],
                // tester
                // [9, 14, 4, "A", "A", null, "Bat", [], null, null, null],
    
                [10, 7, 16, 1, 4],
                [11, 20, 16, 1, 4],
                [12, 14, 9, 2, 7, "facePlayer", "facePlayer", [
                        ["facePlayer", "Quill's shop", "Hard discount on adventure gear (No refund in case of death)"],
                    ],
                    [], 3, 1
                ],
                [13, 1, 6, 1, 11],
    
                [14, 17, 3, 1, 6],
                [15, 15, 7, 1, 6],
                [16, 10, 10, 1, 6],
                [17, 12, 3, 1, 6],
                [18, 19, 9, 1, 6],
                [19, 9, 7, 1, 6],
    
                [20, 2, 7, 1, 12],
                [21, 2, 5, 1, 12],
                [22, 6, 7, 1, 12],
                [23, 6, 5, 1, 12],
                [24, 2, 3, 1, 12],
                [25, 6, 3, 1, 12],
                [26, 1, 9, 1, 12],
    
                [27, 7, 12, 1, 17],
                [28, 20, 4, 1, 17],
                [29, 13, 13, 1, 17],
    
                [30, 16, 9, 1, 5],
                [31, 15, 13, 1, 5],
                [32, 17, 7, 1, 5],
                [33, 5, 11, 1, 5],
                [34, 21, 6, 1, 5],
                [35, 15, 11, 1, 5],
    
                [36, 3, 7, 1, 16],
                [37, 3, 5, 1, 16],
                [38, 5, 5, 1, 16],
                [39, 5, 7, 1, 16],
                [40, 2, 1, 1, 16],
                [41, 6, 1, 1, 16],
                [42, 3, 11, 1, 16],
                [43, 1, 11, 1, 16],
    
                [44, 16, 4, 1, 15],
                [45, 10, 9, 1, 15],
                [46, 11, 1, 1, 15],
                
                // coffre
                [47, 22, 21, 6, 9],
    
                [0, 10, 1, 10, 13],
                [0, 11, 1, 10, 13],
                [0, 12, 1, 10, 13],
                [0, 17, 1, 10, 13],
    
                [0, 18, 1, 10, 13],
                [0, 9, 2, 10, 13],
                [0, 11, 2, 10, 13],
                [0, 15, 2, 10, 13],
                [0, 17, 2, 10, 13],
                [0, 19, 2, 10, 13],
                [0, 10, 3, 10, 13],
                [0, 11, 3, 10, 13],
                [0, 12, 3, 10, 13],
                [0, 10, 4, 10, 13],
                [0, 11, 5, 10, 13],
                [0, 13, 5, 10, 13],
                [0, 15, 5, 10, 13],
                [0, 10, 7, 10, 13],
                [0, 14, 7, 10, 13],
                [0, 16, 7, 10, 13],
                [0, 22, 7, 10, 13],
                [0, 10, 8, 10, 13],
                [0, 12, 8, 10, 13],
                [0, 15, 8, 10, 13],
                [0, 20, 8, 10, 13],
                [0, 21, 8, 10, 13],
                [0, 22, 8, 10, 13],
                [0, 10, 9, 10, 13],
                [0, 11, 9, 10, 13],
                [0, 17, 9, 10, 13],
                [0, 18, 9, 10, 13],
                [0, 19, 9, 10, 13],
                [0, 21, 9, 10, 13],
                [0, 9, 10, 10, 13],
                [0, 17, 10, 10, 13],
                [0, 10, 11, 10, 13],
                [0, 17, 11, 10, 13],
                [0, 10, 12, 10, 13],
                [0, 11, 12, 10, 13],
                [0, 11, 13, 10, 13],
                [0, 11, 14, 10, 13],
    
                // EXIT TEST
                [47, 21, 23, "EXIT", "EXIT"],
            ],
            eventA: [
                [17, 5, ouest, false, 3, 2, 3, "Moving out..."],
                [13, 9, nord, false, 1, 2, 3, "Moving out..."],
                [9, 6, est, false, 3, 2, 3, "Moving out..."],
                [2, 12, nord, true, 2, 1, 2, "Moving out of the dungeon !"],
            ],
            eventB: [
                [19, 5, est, true, 3, 1, 2, "Moving in !"],
                [13, 11, sud, true, 3, 1, 4, "Moving in !"],
                [7, 6, ouest, true, 2, 1, 2, "Moving in !"],
                [2, 14, sud, true, 1, 1, 1, "It's a pretty scary place..."],
            ],
    
            playerStart: {
                X: 14,
                Y: 1,
                Orientation: 4.71238898038469,
                ceilingRender: false,
                ceilingHeight: 2,
                ceilingTexture: 1,
                floorTexture: 3
            }, // Position de départ du joueur pour l'ID 1
        }
    
  ];

function getMapDataByID(mapID) {
    return maps.find(map => map.mapID === mapID);
}

// Exemple d'utilisation
var mapData = getMapDataByID(currentMap);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Player
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class Player {
    constructor(name, x, y, rot, raycaster) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.z = 0,
        this.dir = 0,
        this.rot = rot,
        this.quadrant = "",
        this.speed = 0,

        this.tileSize = 1280,
        this.moveSpeed = Math.round(1280 / ((DESIRED_FPS / 60.0) * 16)),
        this.rotSpeed = (1.5 * Math.PI) / 180,

        this.hp = 10;
        this.mp = 10;
        this.hpMax = 10;
        this.mpMax = 10;
        this.turn = true;

        this.strength = 5;
        this.dexterity = 5;
        this.intellect = 5;

        this.XPstrength = 0;
        this.XPdexterity = 0;
        this.XPintellect = 0;

        this.might = 1;
        this.dodge = 1;
        this.magic = 1;
        this.armor = 0;

        this.hands = [];
        this.torso = [];
        this.inventory = [];
        this.spells = [];
        this.quests = [];

        this.joystick = true;
        this.selectedSpell = 0;
        this.combatSpell = false;

        this.playerGold = this.playerGold;

        // Référence à la classe principale pour permettre au joueur d'interagir avec le moteur du jeu.
        // Bien que cette approche fonctionne, elle introduit un couplage fort entre Player et la classe principale.
        // Cela peut rendre le code moins flexible à long terme et plus difficile à maintenir ou à tester.
        // Il serait préférable d'envisager des alternatives comme l'utilisation d'événements ou de services pour réduire ce couplage.
        this.raycaster = raycaster;

        this.lastAttackTime = 0; // Nouveau attribut pour suivre le temps de la dernière attaque
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // fonction update des stats du joueurs (intégré au gamecycle)
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    statsUpdate() {
        // tick a chaque cycle
        // intégrer changement d'icone d'arme équipé dans l'UI d'exploration

        // Old Progress bar
        const playerHP = document.getElementById("PlayerHPoutput");
        const playerMP = document.getElementById("PlayerMPoutput");
        const playerXP = document.getElementById("PlayerXPoutput");

        playerHP.textContent = this.hp;
        playerMP.textContent = this.mp;
        // playerXP.textContent = player.xp;

        var hpBar = document.getElementById("hpBar");
        var mpBar = document.getElementById("mpBar");
        // var xpBar = document.getElementById("xpBar");

        const playerStr = document.getElementById("PlayerStrOutput");
        const playerDex = document.getElementById("PlayerDexOutput");
        const playerInt = document.getElementById("PlayerIntOutput");

        const playerMight = document.getElementById("PlayerMightOutput");
        const playerDodge = document.getElementById("PlayerDodgeOutput");
        const playerMagic = document.getElementById("PlayerMagicOutput");
        const playerArmor = document.getElementById("PlayerArmorOutput");
        const playerCriti = document.getElementById("PlayerCritiOutput");

        hpBar.value = this.hp;
        mpBar.value = this.mp;

        // money !
        var playerGold = document.getElementById("PlayerGoldOutput");
        playerGold.textContent = this.gold;

        //On affiche l'arme équipé
        var playerWeapon = document.getElementById("weaponIcon");
        
        if (this.hands[0]){
            // console.log(this.hands[0].icon);
            playerWeapon.src = this.hands[0].icon ;
        } else {
            playerWeapon.src = "assets/icons/a.png";
        }

        // changer quand les points hpMax augmenteront
        updateProgressBar("hpBar", this.hp, 10);
        updateProgressBar("mpBar", this.mp, 10);

        playerStr.textContent = this.strength;
        playerDex.textContent = this.dexterity;
        playerInt.textContent = this.intellect;

        if (this.XPstrength >= 10) {
            this.XPstrength = 0;
            this.strength += 1;
            console.log("Strength leveled up !")
        }

        if (this.XPdexterity >= 10) {
            this.XPdexterity = 0;
            this.dexterity += 1;
            console.log("Dexterity leveled up !")
        }

        if (this.XPintellect >= 10) {
            this.XPintellect = 0;
            this.intellect += 1;
            console.log("Intellect leveled up !")
        }

        updateProgressBar("strengthBar", this.XPstrength, 10);
        updateProgressBar("dexterityBar", this.XPdexterity, 10);
        updateProgressBar("intellectBar", this.XPintellect, 10);

        // Mana regen + maximum mana
        if (this.mp < this.mpMax) {
            this.mp += (this.intellect / 50);
        } else {
            this.mp = this.mpMax;
        }

        // Maximum hp
        if (this.hp > this.hpMax) {
            this.hp = this.hpMax;
        } else {}

        // FONCTION DEATH
        if (this.hp > 0) {} else {
            if (gameOver === false) {
                Raycaster.showGameOver();
                gameOver = true;
            } else {
                // rajouter player tun = false, vérifier l'ordre 
                // pour éviter conflit avec le reste de la fonction
                console.log("hey you're dead");
            }
        }

        // On base les HP sur la force & MP sur l'intellect
        this.hpMax = 10 + (this.strength - 5);
        this.mpMax = 10 + (this.intellect - 5);

        // on vérifie s'il y a une différence entre l'ancienne valeur et la nouvelle
        // evite les incrémentations infinies dues à la boucle

        if (this.strength !== this.oldStrength) {
            this.might += (this.strength - 5);
            this.oldStrength = this.strength;
        }

        if (this.intellect !== this.oldIntellect) {
            this.magic += (this.intellect - 5);
            this.oldIntellect = this.intellect;
        }

        // pareil pour dodge et critical
        // opti pour équipement

        var baseDodge = 0;
        var baseCriti = 0;

        baseDodge = this.dexterity * 2
        baseCriti = this.dexterity * 2

        if (this.hands[0]){
            this.dodge = baseDodge + this.hands[0].dodge;
            this.criti = baseCriti + this.hands[0].criti;
        } else {
            this.dodge = baseDodge;
            this.criti = baseCriti;
        }
        // L'armure n"a pas de modificateurs
        this.armor = this.armor;

        playerMight.textContent = this.might;
        playerDodge.textContent = this.dodge;
        playerMagic.textContent = this.magic;
        playerArmor.textContent = this.armor;
        playerCriti.textContent = this.criti;

        // affichage du sort sélectionné et de son icone
        const currentSpell = document.getElementById("selectedSpell");
        currentSpell.textContent = this.spells[this.selectedSpell].name;

        const currentSpellIcon = document.getElementById("castSpell");
        currentSpellIcon.src = this.spells[this.selectedSpell].icon;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // sélection et lancement de sort
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    nextSpell() {
        this.selectedSpell++;
        if (this.selectedSpell >= this.spells.length) {
            this.selectedSpell = 0;
        }
        const currentSpellIcon = document.getElementById("castSpell");
        currentSpellIcon.src = this.spells[this.selectedSpell].icon;

        const currentSpellName = document.getElementById("selectedSpell");
        currentSpellName.textContent = this.spells[this.selectedSpell].name;
    }

    previousSpell() {
        this.selectedSpell--;
        if (this.selectedSpell < 0) {
            this.selectedSpell = this.spells.length - 1;
        }
        const currentSpellIcon = document.getElementById("castSpell");
        currentSpellIcon.src = this.spells[this.selectedSpell].icon;

        const currentSpell = document.getElementById("selectedSpell");
        currentSpell.textContent = this.spells[this.selectedSpell].name;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // EQUIPEMENT INVENTAIRE
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    displayInventory() {
        // Mettre à jour l'affichage de l'or
        const goldOutput = document.getElementById("PlayerGoldOutput");
        if (goldOutput) {
            goldOutput.textContent = this.gold || 0;
        }
        
        const inventoryList = document.getElementById("inventory-list");
        const itemDetailsPlaceholder = document.getElementById("item-details-placeholder");
        
        if (!inventoryList) return;
        
        // Vider la liste des objets
        inventoryList.innerHTML = "";
        
        if (this.inventory && this.inventory.length > 0) {
            // Générer la liste des objets
            this.inventory.forEach((item, index) => {
                const equippedMark = item.equipped ? "✓" : "";
                
                // Déterminer l'icône en fonction du slot
                var itemIcon = this.inventory[index].icon;
                
                const isEquipped = item.equipped;
                const bgColor = isEquipped ? "rgba(0, 60, 0, 0.7)" : "#140c1c";
                
                const itemElement = document.createElement("div");
                itemElement.className = "item-entry";
                itemElement.setAttribute("data-index", index);
                itemElement.style.cssText = `
                    display: flex; 
                    align-items: center; 
                    padding: 4px; 
                    margin-top: 3px;
                    margin-bottom: 3px: 
                    cursor: pointer; 
                    background-color: ${bgColor}; 
                    border: 1px solid #663300;
                    
                `;
                
                itemElement.innerHTML = `
                    <img src="${itemIcon}" style="width: 20px; height: 20px; margin-right: 5px;">
                    <span style="flex-grow: 1; font-size: 13px; color: ${isEquipped ? '#aaffaa' : '#cccccc'}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.name}</span>
                    <span style="color: #66ff66; font-weight: bold;">${equippedMark}</span>
                `;
                
                itemElement.addEventListener('click', () => {
                    // Désélectionner tous les autres éléments
                    document.querySelectorAll('.item-entry').forEach(e => {
                        e.style.borderColor = '#663300';
                        e.style.backgroundColor = e.classList.contains('equipped') ? 'rgba(0, 60, 0, 0.7)' : '#140c1c';
                    });
                    
                    // Mettre en évidence l'élément sélectionné
                    itemElement.style.borderColor = '#ffaa00';
                    itemElement.style.backgroundColor = isEquipped ? 'rgba(20, 80, 20, 0.9)' : '#331a0c';
                    
                    // Afficher les détails
                    this.showItemDetails(index);
                    
                    // Cacher le placeholder
                    if (itemDetailsPlaceholder) {
                        itemDetailsPlaceholder.style.display = 'none';
                    }
                });
                
                // Marquer comme équipé pour le style
                if (isEquipped) {
                    itemElement.classList.add('equipped');
                }
                
                inventoryList.appendChild(itemElement);
            });
            
            // Sélectionner automatiquement le premier élément
            const firstItem = inventoryList.querySelector('.item-entry');
            if (firstItem) {
                firstItem.click();
            }
        } else {
            inventoryList.innerHTML = '<div style="padding: 10px; text-align: center; color: #8a7b6c; width: 100%;">No items</div>';
            
            // S'assurer que le placeholder est visible
            if (itemDetailsPlaceholder) {
                itemDetailsPlaceholder.style.display = 'flex';
            }
        }
    }
    
    // Méthode pour afficher les détails d'un objet
    showItemDetails(index) {
        const item = this.inventory[index];
        const itemDetails = document.getElementById('item-details');
        
        if (!item || !itemDetails) return;
        
        // Déterminer l'icône en fonction du slot
        let itemIcon = item.icon;
        
        // Type d'équipement
        let slotName = "";
        switch(item.slot) {
            case 1: slotName = "Weapon"; break;
            case 2: slotName = "Armor"; break;
            default: slotName = "Item"; break;
        }
        
        // Construire la chaîne HTML des statistiques
        let statsHTML = "";
        
        // Fonction helper pour ajouter une stat avec la bonne couleur
        const addStat = (value, name) => {
            if (value !== 0) {
                const sign = value > 0 ? "+" : "";
                const color = value > 0 ? "#66ff66" : "#ff6666";
                statsHTML += `<div style="margin: 2px 0;"><span style="color: ${color};margin-left: 5px;">${sign}${value}</span> ${name}</div>`;
            }
        };
        
        // Ajouter toutes les stats dans l'ordre
        addStat(item.strength, "Strength");
        addStat(item.dexterity, "Dexterity");
        addStat(item.intellect, "Intellect");
        addStat(item.might, "Might");
        addStat(item.magic, "Magic");
        addStat(item.dodge, "Dodge");
        addStat(item.criti, "Crit.");
        addStat(item.armor, "Armor");
        
        if (item.power !== 0) {
            statsHTML += `<div style="margin: 2px 0;">${item.power} Power</div>`;
        }
        
        // Si aucune statistique n'est définie
        if (statsHTML === "") {
            statsHTML = "<div style='color: #8a7b6c;'>No stats available</div>";
        }
        
        // Construire le HTML complet des détails
        itemDetails.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 10px; border-bottom: 1px solid #553311; padding-bottom: 5px; width: 100%;">
                <img src="${itemIcon}" style="width: 28px; height: 28px; margin : 5px;">
                <div style="width: calc(100% - 38px); overflow: hidden;">
                    <div style="margin-top: 5px; font-size: 15px; font-weight: bold; color: #e8d5a9; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.name}</div>
                    <div style="font-size: 12px; color: #a89986;">${slotName}</div>
                </div>
            </div>
            
            <div style="flex-grow: 1; font-size: 13px; overflow-y: auto; width: 100%; max-height: calc(100% - 80px);  margin-right: 5px;">
                ${statsHTML}
            </div>
            
            <div style="text-align: center; margin-top: 10px; width: 100%;">
                <button id="item-action-btn" style="
                    padding: 6px 12px; 
                    background-color: ${item.equipped ? '#793020' : '#205020'}; 
                    color: #e8d5a9; 
                    border: 1px solid #663300; 
                    cursor: pointer;
                    font-family: monospace;
                    text-transform: uppercase;
                    box-shadow: inset 1px 1px 0px rgba(255, 255, 255, 0.2), inset -1px -1px 0px rgba(0, 0, 0, 0.4);
                    width: 90%;
                    max-width: 180px;
                ">
                    ${item.equipped ? 'UNEQUIP' : 'EQUIP'}
                </button>
            </div>
        `;
        
        // Ajouter l'écouteur d'événement pour le bouton d'action
        document.getElementById('item-action-btn').addEventListener('click', () => {
            if (item.equipped) {
                item.unequip(this);
            } else {
                item.equip(this);
            }
            
            // Mettre à jour l'interface
            this.displayInventory();
            this.equipmentDisplay();
        });
    }
    
    // Garde la fonction existante pour la compatibilité
    equipmentDisplay() {
        const handsContent = document.getElementById("handsContent");
        const torsoContent = document.getElementById("torsoContent");
    
        // Vérifiez si hands est défini et non vide
        if (this.hands && this.hands.length > 0) {
            handsContent.innerHTML = `<button class="equipped-item" style="color:black;" data-item="${this.hands[0].name}">${this.hands[0].name}</button>`;
        } else {
            handsContent.innerHTML = "EMPTY";
        }
    
        // Vérifiez si torso est défini et non vide
        if (this.torso && this.torso.length > 0) {
            torsoContent.innerHTML = `<button class="equipped-item" style="color:black;" data-item="${this.torso[0].name}">${this.torso[0].name}</button>`;
        } else {
            torsoContent.innerHTML = "EMPTY";
        }
    
        // Ajouter des gestionnaires d'événements aux boutons
        document
            .querySelectorAll(".equipped-item")
            .forEach((itemButton) => {
                itemButton.addEventListener("click", (event) => {
                    const itemName = itemButton.getAttribute("data-item");
                    const clickedItem = this.inventory.find((item) => item.name === itemName);
    
                    if (clickedItem && clickedItem.equipped) {
                        clickedItem.unequip(this);
                        
                        // Mettre à jour l'affichage
                        this.displayInventory();
                        this.equipmentDisplay();
                    }
                });
            });
    }
    
    toggleEquipment() {
        // AFFICHER INVENTAIRE
        this.displayInventory();
        this.equipmentDisplay();
    
        var info = document.getElementById("info");
        var stats = document.getElementById("stats");
        var equipment = document.getElementById("equipment");
    
        var items = document.getElementById("items");
        var output = document.getElementById("output");
        var dialWindow = document.getElementById("dialogueWindow");
    
        var actionButton = document.getElementById('actionButtons');
    
        // joystick adds
        if (typeof joystick !== 'undefined' && joystick) {
            document.getElementById("joystick-container").style.display = "none";
            document.getElementById("joystickBackButtonContainer").style.display = "block";
    
            this.inventoryMenuShowed = true;
        }
    
        if (actionButton) {
            actionButton.style.display = "none";
        }
        
        document.getElementById("joystickBackButtonContainer").style.display = "block";
        this.inventoryMenuShowed = true;
    
        info.style.display = "none";
        equipment.style.display = "block";
        stats.style.display = "none";
    
        items.style.display = "block";
        output.style.display = "none";
        dialWindow.style.display = "none";
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Quêtes
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    displayQuests() {
        const questContent = document.getElementById("questContent");
        
        // Mettre à jour le compteur de quêtes
        const questCount = document.getElementById("quest-count");
        if (questCount) {
            const completedCount = this.quests.filter(quest => quest.completed).length;
            questCount.textContent = `${completedCount}/${this.quests.length}`;
        }
    
        if (this.quests && this.quests.length > 0) {
            // Structure à deux colonnes comme pour l'inventaire et la boutique
            let html = `<div style="display: flex; height: 170px; width: 100%;">
                <!-- Liste des quêtes (40% de la largeur) -->
                <div id="quest-list" style="width: 40%; height: 100%; border-right: 1px solid #663300; overflow-y: auto;">
                    <!-- Les quêtes seront listées ici -->
                </div>
                
                <!-- Détails de la quête sélectionnée (60% de la largeur) -->
                <div id="quest-details" style="margin-top: 5px; width: 60%; height: 100%; display: flex; flex-direction: column;">
                    <!-- Les détails seront affichés ici -->
                    <div id="quest-details-placeholder" style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; color: #8a7b6c;">
                        <div>Select a quest</div>
                        <div>to view details</div>
                    </div>
                </div>
            </div>`;
            
            questContent.innerHTML = html;
            
            const questList = document.getElementById("quest-list");
            
            // Générer la liste des quêtes
            this.quests.forEach((quest, index) => {
                const isCompleted = quest.completed;
                const bgColor = isCompleted ? "rgba(0, 60, 0, 0.7)" : "#140c1c";
                const statusIcon = isCompleted ? "✓" : "⋯";
                
                const questElement = document.createElement("div");
                questElement.className = `quest-item-entry ${isCompleted ? 'completed' : ''}`;
                questElement.setAttribute("data-index", index);
                questElement.style.cssText = `
                    display: flex; 
                    align-items: center; 
                    padding: 4px; 
                    margin-top: 3px;
                    margin-bottom: 3px: 
                    cursor: pointer; 
                    background-color: ${bgColor}; 
                    border: 1px solid #663300;
                    width: 99%;
                `;
                
                questElement.innerHTML = `
                    <span style="margin-left: 5px; margin-top:5px; flex-grow: 1; font-size: 13px; color: ${isCompleted ? '#aaffaa' : '#cccccc'}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${quest.title}</span>
                    <span style="margin-left: 5px; color: ${isCompleted ? '#66ff66' : '#aaaaaa'}; font-weight: bold;">${statusIcon}</span>
                `;
                
                questElement.addEventListener('click', () => {
                    // Désélectionner tous les autres éléments
                    document.querySelectorAll('.quest-item-entry').forEach(e => {
                        e.style.borderColor = '#663300';
                        e.style.backgroundColor = e.classList.contains('completed') ? 'rgba(0, 60, 0, 0.7)' : '#140c1c';
                    });
                    
                    // Mettre en évidence l'élément sélectionné
                    questElement.style.borderColor = '#ffaa00';
                    questElement.style.backgroundColor = isCompleted ? 'rgba(20, 80, 20, 0.9)' : '#331a0c';
                    
                    // Afficher les détails
                    showQuestDetails(quest);
                    
                    // Cacher le placeholder
                    const placeholder = document.getElementById('quest-details-placeholder');
                    if (placeholder) {
                        placeholder.style.display = 'none';
                    }
                });
                
                questList.appendChild(questElement);
            });
            
            // Fonction pour afficher les détails d'une quête
            const showQuestDetails = (quest) => {
                const questDetails = document.getElementById('quest-details');
                if (!questDetails) return;
                
                // État de la quête
                const questStatus = quest.completed ? "Completed" : "In progress";
                const statusColor = quest.completed ? "#66ff66" : "#ffcc66";
                
                // Construire le HTML des détails
                questDetails.innerHTML = `
                    <div style="border-bottom: 1px solid #553311; padding-bottom: 5px; width: 110%;">
                        <div style="margin-left: 5px;font-size: 16px; font-weight: bold; color: #e8d5a9; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${quest.title}</div>
                        <div style="margin-left: 5px;font-size: 12px; color: ${statusColor};">${questStatus}</div>
                    </div>
                    
                    <div style="margin-left: 5px; flex-grow: 1; font-size: 13px; overflow-y: auto; width: 101%; max-height: calc(100% - 60px);">
                        <p style="margin-bottom: 10px;">${quest.description}</p>
                        
                        ${quest.reward ? 
                            `<div style="margin-top: 15px;">
                                <div style="margin-left: 5px; font-weight: bold; color: #e8d5a9;">Reward:</div>
                                <div style="margin-left: 5px;color: #ffcc00;">${quest.reward}</div>
                            </div>` 
                            : ''}
                    </div>
                `;
            };
            
            // Sélectionner automatiquement la première quête
            const firstQuest = questList.querySelector('.quest-item-entry');
            if (firstQuest) {
                firstQuest.click();
            }
        } else {
            questContent.innerHTML = '<div style="padding: 10px; text-align: center; color: #8a7b6c;">No quests in progress</div>';
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Contrôle UI
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    joystickBackButton() {
        document.getElementById("stats").style.display = "none";
        document.getElementById("info").style.display = "block";
        document.getElementById("equipment").style.display = "none";

        document.getElementById("items").style.display = "none";
        document.getElementById("quests").style.display = "none";
        document.getElementById("output").style.display = "block";
        document.getElementById("dialogueWindow").style.display = "none";

        document.getElementById("joystick-container").style.display = "block";
        document.getElementById("QuestButton").style.display = "block";
        document.getElementById("InventoryButton").style.display = "none";
        document.getElementById("joystickBackButtonContainer").style.display = "none";

        // Dungeon Crawler controls
        document.getElementById("actionButtons").style.display = "block";
    }

    //////////////////////////////////////////////////////////////////////////////
    /// CONTROLES - liaisons des boutons à un événement
    //////////////////////////////////////////////////////////////////////////////

    // Case selon type de bouton appuyée, les ID sont liées à un nombre dans "bindKeysAndButtons"
    handleButtonClick(buttonNumber) {
        switch (buttonNumber) {
            case 1: // ACTION (Bouton A)
                Sprite.resetToggle();
                if (this.turn == true) {
                    console.log('Action/Dialogue');
                    this.buttonAClicked = true;
                    this.actionButtonClicked = true;
                }
                break;
            
            case 2: // Non utilisé
                break;
                
            case 3: // EQUIPEMENT (Bouton B)
                console.log("Bouton Equipement");
                if (this.inventoryMenuShowed == false) {
                    Sprite.resetToggle();
                    this.inventoryMenuShowed = true;
                    this.toggleEquipment();
                    console.log("false");
                } else {
                    this.inventoryMenuShowed = false;
                    Sprite.resetToggle();
                    console.log("true");
                }
                break;
              
            case 4: // TOURNER A GAUCHE (flèche gauche)
                console.log("turnLeft");
                if (!this.isMoving && !this.isRotating && this.turn) {
                    this.button7Clicked = true;
                    this.turnLeftButtonClicked = true;
                }
                break;  

            case 5: // AVANCER (flèche haut)
                console.log("forward");
                if (!this.isMoving && !this.isRotating && this.turn) {
                    this.button5Clicked = true;
                }
                break;
            
            case 6: // TOURNER A DROITE (flèche droite)
                console.log("turnRight");
                if (!this.isMoving && !this.isRotating && this.turn) {
                    this.button9Clicked = true;
                    this.turnRightButtonClicked = true;
                }
                break;

            case 7: // ESQUIVE A GAUCHE (flèche gauche)
                console.log("LeftLeft");
                if (!this.isMoving && !this.isRotating && this.turn) {
                    this.button7Clicked = true;
                    this.LeftLeftButtonClicked = true;
                }
                break;
                
            case 8: // RECULER (flèche bas)
                console.log("backward");
                if (!this.isMoving && !this.isRotating && this.turn) {
                    this.button8Clicked = true;
                }
                break;
                
            case 9: // TOURNER A DROITE (flèche droite)
                console.log("RightRight");
                if (!this.isMoving && !this.isRotating && this.turn) {
                    this.button9Clicked = true;
                    this.RightRightButtonClicked = true;
                }
                break;
                
            case 10:
                // console.log('strifeRight');
                this.joystickBackButton();
                // correction nécéssitée double clic après reset toggle
                this.inventoryMenuShowed = false;
                console.log("joystickBackButton");
                break;
                
            case 11:
                console.log("quest button");
                document.getElementById("QuestButton").style.display = "none";
                document.getElementById("InventoryButton").style.display = "block";
    
                this.displayQuests();
    
                document.getElementById("items").style.display = "none";
                document.getElementById("quests").style.display = "block";
                break;
                
            case 12:
                console.log("inventory button");
                document.getElementById("QuestButton").style.display = "block";
                document.getElementById("InventoryButton").style.display = "none";
    
                document.getElementById("items").style.display = "block";
                document.getElementById("quests").style.display = "none";
                break;
                
            case 13:
                this.previousSpell();
                break;
                
            case 14:
                if (this.spells[this.selectedSpell].selfCast == true) {
                    console.log("self cast !")
                    this.spells[this.selectedSpell].cast(this, this);
                } else {
                    console.log("not a selfCast")
                    console.log("magic combat = true")
                    if (this.turn == true) {
                        console.log('Attack spell casted')
    
                        this.actionButtonClicked = true;
                        this.combatSpell = true;
                    }
                }
                break;
                
            case 15:
                this.nextSpell();
                break;
                
            case 16:
                if (gameOver == false) {
                    this.raycaster.saveGameState();
                    Sprite.terminalLog("Player state saved!");
                    Raycaster.showRenderWindow()
                } else {
                    alert("You can't save if you're dead.");
                }
                break;
                
            case 17:
                pause(500);
                this.raycaster.loadGameState(this);
                Raycaster.showRenderWindow()
                Sprite.resetTerminal();
                Sprite.terminalLog("Save loaded !");
                break;
                
            case 18:
                Raycaster.showRenderWindow();
                if (gameOver == false) {
                    if (confirm("Voulez-vous vraiment charger la prochaine carte ?")) {
                        this.raycaster.nextMap(this);
                        console.log("nextMapButton");
                        Sprite.resetTerminal();
                        Sprite.terminalLog("Next map loaded !");
                    } else {
                        console.log("Changement de carte annulé.");
                    }
                } else {
                    alert("You're dead...");
                }
                
                break;
                
            case 19:
                pause(500);
                this.raycaster.newGame();
                Sprite.resetTerminal();
                Sprite.terminalLog("New game !");
                break;
                
            case 20:
                pause(500);
                Raycaster.resetShowGameOver()
                Raycaster.showMainMenu();
                break;
                
            case 21:
                pause(500);
                if (gameOver == false) {
                    Raycaster.showRenderWindow();
                } else {
                    alert('dead, so nope');
                }
                break;
                
            default:
                console.log("Bouton non reconnu: " + buttonNumber);
        }
    }

    // Méthode améliorée pour éviter les redites et tout centraliser
    bindButton(buttonId, buttonNumber) {
        document.getElementById(buttonId).addEventListener("click", () => {
            this.handleButtonClick(buttonNumber);
        });
    }

    // méthode d'interface, permet de centraliser les commandes et eventlistener
    bindKeysAndButtons() {
        this.keysDown = [];
        let this2 = this;

        // Liaison des touches
        document.onkeydown = function(e) {
            e = e || window.event;
            this2.keysDown[e.keyCode] = true;
        };
        document.onkeyup = function(e) {
            e = e || window.event;
            this2.keysDown[e.keyCode] = false;
        };

        /////////////////////////////////////////////////////////
        //  CONTROLES - JOYSTICK
        /////////////////////////////////////////////////////////

        document.addEventListener("joystickchange", function(event) {
            const {
                up,
                down,
                left,
                right
            } = event.detail;
            joystickForwardClicked = up;
            joystickBackwardClicked = down;
            joystickLeftClicked = left;
            joystickRightClicked = right;
        });

        /////////////////////////////////////////////////////////
        // Liaison des boutons avec événement
        /////////////////////////////////////////////////////////

        let canClickSave = true;
        let canClickLoad = true;
        let canClickNextMap = true;
        const debounceDelay = 500; // Délai pour éviter les clics multiples (500ms ici)

        // Boutons avec debounce (anti double clic)
        this.bindButton("saveButton", 16, () => {
            if (canClickSave) {
                canClickSave = false;
                setTimeout(() => canClickSave = true, debounceDelay);
            }
        });

        this.bindButton("loadButton", 17, () => {
            if (canClickLoad) {
                canClickLoad = false;
                setTimeout(() => canClickLoad = true, debounceDelay);
            }
        });

        this.bindButton("nextMapButton", 18, () => {
            if (canClickNextMap) {
                canClickNextMap = false;
                setTimeout(() => canClickNextMap = true, debounceDelay);
            }
        });

        // Autres boutons sans debounce
        this.bindButton("button1", 1);
        this.bindButton("button2", 2);
        this.bindButton("button3", 3);
        this.bindButton("button4", 4);
        this.bindButton("button5", 5);
        this.bindButton("button6", 6);
        this.bindButton("button7", 7);
        this.bindButton("button8", 8);
        this.bindButton("button9", 9);
        this.bindButton("joystickBackButton", 10);
        this.bindButton("QuestButton", 11);
        this.bindButton("InventoryButton", 12);
        this.bindButton("previousSpell", 13);
        // this.bindButton("castSpell", 14);
        this.bindButton("nextSpell", 15);
        this.bindButton("newGameButton", 19);
        this.bindButton("mainMenuButton", 20);
        this.bindButton("backMenuButton", 21);

        // Dungeon Crawler UI
        this.bindButton("buttonA", 1);
        this.bindButton("buttonB", 14);
        this.bindButton("characterButton", 3);
/*
        this.bindButton("buttonUp", 5);
        this.bindButton("buttonLeft", 7);
        this.bindButton("buttonDown", 8);
        this.bindButton("buttonRight", 9);
*/
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // méthode calcul quadrant et stockage de la valeur dans Player
    // refactorisation de la méthode Move(), subdivisée en sous-méthodes
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    playerQuadrant(player) {
        if (!player) {
            console.error("Player is undefined in playerQuadrant()");
            return;
        }
        
        // Convertir la rotation en degrés et normaliser entre 0 et 360
        const rotDeg = (player.rot * 180 / Math.PI + 360) % 360;
        
        // Ne mapper qu'aux 4 directions cardinales
        if (rotDeg >= 315 || rotDeg < 45) {
            player.quadrant = "est";  // 0 degrés est Est dans ce système
        } else if (rotDeg >= 45 && rotDeg < 135) {
            player.quadrant = "nord";
        } else if (rotDeg >= 135 && rotDeg < 225) {
            player.quadrant = "ouest";
        } else if (rotDeg >= 225 && rotDeg < 315) {
            player.quadrant = "sud";
        }
        
        // Vérification de sécurité
        if (!player.quadrant) {
            console.error(`Failed to determine quadrant for rotation ${rotDeg}° (${player.rot} rad)`);
            player.quadrant = "nord"; // Valeur par défaut
        }
    }

    handleSlidingCollision(player, map) {

        if (!player) {
            console.error("Player is undefined.");
            return;
        }

        const {
            x,
            y,
            quadrant
        } = player;
        const tileSize = this.tileSize;
        const actualMap = map;

        const slidingMovements = {
            "sud-ouest": [{
                y: 30,
                x: 0
            }, {
                y: 0,
                x: 30
            }],
            "sud-est": [{
                y: 30,
                x: 0
            }, {
                y: 0,
                x: -30
            }],
            "nord-ouest": [{
                y: -30,
                x: 0
            }, {
                y: 0,
                x: 30
            }],
            "nord-est": [{
                y: -30,
                x: 0
            }, {
                y: 0,
                x: -30
            }]
        };

        const movements = slidingMovements[quadrant] || [];

        for (const movement of movements) {
            const newX = x + movement.x;
            const newY = y + movement.y;
            const tileX = Math.floor(newX / tileSize);
            const tileY = Math.floor(newY / tileSize);

            if (actualMap[tileY][tileX] === 0) {
                player.x = newX;
                player.y = newY;
                break;
            }
        }
    }

    calculateFrontPosition() {
        // S'assurer que la propriété quadrant est définie
        if (!this.quadrant) {
            // Calcul d'urgence du quadrant
            this.playerQuadrant(this);
            
            // Si toujours indéfini après tentative de calcul, utiliser une valeur par défaut
            if (!this.quadrant) {
                // La rotation en radians nous permettra de déterminer un quadrant par défaut
                const rotDeg = (this.rot * 180 / Math.PI + 360) % 360;
                
                // Déterminer un quadrant basé sur la rotation (seulement les 4 directions cardinales)
                if (rotDeg >= 45 && rotDeg < 135) {
                    this.quadrant = "nord";
                } else if (rotDeg >= 135 && rotDeg < 225) {
                    this.quadrant = "ouest";
                } else if (rotDeg >= 225 && rotDeg < 315) {
                    this.quadrant = "sud";
                } else {
                    this.quadrant = "est";
                }
                
                console.log(`Quadrant fallback used: ${this.quadrant} based on rotation ${rotDeg.toFixed(2)}°`);
            }
        }
    
        // Simplifions avec seulement les 4 directions cardinales
        const frontOffsets = {
            "nord": { x: 0, y: -1 },
            "est": { x: 1, y: 0 },  // Correction ici: Est devrait être +1 en X
            "sud": { x: 0, y: 1 },
            "ouest": { x: -1, y: 0 }  // Correction ici: Ouest devrait être -1 en X
        };
    
        // Récupérer l'offset basé sur le quadrant, avec une valeur par défaut
        const offset = frontOffsets[this.quadrant] || { x: 0, y: 0 };
        
        // Calculer la position frontale
        const frontX = Math.floor((this.x / this.tileSize) + offset.x);
        const frontY = Math.floor((this.y / this.tileSize) + offset.y);
    
        return { frontX, frontY };
    }

    // Modifions la méthode handleSpriteAction pour gérer le délai
    async handleSpriteAction(action, sprites) {
        if (!action || !this || !this.turn) return;
    
        // Vérifier qu'aucune action n'est en cours
        // n'est-ce pas un doublon de la vérification précédente ?
        if (this.isMoving || this.isRotating || this.isTeleporting || this.isDooring) {
            console.log("Cannot perform action - player is busy");
            return;
        }
    
        // Vérifier si suffisamment de temps s'est écoulé depuis la dernière attaque
        const currentTime = Date.now();
        if (currentTime - this.lastAttackTime < 2000) {
            Sprite.terminalLog("Vous n'êtes pas prêt à attaquer de nouveau.");
            return;
        }

        const {
            frontX,
            frontY
        } = this.calculateFrontPosition();

        console.log(`Action detected! Looking at position (${frontX}, ${frontY})`);
        console.log(`Player position: (${Math.floor(this.x / this.tileSize)}, ${Math.floor(this.y / this.tileSize)}), quadrant: ${this.quadrant}`);

        let spriteFound = false;
        for (const sprite of sprites) {
            const spriteX = Math.floor(sprite.x / this.tileSize);
            const spriteY = Math.floor(sprite.y / this.tileSize);
            
            //console.log(`Checking sprite at (${spriteX}, ${spriteY}), type: ${sprite.spriteType}`);
            
            if (spriteX === frontX && spriteY === frontY) {
                spriteFound = true;
                console.log(`Sprite found at front position! Type: ${sprite.spriteType}`);
                
                // on passe "turn" en false 
                // this.turn = false;

                switch (sprite.spriteType) {
                    case "A":
                        console.log("Enemy detected, initiating combat!");
                        // Enregistrer le temps de cette attaque
                        this.lastAttackTime = currentTime;
                        
                        if (this.combatSpell) {
                            console.log("Using combat spell");
                            sprite.combatSpell(this, sprite);
                        } else {
                            console.log("Using normal attack");
                            sprite.combat(this.might, this.criti, this);
                        }
                        break;
                    case "EXIT":
                        Sprite.terminalLog('Level finished!')
                        this.raycaster.nextMap();
                        break;
                    case "DOOR":
                        // IMPORTANT: Traiter les portes de manière spéciale
                        // Appeler door() mais NE PAS appeler handleTeleportation ensuite
                        
                    
                        sprite.door(this, null);
                        this.raycaster.loadFloorCeilingImages();
                        Sprite.terminalLog('You enter/exit the area.');
                        // Réinitialiser l'état de l'action pour éviter de lancer handleTeleportation après
                        this.actionButtonClicked = false;
                        return; // Sortir immédiatement pour éviter l'appel à handleTeleportation
                    case 0:
                        console.log("Dialogue sprite detected");

                        sprite.talk();

                        // Attendre 0.5 seconde puis débloquer les commandes
                        setTimeout(() => {
                            this.turn = false;
                        }, 500);

                        break;
                    case 1:
                        // décoration, ne rien faire
                        console.log("Decoration sprite, no action");
                        this.turn = false;
                        break;
                    case 2:
                        console.log("Dialogue sprite type 2 detected");

                        sprite.talk();

                        // Attendre 0.5 seconde puis débloquer les commandes
                        setTimeout(() => {
                            this.turn = false;
                        }, 500);

                        break;
                    case 3:
                        sprite.displayItemsForSale(this);
                        this.turn = false;
                        break;
                    case 4:
                        // gestion des Quest Giver
                        console.log("Quest Giver sprite, not implemented yet");
                        this.turn = false;
                        break;
                    case 5:
                        // valeur fixe de test
                        // ultérieurement : quests[currentMap].complete();
                        console.log("Quest completion sprite");
                        if (this.quests[0].completed === false) {
                            this.quests[0].complete();

                            // changement de texture temporaire
                            console.log("test changement de texture");
                            sprite.spriteTexture = 21;

                            Sprite.resetToggle();
                        } else {
                            Sprite.terminalLog("I've already looted that.")
                        }

                        this.turn = false;
                        
                        break;
                    case 6:
                        // valeur fixe de test
                        // ultérieurement : quests[currentMap].complete();
                        console.log("chest !");
                        if (sprite.step != 1) {
                            sprite.lootClass = 5;

                            sprite.generateLoot(this);

                            // changement de texture temporaire
                            sprite.spriteTexture = 21;

                            sprite.step = 1;

                            Sprite.resetToggle();
                        } else {
                            Sprite.terminalLog("I've already looted that.")
                        }

                        this.turn = false;

                        break;
                    default:
                        console.log(`Sprite type ${sprite.spriteType} has no specific action`);
                        Sprite.resetToggle();
                        break;
                }
            }
        }
        
        if (!spriteFound) {
            console.log("No sprite found at front position");
        }
        
        // Réinitialisation de la touche d'action après utilisation
        this.actionButtonClicked = false;
    }

    async handleTeleportation(player, mapEventA, mapEventB, newX, newY, tileSize) {
        // Vérifier qu'aucune autre action n'est en cours
        if (player.isMoving || player.isRotating || player.isTeleporting || player.isDooring) {
            console.log("Cannot teleport - player is busy");
            return;
        }
        
        // Marquer qu'une téléportation est en cours
        player.isTeleporting = true;
        
        try {
            const tolerance = Math.PI / 6; // 30° en radians
    
            for (var i = 0; i < mapEventA.length; i++) {
                // Calculer l'orientation opposée (ajout de π radians)
                const oppositeOrientationA = (mapEventA[i][2] + Math.PI) % (2 * Math.PI);
                const oppositeOrientationB = (mapEventB[i][2] + Math.PI) % (2 * Math.PI);
    
                // Vérification pour la téléportation depuis A vers B
                if (
                    Math.floor(newX / tileSize) === mapEventA[i][0] &&
                    Math.floor(newY / tileSize) === mapEventA[i][1] &&
                    (player.rot >= oppositeOrientationA - tolerance && player.rot <= oppositeOrientationA + tolerance)
                ) {
                    // Téléportation aux coordonnées données dans l'Event
                    newX = mapEventB[i][0] * tileSize + 640;
                    newY = mapEventB[i][1] * tileSize + 640;
                    player.rot = mapEventB[i][2];
    
                    // Variable de modification d'environnement
                    ceilingRender = mapEventB[i][3];
                    ceilingTexture = mapEventB[i][4];
                    ceilingHeight = mapEventB[i][5];
                    // Variable de modification des textures (vers le type '1' = terre)
                    floorTexture = mapEventB[i][6];
    
                    // On recharge toutes les textures, sinon le canvas ne sera pas modifié
                    this.raycaster.loadFloorCeilingImages();
    
                    console.log(mapEventB[i][7]);
    
                    // Évite les doubles téléportations
                    await new Promise(resolve => setTimeout(resolve, 250));
                    
                    // Set new position
                    player.x = newX;
                    player.y = newY;
    
                    break; // Sortir de la boucle une fois la téléportation effectuée
                }
    
                // Vérification pour la téléportation depuis B vers A
                if (
                    Math.floor(newX / tileSize) === mapEventB[i][0] &&
                    Math.floor(newY / tileSize) === mapEventB[i][1] &&
                    (player.rot >= oppositeOrientationB - tolerance && player.rot <= oppositeOrientationB + tolerance)
                ) {
                    // Téléportation aux coordonnées données dans l'Event
                    newX = mapEventA[i][0] * tileSize + 640;
                    newY = mapEventA[i][1] * tileSize + 640;
                    player.rot = mapEventA[i][2];
    
                    // Variable de modification d'environnement
                    ceilingRender = mapEventA[i][3];
                    ceilingTexture = mapEventA[i][4];
                    ceilingHeight = mapEventA[i][5];
                    // Variable de modification des textures (vers le type '1' = terre)
                    floorTexture = mapEventA[i][6];
    
                    // On recharge toutes les textures, sinon le canvas ne sera pas modifié
                    this.raycaster.loadFloorCeilingImages();
    
                    console.log(mapEventA[i][7]);
    
                    // Évite les doubles téléportations
                    await new Promise(resolve => setTimeout(resolve, 250));
                    
                    // Set new position
                    player.x = newX;
                    player.y = newY;
    
                    break; // Sortir de la boucle une fois la téléportation effectuée
                }
            }
        } finally {
            // Toujours libérer le verrou, même en cas d'erreur
            player.isTeleporting = false;
        }
    }
    
    ///////////////////////////////////////////////////////////////////////////////////////////////
    // Logique de blocage
    ///////////////////////////////////////////////////////////////////////////////////////////////

    isBlocking(x, y, map) {
        // console.log('x:', x, 'y:', y, 'map:', map);

        // first make sure that we cannot move outside the boundaries of the level
        if (y < 0 || y >= map.mapHeight || x < 0 || x >= map.mapWidth)
            return true;

        // return true if the map block is not 0, ie. if there is a blocking wall.
        if (map[Math.floor(y)][Math.floor(x)] != 0) {
            return true
        }
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    /// Gestion interaction joueur avec monde (Move/Action)
    ///////////////////////////////////////////////////////////////////////////////////////////////
    async move(timeElapsed, map, eventA, eventB, sprites) {
        // PARAMÈTRES AJUSTABLES DE MOUVEMENT
        // ----------------------------------
        // Durées d'animation (en millisecondes)
        const ROTATION_DURATION = 500;      // Durée de rotation de 90 degrés
        const DODGE_DURATION = 400;         // Durée d'une esquive latérale
        const FORWARD_DURATION = 600;       // Durée de base pour avancer
        const BACKWARD_DURATION = 500;      // Durée de base pour reculer
        const CONTINUOUS_MOVE_SPEEDUP = 150; // Réduction de temps pour mouvements continus
        const WALL_IMPACT_DURATION = 250;   // Durée de l'animation d'impact sur un mur
        const ENEMY_IMPACT_DURATION = 500;  // Durée de l'animation d'impact sur un ennemi
        
        // Distances et facteurs
        const PUSH_WALL_FACTOR = 0.2;      // % de la taille d'une case pour l'animation d'impact mur
        const PUSH_ENEMY_FACTOR = 0.15;    // % de la taille d'une case pour l'animation d'impact ennemi
        const MOVEMENT_THRESHOLD = 0.1;    // Précision de détection des angles cardinaux
        const ATTACK_COOLDOWN = 2000;      // Temps minimum entre deux attaques (ms)
        const CONTINUOUS_MOVE_DELAY = 50;  // Délai entre mouvements continus (ms)
        
        // Facteurs d'easing pour les animations
        const easeInOut = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const easeInOutQuart = (t) => t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
        const easeOutBack = (t) => {
            const c1 = 1.70158;
            const c3 = c1 + 1;
            return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
        };
        
        // Définir les angles cardinaux précis (en radians)
        const NORTH = Math.PI / 2;
        const EAST = 0;
        const SOUTH = 3 * Math.PI / 2;
        const WEST = Math.PI;
        
        // Récupération des entrées utilisateur - combinaison du clavier et des contrôles UI
        let up = this.keysDown[KEY_UP] || this.keysDown[KEY_W] || this.joystickForwardClicked || this.button5Clicked;
        let down = this.keysDown[KEY_DOWN] || this.keysDown[KEY_S] || this.joystickBackwardClicked || this.button8Clicked;
        let left = this.keysDown[KEY_LEFT] || this.keysDown[KEY_A] || this.joystickLeftClicked || this.turnLeftButtonClicked;
        let right = this.keysDown[KEY_RIGHT] || this.keysDown[KEY_D] || this.joystickRightClicked || this.turnRightButtonClicked;
        let dodgeLeft = this.button7Clicked;
        let dodgeRight = this.button9Clicked;
        const action = this.actionButtonClicked || this.keysDown[KEY_F] || this.keysDown[KEY_SPACE] || this.buttonAClicked;
        
        // Sauvegarde l'état des touches pour vérification ultérieure
        this.continuousUpPressed = this.keysDown[KEY_UP] || this.keysDown[KEY_W];
        this.continuousDownPressed = this.keysDown[KEY_DOWN] || this.keysDown[KEY_S];
        this.continuousJoystickUp = this.joystickForwardClicked;
        this.continuousJoystickDown = this.joystickBackwardClicked;
        
        // Réinitialiser les états des boutons après leur détection
        this.button4Clicked = false;
        this.button5Clicked = false;
        this.button6Clicked = false;
        this.button7Clicked = false;
        this.button8Clicked = false;
        this.button9Clicked = false;
        this.buttonAClicked = false;
        this.turnLeftButtonClicked = false;
        this.turnRightButtonClicked = false;
        this.actionButtonClicked = false;
        
        // Si les commandes sont bloquées, ignorer les déplacements
        if (commandBlocking) {
            return;
        }

        // pour éviter les doubles actions (en test)
        if (!this.turn) {
            return;
        }
        
        // Éviter les mouvements multiples pendant une téléportation ou utilisation porte
        if (this.isTeleporting || this.isDooring) return;

        // Éviter les mouvements multiples pendant une animation ou une action
        if (this.isMoving || this.isRotating) return;
        
        // Traitement des rotations (par incréments de 90 degrés)
        if (left || right) {
            // Marquer le début de la rotation
            this.isRotating = true;
            
            // Déterminer la rotation cible
            let targetRot;
            if (left) {
                // Rotation de 90 degrés dans le sens horaire
                if (Math.abs(this.rot - NORTH) < MOVEMENT_THRESHOLD) targetRot = WEST;
                else if (Math.abs(this.rot - EAST) < MOVEMENT_THRESHOLD) targetRot = NORTH;
                else if (Math.abs(this.rot - SOUTH) < MOVEMENT_THRESHOLD) targetRot = EAST;
                else if (Math.abs(this.rot - WEST) < MOVEMENT_THRESHOLD) targetRot = SOUTH;
            } else if (right) {
                // Rotation de 90 degrés dans le sens anti-horaire
                if (Math.abs(this.rot - NORTH) < MOVEMENT_THRESHOLD) targetRot = EAST;
                else if (Math.abs(this.rot - EAST) < MOVEMENT_THRESHOLD) targetRot = SOUTH;
                else if (Math.abs(this.rot - SOUTH) < MOVEMENT_THRESHOLD) targetRot = WEST;
                else if (Math.abs(this.rot - WEST) < MOVEMENT_THRESHOLD) targetRot = NORTH;
            }
            
            // Animation de rotation avec durée minimale garantie
            const startRot = this.rot;
            const minRotationDuration = ROTATION_DURATION;
            
            // Calculer la différence d'angle en prenant le chemin le plus court
            let angleDiff = targetRot - startRot;
            if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
            if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
            
            const startTime = performance.now();
            let rotationComplete = false;
            
            while (!rotationComplete) {
                const currentTime = performance.now();
                const elapsedTime = currentTime - startTime;
                
                // Calculer la progression de la rotation (entre 0 et 1)
                let t = Math.min(elapsedTime / minRotationDuration, 1);
                
                // Si la rotation est terminée
                if (t >= 1) {
                    rotationComplete = true;
                    t = 1;
                }
                
                // Appliquer l'easing
                const easedT = easeInOutQuart(t);
                
                // Mettre à jour la rotation
                this.rot = startRot + angleDiff * easedT;
                
                // Rendre la frame
                await new Promise(resolve => requestAnimationFrame(resolve));
            }
            
            // Normaliser à la fin pour éviter les erreurs d'arrondi
            this.rot = targetRot;
            
            // Mise à jour du quadrant après rotation
            this.playerQuadrant(this);
            
            // Réinitialiser l'état de rotation
            this.isRotating = false;
            return;
        }
        
        // Calcul de la case de destination selon le mouvement
        let destX = Math.floor(this.x / this.tileSize);
        let destY = Math.floor(this.y / this.tileSize);
        
        // Variable pour suivre si un mouvement est demandé
        let movementRequested = false;
        let isMovingBackward = false;
        let isDodging = false;
        
        if (up) {
            // Avancer d'une case dans la direction actuelle
            if (Math.abs(this.rot - NORTH) < MOVEMENT_THRESHOLD) {
                destY -= 1; // Nord
            } else if (Math.abs(this.rot - EAST) < MOVEMENT_THRESHOLD) {
                destX += 1; // Est
            } else if (Math.abs(this.rot - SOUTH) < MOVEMENT_THRESHOLD) {
                destY += 1; // Sud
            } else if (Math.abs(this.rot - WEST) < MOVEMENT_THRESHOLD) {
                destX -= 1; // Ouest
            }
            movementRequested = true;
        } else if (down) {
            // Reculer d'une case (direction opposée)
            if (Math.abs(this.rot - NORTH) < MOVEMENT_THRESHOLD) {
                destY += 1; // Sud (opposé du Nord)
            } else if (Math.abs(this.rot - EAST) < MOVEMENT_THRESHOLD) {
                destX -= 1; // Ouest (opposé de l'Est)
            } else if (Math.abs(this.rot - SOUTH) < MOVEMENT_THRESHOLD) {
                destY -= 1; // Nord (opposé du Sud)
            } else if (Math.abs(this.rot - WEST) < MOVEMENT_THRESHOLD) {
                destX += 1; // Est (opposé de l'Ouest)
            }
            movementRequested = true;
            isMovingBackward = true;
        } else if (dodgeLeft || dodgeRight) {
            // Esquive latérale (déplacement perpendiculaire à la direction)
            if (Math.abs(this.rot - NORTH) < MOVEMENT_THRESHOLD) {
                // Face au nord, esquive à gauche = ouest, esquive à droite = est
                destX += dodgeLeft ? -1 : 1;
            } else if (Math.abs(this.rot - EAST) < MOVEMENT_THRESHOLD) {
                // Face à l'est, esquive à gauche = nord, esquive à droite = sud
                destY += dodgeLeft ? -1 : 1;
            } else if (Math.abs(this.rot - SOUTH) < MOVEMENT_THRESHOLD) {
                // Face au sud, esquive à gauche = est, esquive à droite = ouest
                destX += dodgeLeft ? 1 : -1;
            } else if (Math.abs(this.rot - WEST) < MOVEMENT_THRESHOLD) {
                // Face à l'ouest, esquive à gauche = sud, esquive à droite = nord
                destY += dodgeLeft ? 1 : -1;
            }
            movementRequested = true;
            isDodging = true;
        } else if (action && this.turn) {
            // Gestion des actions
            await this.handleSpriteAction(action, sprites);
            
            if (action) {
                await this.handleTeleportation(this, eventA, eventB, this.x, this.y, this.tileSize);
            }
            return;
        }
        
        // Si aucun mouvement n'est demandé, sortir
        if (!movementRequested) return;
        
        // Vérification de collision avec mur ou limite de carte
        let collidesWithWall = destX < 0 || destY < 0 || destX >= map[0].length || destY >= map.length || map[destY][destX] !== 0;
        
        // Vérification des sprites bloquants
        let collidesWithSprite = false;
        let collidedSprite = null;
        
        for (let sprite of sprites) {
            let spriteX = Math.floor(sprite.x / this.tileSize);
            let spriteY = Math.floor(sprite.y / this.tileSize);
            
            if (spriteX === destX && spriteY === destY && sprite.isBlocking) {
                collidesWithSprite = true;
                collidedSprite = sprite;
                break;
            }
        }
        
        // Gestion spécifique pour les ennemis (type "A")
        if (collidesWithSprite && collidedSprite.spriteType === "A") {
            // Marquer le début du mouvement
            this.isMoving = true;
            
            // Animation d'impact contre l'ennemi
            const startX = this.x;
            const startY = this.y;
            
            // Distance de "poussée" vers l'ennemi
            const pushDistance = this.tileSize * PUSH_ENEMY_FACTOR;
            
            // Calculer la direction de la poussée
            let pushX = 0;
            let pushY = 0;
            
            if (isDodging) {
                // Direction pour l'esquive (même logique que le mouvement)
                if (Math.abs(this.rot - NORTH) < MOVEMENT_THRESHOLD) {
                    pushX = dodgeLeft ? -pushDistance : pushDistance;
                } else if (Math.abs(this.rot - EAST) < MOVEMENT_THRESHOLD) {
                    pushY = dodgeLeft ? -pushDistance : pushDistance;
                } else if (Math.abs(this.rot - SOUTH) < MOVEMENT_THRESHOLD) {
                    pushX = dodgeLeft ? pushDistance : -pushDistance;
                } else if (Math.abs(this.rot - WEST) < MOVEMENT_THRESHOLD) {
                    pushY = dodgeLeft ? pushDistance : -pushDistance;
                }
            } else if (isMovingBackward) {
                // Inversion pour le mouvement arrière
                if (Math.abs(this.rot - NORTH) < MOVEMENT_THRESHOLD) {
                    pushY = pushDistance; // Sud (inverse du Nord)
                } else if (Math.abs(this.rot - EAST) < MOVEMENT_THRESHOLD) {
                    pushX = -pushDistance; // Ouest (inverse de l'Est)
                } else if (Math.abs(this.rot - SOUTH) < MOVEMENT_THRESHOLD) {
                    pushY = -pushDistance; // Nord (inverse du Sud)
                } else if (Math.abs(this.rot - WEST) < MOVEMENT_THRESHOLD) {
                    pushX = pushDistance; // Est (inverse de l'Ouest)
                }
            } else {
                // Direction normale pour le mouvement avant
                if (Math.abs(this.rot - NORTH) < MOVEMENT_THRESHOLD) {
                    pushY = -pushDistance; // Nord
                } else if (Math.abs(this.rot - EAST) < MOVEMENT_THRESHOLD) {
                    pushX = pushDistance;  // Est
                } else if (Math.abs(this.rot - SOUTH) < MOVEMENT_THRESHOLD) {
                    pushY = pushDistance;  // Sud
                } else if (Math.abs(this.rot - WEST) < MOVEMENT_THRESHOLD) {
                    pushX = -pushDistance; // Ouest
                }
            }
            
            // Position cible maximale de la poussée
            const maxPushX = startX + pushX;
            const maxPushY = startY + pushY;
            
            // Phase 1: Poussée vers l'avant/arrière rapide
            const startImpactTime = performance.now();
            let impactPhase1Complete = false;
            
            while (!impactPhase1Complete) {
                const currentTime = performance.now();
                const elapsedTime = currentTime - startImpactTime;
                
                // Progression de la phase 1 (0 à 1)
                let t = Math.min(elapsedTime / (ENEMY_IMPACT_DURATION / 2), 1);
                
                if (t >= 1) {
                    impactPhase1Complete = true;
                    t = 1;
                }
                
                const easedT = easeInOut(t);
                
                this.x = startX + pushX * easedT;
                this.y = startY + pushY * easedT;
                
                await new Promise(resolve => requestAnimationFrame(resolve));
            }
            
            // Phase 2: Rebond rapide
            const startReboundTime = performance.now();
            let impactPhase2Complete = false;
            
            while (!impactPhase2Complete) {
                const currentTime = performance.now();
                const elapsedTime = currentTime - startReboundTime;
                
                // Progression de la phase 2 (0 à 1)
                let t = Math.min(elapsedTime / (ENEMY_IMPACT_DURATION / 2), 1);
                
                if (t >= 1) {
                    impactPhase2Complete = true;
                    t = 1;
                }
                
                const easedT = easeOutBack(t);
                
                this.x = maxPushX - pushX * easedT;
                this.y = maxPushY - pushY * easedT;
                
                await new Promise(resolve => requestAnimationFrame(resolve));
            }
            
            // Normalisation finale de la position
            this.x = startX;
            this.y = startY;
            this.z = 0;
            
            // Marquer la fin du mouvement d'impact
            this.isMoving = false;
            
            // Vérifier le délai avant de déclencher le combat
            const currentTime = Date.now();
            if (this.turn && !isDodging && (currentTime - (this.lastAttackTime || 0) >= ATTACK_COOLDOWN)) {
                try {
                    this.lastAttackTime = currentTime; // Mettre à jour le temps de la dernière attaque
                    await collidedSprite.combat(this.might, this.criti, this);
                } catch (error) {
                    console.error("Error:", error);
                    this.turn = false;
                }
            } else if (this.turn && !isDodging && (currentTime - (this.lastAttackTime || 0) < ATTACK_COOLDOWN)) {
                // Informer le joueur qu'il n'est pas prêt à attaquer
                Sprite.terminalLog("Can't attack yet !");
            }
            
            return;
        }
        
        // Animation d'impact en cas de collision avec un mur ou un sprite non-ennemi
        if (collidesWithWall || collidesWithSprite) {
            // Marquer le début du mouvement
            this.isMoving = true;
            
            // Animation d'impact sur obstacle
            const startX = this.x;
            const startY = this.y;
            
            // Déterminer la distance maximale de "poussée" vers l'obstacle
            const pushDistance = this.tileSize * PUSH_WALL_FACTOR;
            
            // Calculer la direction de la poussée
            let pushX = 0;
            let pushY = 0;
            
            if (isDodging) {
                // Direction pour l'esquive (même logique que le mouvement)
                if (Math.abs(this.rot - NORTH) < MOVEMENT_THRESHOLD) {
                    pushX = dodgeLeft ? -pushDistance : pushDistance;
                } else if (Math.abs(this.rot - EAST) < MOVEMENT_THRESHOLD) {
                    pushY = dodgeLeft ? -pushDistance : pushDistance;
                } else if (Math.abs(this.rot - SOUTH) < MOVEMENT_THRESHOLD) {
                    pushX = dodgeLeft ? pushDistance : -pushDistance;
                } else if (Math.abs(this.rot - WEST) < MOVEMENT_THRESHOLD) {
                    pushY = dodgeLeft ? pushDistance : -pushDistance;
                }
            } else if (isMovingBackward) {
                // Inversion de la direction pour le mouvement arrière
                if (Math.abs(this.rot - NORTH) < MOVEMENT_THRESHOLD) {
                    pushY = pushDistance; // Sud (inverse du Nord)
                } else if (Math.abs(this.rot - EAST) < MOVEMENT_THRESHOLD) {
                    pushX = -pushDistance; // Ouest (inverse de l'Est)
                } else if (Math.abs(this.rot - SOUTH) < MOVEMENT_THRESHOLD) {
                    pushY = -pushDistance; // Nord (inverse du Sud)
                } else if (Math.abs(this.rot - WEST) < MOVEMENT_THRESHOLD) {
                    pushX = pushDistance; // Est (inverse de l'Ouest)
                }
            } else {
                // Direction normale pour le mouvement avant
                if (Math.abs(this.rot - NORTH) < MOVEMENT_THRESHOLD) {
                    pushY = -pushDistance; // Nord
                } else if (Math.abs(this.rot - EAST) < MOVEMENT_THRESHOLD) {
                    pushX = pushDistance;  // Est
                } else if (Math.abs(this.rot - SOUTH) < MOVEMENT_THRESHOLD) {
                    pushY = pushDistance;  // Sud
                } else if (Math.abs(this.rot - WEST) < MOVEMENT_THRESHOLD) {
                    pushX = -pushDistance; // Ouest
                }
            }
            
            // Position cible maximale de la poussée
            const maxPushX = startX + pushX;
            const maxPushY = startY + pushY;
            
            // Phase 1: Poussée vers l'avant/arrière
            const startImpactTime = performance.now();
            let impactPhase1Complete = false;
            
            while (!impactPhase1Complete) {
                const currentTime = performance.now();
                const elapsedTime = currentTime - startImpactTime;
                
                // Progression de la phase 1 (0 à 1)
                let t = Math.min(elapsedTime / (WALL_IMPACT_DURATION / 2), 1);
                
                if (t >= 1) {
                    impactPhase1Complete = true;
                    t = 1;
                }
                
                const easedT = easeInOut(t);
                
                this.x = startX + pushX * easedT;
                this.y = startY + pushY * easedT;
                
                await new Promise(resolve => requestAnimationFrame(resolve));
            }
            
            // Phase 2: Rebond
            const startReboundTime = performance.now();
            let impactPhase2Complete = false;
            
            while (!impactPhase2Complete) {
                const currentTime = performance.now();
                const elapsedTime = currentTime - startReboundTime;
                
                // Progression de la phase 2 (0 à 1)
                let t = Math.min(elapsedTime / (WALL_IMPACT_DURATION / 2), 1);
                
                if (t >= 1) {
                    impactPhase2Complete = true;
                    t = 1;
                }
                
                const easedT = easeOutBack(t); // Effet de rebond
                
                this.x = maxPushX - pushX * easedT;
                this.y = maxPushY - pushY * easedT;
                
                await new Promise(resolve => requestAnimationFrame(resolve));
            }
            
            // Normalisation finale de la position
            this.x = startX;
            this.y = startY;
            this.z = 0;
            
            // Marquer la fin du mouvement
            this.isMoving = false;
            return;
        }
        
        // Si nous arrivons ici, le mouvement est possible
        // Marquer le début du mouvement
        this.isMoving = true;
        
        // Animation de déplacement améliorée
        const startX = this.x;
        const startY = this.y;
        const targetX = destX * this.tileSize + this.tileSize / 2; // Centre de la case
        const targetY = destY * this.tileSize + this.tileSize / 2; // Centre de la case
        
        // Durée minimale du mouvement en ms - réduite pour les mouvements continus
        let minMovementDuration;
        if (isDodging) {
            minMovementDuration = DODGE_DURATION;
        } else {
            // Accélérer les mouvements continus (après le premier)
            const isContinuousMovement = (up && this.lastMoveWasForward) || (down && this.lastMoveWasBackward);
            minMovementDuration = isMovingBackward ? 
                                  (isContinuousMovement ? BACKWARD_DURATION - CONTINUOUS_MOVE_SPEEDUP : BACKWARD_DURATION) : 
                                  (isContinuousMovement ? FORWARD_DURATION - CONTINUOUS_MOVE_SPEEDUP : FORWARD_DURATION);
        }
        
        // Mémoriser la direction du mouvement actuel pour le prochain cycle
        this.lastMoveWasForward = up;
        this.lastMoveWasBackward = down;
        
        // Ajustement de vitesse avec le sort Speed (conservé)
        if (this.spells && this.spells.length > 0 && this.spells[this.selectedSpell].name === "Speed") 
            minMovementDuration -= 50;
        
        // Bornes min/max pour la durée
        minMovementDuration = Math.max(Math.min(minMovementDuration, 800), 200);
        
        // Animation principale avec durée minimale garantie
        const startMovementTime = performance.now();
        let movementComplete = false;
        
        while (!movementComplete) {
            const currentTime = performance.now();
            const elapsedTime = currentTime - startMovementTime;
            
            // Progression du mouvement (0 à 1)
            let t = Math.min(elapsedTime / minMovementDuration, 1);
            
            if (t >= 1) {
                movementComplete = true;
                t = 1;
            }
            
            // Appliquer l'easing
            const easedT = easeInOutQuart(t);
            
            // Position horizontale avec easing
            this.x = startX + (targetX - startX) * easedT;
            this.y = startY + (targetY - startY) * easedT;
            
            // Rendre la frame
            await new Promise(resolve => requestAnimationFrame(resolve));
        }
        
        // Normalisation finale de la position
        this.x = targetX;
        this.y = targetY;
        this.z = 0; // Réinitialiser la hauteur
        
        // Gestion des réinitialisations d'interface
        if (this.turn) {
            Sprite.resetToggle();
            this.inventoryMenuShowed = false;
        }
        
        // Marquer la fin du mouvement
        this.isMoving = false;
        
        // Déclencher immédiatement un nouveau mouvement si le bouton est toujours enfoncé
        // Cela permet des déplacements continus sans avoir à relâcher et réappuyer le bouton
        if (this.continuousUpPressed || this.continuousJoystickUp) {
            // Créer un léger délai pour éviter les mouvements trop rapides
            await new Promise(resolve => setTimeout(resolve, CONTINUOUS_MOVE_DELAY));
            this.button5Clicked = true;  // Simuler un nouveau clic sur le bouton d'avance
            this.move(timeElapsed, map, eventA, eventB, sprites);
        } else if (this.continuousDownPressed || this.continuousJoystickDown) {
            await new Promise(resolve => setTimeout(resolve, CONTINUOUS_MOVE_DELAY));
            this.button8Clicked = true;  // Simuler un nouveau clic sur le bouton de recul
            this.move(timeElapsed, map, eventA, eventB, sprites);
        }
    }
    
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Objets
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class Item {
    constructor(
        id,
        name,
        slot,
        equipped,
        power,
        strength,
        dexterity,
        intellect,
        might,
        magic,
        dodge,
        armor,
        criti,
        price,
        icon
    ) {
        this.id = id;
        this.name = name;
        this.slot = slot;
        this.equipped = equipped || false;

        this.power = power;

        this.strength = strength;
        this.dexterity = dexterity;
        this.intellect = intellect;

        this.might = might;
        this.magic = magic;
        this.dodge = dodge;

        this.armor = armor;
        this.criti = criti;
        
        this.price = price;
        this.icon = icon;
    }
    
    // Dans la classe Item
    equip(player) {
        if (this.isEquipable(player)) {
            this.unequip(player);

            this.equipped = true;

            player.strength += this.strength || 0;
            player.dexterity += this.dexterity || 0;
            player.intellect += this.intellect || 0;

            player.might += this.might || 0;
            player.magic += this.magic || 0;
            player.dodge += this.dodge || 0;
            player.armor += this.armor || 0;
            player.criti += this.criti || 0;

            player[this.getSlotName()] = [this];
        }
    }

    unequip(player) {
        if (this.equipped) {
            player.strength -= this.strength || 0;
            player.dexterity -= this.dexterity || 0;
            player.intellect -= this.intellect || 0;

            player.might -= this.might || 0;
            player.magic -= this.magic || 0;
            player.dodge -= this.dodge || 0;
            player.armor -= this.armor || 0;
            player.criti -= this.criti || 0;

            // Retirer l'objet de l'emplacement correspondant
            player[this.getSlotName()] = [];

            this.equipped = false;
        }
    }

    isEquipable(player) {
        return (
            (this.slot === 1 && (!player.hands[0] || !player.hands[0].equipped)) ||
            (this.slot === 2 && (!player.torso[0] || !player.torso[0].equipped))
        );
    }

    getSlotName() {
        return this.slot === 1 ? "hands" : this.slot === 2 ? "torso" : "";
    }

    give(player) {
        if (!player.inventory) {
            player.inventory = [];
        }
        player.inventory.push(this);
        console.log(`${player.name} received item: ${this.name}`);
    }

    // à suprimer  ?
    static giveItem(player, itemId) {
        const itemData = Item.itemList.find(item => item.id === itemId);
        if (itemData) {
            const item = new Item(
                itemData.id,
                itemData.name,
                itemData.slot,
                itemData.equipped,
                itemData.power,
                itemData.strength,
                itemData.dexterity,
                itemData.intellect,
                itemData.might,
                itemData.magic,
                itemData.dodge,
                itemData.armor,
                itemData.criti,
                itemData.price,
                itemData.icon
            );
            item.give(player);
        } else {
            console.log(`Item with ID ${itemId} not found.`);
        }
    }

    static getItemById(itemId) {
        const itemData = Item.itemList.find(item => item.id === itemId);
        if (itemData) {
            return new Item(
                itemData.id,
                itemData.name,
                itemData.slot,
                itemData.equipped,
                itemData.power,
                itemData.strength,
                itemData.dexterity,
                itemData.intellect,
                itemData.might,
                itemData.magic,
                itemData.dodge,
                itemData.armor,
                itemData.criti,
                itemData.price,
                itemData.icon
            );
        }
        return null;
    }

    // Nouvelle méthode statique pour déséquiper tous les objets
    static unequipAll(player) {
        if (player.hands && player.hands.length > 0) {
            player.hands.forEach(item => item.unequip(player));
        }
        if (player.torso && player.torso.length > 0) {
            player.torso.forEach(item => item.unequip(player));
        }
    }
}

// Item constructor(name, slot, equipped, power, strength, dexterity, intellect, might, magic, dodge, armor)
Item.itemList = [{
        id: 1,
        name: "Shortsword",
        slot: 1,
        equipped: false,
        power: 0,
        strength: 0,
        dexterity: 0,
        intellect: 0,
        might: 1,
        magic: 0,
        dodge: 0,
        armor: 0,
        criti: 0,
        price: 1,
        icon: "assets/icons/sword.png",
    },
    {
        id: 2,
        name: "Cape",
        slot: 2,
        equipped: false,
        power: 0,
        strength: 0,
        dexterity: 0,
        intellect: 0,
        might: 0,
        magic: 0,
        dodge: 0,
        armor: 1,
        criti: 0,
        price: 1,
        icon: "assets/icons/cape.png"
    },
    {
        id: 3,
        name: "Magic sword",
        slot: 1,
        equipped: false,
        power: 0,
        strength: 0,
        dexterity: 0,
        intellect: 0,
        might: 3,
        magic: 2,
        dodge: 0,
        armor: 0,
        criti: 0,
        price: 1,
        icon: "assets/icons/magicSword.png"
    },
    {
        id: 4,
        name: "Tunic",
        slot: 2,
        equipped: false,
        power: 0,
        strength: 0,
        dexterity: 0,
        intellect: 0,
        might: 0,
        magic: 0,
        dodge: 0,
        armor: 1,
        criti: 0,
        price: 1,
        icon: "assets/icons/tunic.png"
    },
    {
        id: 5,
        name: "Club",
        slot: 1,
        equipped: false,
        power: 0,
        strength: 0,
        dexterity: 0,
        intellect: 0,
        might: 1,
        magic: 0,
        dodge: 0,
        armor: 0,
        criti: 0,
        price: 1,
        icon: "assets/icons/club.png"
    },
    {
        id: 6,
        name: "Staff",
        slot: 1,
        equipped: false,
        power: 0,
        strength: 0,
        dexterity: 0,
        intellect: 0,
        might: 0,
        magic: 1,
        dodge: 0,
        armor: 0,
        criti: 0,
        price: 1,
        icon: "assets/icons/staff.png"
    },
    {
        id: 7,
        name: "Armor",
        slot: 2,
        equipped: false,
        power: 0,
        strength: 0,
        dexterity: -1,
        intellect: 0,
        might: 0,
        magic: 0,
        dodge: 0,
        armor: 3,
        criti: 0,
        price: 1,
        icon: "assets/icons/armor.png"
    },
    {
        id: 8,
        name: "Dagger",
        slot: 1,
        equipped: false,
        power: 0,
        strength: 0,
        dexterity: 0,
        intellect: 0,
        might: 0,
        magic: 0,
        dodge: 10,
        armor: 0,
        criti: 10,
        price: 1,
        icon: "assets/icons/dagger.png"
    },
];

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Sortilèges
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class Spell {
    constructor(id, name, manaCost, description, effect, selfCast, icon) {
        this.id = id;
        this.name = name;
        this.manaCost = manaCost;
        this.description = description;
        this.effect = effect; // Fonction représentant l'effet du sort
        this.selfCast = selfCast;
        this.icon = icon;
    }

    // Méthode pour lancer le sort
    cast(caster, target) {
        if (caster.turn) {
            caster.turn = false;

            if (caster.mp >= this.manaCost) {
                // Vérifie si le lanceur a suffisamment de mana pour lancer le sort
                caster.mp -= this.manaCost; // Réduire le mana du lanceur

                // Appliquer l'effet du sort sur la cible
                this.effect(caster, target);

                // Sprite.terminalLog(`${caster.name} cast ${this.name} on ${target.spriteName}`, 4);
            } else {
                Sprite.terminalLog(`${caster.name} doesn't have enough mana to cast ${this.name}`, 4);
            }
        } else {
            console.log("not your turn");
        }
    }

    // Fonction représentant l'effet de soins
    static healEffect(caster, target) {
        Raycaster.playerHealFlash();

        caster.XPintellect += 1;

        var healEffect = 10 + caster.magic

        target.hp += healEffect;

        if (target.hp > target.hpMax) {
            target.hp = target.hpMax;
            Sprite.displayCombatAnimation(`${target.name} is healed for ${healEffect}HP, and is completely healed by ${caster.name}'s ${this.name}.`, 4);
        } else {
            Sprite.displayCombatAnimation(`${target.name} is healed for ${healEffect}HP by ${caster.name}'s ${this.name}..`, 4);
        }
    }

    // Fonction représentant l'effet de dégâts
    static damageEffect(caster, target) {
        Raycaster.playerHealFlash();
        target.startSpriteFlash();
 
        var damage = 1 + caster.magic;

        target.hp -= damage;
        caster.XPintellect += 1;
        Sprite.displayCombatAnimation(`The target suffered ${damage} points of damage from ${caster.name}'s ${this.name}`, 4);
    }

    // à suprimer ?
    give(player) {
        if (!player.spells) {
            player.spells = [];
        }
        player.spells.push(this);
        console.log(`${player.name} learned spell: ${this.name}`);
    }

    static getSpellById(spellId) {
        const spellData = Spell.spellList.find(spell => spell.id === spellId);
        if (spellData) {
            return new Spell(
                spellData.id,
                spellData.name,
                spellData.manaCost,
                spellData.description,
                spellData.effect,
                spellData.selfCast,
                spellData.icon
            );
        }
        return null;
    }

    static giveSpell(player, spellId) {
        const spell = Spell.getSpellById(spellId);
        if (spell) {
            spell.give(player);
        } else {
            console.log(`Spell with ID ${spellId} not found.`);
        }
    }
}

// Spell constructor(id, name, manaCost, description, effect, selfCast, icon)
Spell.spellList = [{
        id: 1,
        name: "Heal I",
        manaCost: 8,
        description: "Heal the player for 10hp.",
        effect: Spell.healEffect,
        selfCast: true,
        icon: "assets/icons/heal.png"
    },
    {
        id: 2,
        name: "Sparks",
        manaCost: 2,
        description: "Inflict 2pts of electric damage.",
        effect: Spell.damageEffect,
        selfCast: false,
        icon: "assets/icons/sparks.png"
    }
];

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Quêtes
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class Quest {
    constructor(id, title, description, reward, completed) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.reward = reward;
        this.completed = false;
    }

    // Méthode pour marquer une quête comme complétée
    complete() {
        this.completed = true;
        Sprite.displayCombatAnimation(`The quest "${this.title}" has been completed! Reward: ${this.reward}`, 3);
    }

    // à suprimer ?
    give(player) {
        if (!player.quests) {
            player.quests = [];
        }
        player.quests.push(this);
        console.log(`${player.name} received quest: ${this.title}`);
    }

    static getQuestById(questId) {
        const questData = Quest.questList.find(quest => quest.id === questId);
        if (questData) {
            return new Quest(
                questData.id,
                questData.title,
                questData.description,
                questData.reward,
                questData.completed
            );
        }
        return null;
    }

    static giveQuest(player, questId) {
        const quest = Quest.getQuestById(questId);
        if (quest) {
            quest.give(player);
        } else {
            console.log(`Quest with ID ${questId} not found.`);
        }
    }
}

// Quest constructor(id, title, description, reward, completed)
Quest.questList = [{
    id: 1,
    title: "Welcome to Oasis!",
    description: "It's not fresh, but it's new... So please, enjoy my little baby!",
    reward: "<3",
    completed: false
}];

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Sprite Class
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class Sprite {
    constructor(
        x = 0,
        y = 0,
        z = 0,
        w = 128,
        h = 128,
        ang = 0,
        spriteType = 0,
        spriteTexture = 0,
        isBlocking = true,
        attackable = false,
        turn = true,
        hp = 1,
        dmg = 1,
        animationProgress = 0,
        spriteName = '',
        spriteFace = '',
        spriteTalk = [],
        spriteSell = [],
        id = 0,
        step = 0,
        lootClass = null  // Nouvelle propriété: classe de loot
        
    ) {
        this.x = x;
        this.y = y;
        this.z = z; // Correction de z pour éviter l'erreur de copier w
        this.w = w;
        this.h = h;

        this.hit = false;
        this.screenPosition = null; // calculated screen position

        this.spriteFlash = 0;

        this.ang = ang;

        this.spriteType = spriteType;

        this.spriteTexture = spriteTexture;

        this.isBlocking = isBlocking;

        this.attackable = attackable;

        this.hp = hp;
        this.dmg = dmg;

        this.turn = turn;

        this.animationProgress = animationProgress;

        this.spriteName = spriteName;
        this.spriteFace = spriteFace;
        this.spriteTalk = spriteTalk;
        this.spriteSell = spriteSell;
        this.id = id;
        this.step = 0;

        if (lootClass === null || lootClass === 0) {
            if (spriteType === "A") {
                this.lootClass = Sprite.calculateLootClass(hp, dmg);
            } else {
                this.lootClass = 0; // 0 pour les sprites non-ennemis
            }
        } else {
            this.lootClass = lootClass;
        }
    
        this.lastAttackTime = null; // Pour suivre le timing des attaques
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IA / Deplacements ennemis
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async moveRandomlyOrChase(map, sprites, player) {
    // Ne pas déplacer si le sprite n'est pas un ennemi ou s'il est mort ou déjà en mouvement
    if (this.spriteType !== "A" || this.hp <= 0 || this.isMoving) {
        return false;
    }
    
    const tileSize = 1280;
    const currentCellX = Math.floor(this.x / tileSize);
    const currentCellY = Math.floor(this.y / tileSize);
    const playerCellX = Math.floor(player.x / tileSize);
    const playerCellY = Math.floor(player.y / tileSize);
    
    // Calculer la distance entre l'ennemi et le joueur (distance Manhattan)
    const distanceToPlayer = Math.abs(currentCellX - playerCellX) + Math.abs(currentCellY - playerCellY);
    
    // Si on est en contact avec le joueur, attaquer et planifier l'attaque suivante
    if (distanceToPlayer <= 1) {
        // Ne pas bouger, mais attaquer
        if (!this.lastAttackTime || (Date.now() - this.lastAttackTime) >= 2000) {
            this.attackPlayer(player);
            
            // Planifier une attaque supplémentaire dans 2 secondes
            this.lastAttackTime = Date.now();
            setTimeout(() => {
                if (this.hp > 0 && player.hp > 0) {
                    // Vérifier à nouveau la distance avant d'attaquer
                    const newCurrentCellX = Math.floor(this.x / tileSize);
                    const newCurrentCellY = Math.floor(this.y / tileSize);
                    const newPlayerCellX = Math.floor(player.x / tileSize);
                    const newPlayerCellY = Math.floor(player.y / tileSize);
                    const newDistanceToPlayer = Math.abs(newCurrentCellX - newPlayerCellX) + 
                                                Math.abs(newCurrentCellY - newPlayerCellY);
                    
                    if (newDistanceToPlayer <= 1) {
                        this.attackPlayer(player);
                    }
                }
            }, 2000);
        }
        return false;
    }
    
    // Zone de détection (ajustable)
    const detectionRange = 5; // Détecte le joueur à 5 cases ou moins
    
    // Déterminer le mode: poursuite ou aléatoire
    const isChasing = distanceToPlayer <= detectionRange;
    
    // Chance de se déplacer (plus élevée en mode poursuite)
    const moveChance = isChasing ? 0.8 : 0.4; // 80% en mode poursuite, 40% en mode aléatoire
    
    if (Math.random() > moveChance) {
        return false;
    }
    
    let directionToMove = null;
    
    if (isChasing) {
        // Mode poursuite: essayer de se rapprocher du joueur
        const dx = playerCellX - currentCellX;
        const dy = playerCellY - currentCellY;
        
        // Choisir d'abord l'axe avec la plus grande différence
        if (Math.abs(dx) >= Math.abs(dy)) {
            // Se déplacer horizontalement en priorité
            directionToMove = dx > 0 ? { dx: 1, dy: 0 } : { dx: -1, dy: 0 };
            
            // Si bloqué horizontalement, essayer verticalement
            if (!this.isValidMove(directionToMove, map, sprites, player, currentCellX, currentCellY)) {
                directionToMove = dy > 0 ? { dx: 0, dy: 1 } : { dx: 0, dy: -1 };
            }
        } else {
            // Se déplacer verticalement en priorité
            directionToMove = dy > 0 ? { dx: 0, dy: 1 } : { dx: 0, dy: -1 };
            
            // Si bloqué verticalement, essayer horizontalement
            if (!this.isValidMove(directionToMove, map, sprites, player, currentCellX, currentCellY)) {
                directionToMove = dx > 0 ? { dx: 1, dy: 0 } : { dx: -1, dy: 0 };
            }
        }
        
        // Si toujours bloqué, essayer une direction aléatoire
        if (!directionToMove || !this.isValidMove(directionToMove, map, sprites, player, currentCellX, currentCellY)) {
            return this.tryRandomMove(map, sprites, player, currentCellX, currentCellY);
        }
    } else {
        // Mode aléatoire
        return this.tryRandomMove(map, sprites, player, currentCellX, currentCellY);
    }
    
    // Exécuter le mouvement si une direction valide a été trouvée
    if (directionToMove && this.isValidMove(directionToMove, map, sprites, player, currentCellX, currentCellY)) {
        return this.executeMove(directionToMove, currentCellX, currentCellY, tileSize);
    }
    
    return false;
}

// Nouvelle méthode pour gérer l'attaque de l'ennemi
attackPlayer(player) {
    if (player.hp <= 0 || this.hp <= 0) return;
    
    // Animation de l'attaque
    this.startAttackAnimation();
    
    const chanceEchec = Math.floor(Math.random() * 100);
    
    if (chanceEchec > player.dodge) {
        // L'attaque réussit
        if (player.armor >= this.dmg) {
            Sprite.terminalLog("Your armor absorbs all the damages.", 1);
        } else {
            const damageDone = this.dmg - player.armor;
            Sprite.displayCombatAnimation(`${this.spriteName || "The ennemy"} attacks : ${damageDone} dmg !`, 2);
            Raycaster.playerDamageFlash();
            player.hp -= damageDone;
            
            // Vérifier si le joueur est mort
            if (player.hp <= 0) {
                Sprite.terminalLog("You're dead !");
                // Logique de game over déjà gérée dans player.statsUpdate()
            }
        }
    } else {
        // Le joueur esquive
        Sprite.terminalLog(`You dodge ${this.spriteName || "the enemy"}'s attack !`, 2);
        player.XPdexterity += 1;
    }
    
    // Mettre à jour les statistiques du joueur
    player.statsUpdate(player);
}

// Vérifier si un mouvement est valide
isValidMove(direction, map, sprites, player, currentCellX, currentCellY) {
    if (!direction) return false;
    
    const tileSize = 1280;
    const newCellX = currentCellX + direction.dx;
    const newCellY = currentCellY + direction.dy;
    
    // Vérifier les limites de la carte
    if (newCellX < 0 || newCellY < 0 || newCellX >= map[0].length || newCellY >= map.length) {
        return false;
    }
    
    // Vérifier si la case est vide (0 = traversable)
    if (map[newCellY][newCellX] !== 0) {
        return false;
    }
    
    // Vérifier si le joueur est dans la case de destination
    const playerCellX = Math.floor(player.x / tileSize);
    const playerCellY = Math.floor(player.y / tileSize);
    if (newCellX === playerCellX && newCellY === playerCellY) {
        return false;
    }
    
    // Vérifier s'il y a déjà un sprite sur cette case
    for (const sprite of sprites) {
        if (sprite !== this && sprite.isBlocking) {
            const spriteCellX = Math.floor(sprite.x / tileSize);
            const spriteCellY = Math.floor(sprite.y / tileSize);
            
            if (spriteCellX === newCellX && spriteCellY === newCellY) {
                return false; // Case déjà occupée
            }
        }
    }
    
    return true;
}

// Essayer un mouvement aléatoire
tryRandomMove(map, sprites, player, currentCellX, currentCellY) {
    // Directions possibles: nord, est, sud, ouest
    const directions = [
        { dx: 0, dy: -1 }, // nord
        { dx: 1, dy: 0 },  // est
        { dx: 0, dy: 1 },  // sud
        { dx: -1, dy: 0 }  // ouest
    ];
    
    // Mélanger les directions pour un choix vraiment aléatoire
    directions.sort(() => Math.random() - 0.5);
    
    // Essayer chaque direction jusqu'à en trouver une valide
    for (const direction of directions) {
        if (this.isValidMove(direction, map, sprites, player, currentCellX, currentCellY)) {
            return this.executeMove(direction, currentCellX, currentCellY, 1280);
        }
    }
    
    return false; // Aucune direction valide
}

// Exécuter le mouvement avec animation
async executeMove(direction, currentCellX, currentCellY, tileSize) {
    const newCellX = currentCellX + direction.dx;
    const newCellY = currentCellY + direction.dy;
    
    // Tout est OK, on peut déplacer l'ennemi avec animation
    this.isMoving = true;
    
    // Positions initiale et finale
    const startX = this.x;
    const startY = this.y;
    const targetX = newCellX * tileSize + tileSize / 2;
    const targetY = newCellY * tileSize + tileSize / 2;
    
    // Durée de l'animation en ms (plus rapide en mode poursuite)
    const animationDuration = 600; // 600ms = 0.6 seconde
    
    // Fonctions d'easing pour animation plus fluide
    const easeInOutQuart = (t) => t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
    
    // Animation du déplacement
    const startTime = performance.now();
    let animationComplete = false;
    
    while (!animationComplete) {
        const currentTime = performance.now();
        const elapsedTime = currentTime - startTime;
        
        // Progression de l'animation (0 à 1)
        let t = Math.min(elapsedTime / animationDuration, 1);
        
        if (t >= 1) {
            animationComplete = true;
            t = 1;
        }
        
        // Appliquer l'easing pour un mouvement plus naturel
        const easedT = easeInOutQuart(t);
        
        // Mettre à jour la position
        this.x = startX + (targetX - startX) * easedT;
        this.y = startY + (targetY - startY) * easedT;
        
        // Petit effet de rebond vertical
        this.z = 5 * Math.sin(Math.PI * t);
        
        // Attendre la prochaine frame
        await new Promise(resolve => requestAnimationFrame(resolve));
    }
    
    // S'assurer que la position finale est exacte
    this.x = targetX;
    this.y = targetY;
    this.z = 0;
    
    // Animation terminée
    this.isMoving = false;
    
    return true;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Looting
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


    // Tables de loot statiques pour la classe Sprite
    // Format: Minimum gold, Maximum gold, Chances d'obtenir un objet, Tableau d'IDs d'items possibles
    // Tables de loot optimisées pour le calcul automatique
    static lootTables = {
        0: { minGold: 0, maxGold: 0, itemChance: 0, possibleItems: [] }, // Pas de loot
        1: { minGold: 5, maxGold: 15, itemChance: 0.1, possibleItems: [1, 2] }, // Créatures très faibles (PV=2, DMG=1)
        2: { minGold: 10, maxGold: 30, itemChance: 0.2, possibleItems: [1, 2, 5] }, // Créatures faibles
        3: { minGold: 25, maxGold: 60, itemChance: 0.3, possibleItems: [1, 2, 3, 5] }, // Créatures moyennes
        4: { minGold: 50, maxGold: 120, itemChance: 0.5, possibleItems: [2, 3, 4, 5] }, // Créatures fortes
        5: { minGold: 100, maxGold: 250, itemChance: 0.7, possibleItems: [3, 4, 5] }  // Créatures très fortes ou boss
    };


    /**
     * Calcule automatiquement la classe de loot basée sur les statistiques de l'ennemi
     * @param {number} hp - Points de vie de l'ennemi
     * @param {number} dmg - Dégâts de l'ennemi
     * @return {number} - Classe de loot calculée (1-5)
     */
    static calculateLootClass(hp, dmg) {
        // Formule simple basée sur les PV et les dégâts
        // Math.floor(hp/dmg) comme suggéré, mais avec quelques ajustements
        // pour s'assurer que les valeurs restent dans la plage 1-5
        
        // Si l'ennemi n'a pas de dégâts, on utilise 1 pour éviter une division par zéro
        const effectiveDmg = dmg || 1;
        
        // Calcul de base selon la formule hp/dmg
        let baseClass = Math.floor(hp / effectiveDmg);
        
        // Ajouter un petit bonus basé sur les dégâts
        baseClass += Math.floor(dmg / 2);
        
        // Limiter la classe entre 1 et 5
        return Math.max(1, Math.min(5, baseClass));
    }

    // displayLootAnimation() était ici

    generateLoot(player) {
        // Pas de loot si la classe est 0
        if (this.lootClass === 0) {
            return;
        }
    
        // Récupérer la table de loot correspondante à la classe
        const lootTable = Sprite.lootTables[this.lootClass] || Sprite.lootTables[1];
        
        // Générer une quantité aléatoire d'or avec un peu de variance
        const baseGold = Math.floor(Math.random() * (lootTable.maxGold - lootTable.minGold + 1)) + lootTable.minGold;
        
        // Appliquer un modificateur basé sur les caractéristiques de l'ennemi
        const goldModifier = (this.hp * this.dmg) / 10;
        const goldAmount = Math.floor(baseGold * (1 + goldModifier / 100));
        
        // Ajouter l'or au joueur
        player.gold += goldAmount;
        
        // Message pour l'or trouvé avec animation
        Sprite.displayLootAnimation(`You found ${goldAmount} gold coins!`, 'gold');
        //Sprite.terminalLog(`You found ${goldAmount} gold coins!`, 'gold')
        
        // Déterminer si un objet est obtenu, avec une chance influencée par la difficulté de l'ennemi
        const baseItemChance = lootTable.itemChance;
        const difficultyBonus = (this.hp * this.dmg) / 200; // Bonus de 0.5% par point de "puissance"
        const adjustedItemChance = Math.min(0.95, baseItemChance + difficultyBonus); // Plafond à 95%
        
        const getItem = Math.random() < adjustedItemChance;
        
        if (getItem && lootTable.possibleItems.length > 0) {
            // Choisir un objet aléatoire dans la liste des possibles
            // Plus l'ennemi est fort, plus il y a de chances d'obtenir un meilleur objet
            
            // Trier les objets par "valeur" (prix ou puissance)
            const sortedItems = [...lootTable.possibleItems].sort((a, b) => {
                const itemA = Item.getItemById(a);
                const itemB = Item.getItemById(b);
                
                // Estimation simple de la valeur: prix ou somme des attributs
                const valueA = itemA.price || (itemA.might + itemA.magic + itemA.armor + itemA.dodge);
                const valueB = itemB.price || (itemB.might + itemB.magic + itemB.armor + itemB.dodge);
                
                return valueA - valueB;
            });
            
            // Calcul d'un index pondéré qui favorise les meilleurs objets pour les ennemis plus forts
            const powerRatio = Math.min(1, (this.hp * this.dmg) / 50); // 0 à 1 selon la puissance
            const weightedIndex = Math.floor(Math.random() * (1 + powerRatio) * sortedItems.length);
            const clampedIndex = Math.min(weightedIndex, sortedItems.length - 1);
            
            const itemId = sortedItems[clampedIndex];
            
            // Créer l'objet et l'ajouter à l'inventaire du joueur
            const lootItem = Item.getItemById(itemId);
            if (lootItem) {
                lootItem.give(player);
                
                // Message différent selon la rareté de l'objet
                let qualityDesc = "a";
                if (clampedIndex >= sortedItems.length * 0.8) qualityDesc = "an exceptional";
                else if (clampedIndex >= sortedItems.length * 0.6) qualityDesc = "a valuable";
                else if (clampedIndex >= sortedItems.length * 0.4) qualityDesc = "a good";
                
                Sprite.displayLootAnimation(`You found ${qualityDesc} ${lootItem.name}!`, 'item');
                // Sprite.terminalLog(`You found ${qualityDesc} ${lootItem.name}!`, 'item');
            }
        }
        
        // Mise à jour de l'affichage
        player.statsUpdate(player);
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Contrôle UI & terminal log
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Fonction principale de log du terminal
    // Fonction principale de log du terminal avec apparition en fondu
    static terminalLog(entry, style = 0) {
        const outputElement = document.getElementById("output");
        
        // Définition des styles disponibles (couleurs contrastées sur fond #1F0E08)
        const styles = {
            0: { color: "#FFFFFF" },                  // Blanc (par défaut)
            1: { color: "#77DD77" },                  // Vert clair
            2: { color: "#FF6B6B" },                  // Rouge vif
            3: { color: "#FFD166" },                  // Jaune doré
            4: { color: "#79ADDC" },                  // Bleu ciel
            5: { color: "#FF9E80" },                  // Orange corail
            6: { color: "#CCCCFF" },                  // Lavande
            7: { color: "#D4A5A5" },                  // Rose poussiéreux
            8: { color: "#FFFFFF", fontWeight: "bold" },     // Blanc gras
            9: { color: "#FFFFFF", fontStyle: "italic" },    // Blanc italique
            10: { color: "#AAFFAA", fontWeight: "bold" },    // Vert clair gras
            11: { color: "#FFAAAA", fontStyle: "italic" }    // Rouge clair italique
        };
        
        // Obtenir le style sélectionné ou utiliser le style par défaut
        const selectedStyle = styles[style] || styles[0];
        
        // Créer un conteneur pour chaque ligne du terminal
        const logLine = document.createElement("div");
        logLine.className = "terminal-line";
        logLine.style.display = "flex";
        logLine.style.fontFamily = "monospace"; // Police à chasse fixe
        logLine.style.marginBottom = "2px";
        
        // Animation de fondu
        logLine.style.opacity = "0";
        logLine.style.transition = "opacity 0.3s ease-in";
        
        // Créer le symbole du terminal comme une colonne fixe
        const promptColumn = document.createElement("div");
        promptColumn.className = "terminal-prompt-column";
        promptColumn.style.width = "25px"; // Largeur fixe
        promptColumn.style.flexShrink = "0"; // Empêche la réduction
        promptColumn.style.textAlign = "center"; // Centré dans sa colonne
        promptColumn.innerHTML = '<span style="color:#aaa; font-weight:bold;">&gt;</span>';
        
        // Créer le contenu du message avec le style spécifié
        const messageContent = document.createElement("div");
        messageContent.className = "terminal-content";
        messageContent.style.flexGrow = "1";
        messageContent.style.color = selectedStyle.color || "";
        messageContent.style.fontWeight = selectedStyle.fontWeight || "";
        messageContent.style.fontStyle = selectedStyle.fontStyle || "";
        messageContent.innerHTML = entry;
        
        // Assembler la ligne
        logLine.appendChild(promptColumn);
        logLine.appendChild(messageContent);
        
        // Ajouter la ligne au terminal
        outputElement.appendChild(logLine);
        
        // Déclencher l'animation de fondu après un bref délai
        setTimeout(() => {
            logLine.style.opacity = "1";
        }, 10);
        
        // Faire défiler vers le bas pour voir les nouveaux messages
        outputElement.scrollTop = outputElement.scrollHeight;
        
        // Stocker la dernière entrée
        lastEntry = entry;
    }

    // Fonction pour les animations de loot adaptée au nouveau format
    static displayLootAnimation(message, type = 'gold') {
        const outputElement = document.getElementById("output");
        
        // Créer un conteneur pour la ligne du terminal
        const logLine = document.createElement("div");
        logLine.className = "terminal-line";
        logLine.style.display = "flex";
        logLine.style.fontFamily = "monospace"; // Police à chasse fixe
        logLine.style.marginBottom = "2px";
        
        // Animation de fondu
        logLine.style.opacity = "0";
        logLine.style.transition = "opacity 0.3s ease-in";
        
        // Créer le symbole du terminal comme une colonne fixe
        const promptColumn = document.createElement("div");
        promptColumn.className = "terminal-prompt-column";
        promptColumn.style.width = "25px"; // Largeur fixe
        promptColumn.style.flexShrink = "0"; // Empêche la réduction
        promptColumn.style.textAlign = "center"; // Centré dans sa colonne
        promptColumn.innerHTML = '<span style="color:#aaa; font-weight:bold;">&gt;</span>';
        
        // Créer le contenu animé du message
        const messageContent = document.createElement("div");
        messageContent.className = "terminal-content";
        messageContent.style.flexGrow = "1";
        
        // Créer le span pour le contenu du message
        const lootSpan = document.createElement('span');
        lootSpan.style.color = type === 'gold' ? "#FFD700" : "#DA70D6"; // Or ou Orchidée
        lootSpan.style.fontWeight = "";
        lootSpan.style.display = "inline-block";
        lootSpan.innerHTML = message;
        
        // Ajouter une légère animation d'échelle avec CSS pour le loot
        lootSpan.style.transition = "transform 0.5s ease";
        
        messageContent.appendChild(lootSpan);
        
        // Assembler la ligne
        logLine.appendChild(promptColumn);
        logLine.appendChild(messageContent);
        
        // Ajouter la ligne au terminal
        outputElement.appendChild(logLine);
        
        // Déclencher l'animation de fondu après un bref délai
        setTimeout(() => {
            logLine.style.opacity = "1";
            
            // Ajouter un petit effet de grossissement après le fondu
            setTimeout(() => {
                lootSpan.style.transform = "scale(1.1)";
                
                // Puis revenir à la taille normale
                setTimeout(() => {
                    lootSpan.style.transform = "scale(1.0)"; // Explicitement à 1.0 pour garantir la taille normale
                }, 250);
            }, 300);
        }, 10);
        
        // Faire défiler vers le bas pour voir les nouveaux messages
        outputElement.scrollTop = outputElement.scrollHeight;
    }

    static displayCombatAnimation(message, styleType = 0) {
        const outputElement = document.getElementById("output");
        
        // Définition des styles disponibles (couleurs contrastées sur fond #1F0E08)
        const styles = {
            0: { color: "#FFFFFF" },                  // Blanc (par défaut)
            1: { color: "#77DD77" },                  // Vert clair
            2: { color: "#FF6B6B" },                  // Rouge vif
            3: { color: "#FFD166" },                  // Jaune doré
            4: { color: "#79ADDC" },                  // Bleu ciel
            5: { color: "#FF9E80" },                  // Orange corail
            6: { color: "#CCCCFF" },                  // Lavande
            7: { color: "#D4A5A5" },                  // Rose poussiéreux
            8: { color: "#FFFFFF", fontWeight: "bold" },     // Blanc gras
            9: { color: "#FFFFFF", fontStyle: "italic" },    // Blanc italique
            10: { color: "#AAFFAA", fontWeight: "bold" },    // Vert clair gras
            11: { color: "#FFAAAA", fontStyle: "italic" }    // Rouge clair italique
        };
    
        // S'assurer que le styleType est valide, sinon utiliser le style par défaut
        const style = styles[styleType] || styles[0];
    
        // Créer un conteneur pour la ligne du terminal
        const logLine = document.createElement("div");
        logLine.className = "terminal-line";
        logLine.style.display = "flex";
        logLine.style.fontFamily = "monospace"; // Police à chasse fixe
        logLine.style.marginBottom = "2px";
        
        // Animation de fondu
        logLine.style.opacity = "0";
        logLine.style.transition = "opacity 0.3s ease-in";
        
        // Créer le symbole du terminal comme une colonne fixe
        const promptColumn = document.createElement("div");
        promptColumn.className = "terminal-prompt-column";
        promptColumn.style.width = "25px"; // Largeur fixe
        promptColumn.style.flexShrink = "0"; // Empêche la réduction
        promptColumn.style.textAlign = "center"; // Centré dans sa colonne
        promptColumn.innerHTML = '<span style="color:#aaa; font-weight:bold;">&gt;</span>';
        
        // Créer le contenu animé du message
        const messageContent = document.createElement("div");
        messageContent.className = "terminal-content";
        messageContent.style.flexGrow = "1";
        
        // Créer le span pour le contenu du message avec le style sélectionné
        const animatedSpan = document.createElement('span');
        animatedSpan.style.color = style.color;
        if (style.fontWeight) animatedSpan.style.fontWeight = style.fontWeight;
        if (style.fontStyle) animatedSpan.style.fontStyle = style.fontStyle;
        animatedSpan.style.display = "inline-block";
        animatedSpan.innerHTML = message;
        
        // Ajouter une légère animation d'échelle avec CSS
        animatedSpan.style.transition = "transform 0.5s ease";
        
        messageContent.appendChild(animatedSpan);
        
        // Assembler la ligne
        logLine.appendChild(promptColumn);
        logLine.appendChild(messageContent);
        
        // Ajouter la ligne au terminal
        outputElement.appendChild(logLine);
        
        // Déclencher l'animation de fondu après un bref délai
        setTimeout(() => {
            logLine.style.opacity = "1";
            
            // Ajouter un petit effet de grossissement après le fondu
            setTimeout(() => {
                animatedSpan.style.transform = "scale(1.1)";
                
                // Puis revenir à la taille normale
                setTimeout(() => {
                    animatedSpan.style.transform = "scale(1.0)"; // Explicitement à 1.0 pour garantir la taille normale
                }, 250);
            }, 300);
        }, 10);
        
        // Faire défiler vers le bas pour voir les nouveaux messages
        outputElement.scrollTop = outputElement.scrollHeight;
    }

    static resetTerminal() {
        const outputElement = document.getElementById("output");
        outputElement.innerHTML = "<span style='color:#77ee77; font-weight:bold;'>- New Terminal -</span><br>";
    }

    static resetToggle() {
        const outputElement = document.getElementById("output");
        outputElement.scrollTop = outputElement.scrollHeight;

        var info = document.getElementById("info");
        var stats = document.getElementById("stats");
        var equipment = document.getElementById("equipment");

        var output = document.getElementById("output");
        var items = document.getElementById("items");
        var dialWindow = document.getElementById("dialogueWindow");

        document.getElementById("quests").style.display = "none";
        document.getElementById("shop").style.display = "none";

        document.getElementById("joystick-container").style.display = "block";
        document.getElementById("joystickBackButtonContainer").style.display = "none";

        info.style.display = "block";
        equipment.style.display = "none";
        stats.style.display = "none";

        dialWindow.style.display = "none";
        items.style.display = "none";
        output.style.display = "block";

        // dungeon crawler controls :
        document.getElementById("actionButtons").style.display = "block";
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // boutique, pas de prix pour le moment
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    displayItemsForSale(player) {
        var output = document.getElementById("output");
        var dialWindow = document.getElementById("dialogueWindow");
        output.style.display = "none";
        dialWindow.style.display = "none";

        // Afficher la boutique
        document.getElementById("shop").style.display = "block";

        // Mettre à jour le nom de la boutique
        const shopName = document.getElementById("shopName");
        shopName.textContent = this.spriteName;

        // Mettre à jour l'affichage de l'or
        const goldOutput = document.getElementById("ShopPlayerGoldOutput");
        if (goldOutput) {
            goldOutput.textContent = player.gold || 0;
        }

        const shopContent = document.getElementById("shopContent");
        
        // Afficher l'écran d'accueil avec les deux options
        shopContent.innerHTML = `
            <div style="height: 170px; width: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                <div style="font-size: 16px; color: #e8d5a9; margin-bottom: 20px; text-align: center;">
                    Welcome to ${this.spriteName}'s shop
                </div>
                <div style="display: flex; justify-content: center; gap: 20px;">
                    <button id="buy-option" style="
                        padding: 8px 20px; 
                        background-color: #205020; 
                        color: #e8d5a9; 
                        border: 1px solid #663300; 
                        cursor: pointer;
                        font-family: monospace;
                        text-transform: uppercase;
                        box-shadow: inset 1px 1px 0px rgba(255, 255, 255, 0.2), inset -1px -1px 0px rgba(0, 0, 0, 0.4);
                    ">BUY ITEMS</button>
                    <button id="sell-option" style="
                        padding: 8px 20px; 
                        background-color: #793020; 
                        color: #e8d5a9; 
                        border: 1px solid #663300; 
                        cursor: pointer;
                        font-family: monospace;
                        text-transform: uppercase;
                        box-shadow: inset 1px 1px 0px rgba(255, 255, 255, 0.2), inset -1px -1px 0px rgba(0, 0, 0, 0.4);
                    ">SELL ITEMS</button>
                </div>
                <div style="margin-top: 20px;">
                    <button id="back-button" style="
                        padding: 5px 10px; 
                        background-color: #140c1c; 
                        color: #e8d5a9; 
                        border: 1px solid #663300; 
                        cursor: pointer;
                        font-family: monospace;
                    ">BACK</button>
                </div>
            </div>
        `;
        
        // Ajouter l'écouteur d'événement pour l'option d'achat
        document.getElementById('buy-option').addEventListener('click', () => {
            this.displayBuyInterface(player);
        });
        
        // Ajouter l'écouteur d'événement pour l'option de vente
        document.getElementById('sell-option').addEventListener('click', () => {
            this.displaySellInterface(player);
        });
        
        // Ajouter l'écouteur d'événement pour le bouton de retour
        document.getElementById('back-button').addEventListener('click', () => {
            Sprite.resetToggle();
        });
    }

    // Méthode pour afficher l'interface d'achat
    displayBuyInterface(player) {
        const shopContent = document.getElementById("shopContent");
        const goldOutput = document.getElementById("ShopPlayerGoldOutput");
        
        if (this.spriteSell && this.spriteSell.length > 0) {
            // Division en deux colonnes identique à l'inventaire
            shopContent.innerHTML = `
                <div style="display: flex; height: 170px; width: 100%;">
                    <!-- Liste des objets (40% de la largeur) -->
                    <div id="shop-list" style="width: 40%; height: 95%; border-right: 1px solid #663300; overflow-y: auto; padding-right: 5px;">
                        <!-- Les items seront listés ici -->
                    </div>
                    
                    <!-- Détails de l'objet sélectionné (60% de la largeur) -->
                    <div id="shop-details" style="width: 60%; height: 100%; display: flex; flex-direction: column;">
                        <!-- Les détails seront affichés ici -->
                        <div id="shop-details-placeholder" style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; color: #8a7b6c;">
                            <div>Select an item</div>
                            <div>to view details</div>
                        </div>
                    </div>
                </div>
            `;
            
            const shopList = document.getElementById("shop-list");
            
            // Générer la liste des objets
            this.spriteSell.forEach((itemId, index) => {
                const item = Item.getItemById(itemId);
                if (!item) return;
                
                // Déterminer l'icône en fonction du slot
                let itemIcon = item.icon;
                
                // Afficher le prix ou "FREE" si le prix est 0 ou non défini
                const priceDisplay = item.price > 0 ? `${item.price} gp` : 'FREE';
                
                const itemElement = document.createElement("div");
                itemElement.className = "shop-item-entry";
                itemElement.setAttribute("data-index", index);
                itemElement.setAttribute("data-item-id", item.id);
                itemElement.style.cssText = `
                    display: flex; 
                    align-items: center; 
                    margin-top: 3px;
                    margin-bottom: 3px: 
                    cursor: pointer; 
                    background-color: #140c1c; 
                    border: 1px solid #663300;
                    width: 100%;
                `;
                
                itemElement.innerHTML = `
                    <img src="${itemIcon}" style="width: 20px; height: 20px; margin-right: 5px;">
                    <span style="flex-grow: 1; font-size: 13px; color: #cccccc; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.name}</span>
                    <span style="color: #ffcc00; font-weight: bold;">${priceDisplay}</span>
                `;
                
                itemElement.addEventListener('click', () => {
                    // Désélectionner tous les autres éléments
                    document.querySelectorAll('.shop-item-entry').forEach(e => {
                        e.style.borderColor = '#663300';
                        e.style.backgroundColor = '#140c1c';
                    });
                    
                    // Mettre en évidence l'élément sélectionné
                    itemElement.style.borderColor = '#ffaa00';
                    itemElement.style.backgroundColor = '#331a0c';
                    
                    // Afficher les détails
                    this.showShopItemDetails(item, player, index);
                    
                    // Cacher le placeholder
                    const placeholder = document.getElementById('shop-details-placeholder');
                    if (placeholder) {
                        placeholder.style.display = 'none';
                    }
                });
                
                shopList.appendChild(itemElement);
            });
            
            // Sélectionner automatiquement le premier élément
            const firstItem = shopList.querySelector('.shop-item-entry');
            if (firstItem) {
                firstItem.click();
            }
        } else {
            shopContent.innerHTML = `
                <div style="height: 170px; width: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                    <div style="padding: 10px; text-align: center; color: #8a7b6c;">No items for sale</div>
                    <div style="margin-top: 20px;">
                        <button id="return-to-shop" style="
                            padding: 5px 10px; 
                            background-color: #140c1c; 
                            color: #e8d5a9; 
                            border: 1px solid #663300; 
                            cursor: pointer;
                            font-family: monospace;
                        ">BACK</button>
                    </div>
                </div>
            `;
            
            // Ajouter l'écouteur d'événement pour le bouton de retour
            document.getElementById('return-to-shop').addEventListener('click', () => {
                this.displayItemsForSale(player);
            });
        }
    }

    // Méthode pour afficher l'interface de vente
    displaySellInterface(player) {
        const shopContent = document.getElementById("shopContent");
        const goldOutput = document.getElementById("ShopPlayerGoldOutput");
        
        if (player.inventory && player.inventory.length > 0) {
            // Division en deux colonnes identique à l'inventaire
            shopContent.innerHTML = `
                <div style="display: flex; height: 170px; width: 100%;">
                    <!-- Liste des objets (40% de la largeur) -->
                    <div id="sell-list" style="width: 40%; height: 95%; border-right: 1px solid #663300; overflow-y: auto; padding-right: 5px;">
                        <!-- Les items seront listés ici -->
                    </div>
                    
                    <!-- Détails de l'objet sélectionné (60% de la largeur) -->
                    <div id="sell-details" style="width: 60%; height: 100%; display: flex; flex-direction: column;">
                        <!-- Les détails seront affichés ici -->
                        <div id="sell-details-placeholder" style="display: flex; flex-direction: column; justify-content: center; align-items: center; height: 100%; color: #8a7b6c;">
                            <div>Select an item</div>
                            <div>to sell</div>
                        </div>
                    </div>
                </div>
            `;
            
            const sellList = document.getElementById("sell-list");
            
            // Générer la liste des objets que le joueur peut vendre
            player.inventory.forEach((item, index) => {
                if (!item) return;
                
                // Déterminer l'icône en fonction du slot
                let itemIcon = item.icon;
                
                // Calculer le prix de vente (moitié du prix d'achat, minimum 1 gp)
                const sellPrice = item.price > 0 ? Math.max(Math.floor(item.price / 2), 1) : 1;
                
                // Ne pas permettre de vendre des objets équipés
                const isEquipped = item.equipped;
                const bgColor = isEquipped ? 'rgba(20, 20, 20, 0.7)' : '#140c1c';
                
                const itemElement = document.createElement("div");
                itemElement.className = "sell-item-entry";
                itemElement.setAttribute("data-index", index);
                itemElement.setAttribute("data-equipped", isEquipped.toString());
                itemElement.style.cssText = `
                    display: flex; 
                    align-items: center; 
                    margin-top: 3px;
                    margin-bottom: 3px: 
                    cursor: ${isEquipped ? 'not-allowed' : 'pointer'}; 
                    background-color: ${bgColor}; 
                    border: 1px solid #663300;
                    width: 100%;
                    opacity: ${isEquipped ? '0.7' : '1'};
                `;
                
                itemElement.innerHTML = `
                    <img src="${itemIcon}" style="width: 20px; height: 20px; margin-right: 5px;">
                    <span style="flex-grow: 1; font-size: 13px; color: #cccccc; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.name}${isEquipped ? ' (equipped)' : ''}</span>
                    <span style="color: #ffcc00; font-weight: bold;">${sellPrice} gp</span>
                `;
                
                if (!isEquipped) {
                    itemElement.addEventListener('click', () => {
                        // Désélectionner tous les autres éléments
                        document.querySelectorAll('.sell-item-entry').forEach(e => {
                            e.style.borderColor = '#663300';
                            e.style.backgroundColor = '#140c1c';
                        });
                        
                        // Mettre en évidence l'élément sélectionné
                        itemElement.style.borderColor = '#ffaa00';
                        itemElement.style.backgroundColor = '#331a0c';
                        
                        // Afficher les détails
                        this.showSellItemDetails(item, player, index, sellPrice);
                        
                        // Cacher le placeholder
                        const placeholder = document.getElementById('sell-details-placeholder');
                        if (placeholder) {
                            placeholder.style.display = 'none';
                        }
                    });
                }
                
                sellList.appendChild(itemElement);
            });
            
            // Sélectionner automatiquement le premier élément non équipé
            const firstItem = sellList.querySelector('.sell-item-entry[data-equipped="false"]');
            if (firstItem) {
                firstItem.click();
            }
        } else {
            shopContent.innerHTML = `
                <div style="height: 170px; width: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center;">
                    <div style="padding: 10px; text-align: center; color: #8a7b6c;">Your inventory is empty</div>
                    <div style="margin-top: 20px;">
                        <button id="return-to-shop" style="
                            padding: 5px 10px; 
                            background-color: #140c1c; 
                            color: #e8d5a9; 
                            border: 1px solid #663300; 
                            cursor: pointer;
                            font-family: monospace;
                        ">BACK</button>
                    </div>
                </div>
            `;
            
            // Ajouter l'écouteur d'événement pour le bouton de retour
            document.getElementById('return-to-shop').addEventListener('click', () => {
                this.displayItemsForSale(player);
            });
        }
    }

    // Méthode pour afficher les détails d'un objet à acheter
    showShopItemDetails(item, player, index) {
        const shopDetails = document.getElementById('shop-details');
        if (!shopDetails) return;
        
        // Déterminer l'icône en fonction du slot
        let itemIcon = item.icon;
                        
        // Type d'équipement
        let slotName = "";
        switch(item.slot) {
            case 1: slotName = "Weapon"; break;
            case 2: slotName = "Armor"; break;
            default: slotName = "Item"; break;
        }
        
        // Construire la chaîne HTML des statistiques
        let statsHTML = "";
        
        // Fonction helper pour ajouter une stat avec la bonne couleur
        const addStat = (value, name) => {
            if (value !== 0) {
                const sign = value > 0 ? "+" : "";
                const color = value > 0 ? "#66ff66" : "#ff6666";
                statsHTML += `<div style="margin: 2px 0;"><span style="color: ${color};">${sign}${value}</span> ${name}</div>`;
            }
        };
        
        // Ajouter toutes les stats dans l'ordre
        addStat(item.strength, "Strength");
        addStat(item.dexterity, "Dexterity");
        addStat(item.intellect, "Intellect");
        addStat(item.might, "Might");
        addStat(item.magic, "Magic");
        addStat(item.dodge, "Dodge");
        addStat(item.criti, "Crit.");
        addStat(item.armor, "Armor");
        
        if (item.power !== 0) {
            statsHTML += `<div style="margin: 2px 0;">${item.power} Power</div>`;
        }
        
        // Si aucune statistique n'est définie
        if (statsHTML === "") {
            statsHTML = "<div style='color: #8a7b6c;'>No stats available</div>";
        }
        
        // Afficher le prix ou "FREE" si le prix est 0 ou non défini
        const priceDisplay = item.price > 0 ? `${item.price} gp` : 'FREE';
        const buyText = item.price > 0 ? 'BUY' : 'TAKE';
        
        // Vérifier si le joueur a assez d'or
        const canAfford = (player.gold || 0) >= item.price;
        const buttonClass = !canAfford && item.price > 0 ? 'cannot-afford' : '';
        
        // Structure avec positions absolues et défilement central
        shopDetails.innerHTML = `
            <!-- Conteneur principal avec position relative pour servir de référence aux positions absolues -->
            <div style="position: relative; width: 103%; height: 95%;">
                <!-- Division 1: Nom et icône (position absolue en haut) -->
                <div style="position: absolute; top: 0; left: 0; right: 0; background-color: #140c1c; z-index: 2; border-bottom: 1px solid #553311; padding-bottom: 5px;">
                    <div style="display: flex; align-items: center; width: 100%;padding : 5px;">
                        <img src="${itemIcon}" style="width: 28px; height: 28px; margin-right: 10px;">
                        <div style="width: calc(100% - 38px);">
                            <div style="font-size: 15px; font-weight: bold; color: #e8d5a9; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.name}</div>
                            <div style="font-size: 12px; color: #a89986;">${slotName}</div>
                        </div>
                    </div>
                </div>
                
                <!-- Division 3: Prix et bouton d'achat (position absolue en bas) -->
                <div style="position: absolute; bottom: 0; left: 0; right: 0; background-color: #140c1c; z-index: 2; border-top: 1px solid #553311; padding-top: 5px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                        <div style="margin-left : 5px;font-size: 14px; color: #ffcc00; font-weight: bold;">
                            Price: ${priceDisplay}
                        </div>
                        <button id="buy-item-btn" class="${buttonClass}" style="
                            margin-right:5px;
                            margin-bottom:6px;
                            padding: 6px 12px; 
                            background-color: ${canAfford || item.price === 0 ? '#205020' : '#501102'}; 
                            color: #e8d5a9; 
                            border: 1px solid #663300; 
                            cursor: ${canAfford || item.price === 0 ? 'pointer' : 'not-allowed'};
                            font-family: monospace;
                            text-transform: uppercase;
                            box-shadow: inset 1px 1px 0px rgba(255, 255, 255, 0.2), inset -1px -1px 0px rgba(0, 0, 0, 0.4);
                            width: auto;
                        ">
                            ${buyText}
                        </button>
                    </div>
                </div>
                
                <!-- Division 2: Statistiques (zone avec défilement) -->
                <div style="margin-left : 5px; position: absolute; top: 45px; bottom: 40px; left: 0; right: 0; overflow-y: scroll; font-size: 13px; padding: 5px 5px 5px 0;">
                    ${statsHTML}
                </div>
            </div>
        `;
        
        // Ajouter l'écouteur d'événement pour le bouton d'achat
        document.getElementById('buy-item-btn').addEventListener('click', () => {
            if (item.price > 0) {
                // Vérifier si le joueur a assez d'or
                if ((player.gold || 0) >= item.price) {
                    // Déduire le coût
                    player.gold -= item.price;
                    
                    // Ajouter l'objet à l'inventaire
                    this.addItemToInventory(item, player);
                    
                    // Retirer l'objet de la liste de vente
                    this.spriteSell = this.spriteSell.filter(itemId => itemId !== item.id);
                    
                    // Message de confirmation
                    Sprite.terminalLog(`You bought ${item.name} for ${item.price} gp.`);
                    
                    // Actualiser l'or affiché
                    const goldOutput = document.getElementById("ShopPlayerGoldOutput");
                    if (goldOutput) {
                        goldOutput.textContent = player.gold || 0;
                    }
                    
                    // Recharger l'interface d'achat
                    this.displayBuyInterface(player);
                } else {
                    Sprite.terminalLog(`You don't have enough gold to buy ${item.name}.`);
                }
            } else {
                // Donner gratuitement
                this.giveItemToPlayer(item, player);
                Sprite.terminalLog(`You received ${item.name} for free.`);
                
                // Recharger l'interface d'achat
                this.displayBuyInterface(player);
            }
        });
    }

    // Méthode pour afficher les détails d'un objet à vendre
    showSellItemDetails(item, player, index, sellPrice) {
        const sellDetails = document.getElementById('sell-details');
        if (!sellDetails) return;
        
        // DEBUG: Vérifier l'état initial
        console.log('=== showSellItemDetails - DÉBUT ===');
        console.log('Item à vendre:', item);
        console.log('Item ID:', item?.id);
        console.log('Player inventory (avant vente):', player.inventory);
        console.log('Index de l\'item dans l\'inventaire:', index);
        console.log('Sprite spriteSell (avant vente):', this.spriteSell);
        console.log('Type de this.spriteSell:', typeof this.spriteSell);
        console.log('Marchand (this):', this);
        
        // Déterminer l'icône en fonction du slot
        let itemIcon = item.icon;
        let itemId = item.id;
        
        console.log('Variable itemId extraite:', itemId);
                        
        // Type d'équipement
        let slotName = "";
        switch(item.slot) {
            case 1: slotName = "Weapon"; break;
            case 2: slotName = "Armor"; break;
            default: slotName = "Item"; break;
        }
        
        // Construire la chaîne HTML des statistiques
        let statsHTML = "";
        
        // Fonction helper pour ajouter une stat avec la bonne couleur
        const addStat = (value, name) => {
            if (value !== 0) {
                const sign = value > 0 ? "+" : "";
                const color = value > 0 ? "#66ff66" : "#ff6666";
                statsHTML += `<div style="margin: 2px 0;"><span style="color: ${color};">${sign}${value}</span> ${name}</div>`;
            }
        };
        
        // Ajouter toutes les stats dans l'ordre
        addStat(item.strength, "Strength");
        addStat(item.dexterity, "Dexterity");
        addStat(item.intellect, "Intellect");
        addStat(item.might, "Might");
        addStat(item.magic, "Magic");
        addStat(item.dodge, "Dodge");
        addStat(item.criti, "Crit.");
        addStat(item.armor, "Armor");
        
        if (item.power !== 0) {
            statsHTML += `<div style="margin: 2px 0;">${item.power} Power</div>`;
        }
        
        // Si aucune statistique n'est définie
        if (statsHTML === "") {
            statsHTML = "<div style='color: #8a7b6c;'>No stats available</div>";
        }
        
        // Structure avec positions absolues et défilement central
        sellDetails.innerHTML = `
            <!-- Conteneur principal avec position relative pour servir de référence aux positions absolues -->
            <div style="position: relative; width: 103%; height: 160px;">
                <!-- Division 1: Nom et icône (position absolue en haut) -->
                <div style="position: absolute; top: 0; left: 0; right: 0; background-color: #140c1c; z-index: 2; border-bottom: 1px solid #553311; padding-bottom: 5px;">
                    <div style="display: flex; align-items: center; width: 100%;padding : 5px;">
                        <img src="${itemIcon}" style="width: 28px; height: 28px; margin-right: 10px;">
                        <div style="width: calc(100% - 38px);">
                            <div style="font-size: 15px; font-weight: bold; color: #e8d5a9; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.name}</div>
                            <div style="font-size: 12px; color: #a89986;">${slotName}</div>
                        </div>
                    </div>
                </div>
                
                <!-- Division 3: Prix et bouton de vente (position absolue en bas) -->
                <div style="position: absolute; bottom: 0; left: 0; right: 0; background-color: #140c1c; z-index: 2; border-top: 1px solid #553311; padding-top: 5px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; width: 100%;">
                        <div style="margin-left : 5px;font-size: 14px; color: #ffcc00; font-weight: bold;">
                            Sell price: ${sellPrice} gp
                        </div>
                        <button id="sell-item-btn" style="
                            margin-right:5px;
                            margin-bottom:6px;
                            padding: 6px 12px; 
                            background-color: #793020; 
                            color: #e8d5a9; 
                            border: 1px solid #663300; 
                            cursor: pointer;
                            font-family: monospace;
                            text-transform: uppercase;
                            box-shadow: inset 1px 1px 0px rgba(255, 255, 255, 0.2), inset -1px -1px 0px rgba(0, 0, 0, 0.4);
                            width: auto;
                        ">
                            SELL
                        </button>
                    </div>
                </div>
                
                <!-- Division 2: Statistiques (zone avec défilement) -->
                <div style="margin-left : 5px; position: absolute; top: 45px; bottom: 40px; left: 0; right: 0; overflow-y: scroll; font-size: 13px; padding: 5px 5px 5px 0;">
                    ${statsHTML}
                </div>
            </div>
        `;
        
        // Ajouter l'écouteur d'événement pour le bouton de vente
        document.getElementById('sell-item-btn').addEventListener('click', () => {
            console.log('\n--- BOUTON VENTE CLIQUÉ ---');
            console.log('Tentative de vente de l\'item:', item);
            console.log('Index de l\'item:', index);
            console.log('Prix de vente:', sellPrice);
            
            // Obtenir l'or de la vente
            console.log('Or du joueur avant vente:', player.gold);
            player.gold += sellPrice;
            console.log('Or du joueur après vente:', player.gold);
            
            // Vérifier l'état de spriteSell avant modification
            console.log('spriteSell avant ajout:', this.spriteSell);
            console.log('Type de spriteSell:', typeof this.spriteSell);
            console.log('Est-ce un tableau?', Array.isArray(this.spriteSell));
            
            // Initialiser spriteSell si nécessaire
            if (!this.spriteSell) {
                console.log('spriteSell est null/undefined, initialisation...');
                this.spriteSell = [];
            }
            
            // Ajouter l'objet aux objets en vente du marchand
            console.log('Ajout de l\'itemId à spriteSell:', itemId);
            this.spriteSell.push(itemId);
            console.log('spriteSell après ajout:', this.spriteSell);
            
            // Vérifier l'inventaire avant suppression
            console.log('Inventaire du joueur avant suppression:', player.inventory);
            console.log('Item à l\'index', index, ':', player.inventory[index]);
            
            // Supprimer l'objet de l'inventaire
            const removedItem = player.inventory.splice(index, 1);
            console.log('Item supprimé de l\'inventaire:', removedItem);
            console.log('Inventaire du joueur après suppression:', player.inventory);
            
            // Vérifier si l'item existe encore dans le système global
            console.log('Vérification de l\'existence de l\'item dans le système global...');
            if (typeof Item !== 'undefined' && Item.getItemById) {
                const globalItem = Item.getItemById(itemId);
                console.log('Item trouvé dans le système global?', globalItem);
            } else {
                console.log('Item.getItemById n\'est pas disponible ou Item n\'est pas défini');
            }
            
            // Message de confirmation
            Sprite.terminalLog(`You sold ${item.name} for ${sellPrice} gp.`);
            
            // Actualiser l'or affiché
            const goldOutput = document.getElementById("ShopPlayerGoldOutput");
            if (goldOutput) {
                goldOutput.textContent = player.gold || 0;
            }
            
            // Mettre à jour les statistiques du joueur
            console.log('Mise à jour des statistiques du joueur...');
            player.statsUpdate(player);
            
            // Vérifier l'état final
            console.log('\n--- ÉTAT FINAL ---');
            console.log('spriteSell final:', this.spriteSell);
            console.log('Inventaire final du joueur:', player.inventory);
            console.log('Or final du joueur:', player.gold);
            console.log('=== showSellItemDetails - FIN ===\n');
            
            // Recharger l'interface de vente
            this.displaySellInterface(player);
        });
    }


    addItemToInventory(item, player) {
        player.inventory.push(item);
    }

    giveItemToPlayer(item, player) {
        if (player) {
            console.log("Adding item to inventory:", item.name);
            this.addItemToInventory(item, player);

            console.log("Player's inventory:", player.inventory);

            this.spriteSell = this.spriteSell.filter(itemId => itemId !== item.id);

            this.displayItemsForSale(player);
        } else {
            console.log("Player not defined");
        }
    }

    // Dans Sprites.js, ajoutez cette nouvelle méthode
    sellItemToPlayer(item, player) {
        if (player) {
            // Vérifier si le joueur a assez d'argent
            if (player.gold >= item.price) {
                // Déduire l'argent
                player.gold -= item.price;
                console.log(player.gold);
                
                // Utiliser la méthode existante pour ajouter l'objet à l'inventaire
                this.giveItemToPlayer(item, player);
                
                // Mettre à jour l'affichage de l'or
                player.statsUpdate(player);
                
                // Message d'achat
                Sprite.terminalLog(`Vous avez acheté ${item.name} pour ${item.price} pièces d'or.`);
            } else {
                // Message si le joueur n'a pas assez d'argent
                Sprite.terminalLog("Vous n'avez pas assez d'or pour acheter cet objet!");
            }
        } else {
            console.log("Player not defined");
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Gestion des dialogues
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // peut etre réduit
    countDialogues() {
        return this.spriteTalk.length;
    }

    // XYZ
    talk() {
        Sprite.resetToggle();
    
        // Activer le blocage des commandes pendant le dialogue
        commandBlocking = true;
    
        const dialogue = document.getElementById("dialogue");
        const faceOutput = document.getElementById("faceOutput");
        const dialWindow = document.getElementById("dialogueWindow");
        const outputElement = document.getElementById("output");
        const nextButton = document.getElementById("nextButton");
    
        // Réinitialiser le contenu de la fenêtre de dialogue
        dialogue.innerHTML = "";
        faceOutput.src = "";
    
        // Retirer tout ancien gestionnaire d'événements du bouton "Next"
        const newNextButton = nextButton.cloneNode(true);
        nextButton.parentNode.replaceChild(newNextButton, nextButton);
    
        outputElement.style.display = "none";
        dialWindow.style.display = "block";
    
        let currentDialogue = 0;
        let allDialoguesLog = ''; // Stocker tous les dialogues pour le log
    
        // Variable pour stocker la référence de l'écouteur actuel
        let activeKeyListener = null;
    
        const showNextDialogue = () => {
            if (currentDialogue < this.spriteTalk.length) {
                const [face, name, entry] = this.spriteTalk[currentDialogue];
    
                if (face && name && entry) {
                    dialogue.innerHTML = `<font style="font-weight: bold;">${name} </font> :<font style="font-style: italic;"><br><br>${entry}</font>`;
                    const imgElement = document.getElementById(face);
                    faceOutput.src = imgElement ? imgElement.src : '';
                    allDialoguesLog += `<font style="font-weight: bold;">${name} </font> :<font style="font-style: italic;"><br><br>${entry}</font><br>`;
                }
    
                currentDialogue++;
            } else {
                // Fin du dialogue - retirer l'écouteur d'événements
                if (activeKeyListener) {
                    document.removeEventListener("keydown", activeKeyListener);
                    activeKeyListener = null;
                }
                
                for (let i = 0; i < this.spriteTalk.length; i++) {
                    const [face, name, entry] = this.spriteTalk[i];
                    Sprite.terminalLog(`${name} :</br>${entry}</br>`, 4);
                }
    

                outputElement.style.display = "block";
                dialWindow.style.display = "none";

                setTimeout(() => {
                    commandBlocking = false;
                }, 500);
            }
        };
    
        // Écouteur pour les touches clavier
        const keyListener = (event) => {
            if (event.code === "Space" || event.key.toLowerCase() === "f") {
                event.preventDefault();
                showNextDialogue();
            }
        };
    
        // S'assurer qu'aucun ancien écouteur n'est actif
        if (activeKeyListener) {
            document.removeEventListener("keydown", activeKeyListener);
        }
        
        // Stocker et ajouter le nouvel écouteur
        activeKeyListener = keyListener;
        
        // Ajout des event listeners
        newNextButton.addEventListener("click", showNextDialogue);
        document.addEventListener("keydown", activeKeyListener);
    
        if (currentDialogue === 0) {
        // Affiche le premier dialogue immédiatement
        showNextDialogue();
        }

    }

    

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Animation de combat
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    async startAttackAnimation() {
        this.spriteFlash = 200;
        await new Promise((resolve) => setTimeout(resolve, 200));
        this.spriteFlash = 0;
    }

    async startSpriteFlash() {
        this.spriteFlash = 200;
        await new Promise((resolve) => setTimeout(resolve, 200));
        this.spriteFlash = 0;
    }

    // Méthode statique pour mettre à jour les valeurs du sprite de combat
    static updateCombatAnimationSprite(params) {
        if (Sprite.combatAnimationSprite) {
            for (let key in params) {
                if (Sprite.combatAnimationSprite.hasOwnProperty(key)) {
                    Sprite.combatAnimationSprite[key] = params[key];
                    console.log(params[key]);
                }
            }
        } else {
            console.error("Combat animation sprite not initialized.");
        }
    }

    // recul au contact de l'ennemi
    static recoilPlayer(player) {
        // Constants pour le recul
        const recoilDistance = 800; // Distance de recul en pixels
        const recoilDuration = 300; // Durée totale de l'animation en millisecondes

        // Calcul de l'angle en degrés
        const angleDeg = (player.rot * 180 / Math.PI + 360) % 360;

        // Détermination de la direction de recul basée sur l'angle
        const recoilDirections = [{
                min: 337.5,
                max: 360,
                dx: -1,
                dy: 0
            }, // Est
            {
                min: 0,
                max: 22.5,
                dx: -1,
                dy: 0
            }, // Est
            {
                min: 22.5,
                max: 67.5,
                dx: -1,
                dy: 1
            }, // Nord-Est
            {
                min: 67.5,
                max: 112.5,
                dx: 0,
                dy: 1
            }, // Nord
            {
                min: 112.5,
                max: 157.5,
                dx: 1,
                dy: 1
            }, // Nord-Ouest
            {
                min: 157.5,
                max: 202.5,
                dx: 1,
                dy: 0
            }, // Ouest
            {
                min: 202.5,
                max: 247.5,
                dx: 1,
                dy: -1
            }, // Sud-Ouest
            {
                min: 247.5,
                max: 292.5,
                dx: 0,
                dy: -1
            }, // Sud
            {
                min: 292.5,
                max: 337.5,
                dx: -1,
                dy: -1
            } // Sud-Est
        ];

        let dx = 0,
            dy = 0;

        for (const direction of recoilDirections) {
            if (angleDeg >= direction.min && angleDeg < direction.max) {
                dx = direction.dx;
                dy = direction.dy;
                break;
            }
        }

        // Position initiale du joueur
        const initialX = player.x;
        const initialY = player.y;

        // Position de recul
        const recoilX = initialX + dx * recoilDistance;
        const recoilY = initialY + dy * recoilDistance;

        // Fonction pour animer le recul
        const animateRecoil = (progress) => {
            player.x = initialX + (recoilX - initialX) * progress;
            player.y = initialY + (recoilY - initialY) * progress;
        };

        // Démarrer l'animation
        let startTime = null;
        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = elapsed / recoilDuration;
            if (progress < 1) {
                animateRecoil(progress);
                requestAnimationFrame(step);
            } else {
                // Assurer la position finale correcte
                player.x = recoilX;
                player.y = recoilY;
            }
        };
        requestAnimationFrame(step);
    }

    // Méthode pour invoquer le sprite d'animation
    // Delay est fixé à 150ms par défaut
    invokeAnimationSprite(player, usedTexture, delay = 150) {
        // Stocker la position initiale du sprite de combat
        const initialCombatSpritePosition = {
            x: Sprite.combatAnimationSprite.x,
            y: Sprite.combatAnimationSprite.y
        };

        // Mise à jour du sprite de combat pour l'effet cosmétique
        Sprite.updateCombatAnimationSprite({
            x: (player.x + this.x) / 2, // Nouvelle position x
            y: (player.y + this.y) / 2, // Nouvelle position y
            spriteTexture: usedTexture, // Nouvelle texture
        });

        // Retourner le sprite de combat à sa position initiale après le délai spécifié
        setTimeout(() => {
            Sprite.updateCombatAnimationSprite({
                x: initialCombatSpritePosition.x,
                y: initialCombatSpritePosition.y,
                texture: 0,
            });
        }, delay);
    }

    hitAnimation(player) {
        // Constants pour le recul
        const recoilDistance = 600; // Distance de recul en pixels
        const recoilDuration = 750; // Durée totale de l'animation en millisecondes

        // Calcul de l'angle en degrés
        const angleDeg = (player.rot * 180 / Math.PI + 360) % 360;

        // Détermination du quadrant en fonction de l'angle
        const quadrants = [{
                min: 337.5,
                max: 360,
                name: "est"
            },
            {
                min: 0,
                max: 22.5,
                name: "est"
            },
            {
                min: 22.5,
                max: 67.5,
                name: "nord-est"
            },
            {
                min: 67.5,
                max: 112.5,
                name: "nord"
            },
            {
                min: 112.5,
                max: 157.5,
                name: "nord-ouest"
            },
            {
                min: 157.5,
                max: 202.5,
                name: "ouest"
            },
            {
                min: 202.5,
                max: 247.5,
                name: "sud-ouest"
            },
            {
                min: 247.5,
                max: 292.5,
                name: "sud"
            },
            {
                min: 292.5,
                max: 337.5,
                name: "sud-est"
            }
        ];

        let quadrantName = "";
        for (const quadrant of quadrants) {
            if (angleDeg >= quadrant.min && angleDeg < quadrant.max) {
                quadrantName = quadrant.name;
                break;
            }
        }

        // Directions prédéfinies pour chaque quadrant
        const recoilDirections = {
            "est": {
                dx: 1,
                dy: 0
            },
            "nord-est": {
                dx: 1,
                dy: -1
            },
            "nord": {
                dx: 0,
                dy: -1
            },
            "nord-ouest": {
                dx: -1,
                dy: -1
            },
            "ouest": {
                dx: -1,
                dy: 0
            },
            "sud-ouest": {
                dx: -1,
                dy: 1
            },
            "sud": {
                dx: 0,
                dy: 1
            },
            "sud-est": {
                dx: 1,
                dy: 1
            }
        };

        const {
            dx,
            dy
        } = recoilDirections[quadrantName];

        // Position initiale de l'ennemi
        const initialX = this.x;
        const initialY = this.y;

        // Position de recul
        const recoilX = initialX + dx * recoilDistance;
        const recoilY = initialY + dy * recoilDistance;

        // Fonction de facilité pour l'effet de rebond
        const easeOutBounce = (t) => {
            const n1 = 7.5625;
            const d1 = 2.75;
            if (t < 1 / d1) return n1 * t * t;
            if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
            if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
            return n1 * (t -= 2.625 / d1) * t + 0.984375;
        };

        // Fonction pour animer le recul et le retour avec effet de rebond
        const animateRecoil = (progress) => {
            const easedProgress = easeOutBounce(progress);
            if (progress < 0.5) {
                // Première moitié de l'animation: recul
                this.x = initialX + (recoilX - initialX) * easedProgress;
                this.y = initialY + (recoilY - initialY) * easedProgress;
            } else {
                // Deuxième moitié de l'animation: retour à la position initiale
                this.x = recoilX + (initialX - recoilX) * easedProgress;
                this.y = recoilY + (initialY - recoilY) * easedProgress;
            }
        };

        // Démarrer l'animation
        let startTime = null;
        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = elapsed / recoilDuration;
            if (progress < 1) {
                animateRecoil(progress);
                requestAnimationFrame(step);
            } else {
                // Assurer la position finale correcte
                this.x = initialX;
                this.y = initialY;
            }
        };
        requestAnimationFrame(step);
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Gestion Combat Sprite
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    attack(target) {
        if (target.armor >= this.dmg) {
            let entry = "Your armor absorbs all the damages.";
            Sprite.terminalLog(entry, 1);
        } else {
            let entry =
                "The opponent attacks :" +
                (this.dmg - target.armor) +
                "dmg";
            Sprite.terminalLog(entry, 2);
            Raycaster.playerDamageFlash();
            target.hp -= this.dmg - target.armor;
        }
    }

    playerAttack(damage, criti, player) {
        const chanceCriti = Math.floor(Math.random() * 100);
        var factor = 1;

        if (chanceCriti < criti) {
            factor = 2
            Sprite.terminalLog('Critical hit !', 5);
            player.XPdexterity += 1;
        }

        this.hp -= damage * factor;

        this.invokeAnimationSprite(player, 19);
        this.hitAnimation(player)
        this.startSpriteFlash();

        player.XPstrength += 1;

        var entry =
            'You attack :' +
            damage * factor +
            " dmg";

        Sprite.displayCombatAnimation(entry, 1);
    }

    enemyAttackUpdate(player) {
        if (this.hp <= 0) {
            let entry = "The enemy is dead!";
            Sprite.terminalLog(entry, 3);
    
            // Générer le loot avec le système amélioré
            this.generateLoot(player);
    
            this.spriteType = 0;
            this.spriteTexture = 10;
            this.spriteTalk = [
                ["facePlayer", "Alakir", "It's dead..."]
            ];
            this.isBlocking = false;
    
            player.statsUpdate(player); // Mettre à jour l'affichage
        } else {
            const chanceEchec = Math.floor(Math.random() * 100);
    
            if (chanceEchec > player.dodge) {
                setTimeout(() => this.attack(player), 500);
            } else {

                Sprite.terminalLog('You dodge the attack.', 1)

                player.XPdexterity += 1;
                console.log(player.XPdexterity + "pts dexterity experience.");
            }
        }
        Sprite.resetToggle();
    }

    async combat(damage, criti, player) {
        if (player.turn == true) {
            player.turn = false;
            this.playerAttack(damage, criti, player);
            
            // Au lieu d'appeler enemyAttackUpdate immédiatement, nous laissons
            // le cycle d'attaque automatique s'en charger
            if (this.hp <= 0) {
                let entry = "The ennemy's dead !";
                Sprite.terminalLog(entry, 3);
                
                // Générer le loot
                this.generateLoot(player);
                
                this.spriteType = 0;
                this.spriteTexture = 10;
                this.spriteTalk = [
                    ["facePlayer", "Alakir", "It's dead..."]
                ];
                this.isBlocking = false;
                
                player.statsUpdate(player);
            } else {
                // Définir le moment de la dernière attaque pour synchroniser
                // avec le système d'attaque au contact
                this.lastAttackTime = Date.now();
            }
            
            Sprite.resetToggle();
            player.turn = true; // Rendre le tour au joueur après son attaque
        } else {
            console.log('not your turn');
        }
    }

    async combatSpell(player, target) {
        if (player.turn == true) {
            // console.log(player.spells[player.selectedSpell].name)
            player.spells[player.selectedSpell].cast(player, target);


            // Appeler la méthode pour invoquer le sprite d'animation
            this.invokeAnimationSprite(player, 20, 300);
            this.hitAnimation(player)
            this.enemyAttackUpdate(player);

            player.turn = false;
            player.combatSpell = false;
        } else {
            console.log('not your turn');
        }
    }

    async door(player, textureSet) {
        // Vérifier qu'aucune autre action n'est en cours
        if (player.isMoving || player.isRotating || player.isTeleporting || player.isDooring) {
            console.log("Cannot use door - player is busy");
            return;
        }
        
        // Marquer qu'une action de porte est en cours
        player.isDooring = true;
        
        try {
            // Store initial position for debugging
            const initialX = player.x;
            const initialY = player.y;
            
            // Determine floor texture to use
            let floor;
            if (textureSet === null) {
                floor = 1;
            } else if (textureSet) {
                // If a texture set is provided, use it
                floor = floorType;
            }
        
            // Calculate new position based on player's facing direction
            // The teleportation distance is 2 tiles (2 * tileSize)
            const tileSize = 1280; // Make sure this matches the game's tileSize
            const teleportDistance = 2 * tileSize;
            
            // Log current position and quadrant for debugging
            console.log(`Before teleport: x=${player.x}, y=${player.y}, quadrant=${player.quadrant}`);
            
            // Apply teleportation based on direction
            // Using more precise quadrant detection
            if (player.quadrant === "nord") {
                player.y -= teleportDistance;
            } else if (player.quadrant === "est") {
                player.x += teleportDistance;
            } else if (player.quadrant === "sud") {
                player.y += teleportDistance;
            } else if (player.quadrant === "ouest") {
                player.x -= teleportDistance;
            } else {
                console.log("Invalid quadrant or diagonal movement not supported");
                return; // Exit without making any changes
            }
            
            // Toggle ceiling rendering and update environment properties
            if (ceilingRender === true) {
                // Restore map default values
                ceilingRender = mapData.playerStart.ceilingRender;
                ceilingHeight = mapData.playerStart.ceilingHeight;
                ceilingTexture = mapData.playerStart.ceilingTexture;
                floorTexture = mapData.playerStart.floorTexture;
                
                console.log(`Ceiling render OFF: height=${ceilingHeight}, texture=${ceilingTexture}, floor=${floorTexture}`);
            } else {
                // Turn ceiling rendering on with specific values
                ceilingRender = true;
                ceilingHeight = 1;
                ceilingTexture = 1;
                floorTexture = floor || 1; // Use the determined floor or default to 2
                
                console.log(`Ceiling render ON: height=${ceilingHeight}, texture=${ceilingTexture}, floor=${floorTexture}`);
            }
            
            // Recharger les textures
            this.raycaster.loadFloorCeilingImages();
            
            // Pause courte pour permettre la mise à jour visuelle
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Log the new position for debugging
            console.log(`After teleport: x=${player.x}, y=${player.y}, moved: x=${player.x - initialX}, y=${player.y - initialY}`);
            
        } finally {
            // Toujours libérer le verrou, même en cas d'erreur
            player.isDooring = false;
        }
    }
}

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
        // mettre la map par défaut comme argument
        this.initMap(currentMap, mapData.map, mapData.eventA, mapData.eventB);
        this.stripWidth = 1; // leave this at 1 for now
        this.ceilingHeight = 1; // ceiling height in blocks
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
        this.viewDist = this.displayWidth / 2 / Math.tan(this.fovRadians / 2);
        this.rayAngles = null;
        this.viewDistances = null;
        this.backBuffer = null;

        this.mainCanvasContext;
        this.screenImageData;
        this.textureIndex = 0;
        this.textureImageDatas = [];
        this.texturesLoadedCount = 0;
        this.texturesLoaded = false;

        this.initPlayer();
        this.initSprites(mapData.sprites);;
        this.player.bindKeysAndButtons();
        this.initScreen();
        this.drawMiniMap();
        this.createRayAngles();
        this.createViewDistances();
        this.past = Date.now();

        // IA / Deplacement Ennemis
        this.enemyMoveCounter = 0;
    }

    static get TWO_PI() {
        return Math.PI * 2;
    }

    static get MINIMAP_SCALE() {
        return 8;
    }

    //////////////////////////////////////////////////////////////////////////////
    /// HORLOGE DU JEUX / GAMECYCLE
    //////////////////////////////////////////////////////////////////////////////

    gameCycle() {
        const now = Date.now();
        let timeElapsed = now - this.past;
        this.past = now;
        this.player.move(timeElapsed, this.map, this.mapEventA, this.mapEventB, this.sprites);
        this.updateMiniMap();
        let rayHits = [];
        this.resetSpriteHits();
        this.castRays(rayHits);
        this.sortRayHits(rayHits);
        this.drawWorld(rayHits);
        let this2 = this;
        window.requestAnimationFrame(function() {
            this2.gameCycle();
        });

        //////////////////////////////////////////////////////////////////////////////
        /// IA / Deplacements ennemis
        //////////////////////////////////////////////////////////////////////////////
        
        // Dans gameCycle de Raycaster
        this.enemyMoveCounter = (this.enemyMoveCounter || 0) + timeElapsed;
        const baseInterval = 1500;

        if (this.enemyMoveCounter >= baseInterval) {
            this.enemyMoveCounter = 0;
            
            // Parcourir tous les sprites et déplacer les ennemis
            for (let sprite of this.sprites) {
                if (sprite.spriteType === "A" && sprite.hp > 0) {
                    // Déplacer chaque ennemi
                    sprite.moveRandomlyOrChase(this.map, this.sprites, this.player);
                }
            }
        }

        //////////////////////////////////////////////////////////////////////////////
        /// UNITE TEMPORELLE ("TOUR") redondant
        //////////////////////////////////////////////////////////////////////////////

        // calculé à chaque gameCycle() (temmps réel)
        this.player.statsUpdate(this.player);

        // Utilisation de totalTimeElapsed pour calculer un délai d'une seconde
        // La valeur est initialisée au début du code
        totalTimeElapsed += timeElapsed;

        const oneSecond = 1000; // 1 seconde en millisecondes

        timeSinceLastSecond += timeElapsed;



        if (timeSinceLastSecond >= oneSecond) {
            // console.log("Délai d'un tour atteint, pas de minuterie CPU")
            this.player.turn = true;
            timeSinceLastSecond -= oneSecond;
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
        const tileSizeHalf = Math.floor(this.tileSize / 2);

        this.player = new Player(
            "Alakir",
            mapData.playerStart.X * this.tileSize + this.tileSize / 2,
            mapData.playerStart.Y * this.tileSize + this.tileSize / 2,
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

    static showGameOver() {
        const mainCanvas = document.getElementById("mainCanvas");
        const gameOverWindow = document.getElementById("gameOverWindow");

        mainCanvas.style = "display:none";
        gameOverWindow.style = "display:block";
    }

    static resetShowGameOver() {
        const mainCanvas = document.getElementById("mainCanvas");
        const gameOverWindow = document.getElementById("gameOverWindow");
        const mainMenuWindow = document.getElementById("mainMenuWindow");

        mainCanvas.style = "display:block";
        gameOverWindow.style = "display:none";
    }

    static showMainMenu() {
        const renderWindow = document.getElementById("renderWindow");
        const gameOverWindow = document.getElementById("gameOverWindow");
        const mainMenuWindow = document.getElementById("mainMenuWindow");

        renderWindow.style = "display:none";
        gameOverWindow.style = "display:none";
        mainMenuWindow.style = "display:block";
    }

    static showRenderWindow() {
        const renderWindow = document.getElementById("renderWindow");
        const gameOverWindow = document.getElementById("gameOverWindow");
        const mainMenuWindow = document.getElementById("mainMenuWindow");

        renderWindow.style = "display:block";
        gameOverWindow.style = "display:none";
        mainMenuWindow.style = "display:none";
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
        this.player.x = mapData.playerStart.X * this.tileSize + this.tileSize / 2;
        this.player.y = mapData.playerStart.Y * this.tileSize + this.tileSize / 2;
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

        this.player.x = mapData.playerStart.X * this.tileSize + this.tileSize / 2;
        this.player.y = mapData.playerStart.Y * this.tileSize + this.tileSize / 2;
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
    }

    newGame() {
        currentMap = 1;
        mapData = getMapDataByID(currentMap);

        this.initPlayer();
        this.player.x = mapData.playerStart.X * this.tileSize + this.tileSize / 2;
        this.player.y = mapData.playerStart.Y * this.tileSize + this.tileSize / 2;
        this.player.rot = mapData.playerStart.Orientation;

        gameOver = false;

        ceilingHeight = mapData.playerStart.ceilingHeight;
        ceilingRender = mapData.playerStart.ceilingRender;
        ceilingTexture = mapData.playerStart.ceilingTexture;
        floorTexture = mapData.playerStart.floorTexture;
        this.loadFloorCeilingImages();

        this.initMap(currentMap, mapData.map, mapData.eventA, mapData.eventB);
        this.initSprites(mapData.sprites);

        Raycaster.showRenderWindow();

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
    
        const tileSizeHalf = Math.floor(this.tileSize / 2);
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
    
                    let newDecoration = new Sprite(newX, newY, 0, this.tileSize, this.tileSize, 13, 13, false);
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


                let isBlocking = true;
                // Créer le sprite avec le paramètre lootClass
                this.sprites.push(new Sprite(
                    x, y, 0, this.tileSize, this.tileSize, 0, type, texture, 
                    isBlocking, false, true, hp, dmg, 0, name, face, dialogue, 
                    spriteSell, id, lootClass
                ));

                // Si la classe de loot n'est pas définie et que c'est un ennemi (type "A"),
                // la calculer automatiquement
                if (lootClass === null || lootClass === 0) {
                    if (type === "A") {
                        lootClass = Sprite.calculateLootClass(hp, dmg);
                        console.log(lootClass);
                    } else {
                        lootClass = 0; // 0 pour les sprites non-ennemis
                    }
                } else {
                    lootClass = lootClass;
                }
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
            0  // lootClass (0 car ce n'est pas un ennemi à looter)
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

    findSpritesInCell(cellX, cellY, onlyNotHit = false) {
        let spritesFound = [];
        for (let sprite of this.sprites) {
            if (onlyNotHit && sprite.hit) {
                continue;
            }
            let spriteCellX = Math.floor(sprite.x / this.tileSize);
            let spriteCellY = Math.floor(sprite.y / this.tileSize);
            if (cellX == spriteCellX && cellY == spriteCellY) {
                spritesFound.push(sprite);
            }
        }
        return spritesFound;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////
    // Canvas 
    ///////////////////////////////////////////////////////////////////////////////////////////////


    /**
     * https://stackoverflow.com/a/35690009/1645045
     */
    static setPixel(imageData, x, y, r, g, b, a) {
        let index = (x + y * imageData.width) * 4;
        imageData.data[index + 0] = r;
        imageData.data[index + 1] = g;
        imageData.data[index + 2] = b;
        imageData.data[index + 3] = a;
    }

    static getPixel(imageData, x, y) {
        let index = (x + y * imageData.width) * 4;
        return {
            r: imageData.data[index + 0],
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

    loadFloorCeilingImages() {
        // Crée un canvas temporaire pour obtenir les pixels des images
        let canvas = document.createElement("canvas");
        canvas.width = this.textureSize * 2;
        canvas.height = this.textureSize * 24;
        let context = canvas.getContext("2d");

        // Fonction générique pour charger les textures de sol et de plafond
        const loadTexture = (imageId, textureType) => {
            let img = document.getElementById(imageId);
            context.drawImage(img, 0, 0, img.width, img.height);
            return context.getImageData(0, 0, this.textureSize, this.textureSize);
        };

        // Skybox
        let skyboximg = document.getElementById("skybox1");
        context.drawImage(skyboximg, 0, 0, skyboximg.width, skyboximg.height);
        this.skyboxImageData = context.getImageData(0, 0, this.textureSize * 2, this.textureSize * 3);

        // texture des sprites

        // Chargement des textures de sol
        const floorTextures = {
            1: "floorimg1",
            2: "floorimg2",
            3: "floorimg3",
            4: "floorimg4"
        };
        if (floorTextures[floorTexture]) {
            this.floorImageData = loadTexture(floorTextures[floorTexture], 'floor');
        }

        // Chargement des textures de plafond
        const ceilingTextures = {
            1: "ceilingimg1",
            2: "ceilingimg2",
            3: "ceilingimg3"
        };
        if (ceilingTextures[ceilingTexture]) {
            this.ceilingImageData = loadTexture(ceilingTextures[ceilingTexture], 'ceiling');
        }

        // Chargement des textures de mur
        let wallsImage = document.getElementById("wallsImage");
        context.drawImage(wallsImage, 0, 0, wallsImage.width, wallsImage.height);
        this.wallsImageData = context.getImageData(0, 0, wallsImage.width, wallsImage.height);

        // Chargement des sprites (partie déjà optimisée)
        const spriteIds = [
            "sprite1", "sprite2", "sprite3", "sprite4", "sprite5", "sprite6",
            "sprite7", "sprite14", "sprite9", "sprite10", "sprite11", "sprite12",
            "sprite13", "sprite8", "sprite15", "sprite16", "sprite17", "sprite18",
            "sprite19", "sprite20", "sprite21"
        ];

        spriteIds.forEach((spriteId, index) => {
            let spriteImage = document.getElementById(spriteId);
            let canvas = document.createElement("canvas");
            let context = canvas.getContext("2d");
            canvas.width = spriteImage.width;
            canvas.height = spriteImage.height;
            context.drawImage(spriteImage, 0, 0, spriteImage.width, spriteImage.height);
            this["spriteImageData" + (index + 1)] = context.getImageData(0, 0, spriteImage.width, spriteImage.height);
        });
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
        spriteFlash
    ) {
        srcX = Math.trunc(srcX);
        srcY = Math.trunc(srcY);
        dstX = Math.trunc(dstX);
        dstY = Math.trunc(dstY);
        const dstEndX = Math.trunc(dstX + dstW);
        const dstEndY = Math.trunc(dstY + dstH);
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
                let textureX = Math.trunc(texX);
                let textureY = Math.trunc(texY);

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

                        // Mettre à jour l'image en utilisant setPixel (sans modifier la fonction elle-même)
                        Raycaster.setPixel(
                            this.backBuffer,
                            screenX,
                            screenY,
                            flashedPixel.r,
                            flashedPixel.g,
                            flashedPixel.b,
                            255
                        );
                    } else if (srcPixel.a) {
                        Raycaster.setPixel(
                            this.backBuffer,
                            screenX,
                            screenY,
                            srcPixel.r,
                            srcPixel.g,
                            srcPixel.b,
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

                        // Mettre à jour l'image en utilisant setPixel (sans modifier la fonction elle-même)
                        Raycaster.setPixel(
                            this.backBuffer,
                            screenX,
                            screenY,
                            flashedPixel.r,
                            flashedPixel.g,
                            flashedPixel.b,
                            255
                        );
                    } else if (srcPixel.a) {
                        Raycaster.setPixel(
                            this.backBuffer,
                            screenX,
                            screenY,
                            srcPixel.r,
                            srcPixel.g,
                            srcPixel.b,
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
        // ligne à supprimer si pas de bug dans la version > α0.6
        // let sprite = rayHit.sprite
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

        let diffX = Math.trunc(rayHit.strip - rc.x);
        let dstX = rc.x + diffX; // skip left parts of sprite already drawn
        let srcX = Math.trunc((diffX / rc.w) * this.textureSize);
        let srcW = 1;

        if (srcX >= 0 && srcX < this.textureSize) {
            // Créez un objet (ou tableau) pour stocker les données associées à chaque spriteType
            const spriteData = {
                A: this.spriteImageData8, // NPC TEST ENEMY
                1: this.spriteImageData1, // PNJ1
                2: this.spriteImageData2, // PNJ2
                3: this.spriteImageData3, // Garde
                4: this.spriteImageData4, // Rock
                5: this.spriteImageData5, // Tonneau
                6: this.spriteImageData6, // buisson
                7: this.spriteImageData7, // pancarte
                8: this.spriteImageData14, // Imp (fight test NOT ANIMATED)
                // 8: this.spriteImageData8,  // Imp (old data, switched with bat (n°8))
                9: this.spriteImageData9, // Treasure !
                10: this.spriteImageData10, // "dead enemy skull"
                11: this.spriteImageData11, // Statue
                12: this.spriteImageData12, // Brasier
                13: this.spriteImageData13, // weeds
                14: this.spriteImageData14, // bat (fight test ANIMATED)
                15: this.spriteImageData15, // arbe
                16: this.spriteImageData16, // colonne
                17: this.spriteImageData17, // sac
                18: this.spriteImageData18, // sac
                19: this.spriteImageData19, // slashAnimation
                20: this.spriteImageData20, // sparkAnimation
                21: this.spriteImageData21, // openChest
            };

            // Utilisez la structure de données pour accéder aux données appropriées en fonction de spriteType
            const spriteTexture = rayHit.sprite.spriteTexture;
            const spriteFlash = rayHit.sprite.spriteFlash;

            if (spriteData.hasOwnProperty(spriteTexture)) {
                this.drawTexturedRect(spriteData[spriteTexture], srcX, 0, srcW,
                    this.textureSize, dstX, rc.y, this.stripWidth, rc.h, spriteFlash
                );
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
        let imgy = (this.displayHeight - wallScreenHeight) / 2;
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
        const wallType = Math.floor(textureY / TextureUnit) + 1; // Ajustement pour correspondre à un index 0-based

        // On suppose que textureY est un multiple de TextureUnit
        const config = wallConfig[wallType] || wallConfig[1]; // 3 correspond au "default"

        if (this.ceilingHeight === 1) {
            // Utilisation de la texture spéciale pour un étage
            this.drawTexturedRect(this.wallsImageData, textureX, config.singleFloorTexture, swidth, sheight, imgx, imgy, imgw, imgh);
        } else {
            // Dessiner le rez-de-chaussée (groundTexture)
            this.drawTexturedRect(this.wallsImageData, textureX, config.groundTexture, swidth, sheight, imgx, imgy, imgw, imgh);

            // Si plusieurs étages, dessiner les étages intermédiaires et le dernier étage
            for (let level = 1; level < this.ceilingHeight - 1; ++level) {
                // Répéter la texture des étages intermédiaires
                this.drawTexturedRect(this.wallsImageData, textureX, config.firstFloorTexture, swidth, sheight, imgx, imgy - level * wallScreenHeight, imgw, imgh);
            }

            // Dernier étage (topFloorTexture)
            this.drawTexturedRect(this.wallsImageData, textureX, config.topFloorTexture, swidth, sheight, imgx, imgy - (this.ceilingHeight - 1) * wallScreenHeight, imgw, imgh);

            // Si un toit est configuré, on le dessine au-dessus du dernier étage
            if (config.roofTexture) {
                this.drawTexturedRect(this.wallsImageData, textureX, config.roofTexture, swidth, sheight, imgx, imgy - this.ceilingHeight * wallScreenHeight, imgw, imgh);
            }
        }
    }

    //////////////////////////////////////////////////////////////////////
    // sol
    //////////////////////////////////////////////////////////////////////

    drawSolidFloor() {
        for (let y = this.displayHeight / 2; y < this.displayHeight; ++y) {
            for (let x = 0; x < this.displayWidth; ++x) {
                Raycaster.setPixel(this.backBuffer, x, y, 111, 71, 59, 255);
            }
        }
    }

    drawTexturedFloor(rayHits) {
        for (let rayHit of rayHits) {
            const wallScreenHeight = this.stripScreenHeight(
                this.viewDist,
                rayHit.correctDistance,
                this.tileSize
            );
            const centerY = this.displayHeight / 2;
            const eyeHeight = this.tileSize / 2 + this.player.z;
            const screenX = rayHit.strip * this.stripWidth;
            const currentViewDistance = this.viewDistances[rayHit.strip];
            const cosRayAngle = Math.cos(rayHit.rayAngle);
            const sinRayAngle = Math.sin(rayHit.rayAngle);
            let screenY = Math.max(
                centerY,
                Math.floor((this.displayHeight - wallScreenHeight) / 2) +
                wallScreenHeight
            );
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
                let textureX = Math.floor(worldX) % this.tileSize;
                let textureY = Math.floor(worldY) % this.tileSize;
                if (this.tileSize != this.textureSize) {
                    textureX = Math.floor((textureX / this.tileSize) * this.textureSize);
                    textureY = Math.floor((textureY / this.tileSize) * this.textureSize);
                }
                let srcPixel = Raycaster.getPixel(
                    this.floorImageData,
                    textureX,
                    textureY
                );
                Raycaster.setPixel(
                    this.backBuffer,
                    screenX,
                    screenY,
                    srcPixel.r,
                    srcPixel.g,
                    srcPixel.b,
                    255
                );
            }
        }
    }

    //////////////////////////////////////////////////////////////////////
    // Plafond/SkyBox
    //////////////////////////////////////////////////////////////////////

    drawTexturedCeiling(rayHits) {
        for (let rayHit of rayHits) {
            const wallScreenHeight = this.stripScreenHeight(
                this.viewDist,
                rayHit.correctDistance,
                this.tileSize
            );
            const centerY = this.displayHeight / 2;
            const eyeHeight = this.tileSize / 2 + this.player.z;
            const screenX = rayHit.strip * this.stripWidth;
            const currentViewDistance = this.viewDistances[rayHit.strip];
            const cosRayAngle = Math.cos(rayHit.rayAngle);
            const sinRayAngle = Math.sin(rayHit.rayAngle);
            const currentCeilingHeight = this.tileSize * this.ceilingHeight;
            let screenY = Math.min(
                centerY - 1,
                Math.floor((this.displayHeight - wallScreenHeight) / 2) - 1
            );
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
                let textureX = Math.floor(worldX) % this.tileSize;
                let textureY = Math.floor(worldY) % this.tileSize;
                if (this.tileSize != this.textureSize) {
                    textureX = Math.floor((textureX / this.tileSize) * this.textureSize);
                    textureY = Math.floor((textureY / this.tileSize) * this.textureSize);
                }
                let srcPixel = Raycaster.getPixel(
                    this.ceilingImageData,
                    textureX,
                    textureY
                );
                Raycaster.setPixel(
                    this.backBuffer,
                    screenX,
                    screenY,
                    srcPixel.r,
                    srcPixel.g,
                    srcPixel.b,
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

    createRayAngles() {
        if (!this.rayAngles) {
            this.rayAngles = [];
            for (let i = 0; i < this.rayCount; i++) {
                let screenX = (this.rayCount / 2 - i) * this.stripWidth;
                let rayAngle = Math.atan(screenX / this.viewDist);
                this.rayAngles.push(rayAngle);
            }
            console.log("No. of ray angles=" + this.rayAngles.length);
        }
    }

    createViewDistances() {
        if (!this.viewDistances) {
            this.viewDistances = [];
            for (let x = 0; x < this.rayCount; x++) {
                let dx = (this.rayCount / 2 - x) * this.stripWidth;
                let currentViewDistance = Math.sqrt(
                    dx * dx + this.viewDist * this.viewDist
                );
                this.viewDistances.push(currentViewDistance);
            }
            console.log("No. of view distances=" + this.viewDistances.length);
        }
    }

    sortRayHits(rayHits) {
        rayHits.sort(function(a, b) {
            return a.distance > b.distance ? -1 : 1;
        });
    }

    castRays(rayHits) {
        for (let i = 0; i < this.rayAngles.length; i++) {
            let rayAngle = this.rayAngles[i];
            this.castSingleRay(rayHits, this.player.rot + rayAngle, i);
        }
    }

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

        // Check for sprites in cell
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
                // sprite.hit = true
                rayHits.push(spriteHit);
            }
        }

        // Handle cell walls
        if (this.map[cellY][cellX] > 0) {
            let distX = this.player.x - (horizontal ? hx : vx);
            let distY = this.player.y - (horizontal ? hy : vy);
            let squaredDistance = distX * distX + distY * distY;
            if (!wallHit.distance || squaredDistance < wallHit.distance) {
                wallFound = true;
                wallHit.distance = squaredDistance;
                wallHit.horizontal = horizontal;
                if (horizontal) {
                    wallHit.x = hx;
                    wallHit.y = hy;
                    wallHit.tileX = hx % this.tileSize;
                    // Facing down, flip image
                    if (!up) {
                        wallHit.tileX = this.tileSize - wallHit.tileX;
                    }
                } else {
                    wallHit.x = vx;
                    wallHit.y = vy;
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
        rayAngle %= Raycaster.TWO_PI;
        if (rayAngle < 0) rayAngle += Raycaster.TWO_PI;

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
        ray.cellX = Math.trunc(this.player.x / this.tileSize);
        ray.cellY = Math.trunc(this.player.y / this.tileSize);
        this.onCellHit(ray);

        // closest vertical line
        ray.vx = right ?
            Math.trunc(this.player.x / this.tileSize) * this.tileSize +
            this.tileSize :
            Math.trunc(this.player.x / this.tileSize) * this.tileSize - 1;
        ray.vy = this.player.y + (this.player.x - ray.vx) * Math.tan(rayAngle);

        // closest horizontal line
        ray.hy = up ?
            Math.trunc(this.player.y / this.tileSize) * this.tileSize - 1 :
            Math.trunc(this.player.y / this.tileSize) * this.tileSize +
            this.tileSize;
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
            ray.cellX = Math.trunc(ray.vx / this.tileSize);
            ray.cellY = Math.trunc(ray.vy / this.tileSize);
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
            ray.cellX = Math.trunc(ray.hx / this.tileSize);
            ray.cellY = Math.trunc(ray.hy / this.tileSize);
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
            this.displayWidth / 2 +
            x - // get distance from left of screen
            spriteScreenWidth / 2; // deduct half of sprite width because x is center of sprite
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
