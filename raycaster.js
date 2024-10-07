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
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// MAP | ENVIRONMENT || Make a class out of it ? Whatever...
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var currentMap = 1;

// Valeur hauteur de plafond
let ceilingHeight = 2;
let ceilingRender = false;

// Texture sol et plafond
let floorTexture = 3;
let ceilingTexture = 1;

var maps = [{
        mapID: 1,
        map: [
            [1,1,1,1,1,1,1,1,5,5,5,5,5,1,9,9,1,5,5,5,5,5,5,5],
            [2,2,0,0,0,0,0,2,5,5,0,0,0,1,0,0,1,0,0,5,5,5,5,5],
            [2,2,0,0,0,0,0,2,5,0,0,0,0,0,0,0,0,0,0,0,5,5,5,5],
            [2,2,0,0,0,0,0,2,1,1,0,0,0,0,0,0,0,0,0,7,6,6,6,5],
            [1,1,1,1,0,1,1,1,1,1,0,0,0,0,0,0,0,0,7,0,0,0,6,3],
            [2,2,0,0,0,0,0,1,2,0,0,0,0,0,0,0,0,0,8,0,0,0,6,3],
            [2,0,0,0,0,0,0,0,4,0,0,0,0,0,0,0,0,0,7,0,0,0,6,3],
            [2,2,0,0,0,0,0,1,2,0,0,0,0,0,0,0,0,0,6,6,6,6,6,3],
            [1,1,1,1,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,5,5],
            [1,0,0,0,0,0,0,1,5,1,0,0,0,0,0,0,0,0,0,0,0,0,5,3],
            [1,0,0,0,1,1,0,1,5,0,0,0,7,8,7,6,0,0,5,5,5,5,5,3],
            [1,0,0,0,1,0,0,0,1,5,0,0,6,0,0,0,7,0,5,3,3,3,3,3],
            [1,0,0,0,1,0,0,0,1,5,0,7,0,0,0,0,6,5,3,3,0,0,3,3],
            [1,2,4,2,1,1,1,1,1,3,5,6,0,0,0,0,6,3,3,3,0,0,0,3],
            [3,3,0,3,3,3,3,3,3,3,3,0,6,6,6,6,6,3,0,0,3,0,0,3],
            [3,0,0,3,3,3,0,0,3,3,3,0,3,3,3,3,3,0,0,0,3,3,0,3],
            [3,0,3,3,0,0,0,0,0,3,3,3,0,0,0,0,0,0,3,0,0,3,3,3],
            [3,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,3,0,0,0,3,3],
            [3,3,3,3,0,0,0,0,0,3,3,3,3,3,0,0,0,3,0,0,3,0,3,3],
            [3,0,0,3,3,3,0,3,3,3,0,0,0,3,0,0,0,3,0,3,3,0,3,3],
            [3,0,0,3,3,3,0,3,0,0,0,0,0,3,0,0,0,3,0,3,0,0,0,3],
            [3,0,0,0,0,0,0,0,0,3,0,0,0,3,3,0,3,3,0,3,0,0,0,3],
            [3,0,0,3,3,3,3,3,3,3,0,0,0,3,3,0,0,0,0,3,0,0,0,3],
            [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,9,3,3]
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
                [1, 2, 3, 4], 6, 4
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
    },
    {
        mapID: 2,
        map: [[5,5,5,5,6,5,5,6,5,5,5,9,9,5,5,5,5,5,5,5,5,5,5,5],[5,5,0,0,7,6,6,7,0,0,5,0,0,5,0,0,0,0,0,0,0,0,5,5],[5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5],[5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5],[6,6,6,6,0,0,0,0,0,0,0,0,0,0,7,6,7,6,6,0,0,0,0,5],[5,0,0,7,0,0,0,0,0,0,0,0,0,0,6,0,0,0,6,0,0,0,0,5],[5,0,0,8,0,0,0,0,0,0,0,0,0,0,8,0,0,0,6,6,6,0,0,5],[5,0,0,7,0,0,6,7,8,6,0,0,0,0,6,0,0,0,6,0,6,0,0,5],[6,6,6,6,0,0,6,0,0,7,0,0,0,0,6,0,0,0,6,0,6,0,0,5],[5,6,0,0,0,0,6,6,7,6,0,0,0,0,7,6,6,6,6,0,7,0,0,5],[5,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,0,0,6,0,0,5],[5,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,6,7,6,6,0,0,5],[6,7,0,6,8,7,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5],[5,0,0,6,0,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5],[5,0,0,7,6,6,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5],[5,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,5],[5,0,0,0,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,0,0,0,5],[5,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,5],[5,0,0,0,1,0,0,0,0,1,1,9,9,1,1,0,0,0,0,1,0,0,0,5],[5,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,5],[5,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1,0,0,0,5],[5,0,0,0,1,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,0,0,0,5],[5,5,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,5,5],[5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5,5]],
        
        sprites: [
            // liste de test
            [6, 4, 17, "A", "A", null, "Bat", [], null, null, null],
            [7, 19, 15, "A", "A", null, "Bat", [], null, null, null],
            [8, 21, 20, "A", "A", null, "Bat", [], null, null, null],
            [9, 14, 4, "A", "A", null, "Bat", [], null, null, null],
        ],
        eventA: [],
        eventB: [],
        //xyz
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

        // Référence à la classe principale pour permettre au joueur d'interagir avec le moteur du jeu.
        // Bien que cette approche fonctionne, elle introduit un couplage fort entre Player et la classe principale.
        // Cela peut rendre le code moins flexible à long terme et plus difficile à maintenir ou à tester.
        // Il serait préférable d'envisager des alternatives comme l'utilisation d'événements ou de services pour réduire ce couplage.
        this.raycaster = raycaster;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // fonction update des stats du joueurs (intégré au gamecycle)
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    statsUpdate() {
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

        if (this.strength !== this.oldStrength) {
            this.might += (this.strength - 5);
            this.oldStrength = this.strength;
        }

        if (this.intellect !== this.oldIntellect) {
            this.magic += (this.intellect - 5);
            this.oldIntellect = this.intellect;
        }

        this.dodge = this.dexterity * 2;
        this.armor = this.armor;
        this.criti = this.dexterity * 2;

        playerMight.textContent = this.might;
        playerDodge.textContent = this.dodge;
        playerMagic.textContent = this.magic;
        playerArmor.textContent = this.armor;
        playerCriti.textContent = this.criti;

        // affichage du sort sélectionné et de son icone
        const currentSpell = document.getElementById("selectedSpell");
        currentSpell.textContent = this.spells[this.selectedSpell].name;

        const currentSpellIcon = document.getElementById("castSpell");
        currentSpellIcon.textContent = this.spells[this.selectedSpell].icon;
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
        currentSpellIcon.textContent = this.spells[this.selectedSpell].icon;

        const currentSpellName = document.getElementById("selectedSpell");
        currentSpellName.textContent = this.spells[this.selectedSpell].name;
    }

    previousSpell() {
        this.selectedSpell--;
        if (this.selectedSpell < 0) {
            this.selectedSpell = this.spells.length - 1;
        }
        const currentSpellIcon = document.getElementById("castSpell");
        currentSpellIcon.textContent = this.spells[this.selectedSpell].icon;

        const currentSpell = document.getElementById("selectedSpell");
        currentSpell.textContent = this.spells[this.selectedSpell].name;
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // EQUIPEMENT INVENTAIRE
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    displayInventory() {
        const inventoryContent = document.getElementById("inventoryContent");

        if (this.inventory.length > 0) {

            inventoryContent.innerHTML = "";

            this.inventory.forEach((item) => {
                // on récupère l'icone de test
                const itemIcon = document
                    .getElementById("itemIcon")
                    .getAttribute("src");
                const swordIcon = document
                    .getElementById("weaponIcon")
                    .getAttribute("src");
                const cloakIcon = document
                    .getElementById("cloakIcon")
                    .getAttribute("src");

                const equippedStatus = item.equipped ? "➜ Equipped" : "";
                const equippedClass = item.equipped ? "equipped" : ""; // Ajout de la classe 'equipped' si l'élément est équipé

                let statsHTML = ""; // Variable pour stocker les statistiques à afficher

                // Vérifiez chaque statistique et n'ajoutez à statsHTML que si elle n'est pas égale à zéro
                if (item.might !== 0) {
                    statsHTML += `+${item.might} Might<br>`;
                }
                if (item.magic !== 0) {
                    statsHTML += `+${item.magic} Magic<br>`;
                }
                if (item.dodge !== 0) {
                    statsHTML += `+${item.dodge} Dodge<br>`;
                }
                if (item.armor !== 0) {
                    statsHTML += `+${item.armor} Armor<br>`;
                }
                if (item.power !== 0) {
                    statsHTML += `${item.power} Power<br>`;
                }

                // Supprime le dernier caractère (-) pour éviter un espace inutile à la fin
                statsHTML = statsHTML.slice(0, -2);

                if (item.slot === 1) {
                    inventoryContent.innerHTML += `<button class="inventory-item controlButton ${equippedClass}" style ="line-height: 0.8;background-color: ${
              item.equipped ? "rgb(0, 60, 0)" : "#140c1c"
            }; width:99%; margin-bottom: 5px; padding : 15px;" id="${
              item.name
            }" data-item="${
              item.name
            }"><div style="font-size: 15px; text-align : left; padding-top:5px;"><img src="${swordIcon}"> ► ${
              item.name
            } ${equippedStatus}</div><br> <div style="text-align : right; line-height: 1.15">${statsHTML}</div></button><br>`;
                } else if (item.slot === 2) {
                    inventoryContent.innerHTML += `<button class="inventory-item controlButton ${equippedClass}" style ="line-height: 0.8;background-color: ${
              item.equipped ? "rgb(0, 60, 0)" : "#140c1c"
            }; width:99%; margin-bottom: 5px; padding : 15px;" id="${
              item.name
            }" data-item="${
              item.name
            }"><div style="font-size: 15px; text-align : left; padding-top:5px;"><img src="${cloakIcon}"> ► ${
              item.name
            } ${equippedStatus}</div><br> <div style="text-align : right; line-height: 1.15;">${statsHTML}</div></button><br>`;
                } else {
                    inventoryContent.innerHTML += `<button class="inventory-item controlButton ${equippedClass}" style ="line-height: 0.8;background-color: ${
              item.equipped ? "rgb(0, 60, 0)" : "#140c1c"
            }; width:99%; margin-bottom: 5px; padding : 15px;" id="${
              item.name
            }" data-item="${
              item.name
            }"><div style="font-size: 15px; text-align : left; padding-top:5px;"><img src="${itemIcon}"> ► ${
              item.name
            } ${equippedStatus}</div><br> <div style="text-align : right; line-height: 1.15;">${statsHTML}</div></button><br>`;
                    console.log(`Item: ${item.name}, Power: ${item.power}`);
                }
            });
        } else {
            inventoryContent.innerHTML = "> The inventory is empty";
        }
    }

    equipmentDisplay() {
        const handsContent = document.getElementById("handsContent");
        const torsoContent = document.getElementById("torsoContent");

        // Vérifiez si hands est défini et non vide
        if (this.hands && this.hands.length > 0) {
            handsContent.innerHTML = `<button class="equipped-item" style ="color:black;" data-item="${this.hands[0].name}">${this.hands[0].name}</button>`;
        } else {
            handsContent.innerHTML = "EMPTY";
        }

        // Vérifiez si torso est défini et non vide
        if (this.torso && this.torso.length > 0) {
            torsoContent.innerHTML = `<button class="equipped-item" style ="color:black;" data-item="${this.torso[0].name}">${this.torso[0].name}</button>`;
        } else {
            torsoContent.innerHTML = "EMPTY";
        }

        // Ajouter des gestionnaires d'événements aux boutons
        document
            .querySelectorAll(".inventory-item, .equipped-item")
            .forEach((itemButton) => {
                itemButton.addEventListener("click", (event) => {
                    console.log("clicked !");
                    const itemName = itemButton.getAttribute("data-item");
                    const clickedItem =
                        this.inventory.find((item) => item.name === itemName) ||
                        (this.hands && this.hands[0]) ||
                        (this.torso && this.torso[0]);

                    if (clickedItem) {
                        if (clickedItem.equipped) {
                            console.log("equipped");
                            clickedItem.unequip(this);
                        } else {
                            console.log("unequipped");
                            clickedItem.equip(this);
                        }

                        // Mettre à jour l'affichage de l'inventaire et de l'équipement
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

        // joystick adds
        if (joystick) {
            console.log("TOGGLE bouton inventaire en mode joystick");
            document.getElementById("joystick-container").style.display = "none";
            document.getElementById("joystickBackButtonContainer").style.display = "block";

            this.inventoryMenuShowed = true;
        }

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

        if (this.quests.length > 0) {
            questContent.innerHTML = "";
            this.quests.forEach((quest) => {
                const questStatus = quest.completed ? "Completed" : "In progress";
                const statusClass = quest.completed ? "completed" : ""; // Ajout de la classe 'completed' si la quête est complétée

                questContent.innerHTML += `<div class="quest-item ${statusClass}">
                                              <h3>${quest.title}</h3>
                                              <p>${quest.description}</p>
                                              <p>Status: ${questStatus}</p>
                                          </div>`;
            });
        } else {
            questContent.innerHTML = "> No quests in progress";
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
    }

    //////////////////////////////////////////////////////////////////////////////
    /// CONTROLES - liaisons des boutons à un événement
    //////////////////////////////////////////////////////////////////////////////

    // Case selon type de bouton appuyée, les ID sont liées à un nombre dans "bindKeysAndButtons"
    handleButtonClick(buttonNumber) {
        switch (buttonNumber) {
            case 1: // ACTION
                Sprite.resetToggle();
                if (this.turn == true) {
                    console.log('Action/Dialogue')
                    // actionButtonClicked clic sur la touche action (bouton A)
                    this.actionButtonClicked = true;
                }
                break;
            case 2:
            case 3: // EQUIPEMENT
                console.log("Bouton Equipement");
                // zz
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
            case 4:
                // EMPTY
                break;
            case 5:
                console.log("forward");
                this.joystickForwardClicked = true;
                break;
            case 6:
                // EMPTY
                break;
            case 7:
                console.log("turnLeft");
                this.turnLeftButtonClicked = true;
                break;
            case 8:
                console.log("backward");
                this.BackwardButtonClicked = true;
                break;
            case 9:
                console.log("turnRight");
                this.turnRightButtonClicked = true;
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
                pause(500);
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
                if (gameOver == false) {
                    pause(500);
                    this.raycaster.nextMap(this);
                    console.log("nextMapButton");
                    Raycaster.showRenderWindow();
                    Sprite.resetTerminal();
                    Sprite.terminalLog("Next map loaded !");
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
                console.log("Bouton non reconnu");
        }
    }

    // Méthode améliorée pour éviter les redites et tout centraliser
    bindButton(buttonId, buttonNumber) {
        document.getElementById(buttonId).addEventListener("click", () => {
            this.handleButtonClick(buttonNumber);
        });
    }

    // méthode d'interface, permet de centraliser les commandes et eventlistener
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
        this.bindButton("button5", 5);
        this.bindButton("button7", 7);
        this.bindButton("button8", 8);
        this.bindButton("button9", 9);
        this.bindButton("joystickBackButton", 10);
        this.bindButton("QuestButton", 11);
        this.bindButton("InventoryButton", 12);
        this.bindButton("previousSpell", 13);
        this.bindButton("castSpell", 14);
        this.bindButton("nextSpell", 15);
        this.bindButton("newGameButton", 19);
        this.bindButton("mainMenuButton", 20);
        this.bindButton("backMenuButton", 21);
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // méthode calcul quadrant et stockage de la valeur dans Player
    // refactorisation de la méthode Move(), subdivisée en sous-méthodes
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    playerQuadrant(player) {
        const quadrants = [{
                min: 337.5,
                max: 360,
                name: "ouest"
            },
            {
                min: 0,
                max: 22.5,
                name: "ouest"
            },
            {
                min: 22.5,
                max: 67.5,
                name: "nord-ouest"
            },
            {
                min: 67.5,
                max: 112.5,
                name: "nord"
            },
            {
                min: 112.5,
                max: 157.5,
                name: "nord-est"
            },
            {
                min: 157.5,
                max: 202.5,
                name: "est"
            },
            {
                min: 202.5,
                max: 247.5,
                name: "sud-est"
            },
            {
                min: 247.5,
                max: 292.5,
                name: "sud"
            },
            {
                min: 292.5,
                max: 337.5,
                name: "sud-ouest"
            }
        ];

        for (const quadrant of quadrants) {
            if ((player.rot >= quadrant.min * (Math.PI / 180) && player.rot < quadrant.max * (Math.PI / 180))) {
                player.quadrant = quadrant.name;
                // console.log(player.quadrant);
                return;
            }
        }
        // console.log("rot is out of range - need angle in radians between 0 and 2PI");
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
        const player = this;
        if (!player) {
            console.error('Player is undefined');
            return {
                frontX: null,
                frontY: null
            };
        }

        const {
            x,
            y,
            quadrant
        } = player;

        const frontOffsets = {
            "nord-ouest": {
                x: 0.5,
                y: -0.5
            },
            "nord": {
                x: 0,
                y: -1
            },
            "nord-est": {
                x: -0.5,
                y: -0.5
            },
            "est": {
                x: -1,
                y: 0
            },
            "sud-est": {
                x: -0.5,
                y: 0.5
            },
            "sud": {
                x: 0,
                y: 1
            },
            "sud-ouest": {
                x: 0.5,
                y: 0.5
            },
            "ouest": {
                x: 1,
                y: 0
            }
        };

        const offset = frontOffsets[quadrant];
        const frontX = Math.floor((x / this.tileSize) + offset.x);
        const frontY = Math.floor((y / this.tileSize) + offset.y);

        return {
            frontX,
            frontY
        };
    }

    handleSpriteAction(action, sprites) {
        if (!action || !this || !this.turn) return;

        const {
            frontX,
            frontY
        } = this.calculateFrontPosition();

        if (frontX === null || frontY === null) {
            console.error('Failed to calculate front position');
            return;
        }

        for (const sprite of sprites) {
            if (Math.floor(sprite.x / this.tileSize) === frontX && Math.floor(sprite.y / this.tileSize) === frontY) {
                switch (sprite.spriteType) {
                    case "A":
                        if (this.combatSpell) {
                            sprite.combatSpell(this, sprite);
                        } else {
                            sprite.combat(this.might, this.criti, this);
                        }
                        break;
                    case "EXIT":
                        Sprite.terminalLog('Level finished !')
                        this.raycaster.nextMap();
                        break;
                    case 0:
                        sprite.talk(sprite.spriteTalk, sprite.spriteFace);
                        this.turn = false;
                        break;
                    case 1:
                        // décoration, ne rien faire
                        break;
                    case 2:
                        sprite.talk(sprite.spriteTalk, sprite.spriteFace);
                        this.turn = false;
                        break;
                    case 3:
                        sprite.displayItemsForSale(this);
                        this.turn = false;
                        break;
                    case 4:
                        // gestion des Quest Giver
                        break;
                    case 5:
                        // valeur fixe de test
                        // ultérieurement : quests[currentMap].complete();
                        this.quests[0].complete();

                        // changement de texture temporaire
                        console.log("test changement de texture");
                        sprite.spriteTexture = 21;

                        Sprite.resetToggle();
                        break;
                    default:
                        Sprite.resetToggle();
                        break;
                }
            }
        }
        // Réinitialisation de la touche d'action après utilisation
        this.actionButtonClicked = false;
    }

    async handleTeleportation(player, mapEventA, mapEventB, newX, newY, tileSize) {
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
                await pause(250);
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
                await pause(250);
                // Set new position
                player.x = newX;
                player.y = newY;

                break; // Sortir de la boucle une fois la téléportation effectuée
            }
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
        // console.log(timeElapsed);
        // console.log('Tile Size:', this.tileSize);


        // écoute des changement d'état des variables
        const actualMap = map;

        /*
        console.log(actualMap)
        console.log(eventA)
        console.log(eventB)
        */

        let up = this.keysDown[KEY_UP] || this.keysDown[KEY_W];
        let down = this.keysDown[KEY_DOWN] || this.keysDown[KEY_S];
        let left = this.keysDown[KEY_LEFT] || this.keysDown[KEY_A];
        let right = this.keysDown[KEY_RIGHT] || this.keysDown[KEY_D];
        const action = this.actionButtonClicked || this.keysDown[KEY_F] || this.keysDown[KEY_SPACE];

        let timeBasedFactor = timeElapsed / UPDATE_INTERVAL;

        let moveStep = this.speed * this.moveSpeed * timeBasedFactor;

        this.rot +=
            -this.dir * this.rotSpeed * timeBasedFactor;

        let newX = Math.trunc(this.x + Math.cos(this.rot) * moveStep);
        let newY = Math.trunc(
            this.y + -Math.sin(this.rot) * moveStep
        );

        /*
        console.log('newX:', newX, 'newY:', newY);
        */

        let cellX = newX / this.tileSize;
        let cellY = newY / this.tileSize;


        if (isNaN(cellX) || isNaN(cellY)) {
            console.error("Invalid cell coordinates: cellX =", cellX, ", cellY =", cellY);
            return;
        }

        let obstacleOnPath;

        // ACCELERATION
        const accelerationRate = 0.05; // Taux d'accélération
        const decelerationRate = 0.15; // Taux de décélération

        if (up || joystickForwardClicked === true) {
            this.speed = Math.min(this.speed + accelerationRate, 1);
        } else if (down || joystickBackwardClicked === true) {
            this.speed = Math.max(this.speed - accelerationRate, -1);
        } else {
            // Inertie/décélération si aucune touche n'est enfoncée
            if (this.speed > 0) {
                this.speed = Math.max(this.speed - decelerationRate, 0);
            } else if (this.speed < 0) {
                this.speed = Math.min(this.speed + decelerationRate, 0);
            }
        }

        // normalizing angle (contenu entre 0 et 2*pi)
        // + BONUS : anti-bug angle 0 (parallaxe et sprite), on ajoute ou enlève 1° (pi/180) selon l'angle.
        if (this.rot <= 0) {
            this.rot += 2 * Math.PI - (Math.PI / 180);
            //console.log("changing angle");
        } else if (this.rot >= 2 * Math.PI) {
            this.rot -= 2 * Math.PI + (Math.PI / 180);
            //console.log("changing angle");
        } else {
            // nothing
        }

        // inertie rotation
        if (left || joystickLeftClicked === true) {
            this.dir = Math.max(this.dir - accelerationRate * 2, -1);
        } else if (right || joystickRightClicked === true) {
            this.dir = Math.min(this.dir + accelerationRate * 2, 1);
        } else {
            // Arrêt direct, sans décélération
            this.dir = 0;
        }

        ///////////////////////////////////////////////////////////////////////////////////////////////
        //CALCUL DU QUADRANT CAMERA et collision glissante
        ///////////////////////////////////////////////////////////////////////////////////////////////

        this.playerQuadrant(this);

        // console.log('Player object (this):', this);
        // rajouter detection des sprite blocants aux conditions
        if (this.isBlocking(cellX, cellY, actualMap)) {
            // console.log('Player object (this):', this);
            this.handleSlidingCollision(this, actualMap);
            return;
        }

        //////////////////////////////////////////////////////////////////////////////
        // COLLISION SPRITE
        //////////////////////////////////////////////////////////////////////////////

        // prends en compte la valeur "blocking" dans Sprite
        // Si le sprite est bloquant (isBlocking==true), obstacle on path est true (bloquant)

        for (let i = 0; i < sprites.length; i++) {
            if (
                Math.floor(cellX) === Math.floor(sprites[i].x / this.tileSize) &&
                Math.floor(cellY) === Math.floor(sprites[i].y / this.tileSize)
            ) {
                // Si le sprite est bloquant (isBlocking==true), obstacle on path est true (bloquant)
                obstacleOnPath = sprites[i].isBlocking;

                // sprite attack en cas de collision xyz
                if (this.turn == true && sprites[i].spriteType == "A") {
                    console.log("attack player on collision");
                    sprites[i].enemyAttackUpdate(this);
                    this.turn = false;
                    // ajouter fonction de "rebond" si collision avec ennemis
                    Sprite.recoilPlayer(this);
                }
            }
        }

        // Suite détection sprite
        // implémenter collision glissante
        if (obstacleOnPath) {

            // console.log("sprite bloquant !")
            this.handleSlidingCollision(this, actualMap);

            return;
        } else {
            // ok, tout va
        }

        ///////////////////////////////////////////////////////////////////////////////////////////////
        // ACTION ET TELEPORT FUNCTION // MARQUEUR : event événement téléporteur
        ///////////////////////////////////////////////////////////////////////////////////////////////

        if (action || left || right || down || up || joystickLeftClicked || joystickRightClicked || joystickBackwardClicked || joystickForwardClicked) {
            if (this.turn === true) {
                Sprite.resetToggle();
                this.inventoryMenuShowed = false;
            }
        }

        ///////////////////////////////////////////////////////////////////////////////////////////////
        // ACTION Selon sprite type
        ///////////////////////////////////////////////////////////////////////////////////////////////

        if (action && this && this.turn == true) {
            this.handleSpriteAction(action, sprites);
        }

        ///////////////////////////////////////////////////////////////////////////////////////////////
        // ACTION Téléporteur
        ///////////////////////////////////////////////////////////////////////////////////////////////

        // les listes des téléporteurs sont à présent stockés dans initMap

        if (action) {
            this.handleTeleportation(this, eventA, eventB, newX, newY, this.tileSize);
        }

        // set new position
        this.x = newX;
        this.y = newY;
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
        criti
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
    }

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
            player.strength -= this.strength;
            player.dexterity -= this.dexterity;
            player.intellect -= this.intellect;

            player.might -= this.might;
            player.magic -= this.magic;
            player.dodge -= this.dodge;

            player.armor -= this.armor;

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
                itemData.criti
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
                itemData.criti
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
        criti: 0
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
        criti: 0
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
        criti: 0
    },
    {
        id: 4,
        name: "Robe",
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
        criti: 0
    },
    {
        id: 5,
        name: "Staff",
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
        criti: 0
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

                Sprite.terminalLog(`${caster.name} cast ${this.name} on ${target.spriteName}`);
            } else {
                Sprite.terminalLog(`${caster.name} doesn't have enough mana to cast ${this.name}`);
            }
        } else {
            console.log("not your turn");
        }
    }

    // Fonction représentant l'effet de soins
    static healEffect(caster, target) {
        Raycaster.playerHealFlash();

        caster.XPintellect += 1;

        target.hp += 10;

        if (target.hp > target.hpMax) {
            target.hp = target.hpMax;
            Sprite.terminalLog(`${target.name} is completely healed.`);
        } else {
            Sprite.terminalLog(`${target.name} is healed for 10hp.`);
        }
    }

    // Fonction représentant l'effet de dégâts
    static damageEffect(caster, target) {
        Raycaster.playerHealFlash();
        target.startSpriteFlash();
        target.hp -= 2;
        caster.XPintellect += 1;
        Sprite.terminalLog(`${target.name} suffered 2 points of damage from ${caster.name}`);
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
        icon: "✙"
    },
    {
        id: 2,
        name: "Sparks",
        manaCost: 2,
        description: "Inflict 2pts of electric damage.",
        effect: Spell.damageEffect,
        selfCast: false,
        icon: "🗲"
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
        Sprite.terminalLog(`The quest "${this.title}" has been completed! Reward: ${this.reward}`);
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
        id = 0
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
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Contrôle UI & terminal log
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    static terminalLog(entry) {
        const outputElement = document.getElementById("output");
        const consoleContent = outputElement.innerHTML;
        /* Fonction pour éviter les doublons, mais empêche de comprendre ce qui se passe.
            if (entry === lastEntry) {
              outputElement.scrollTop = outputElement.scrollHeight;
              
            } else {
              outputElement.innerHTML = consoleContent + "> " + entry + "<br>";
              outputElement.scrollTop = outputElement.scrollHeight;
            }
        */
        outputElement.innerHTML = consoleContent + "> " + entry + "<br>";
        outputElement.scrollTop = outputElement.scrollHeight;

        lastEntry = entry;
    }

    static resetTerminal() {
        const outputElement = document.getElementById("output");
        const consoleContent = outputElement.innerHTML;
        outputElement.innerHTML = "- New Terminal -</br>";
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
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // boutique, pas de prix pour le moment
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    displayItemsForSale(player) {
        var output = document.getElementById("output");
        var dialWindow = document.getElementById("dialogueWindow");
        output.style.display = "none";
        dialWindow.style.display = "none";

        const shopContent = document.getElementById("shopContent");
        document.getElementById("shop").style.display = "block";

        const shopName = document.getElementById("shopName");
        shopName.textContent = "'" + this.spriteName + "'";

        if (this.spriteSell.length > 0) {
            shopContent.innerHTML = "";

            this.spriteSell.forEach((itemId) => {
                const item = Item.getItemById(itemId);
                if (item) {
                    const itemIcon = document.getElementById("itemIcon").getAttribute("src");
                    const swordIcon = document.getElementById("weaponIcon").getAttribute("src");
                    const cloakIcon = document.getElementById("cloakIcon").getAttribute("src");

                    let statsHTML = "";
                    if (item.might !== 0) {
                        statsHTML += `+${item.might} Might<br>`;
                    }
                    if (item.magic !== 0) {
                        statsHTML += `+${item.magic} Magic<br>`;
                    }
                    if (item.dodge !== 0) {
                        statsHTML += `+${item.dodge} Dodge<br>`;
                    }
                    if (item.armor !== 0) {
                        statsHTML += `+${item.armor} Armor<br>`;
                    }
                    if (item.power !== 0) {
                        statsHTML += `${item.power} Power<br>`;
                    }
                    statsHTML = statsHTML.slice(0, -2);

                    let itemIconSrc = itemIcon;
                    if (item.slot === 1) {
                        itemIconSrc = swordIcon;
                    } else if (item.slot === 2) {
                        itemIconSrc = cloakIcon;
                    }

                    shopContent.innerHTML += `
              <button class="shop-item controlButton" style="line-height: 0.8;background-color: #281102; width:99%; margin-bottom: 5px; padding: 15px;" id="${item.name}" data-item="${item.id}">
                <div style="font-size: 15px; text-align: left; padding-top:5px;">
                  <img src="${itemIconSrc}"> ► ${item.name}
                </div>
                <p style="font-size: 15px; text-align: left; padding-top:5px;">
                <font style="font-size: 25px;">$</font> ► FREE</p>
                <div style="text-align: right; line-height: 1.15;">${statsHTML}</div>
              </button><br>`;
                }
            });

            // Ajoute des écouteurs d'événements aux boutons des objets
            document.querySelectorAll('.shop-item').forEach(button => {
                button.addEventListener('click', (event) => {
                    const itemId = parseInt(event.currentTarget.getAttribute('data-item'), 10);
                    const itemToBuy = Item.getItemById(itemId);
                    if (itemToBuy) {
                        console.log("Buying item:", itemToBuy.name);
                        this.giveItemToPlayer(itemToBuy, player);
                    }
                });
            });
        } else {
            shopContent.innerHTML = "> No items for sale";
        }
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

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Gestion des dialogues
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // peut etre réduit
    countDialogues() {
        return this.spriteTalk.length;
    }

    talk() {
        Sprite.resetToggle();

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

        const showNextDialogue = () => {
            if (currentDialogue < this.spriteTalk.length) {
                const [face, name, entry] = this.spriteTalk[currentDialogue];

                // Vérifiez qu'ils ne sont pas undefined :
                if (face && name && entry) {
                    dialogue.innerHTML = `<font style="font-weight: bold;">${name} </font> :<font style="font-style: italic;"><br>${entry}</font>`;

                    var imgElement = document.getElementById(face);
                    faceOutput.src = imgElement ? imgElement.src : '';

                    // Accumuler le dialogue dans allDialoguesLog
                    allDialoguesLog += `<font style="font-weight: bold;">${name} </font> :<font style="font-style: italic;"><br>${entry}</font><br>`;
                }

                currentDialogue++;
            } else {
                for (let i = 0; i < this.spriteTalk.length; i++) {
                    const [face, name, entry] = this.spriteTalk[i];
                    Sprite.terminalLog(`<font style="font-weight: bold;">${name} </font> :<font style="font-style: italic;"></br>${entry}</font>`);
                }
                // Fin du dialogue : on log tous les dialogues d'un coup
                // Sprite.terminalLog(allDialoguesLog);

                // Afficher la fin du dialogue
                outputElement.style.display = "block";
                dialWindow.style.display = "none";
                newNextButton.removeEventListener("click", showNextDialogue);
            }
        };

        newNextButton.addEventListener("click", showNextDialogue);

        // Affiche le premier dialogue immédiatement
        showNextDialogue();
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

    // recul au contact de l'ennemi xyz
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
            let entry =
                "<font style='font-style: italic;'>Your armor absorbs all the damages.</font>";
            Sprite.terminalLog(entry);
        } else {
            let entry =
                "<font style='font-style: italic;'>The opponent attacks : <font style='font-weight: bold;'>" +
                (this.dmg - target.armor) +
                " dmg !</font></font>";
            Sprite.terminalLog(entry);
            Raycaster.playerDamageFlash();
            target.hp -= this.dmg - target.armor;
        }
    }

    playerAttack(damage, criti, player) {
        const chanceCriti = Math.floor(Math.random() * 100);
        var factor = 1;

        if (chanceCriti < criti) {
            factor = 2
            Sprite.terminalLog('Critical hit !');
            player.XPdexterity += 1;
        }

        this.hp -= damage * factor;

        this.invokeAnimationSprite(player, 19);
        this.hitAnimation(player)
        this.startSpriteFlash();

        player.XPstrength += 1;

        var entry =
            "<font style='font-style: italic;'>You attack : <font style='font-weight: bold;'>" +
            damage * factor +
            " dmg</font> points ! </font>";

        Sprite.terminalLog(entry);
    }

    enemyAttackUpdate(player) {

        if (this.hp <= 0) {
            let entry = "The enemy is dead!";

            Sprite.terminalLog(entry);

            this.spriteType = 0;
            this.spriteTexture = 10;
            this.spriteTalk = [
                ["facePlayer", "Alakir", "It's dead..."]
            ];
            this.isBlocking = false;
        } else {

            const chanceEchec = Math.floor(Math.random() * 100);

            if (chanceEchec > player.dodge) {
                setTimeout(() => this.attack(player), 500);

            } else {
                const outputElement = document.getElementById("output");
                const consoleContent = outputElement.innerHTML;

                outputElement.innerHTML = consoleContent + "> You dodge the attack !<br>";

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
            this.enemyAttackUpdate(player);
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
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// moteur de jeu
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class Raycaster {
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

    // xyz
    nextMap() {
        // Incrémenter l'ID de la carte pour charger la suivante
        this.mapID += 1;

        const mapData = getMapDataByID(this.mapID); // Utilisation de this.mapID
        

        if (!mapData) {
            console.error(`Aucune donnée trouvée pour la carte avec l'ID ${this.mapID}`);
            // back to the current ID
            this.mapID -=1;
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
        this.initMap(this.mapID, mapData.map, mapData.eventA, mapData.eventB);
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
                state.id
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

            let hp = pos[9] || 2;
            let dmg = pos[10] || 1;

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
                // console.log("sprite #" + id + " loaded.");
                this.sprites.push(new Sprite(x, y, 0, this.tileSize, this.tileSize, 0, type, texture, isBlocking, false, true, hp, dmg, 0, name, face, dialogue, spriteSell, id));
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
            0 // id
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

    constructor(
        mainCanvas,
        displayWidth = 320,
        displayHeight = 180,
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
    }

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
                singleFloorTexture: 0 * TextureUnit,     // Texture spéciale si un seul étage (mur en pierre)
                groundTexture: 18 * TextureUnit,          // Texture pour le rez-de-chaussée (mur en pierre)
                firstFloorTexture: 17 * TextureUnit,      // Texture pour les étages intermédiaires (mur en pierre)
                topFloorTexture: 17 * TextureUnit,        // Texture pour le dernier étage (mur en pierre)
                roofTexture: 16 * TextureUnit             // Texture pour le toit (mur en pierre)
            },
            2: { // ornateWall
                singleFloorTexture: 1 * TextureUnit,     // Texture spéciale si un seul étage (mur orné)
                groundTexture: 21 * TextureUnit,          // Texture pour le rez-de-chaussée (mur orné)
                firstFloorTexture: 20 * TextureUnit,      // Texture pour les étages intermédiaires (mur orné)
                topFloorTexture: 19 * TextureUnit,        // Texture pour le dernier étage (mur orné)
                roofTexture: 0 * TextureUnit    
            },
            3: { // Rocks
                singleFloorTexture: 2 * TextureUnit,      // Texture spéciale si un seul étage
                groundTexture: 11 * TextureUnit,          // Texture pour le rez-de-chaussée
                firstFloorTexture: 10 * TextureUnit,       // Texture pour les étages intermédiaires
                topFloorTexture: 10 * TextureUnit,        // Texture pour le dernier étage
                roofTexture: 9 * TextureUnit             // Texture pour le toit
            },
            4: { // templeDoor
                singleFloorTexture: 5 * TextureUnit,      // Porte du temple pour un seul étage
                groundTexture: 5 * TextureUnit,           // Texture porte du temple (rez-de-chaussée)
                firstFloorTexture: 1 * TextureUnit,       // Texture intermédiaire (premier étage du temple)
                topFloorTexture: 1 * TextureUnit,         // Texture pour le dernier étage
                roofTexture: 0 * TextureUnit              // Texture pour le toit (ou pas de toit pour le temple)
            },
            5: { // forest
                singleFloorTexture: 23* TextureUnit,                 // Texture spéciale pour la forêt (un seul étage)
                groundTexture: 23* TextureUnit,                      // Texture de forêt (rez-de-chaussée)
                firstFloorTexture: 22* TextureUnit,                  // Texture intermédiaire pour les étages de la forêt
                topFloorTexture: 22* TextureUnit,                    // Texture pour le dernier étage
                roofTexture: 0                            // Texture transparente pour le toit
            },
            6: { // house
                singleFloorTexture: 14 * TextureUnit,     // Texture maison spéciale pour un étage
                groundTexture: 14 * TextureUnit,          // Texture maison (rez-de-chaussée)
                firstFloorTexture: 14 * TextureUnit,      // Texture répétée pour les étages intermédiaires
                topFloorTexture: 14 * TextureUnit,        // Texture pour le dernier étage de la maison
                roofTexture: 12 * TextureUnit             // Texture du toit de la maison
            },
            7: { // houseWindow
                singleFloorTexture: 13 * TextureUnit,     // Fenêtre de la maison (un seul étage)
                groundTexture: 13 * TextureUnit,          // Fenêtre de la maison (rez-de-chaussée)
                firstFloorTexture: 13 * TextureUnit,      // Fenêtre répétée pour les étages intermédiaires
                topFloorTexture: 13 * TextureUnit,        // Texture pour le dernier étage avec fenêtre
                roofTexture: 12 * TextureUnit             // Texture du toit de la maison avec fenêtre
            },
            8: { // houseDoor
                singleFloorTexture: 15 * TextureUnit,     // Texture de la porte de la maison (un seul étage)
                groundTexture: 15 * TextureUnit,          // Texture pour la porte de la maison (rez-de-chaussée)
                firstFloorTexture: 14 * TextureUnit,      // Texture répétée pour les étages intermédiaires
                topFloorTexture: 14 * TextureUnit,        // Texture pour le dernier étage avec porte
                roofTexture: 12 * TextureUnit             // Texture du toit de la maison avec porte
            },
            9: { // Prison door
                singleFloorTexture: 7 * TextureUnit,      // Variation du mur de pierre pour un seul étage
                groundTexture: 8 * TextureUnit,           // Texture variation mur de pierre (rez-de-chaussée)
                firstFloorTexture: 8 * TextureUnit,      // Texture répétée pour les étages intermédiaires
                topFloorTexture: 7 * TextureUnit,        // Texture pour le dernier étage de la variation de mur en pierre
                roofTexture: 0 * TextureUnit             // Texture pour le toit de la variation de mur en pierre
            }
            // Tu peux ajouter d'autres configurations si besoin pour atteindre les 24.
        };
        
    
        // Récupérer la configuration du mur en fonction de `textureY`
        // +1, car 0 vaut pour un vide
        const wallType = Math.floor(textureY / TextureUnit) + 1;  // Ajustement pour correspondre à un index 0-based

        // On suppose que textureY est un multiple de TextureUnit
        const config = wallConfig[wallType] || wallConfig[1];  // 3 correspond au "default"
    
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

    drawSkybox() {
        // Calculer les facteurs d'échelle pour les coordonnées de texture
        let scaleX = this.skyboxImageData.width / this.displayWidth;
        let scaleY = this.skyboxImageData.height / this.displayHeight;

        // Calculer le décalage horizontal en fonction de l'angle de la caméra
        let offsetX = Math.floor((-this.player.rot / Math.PI) * this.skyboxImageData.width * 3);

        for (let y = 0; y < this.displayHeight / 2; ++y) {
            // Calculer les coordonnées de texture pour cette ligne de pixels
            let textureY = Math.floor(y * scaleY);

            for (let x = 0; x < this.displayWidth; ++x) {
                // Calculer les coordonnées de texture pour ce pixel
                let textureX = Math.floor((x + offsetX) * scaleX) % this.skyboxImageData.width;

                // Trouver l'index du pixel dans le tableau de données de l'image
                let index = (textureX + textureY * this.skyboxImageData.width) * 4;

                // Extraire les valeurs de couleur du pixel
                let r = this.skyboxImageData.data[index];
                let g = this.skyboxImageData.data[index + 1];
                let b = this.skyboxImageData.data[index + 2];
                let a = this.skyboxImageData.data[index + 3];

                // Trouver l'index du pixel dans le tableau de données du backBuffer
                let backBufferIndex = (x + y * this.displayWidth) * 4;

                // Modifier les données du backBuffer pour mettre à jour le pixel
                this.backBuffer.data[backBufferIndex] = r;
                this.backBuffer.data[backBufferIndex + 1] = g;
                this.backBuffer.data[backBufferIndex + 2] = b;
                this.backBuffer.data[backBufferIndex + 3] = a;
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