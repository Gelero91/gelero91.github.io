const DESIRED_FPS = 60;
const UPDATE_INTERVAL = Math.trunc(1000 / DESIRED_FPS);

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

// Direction  - Orientation caméra
// Valeur étalon
const nord = Math.PI / 2;
const ouest = Math.PI;
const sud = (3 * Math.PI) / 2;
const est = 0;

// vérification de l'orientation visée
var orientationTarget;

// vérification de la distance parcourue par le joueur à chaque pas
var moveTargetX;
var moveTargetY;

// ces variables étaient anciennement dans la fonction d'avancée, c'était illogique
var forward;
var backward;

// Terminal du moteur
let consoleContent = "";
// valeurs pour vérification des doublons de terminalLog()
let lastEntry = "";

// Valeur hauteur de plafond
let ceilingHeight = 2;
let ceilingRender = false;

// Texture sol et plafond
let floorTexture = 3;
let ceilingTexture = 1;

var totalTimeElapsed = 0;
var timeSinceLastSecond = 0;

// animation referee : problème de gestion du temps, prends trop de ressource
let spriteAnimationProgress = 0;
let lastTime = new Date().getSeconds();

// Ingame 1sec Pause Timer
async function pause(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// initialisation du message d'intro du terminal, terminalLog n'est pas encore définit
document.addEventListener("DOMContentLoaded", function () {
  const outputElement = document.getElementById("output");

  function addToConsole(entry) {
    const consoleContent = outputElement.innerHTML;
    outputElement.innerHTML = consoleContent + "> " + entry + "<br>";
  }

  addToConsole("Welcome in Oasis !");
  addToConsole("Version pre-Alpha (conception)");
  addToConsole("");
  addToConsole("HOW TO PLAY :");
  addToConsole("'← ↑ → ↓' or use the joystick to move.");
  addToConsole("'A' button or 'space' to interact/fight.");
  addToConsole("'B' button to access your inventory/stats.");
  addToConsole("");
  addToConsole("N.B. : the joystick is crappy, sorry ♥");
  addToConsole("");
  addToConsole("=========================================");
});

function updateProgressBar(id, value, max) {
  const progressBar = document.getElementById(id);
  const progress = progressBar.querySelector(".progress");
  const percentage = (value / max) * 100;

  progress.style.width = `${percentage}%`;
}

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
  }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Contrôle UI & terminal log
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  static terminalLog(entry) {
    const outputElement = document.getElementById("output");
    const consoleContent = outputElement.innerHTML;

    if (entry === lastEntry) {
      outputElement.scrollTop = outputElement.scrollHeight;
      
    } else {
      outputElement.innerHTML = consoleContent + "> " + entry + "<br>";
      outputElement.scrollTop = outputElement.scrollHeight;

    }

    lastEntry = entry;
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
    shopName.textContent = "'"+this.spriteName+"'";
    
    if (this.spriteSell.length > 0) {
      shopContent.innerHTML = "";

      this.spriteSell.forEach((item) => {
        const itemIcon = document.getElementById("itemIcon").getAttribute("src");
        const swordIcon = document.getElementById("weaponIcon").getAttribute("src");
        const cloakIcon = document.getElementById("cloakIcon").getAttribute("src");

        let statsHTML = ""; 
        if (item.might !== 0) { statsHTML += `+${item.might} Might<br>`; }
        if (item.magic !== 0) { statsHTML += `+${item.magic} Magic<br>`; }
        if (item.dodge !== 0) { statsHTML += `+${item.dodge} Dodge<br>`; }
        if (item.armor !== 0) { statsHTML += `+${item.armor} Armor<br>`; }
        if (item.power !== 0) { statsHTML += `${item.power} Power<br>`; }
        statsHTML = statsHTML.slice(0, -2);

        let itemIconSrc = itemIcon;
        if (item.slot === 1) {
          itemIconSrc = swordIcon;
        } else if (item.slot === 2) {
          itemIconSrc = cloakIcon;
        }

        shopContent.innerHTML += `
          <button class="shop-item controlButton" style="line-height: 0.8;background-color: #281102; width:99%; margin-bottom: 5px; padding: 15px;" id="${item.name}" data-item="${item.name}">
            <div style="font-size: 15px; text-align: left; padding-top:5px;">
              <img src="${itemIconSrc}"> ► ${item.name}
            </div>
            <p style="font-size: 15px; text-align: left; padding-top:5px;">
            <font style="font-size: 25px;">$</font> ► FREE</p>
            <div style="text-align: right; line-height: 1.15;">${statsHTML}</div>
          </button><br>`;
      });

      // Ajoute des écouteurs d'événements aux boutons des objets
      document.querySelectorAll('.shop-item').forEach(button => {
        button.addEventListener('click', (event) => {
          const itemName = event.currentTarget.getAttribute('data-item');
          const itemToBuy = this.spriteSell.find(item => item.name === itemName);
          if (itemToBuy) {
            console.log("Buying item:", itemName);
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

      this.spriteSell = this.spriteSell.filter(sellItem => sellItem !== item);

      this.displayItemsForSale(player);
    } else {
      console.log("Player not defined");
    }
  }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Gestion des dialogues
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

    const showNextDialogue = () => {
      if (currentDialogue < this.spriteTalk.length) {
        const [face, name, entry] = this.spriteTalk[currentDialogue];

        // Vérifiez qu'ils ne sont pas undefined :
        if (face && name && entry) {
          dialogue.innerHTML = `<font style="font-weight: bold;">${name} </font> : <br> <font style="font-style: italic;"> ${entry} </font>`;

          var imgElement = document.getElementById(face);
          faceOutput.src = imgElement ? imgElement.src : '';

          Sprite.terminalLog(`<font style="font-weight: bold;">${name} </font> : <br> <font style="font-style: italic;"> ${entry} </font>`);
        }

        currentDialogue++;
      } else {
        // Fin du dialogue
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
// Animation de combat à revoir
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  async startSpriteFlash() {
    this.spriteFlash = 200;
    await new Promise((resolve) => setTimeout(resolve, 200));
    this.spriteFlash = 0;
  }

  async startAttackAnimation() {
    this.spriteFlash = 200;
    await new Promise((resolve) => setTimeout(resolve, 200));
    this.spriteFlash = 0;
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

    this.startSpriteFlash();
    
    player.XPstrength += 1;

    var entry =
      "<font style='font-style: italic;'>You attack : <font style='font-weight: bold;'>" +
      damage*factor +
      " dmg</font> points ! </font>";

    Sprite.terminalLog(entry);
  }

  enemyAttackUpdate(player) {
    if (this.hp <= 0) {
      let entry = "The enemy is dead!";

      Sprite.terminalLog(entry);

      this.spriteType = 0;
      this.spriteTexture = 10;
      this.dialogue = [["facePlayer", "Alakir", "It's dead..."]];
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

  
  //zzz
  async combatSpell(player, target) {
    if (player.turn == true) {
      // console.log(player.spells[player.selectedSpell].name)
      player.spells[player.selectedSpell].cast(player, target);
      
      this.enemyAttackUpdate(player);

      player.turn = false;
      player.combatSpell = false;
    } else {
      console.log('not your turn');
    }
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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Objets
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    
class Item {
  constructor(
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
    this.name = name;
    this.slot = slot;
    this.equipped = false;

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
}

// constructor(name, slot, equipped, power, strength, dexterity, intellect, might, magic, dodge, armor)
// Set d'objets test

const shortSwordAndShield = new Item("Short Sword and Shield",1,true,0,0,0,0,2,0,0,1);
const jacket = new Item("Quilted jacket", 2, true, 0, 0, 0, 0, 0, 0, 0, 1);
const magicSword = new Item("Magic sword",1,false,0,0,0,0,3,2,0,0);
const robe = new Item("robe", 2, true, 0, 0, 0, 0, 0, 0, 0, 1);


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Sortilèges
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  class Spell {
    constructor(name, manaCost, description, effect, selfCast, icon) {
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

                Sprite.terminalLog(`${caster.name} cast ${this.name} on ${target.name}`);
            } else {
                Sprite.terminalLog(`${caster.name} doesn't have enough mana to cast ${this.name}`);
            }
        } else {
            console.log("not your turn");
        }
    }

    // Fonction représentant l'effet de soins
    healEffect(caster, target) {
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
    damageEffect(caster, target) {
        Raycaster.playerHealFlash();
        target.startSpriteFlash();
        target.hp -= 2;
        caster.XPintellect += 1;
        Sprite.terminalLog(`${target.name} suffured 2 points of damage from ${caster.name}`);
    }
  }

  // Création d'un sort de soins
  const healSpell = new Spell(
    "Heal I",
    8,
      "Heal the player for 10hp.",
      function(caster, target) {
          healSpell.healEffect(caster, target);
      },
    true,
    "✙"
  );

  // Création d'un sort de dégâts
  const sparksSpell = new Spell(
    "Sparks",
    2,
    "Inflict 2pts of electric damage.",
      function(caster, target) {
          sparksSpell.damageEffect(caster, target);
      },
    false,
    "🗲"
  );

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Quêtes
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class Quest {
  constructor(title, description, reward, completed) {
      this.title = title;
      this.description = description;
      this.reward = reward;
      this.completed = false;
  }

  // Méthode pour marquer une quête comme complétée
  complete() {
    this.completed =  true;
    Sprite.terminalLog(`The quest "${this.title}" has been completed ! Reward : ${this.reward}`)
  }

  giveQuest() {

  }
}

  const testQuest = new Quest(
    "Welcome to Oasis !",
    "It's not fresh, but it's new...So please, enjoy my little baby !",
    "<3",
    false
  );

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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Carte
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  initMap() {
    // carte 
    // worldmap
    this.map = 
    [
      [1,1,1,1,1,1,1,1,3,3,3,3,3,1,9,9,1,3,3,3,3,3,3,3],
      [2,2,0,0,0,0,0,2,3,3,0,0,0,1,0,0,1,0,0,3,3,3,3,3],
      [2,2,0,0,0,0,0,2,3,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3],
      [2,2,0,0,0,0,0,2,3,1,0,0,0,0,0,0,0,0,0,15,15,15,3],
      [1,1,1,1,0,1,1,1,1,1,0,0,0,0,0,0,0,0,14,0,0,0,15,3],
      [2,2,0,0,0,0,0,1,2,0,0,0,0,0,0,0,0,0,16,0,0,0,15,3],
      [2,0,0,0,0,0,0,0,6,0,0,0,0,0,0,0,0,0,14,0,0,0,15,3],
      [2,2,0,0,0,0,0,1,2,0,0,0,0,0,0,0,0,0,15,15,15,15,3],
      [1,1,1,1,0,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,24,24],
      [1,0,0,0,0,0,0,1,24,1,0,0,0,0,0,0,0,0,0,0,24,0,24,24],
      [1,0,0,0,1,1,0,1,24,0,0,0,14,16,15,14,0,0,24,24,24,24,24,24],
      [1,0,0,0,1,0,0,0,1,24,0,0,15,0,0,0,15,0,24,3,3,3,3,3],
      [1,0,0,0,1,0,0,0,1,24,0,15,0,0,0,0,15,24,24,3,0,0,3,3],
      [1,2,6,2,1,1,1,1,1,3,24,15,0,0,0,0,15,3,3,3,0,0,0,3],
      [3,3,0,3,3,3,3,3,3,3,24,0,15,15,15,15,15,3,0,0,3,0,0,3],
      [3,0,0,3,3,3,0,0,3,3,3,24,3,3,3,3,3,0,0,0,3,3,0,3],
      [3,0,3,3,0,0,0,0,0,3,3,3,0,0,0,0,0,0,3,0,0,3,3,3],
      [3,0,0,0,0,0,0,0,0,0,0,0,0,3,3,3,3,3,3,0,0,0,3,3],
      [3,3,3,3,0,0,0,0,0,3,3,3,3,3,0,0,0,3,0,0,3,0,3,3],
      [3,0,0,3,3,3,0,3,3,3,0,0,0,3,0,0,0,3,0,3,3,0,3,3],
      [3,0,0,3,3,3,0,3,0,0,0,0,0,3,0,0,0,3,0,3,0,0,0,3],
      [3,0,0,0,0,0,0,0,0,3,0,0,0,3,3,0,3,3,0,3,0,0,0,3],
      [3,0,0,3,3,3,3,3,3,3,0,0,0,3,3,0,0,0,0,3,0,0,0,3],
      [3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3]
  ];

    // liste des téléporteurs 
    // mapEvent lists
    /* 
        Memo organisation des téléporteurs
        const mapEventX = [[Y, X, Rotation, RenduPlafond, TexturePlafond, HauteurPlafond, TextureSol, Contextualisation],]];
    */

    this.mapEventA = [
      [17, 5, ouest, false, 3, 2, 3, "Moving out..."],
      [13, 9, nord, false, 1, 2, 3, "Moving out..."],
      [9, 6, est, false, 3, 2, 3, "Moving out..."],
      [2, 12, nord, true, 2, 1, 2, "Moving out of the dungeon !"],
    ];

    this.mapEventB = [
      [19, 5, est, true, 3, 1, 2, "Moving in !"],
      [13, 11, sud, true, 3, 1, 4, "Moving in !"],
      [7, 6, ouest, true, 2, 1, 2, "Moving in !"],
      [2, 14, sud, true, 1, 1, 1, "It's a pretty scary place..."],
    ];

    /* Prototype de fusion des deux listes de téléporteurs
    const mapTeleports = [
      [[17, 5, ouest, false, 3, 2, 3, "Moving out..."][19, 5, est, true, 3, 1, 2, "Moving in !"]],
      [[13, 9, nord, false, 1, 2, 3, "Moving out..."][13, 11, sud, true, 3, 1, 4, "Moving in !"]],
      [[9, 6, est, false, 3, 2, 3, "Moving out..."][7, 6, ouest, true, 2, 1, 2, "Moving in !"]],
      [[2, 12, nord, true, 2, 1, 2, "Moving out of the dungeon !"][2, 14, sud, true, 1, 1, 1, "It's a pretty scary place..."]],
    ];
    */
  }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Joueur
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  initPlayer() {
    const tileSizeHalf = Math.floor(this.tileSize / 2);

    this.player = {
      name: "Alakir",

      x: 14 * this.tileSize + tileSizeHalf,
      y: 1 * this.tileSize + tileSizeHalf,
      z: 0,
      dir: 0,
      rot: 4.71238898038469,
      quadrant : "",
      speed: 0,

      moveSpeed: Math.round(this.tileSize / ((DESIRED_FPS / 60.0) * 16)),
      rotSpeed: (1.5 * Math.PI) / 180,

      hp: 10,
      mp: 10,
      
      hpMax: 10,
      mpMax: 10,

      turn:true,

      strength: 5,
      dexterity: 5,
      intellect: 5,

      // Valeur de référence pour pour éviter incrémentation infinie de statsUpdate(player)
      oldStrength : 5,
      oldDexterity : 5,
      oldIntellect : 5,

      XPstrength: 0,
      XPdexterity: 0,
      XPintellect:0,

      might: 1,
      dodge: 1,
      magic: 1,
      armor: 0,

      hands: [],
      torso: [],

      inventory: [shortSwordAndShield, jacket],
      inventoryMenuShowed: false,

      spells: [healSpell, sparksSpell],
      selectedSpell : 0,
      combatSpell : false,

      quests: [testQuest],
      
      joystick: true,

      playerFace: "playerFace",
    };

    // ajout de "this.statsUpdate", pour remplacer les manipulations HTML redondantes
    this.statsUpdate(this.player)
  }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// méthode calcul quadrant et stockage de la valeur dans Player
// refactorisation de la méthode Move(), subdivisée en sous-méthodes
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  playerQuadrant(player) {
    const quadrants = [
        { min: 337.5, max: 360, name: "ouest" },
        { min: 0, max: 22.5, name: "ouest" },
        { min: 22.5, max: 67.5, name: "nord-ouest" },
        { min: 67.5, max: 112.5, name: "nord" },
        { min: 112.5, max: 157.5, name: "nord-est" },
        { min: 157.5, max: 202.5, name: "est" },
        { min: 202.5, max: 247.5, name: "sud-est" },
        { min: 247.5, max: 292.5, name: "sud" },
        { min: 292.5, max: 337.5, name: "sud-ouest" }
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
  
  handleSlidingCollision(player) {
    const { x, y, quadrant } = player;
    const tileSize = this.tileSize;
    const map = this.map;

    const slidingMovements = {
        "sud-ouest": [{ y: 30, x: 0 }, { y: 0, x: 30 }],
        "sud-est": [{ y: 30, x: 0 }, { y: 0, x: -30 }],
        "nord-ouest": [{ y: -30, x: 0 }, { y: 0, x: 30 }],
        "nord-est": [{ y: -30, x: 0 }, { y: 0, x: -30 }]
    };

    const movements = slidingMovements[quadrant] || [];

    for (const movement of movements) {
        const newX = x + movement.x;
        const newY = y + movement.y;
        const tileX = Math.floor(newX / tileSize);
        const tileY = Math.floor(newY / tileSize);

        if (map[tileY][tileX] === 0) {
            player.x = newX;
            player.y = newY;
            break;
        }
    }
  }

  calculateFrontPosition() {
    const player = this.player;
    if (!player) {
        console.error('Player is undefined');
        return { frontX: null, frontY: null };
    }

    const { x, y, quadrant } = player;

    const frontOffsets = {
        "nord-ouest": { x: 0.5, y: -0.5 },
        "nord": { x: 0, y: -1 },
        "nord-est": { x: -0.5, y: -0.5 },
        "est": { x: -1, y: 0 },
        "sud-est": { x: -0.5, y: 0.5 },
        "sud": { x: 0, y: 1 },
        "sud-ouest": { x: 0.5, y: 0.5 },
        "ouest": { x: 1, y: 0 }
    };

    const offset = frontOffsets[quadrant];
    const frontX = Math.floor((x / this.tileSize) + offset.x);
    const frontY = Math.floor((y / this.tileSize) + offset.y);

    return { frontX, frontY };
  }

  handleSpriteAction(action) {
    if (!action || !this.player || !this.player.turn) return;

    const { frontX, frontY } = this.calculateFrontPosition();

    if (frontX === null || frontY === null) {
        console.error('Failed to calculate front position');
        return;
    }

    for (const sprite of this.sprites) {
        if (Math.floor(sprite.x / this.tileSize) === frontX && Math.floor(sprite.y / this.tileSize) === frontY) {
            switch (sprite.spriteType) {
                case "A":
                    if (this.player.combatSpell) {
                        sprite.combatSpell(this.player, sprite);
                    } else {
                        sprite.combat(this.player.might, this.player.criti, this.player);
                    }
                    break;
                case 0:
                    sprite.talk(sprite.spriteTalk, sprite.spriteFace);
                    this.player.turn = false;
                    break;
                case 1:
                    // décoration, ne rien faire
                    break;
                case 2:
                    sprite.talk(sprite.spriteTalk, sprite.spriteFace);
                    this.player.turn = false;
                    break;
                case 3:
                    sprite.displayItemsForSale(this.player);
                    this.player.turn = false;
                    break;
                case 4:
                    // gestion des quêteurs
                    break;
                case 5:
                    // valeur fixe de test, normalement valeur de sprite
                    this.player.quests[0].complete();
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
      for (var i = 0; i < mapEventA.length; i++) {
          if (
              Math.floor(newX / tileSize) === mapEventA[i][0] &&
              Math.floor(newY / tileSize) === mapEventA[i][1]
          ) {
              // téléportation aux coordonnées données dans l'Event
              newX = mapEventB[i][0] * tileSize + 640;
              newY = mapEventB[i][1] * tileSize + 640;
              player.rot = mapEventB[i][2];

              // variable de modification d'environnement
              ceilingRender = mapEventB[i][3];
              ceilingTexture = mapEventB[i][4];
              ceilingHeight = mapEventB[i][5];
              // variable de modification des textures (vers le type '1' = terre)
              floorTexture = mapEventB[i][6];
              // On recharge toutes les textures, sinon le canvas ne sera pas modifié
              this.loadFloorCeilingImages();
              console.log(mapEventB[i][7]);

              // évite les double-téléportation
              await pause(250);
              // set new position
              player.x = newX;
              player.y = newY;
              
              break; // Sortir de la boucle une fois la téléportation effectuée
          }
          // On compare également les coordonnées suivantes pour aller/retour
          if (
              Math.floor(newX / tileSize) === mapEventB[i][0] &&
              Math.floor(newY / tileSize) === mapEventB[i][1]
          ) {
              // téléportation aux coordonnées données dans l'Event
              newX = mapEventA[i][0] * tileSize + 640;
              newY = mapEventA[i][1] * tileSize + 640;
              player.rot = mapEventA[i][2];

              // variable de modification d'environnement
              ceilingRender = mapEventA[i][3];
              ceilingTexture = mapEventA[i][4];
              ceilingHeight = mapEventA[i][5];
              // variable de modification des textures (vers le type '1' = terre)
              floorTexture = mapEventA[i][6];
              // On recharge toutes les textures, sinon le canvas ne sera pas modifié
              this.loadFloorCeilingImages();
              console.log(mapEventA[i][7]);

              // évite les double-téléportation
              await pause(250);
              // set new position
              player.x = newX;
              player.y = newY;

              break; // Sortir de la boucle une fois la téléportation effectuée
          } else {
              // console.log(false);
          }
        }
  }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// sélection et lancement de sort
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  nextSpell() {
    this.player.selectedSpell++;
    if (this.player.selectedSpell >= this.player.spells.length) {
        this.player.selectedSpell = 0;
    }
    const currentSpellIcon = document.getElementById("castSpell");
    currentSpellIcon.textContent = this.player.spells[this.player.selectedSpell].icon;

    const currentSpellName = document.getElementById("selectedSpell");
    currentSpellName.textContent = this.player.spells[this.player.selectedSpell].name;
  }

  previousSpell() {
    this.player.selectedSpell--;
    if (this.player.selectedSpell < 0) {
        this.player.selectedSpell = this.player.spells.length - 1;
    }
    const currentSpellIcon = document.getElementById("castSpell");
    currentSpellIcon.textContent = this.player.spells[this.player.selectedSpell].icon;

    const currentSpell = document.getElementById("selectedSpell");
    currentSpell.textContent = this.player.spells[this.player.selectedSpell].name;
  }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// fonction update des stats du joueurs (à chauqe seconde, à intégrer au gamecycle)
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  statsUpdate(player) {
    // Old Progress bar
    const playerHP = document.getElementById("PlayerHPoutput");
    const playerMP = document.getElementById("PlayerMPoutput");
    const playerXP = document.getElementById("PlayerXPoutput");

    playerHP.textContent = player.hp;
    playerMP.textContent = player.mp;
    playerXP.textContent = player.xp;

    var hpBar = document.getElementById("hpBar");
    var mpBar = document.getElementById("mpBar");
    var xpBar = document.getElementById("xpBar");

    hpBar.value = player.hp;
    mpBar.value = player.mp;

    updateProgressBar("hpBar", player.hp, 10);
    updateProgressBar("mpBar", player.mp, 10);

    const playerStr = document.getElementById("PlayerStrOutput");
    const playerDex = document.getElementById("PlayerDexOutput");
    const playerInt = document.getElementById("PlayerIntOutput");

    playerStr.textContent = player.strength;
    playerDex.textContent = player.dexterity;
    playerInt.textContent = player.intellect;

    if (player.XPstrength >= 10) {
      player.XPstrength = 0;
      player.strength +=1;
      console.log("Strength leveled up !")
    }

    if (player.XPdexterity >= 10) {
      player.XPdexterity = 0;
      player.dexterity +=1;
      console.log("Dexterity leveled up !")
    }

    if (player.XPintellect >= 10) {
      player.XPintellect = 0;
      player.intellect +=1;
      console.log("Intellect leveled up !")
    }

    updateProgressBar("strengthBar", player.XPstrength, 10);
    updateProgressBar("dexterityBar", player.XPdexterity, 10);
    updateProgressBar("intellectBar", player.XPintellect, 10);

    // Mana regen + maximum mana
    if (player.mp < player.mpMax) {
      player.mp += (player.intellect / 50);
    } else {
      player.mp = player.mpMax;
    }
    
    // Maximum hp
    if (player.hp > player.hpMax) {
    player.hp = player.hpMax;
    } else {
    }

    // FONCTION DEATH
    if (player.hp > 0) {
    } else {
      Raycaster.death();
    }

    // On base les HP sur la force & MP sur l'intellect
    player.hpMax = 10 + (player.strength - 5);
    player.mpMax = 10 + (player.intellect - 5);

    // on vérifie s'il y a une différence entre l'ancienne valeur et la nouvelle
  
    if (player.strength !== player.oldStrength) {
      player.might += (player.strength - 5);
      player.oldStrength = player.strength;
    }
    
    if (player.intellect !== player.oldIntellect) {
      player.might += (player.intellect - 5);
      player.oldIntellect = player.intellect;
    }

    player.dodge = player.dexterity * 2;
    player.armor = player.armor;
    player.criti = player.dexterity * 2;

    const playerMight = document.getElementById("PlayerMightOutput");
    const playerDodge = document.getElementById("PlayerDodgeOutput");
    const playerMagic = document.getElementById("PlayerMagicOutput");
    const playerArmor = document.getElementById("PlayerArmorOutput");
    const playerCriti = document.getElementById("PlayerCritiOutput");

    playerMight.textContent = player.might;
    playerDodge.textContent = player.dodge;
    playerMagic.textContent = player.magic;
    playerArmor.textContent = player.armor;
    playerCriti.textContent = player.criti;

    // affichage du sort sélectionné et de son icone
    const currentSpell = document.getElementById("selectedSpell");
    currentSpell.textContent = player.spells[player.selectedSpell].name;

    const currentSpellIcon = document.getElementById("castSpell");
    currentSpellIcon.textContent = this.player.spells[this.player.selectedSpell].icon;
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
    setTimeout(function () {
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
    setTimeout(function () {
      // laisser vide pour éviter de cumuler style et classe
      element.style.backgroundColor = "";
      element.style.filter = "";
    }, 100);
  }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// fonction DEATHHHH
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  static async death() {
    Sprite.terminalLog("YOOOU'RE DEEEAD !");
    Sprite.terminalLog("The page is going to refresh in 3seconds...");
    Sprite.terminalLog("HEAL AND EQUIP YOURSELF, GODDAMIT !")
    Sprite.playerDamageFlash
    await new Promise((resolve) => setTimeout(resolve, 3000))
    location.reload();
  }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// EQUIPEMENT INVENTAIRE
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  displayInventory() {
    const inventoryContent = document.getElementById("inventoryContent");

    if (this.player.inventory.length > 0) {

      inventoryContent.innerHTML = "";
      
      this.player.inventory.forEach((item) => {
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
    if (this.player.hands && this.player.hands.length > 0) {
      handsContent.innerHTML = `<button class="equipped-item" style ="color:black;" data-item="${this.player.hands[0].name}">${this.player.hands[0].name}</button>`;
    } else {
      handsContent.innerHTML = "EMPTY";
    }

    // Vérifiez si torso est défini et non vide
    if (this.player.torso && this.player.torso.length > 0) {
      torsoContent.innerHTML = `<button class="equipped-item" style ="color:black;" data-item="${this.player.torso[0].name}">${this.player.torso[0].name}</button>`;
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
            this.player.inventory.find((item) => item.name === itemName) ||
            (this.player.hands && this.player.hands[0]) ||
            (this.player.torso && this.player.torso[0]);

          if (clickedItem) {
            if (clickedItem.equipped) {
              console.log("equipped");
              clickedItem.unequip(this.player);
            } else {
              console.log("unequipped");
              clickedItem.equip(this.player);
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

      this.player.inventoryMenuShowed = true;
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

    if (this.player.quests.length > 0) {
        questContent.innerHTML = "";
        this.player.quests.forEach((quest) => {
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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Initialisation des sprites
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  initSprites() {
    // Mettre le sprite au centre de la cellule
    const tileSizeHalf = Math.floor(this.tileSize / 2);

    this.sprites = [];

    // Liste pour stocker les sprites décoratifs supplémentaires
    let additionalDecoration = [];
    let additionalDecorationCount = 0;
    let additionalDecorationSpriteCount = 0;

    // Positions des sprites avec les commentaires
    // [x, y, type, texture, face, name, dialogue, spriteSell]

      // Liste des positions des sprites avec les valeurs supplémentaires
      let spritePositions = [
        // [x, y, type, texture, face, name, dialogue, spriteSell]
        [17, 6, 2, 1, "faceThief", "Tarik the Thief", [
            ["facePlayer", "Alakir", "Hello there! What's the news?"],
            ["faceThief", "Tarik the Thief", "Welcome adventurer! <br> You should talk to the guards, near the temple. They have a situation."],
            ["facePlayer", "Alakir", "Thanks for the info, I'll head there right away."]
        ], []], // Personnage 1
        [9, 5, 2, 2, "faceGuard", "Guard", [
            ["facePlayer", "Alakir", "Hello, I'm an adventurer. <br> Do you need any help?"],
            ["faceGuard", "Guard", "Hello adventurer. <br> We need help in the temple, the crypts are invaded by critters."],
            ["facePlayer", "Alakir", "Thanks for the info, I'll take care of that."]
        ], []], // Personnage 2
        [4, 1, 2, 2, "faceGuard", "Guard", [
            ["facePlayer", "Alakir", "Hello, I'm an adventurer. <br> Do you need any help?"],
            ["faceGuard", "Guard", "Hello adventurer. <br> We need help in the temple, the crypts are invaded by critters."],
            ["facePlayer", "Alakir", "Thanks for the info, I'll take care of that."]
        ], []], // Personnage 3
        [14, 13, 3, 3, "faceMerchant", "Quill the Merchant", [
            ["facePlayer", "Alakir", "Hey!"],
            ["faceMerchant", "Quill the Merchant", "Oy mate! Want to buy something?"],
            ["facePlayer", "Alakir", "Oh, okay. Maybe later."]
        ], [robe, magicSword]], // PNJ marchant

      // "End of demo"
      [15, 18, 5, 9],  // Fin de la démo

      // Ennemis
      [4, 17, "A", "A"],   // Ennemi 1
      [19, 15, "A", "A"],  // Ennemi 2
      [21, 20, "A", "A"],  // Ennemi 3

      // Dummy for testing
      // [14, 4, "A", "A"],

      // Décorations
      [7, 16, 1, 4],   // Décoration 1
      [20, 16, 1, 4],  // Décoration 2
      [14, 9, 2, 7, "facePlayer", "facePlayer", [
        ["facePlayer", "Quill's shop", "Hard discount on adventure gear (No refund in case of death)"],
      ], []], // Décoration 3 - Pancarte "Quill's Shop"
      [1, 6, 1, 11],  // Décoration 4

      // Bushes
      [17, 3, 1, 6],   // Bush 1
      [15, 7, 1, 6],   // Bush 2
      [10, 10, 1, 6],  // Bush 3
      [12, 3, 1, 6],   // Bush 4
      [19, 9, 1, 6],   // Bush 5
      [9, 7, 1, 6],    // Bush 6

      // Torches
      [2, 7, 1, 12],   // Torche 1
      [2, 5, 1, 12],   // Torche 2
      [6, 7, 1, 12],   // Torche 3
      [6, 5, 1, 12],   // Torche 4
      [2, 3, 1, 12],   // Torche 5
      [6, 3, 1, 12],   // Torche 6
      [1, 9, 1, 12],   // Torche 7

      // Sac
      [7, 12, 1, 17],  // Sac 1
      [20, 4, 1, 17],  // Sac 2
      [13, 13, 1, 17], // Sac 3

      // Barrel
      [16, 9, 1, 5],   // Barrel 1
      [15, 13, 1, 5],  // Barrel 2
      [17, 7, 1, 5],   // Barrel 3
      [5, 11, 1, 5],   // Barrel 4
      [21, 6, 1, 5],   // Barrel 5
      [15, 11, 1, 5],  // Barrel 6

      // Colonnes
      [3, 7, 1, 16],   // Colonne 1
      [3, 5, 1, 16],   // Colonne 2
      [5, 5, 1, 16],   // Colonne 3
      [5, 7, 1, 16],   // Colonne 4
      [2, 1, 1, 16],   // Colonne 5
      [6, 1, 1, 16],   // Colonne 6
      [3, 11, 1, 16],  // Colonne 7
      [1, 11, 1, 16],  // Colonne 8

      // Arbres
      [16, 4, 1, 15],  // Arbre 1
      [10, 9, 1, 15],  // Arbre 2
      [11, 1, 1, 15],  // Arbre 3

      // Herbes
      [10, 1, 10, 13], [11, 1, 10, 13], [12, 1, 10, 13], [17, 1, 10, 13], [18, 1, 10, 13], [9, 2, 10, 13], [11, 2, 10, 13], [15, 2, 10, 13], [17, 2, 10, 13], [19, 2, 10, 13], [10, 3, 10, 13], [11, 3, 10, 13], [12, 3, 10, 13], [10, 4, 10, 13], [11, 5, 10, 13], [13, 5, 10, 13], [15, 5, 10, 13], [10, 7, 10, 13], [14, 7, 10, 13], [16, 7, 10, 13], [22, 7, 10, 13], [10, 8, 10, 13], [12, 8, 10, 13], [15, 8, 10, 13], [20, 8, 10, 13], [21, 8, 10, 13], [22, 8, 10, 13], [10, 9, 10, 13], [11, 9, 10, 13], [17, 9, 10, 13], [18, 9, 10, 13], [19, 9, 10, 13], [21, 9, 10, 13], [9, 10, 10, 13], [17, 10, 10, 13], [10, 11, 10, 13], [17, 11, 10, 13], [10, 12, 10, 13], [11, 12, 10, 13], [11, 13, 10, 13], [11, 14, 10, 13],
    ];

    for (let pos of spritePositions) {
        let x = pos[0] * this.tileSize + tileSizeHalf;
        let y = pos[1] * this.tileSize + tileSizeHalf;

        let type = pos[2];
        let texture = pos[3];
        let face = pos[4];
        let name = pos[5];
        let dialogue = pos[6];
        let spriteSell = pos[7] || [];

        // valeur par défaut, 
        // à changer selon la liste ou le type (pour l'instant osef)
        let hp = 2;
        let dmg = 1;

        // Si le type de sprite est 10 (sprites décoratifs), générez des décorations supplémentaires
        if (type === 10) {
          // Générer des herbes supplémentaires et stockez-les dans additionalDecoration
          for (let j = 0; j < 2; j++) {
              let newX = x + (Math.random() * 2 - 1) * tileSizeHalf;
              let newY = y + (Math.random() * 2 - 1) * tileSizeHalf;
              
              let newDecoration = new Sprite(newX, newY, 0, this.tileSize, this.tileSize, 13, 13, false);

              newDecoration.spriteTexture = 13;

              newDecoration.spriteType = 1;
              newDecoration.isBlocking = false;

              additionalDecoration.push(newDecoration);

              additionalDecorationCount++;
          }
          additionalDecorationSpriteCount++;
        } else {
          // Créer le sprite avec isBlocking en fonction du type
          let isBlocking = true;
          this.sprites.push(new Sprite(x, y, 0, this.tileSize, this.tileSize, 0, type, texture, isBlocking, false, true, hp, dmg, 0, name, face, dialogue, spriteSell));
        }

        if (!dialogue && !face && !name) {
            type = 1;
        }      
    }

    // Ajoutez les décorations supplémentaires à la liste principale de sprites
    for (let newDecoration of additionalDecoration) {
        this.sprites.push(newDecoration);
    }

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
  ) 
  {
    this.initMap();
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
    this.initSprites();
    this.bindKeysAndButtons();
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
    screen.style.width = this.displayWidth*2 + "px";
    screen.style.height = this.displayHeight*2 + "px";
    //screen.style.width = this.displayWidth + "px";
    //screen.style.height = this.displayHeight + "px";
    this.mainCanvas.width = this.displayWidth;
    this.mainCanvas.height = this.displayHeight;
    this.loadFloorCeilingImages();
  }

  loadFloorCeilingImages() {
    // Draw images on this temporary canvas to grab the ImageData pixels
    let canvas = document.createElement("canvas");

    // Canvas needs to be big enough for the wall texture
    //this.textureSize*x
    //x correspond au nombre de textures (de haut en bas) sur imgWall
    //exemple : texture n°4 = 4ème texture, soit entre 3*64px et 4*64px
    canvas.width = this.textureSize * 2;
    canvas.height = this.textureSize * 24;
    let context = canvas.getContext("2d");

    // Skybox Test
    // multiplier texture size selon taille de la texture,
    // sinon réglé comme un sprite
    let skyboximg = document.getElementById("skybox1");
    context.drawImage(skyboximg, 0, 0, skyboximg.width, skyboximg.height);
    this.skyboxImageData = context.getImageData(0,0,this.textureSize * 2,this.textureSize * 3);

    // initialisation de la variable floorimg qui stoque la texture en base64 (pixels)
    // let floorimg;
    // NON -> si déclaration de variable, alors réinitialisation des textures. A faire après condition.

    // MARQUEUR : Chargement des textures sol plafond mur sprites

    // selon le type de sol, la texture est adaptée
    if (floorTexture == 1) {
      let floorimg = document.getElementById("floorimg1");
      context.drawImage(floorimg, 0, 0, floorimg.width, floorimg.height);
      this.floorImageData = context.getImageData(0,0,this.textureSize,this.textureSize);
    } else if (floorTexture == 2) {
      let floorimg = document.getElementById("floorimg2");
      context.drawImage(floorimg, 0, 0, floorimg.width, floorimg.height);
      this.floorImageData = context.getImageData(0,0,this.textureSize,this.textureSize);
    } else if (floorTexture == 3) {
      let floorimg = document.getElementById("floorimg3");
      context.drawImage(floorimg, 0, 0, floorimg.width, floorimg.height);
      this.floorImageData = context.getImageData(0,0,this.textureSize,this.textureSize);
    } else if (floorTexture == 4) {
      let floorimg = document.getElementById("floorimg4");
      context.drawImage(floorimg, 0, 0, floorimg.width, floorimg.height);
      this.floorImageData = context.getImageData(0,0,this.textureSize,this.textureSize);
    }

    // Save ceiling image pixels
    if (ceilingTexture == 1) {
      let ceilingimg = document.getElementById("ceilingimg1");
      context.drawImage(ceilingimg, 0, 0, ceilingimg.width, ceilingimg.height);
      this.ceilingImageData = context.getImageData(0,0,this.textureSize,this.textureSize);
    } else if (ceilingTexture == 2) {
      let ceilingimg = document.getElementById("ceilingimg2");
      context.drawImage(ceilingimg, 0, 0, ceilingimg.width, ceilingimg.height);
      this.ceilingImageData = context.getImageData(0,0,this.textureSize,this.textureSize);
    } else if (ceilingTexture == 3) {
      let ceilingimg = document.getElementById("ceilingimg3");
      context.drawImage(ceilingimg, 0, 0, ceilingimg.width, ceilingimg.height);
      this.ceilingImageData = context.getImageData(0,0,this.textureSize,this.textureSize);
    }

    // Save walls image pixels
    let wallsImage = document.getElementById("wallsImage");
    context.drawImage(wallsImage, 0, 0, wallsImage.width, wallsImage.height);
    this.wallsImageData = context.getImageData(0,0,wallsImage.width,wallsImage.height);
    console.log("wallsImage.width=" + wallsImage.width);

    // Save sprite image pixels
    canvas = document.createElement("canvas");
    context = canvas.getContext("2d");

    // Save sprite image pixels
    // tableau avec les identifiants des éléments d'image (les noms dans le html)
    // pour l'exercice sur les animations, j'ai inversé 8 et 14.
    // sprite 15 = test
    const spriteIds = [
      "sprite1",
      "sprite2",
      "sprite3",
      "sprite4",
      "sprite5",
      "sprite6",
      "sprite7",
      "sprite14",
      "sprite9",
      "sprite10",
      "sprite11",
      "sprite12",
      "sprite13",
      "sprite8",
      "sprite15",
      "sprite16",
      "sprite17",
      "sprite18",
    ];

    // On parcours le tableau et effectue les opérations pour chaque élément,
    // plutôt que les répéter comme avant.
    spriteIds.forEach((spriteId, index) => {
      let spriteImage = document.getElementById(spriteId);

      let canvas = document.createElement("canvas");
      let context = canvas.getContext("2d");
      canvas.width = spriteImage.width;
      canvas.height = spriteImage.height;
      // animation sprite marqueur xxx
      context.drawImage(spriteImage,0,0,spriteImage.width,spriteImage.height);
      this["spriteImageData" + (index + 1)] = context.getImageData(0,0,spriteImage.width,spriteImage.height);
      console.log(`spriteImage${index + 1}.width = ${spriteImage.width}`);
    });
  }

//////////////////////////////////////////////////////////////////////////////
/// CONTROLES - liaisons des boutons à un événement
//////////////////////////////////////////////////////////////////////////////

  // Case selon type de bouton appuyée, les ID sont liées à un nombre dans "bindKeysAndButtons"
  handleButtonClick(buttonNumber) {
    switch (buttonNumber) {
      case 1: // ACTION
        Sprite.resetToggle();
          if (this.player.turn == true) {
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
        if (this.player.spells[this.player.selectedSpell].selfCast == true) {
          console.log("self cast !")
          this.player.spells[this.player.selectedSpell].cast(this.player, this.player);
        } else {
          console.log("not a selfCast")
          console.log("magic combat = true")          
          if (this.player.turn == true) {
            console.log('Attack spell casted')
            //zzz
            this.actionButtonClicked = true;
            this.player.combatSpell = true;
          }
        }
        break;
      case 15:
        this.nextSpell();
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
  bindKeysAndButtons() {
    this.keysDown = [];
    let this2 = this;
  
    // Liaison des touches
    document.onkeydown = function (e) {
      e = e || window.event;
      this2.keysDown[e.keyCode] = true;
    };
    document.onkeyup = function (e) {
      e = e || window.event;
      this2.keysDown[e.keyCode] = false;
    };
  
/////////////////////////////////////////////////////////
//  CONTROLES - JOYSTICK
/////////////////////////////////////////////////////////
  
    document.addEventListener("joystickchange", function (event) {
      const { up, down, left, right } = event.detail;
      if (up) {
        joystickForwardClicked = true;
      } else if (down) {
        joystickBackwardClicked = true;
      } else if (left) {
        joystickLeftClicked = true;
      } else if (right) {
        joystickRightClicked = true;
      } else {
        joystickForwardClicked = false;
        joystickBackwardClicked = false;
        joystickLeftClicked = false;
        joystickRightClicked = false;
      }
    });
  
/////////////////////////////////////////////////////////
// Liaison des boutons avec événement
/////////////////////////////////////////////////////////  

    this.bindButton("button1", 1);
    this.bindButton("button2", 2);
    this.bindButton("button3", 3);
    // this.bindButton('button4', 4);
    this.bindButton("button5", 5);
    // this.bindButton('button6', 6);
    this.bindButton("button7", 7);
    this.bindButton("button8", 8);
    this.bindButton("button9", 9);
    this.bindButton("joystickBackButton", 10);
    this.bindButton("QuestButton", 11);
    this.bindButton("InventoryButton", 12);
    this.bindButton("previousSpell", 13);
    this.bindButton("castSpell", 14);
    this.bindButton("nextSpell", 15);
  }
  
//////////////////////////////////////////////////////////////////////////////
/// HORLOGE DU JEUX / GAMECYCLE
//////////////////////////////////////////////////////////////////////////////

  gameCycle() {
    const now = Date.now();
    let timeElapsed = now - this.past;
    this.past = now;
    this.move(timeElapsed);
    this.updateMiniMap();
    let rayHits = [];
    this.resetSpriteHits();
    this.castRays(rayHits);
    this.sortRayHits(rayHits);
    this.drawWorld(rayHits);
    let this2 = this;
    window.requestAnimationFrame(function () {
      this2.gameCycle();
    });

//////////////////////////////////////////////////////////////////////////////
/// UNITE TEMPORELLE ("TOUR") redondant
//////////////////////////////////////////////////////////////////////////////

    // NOTE : 
    // GESTION DES ANIMATIONS PAR VARIABLE POUR CHAQUE INSTANCE DE SPRITE

    // Utilisation de totalTimeElapsed pour calculer un délai d'une seconde
    // La valeur est initialisée au début du code
    totalTimeElapsed += timeElapsed;

    const oneSecond = 1000; // 1 seconde en millisecondes

    timeSinceLastSecond += timeElapsed;

    if (timeSinceLastSecond >= oneSecond) {
      // console.log("Délai d'un tour atteint, pas de minuterie CPU")
      this.statsUpdate(this.player);
      this.player.turn = true;
      timeSinceLastSecond -= oneSecond;
    }
  }

  stripScreenHeight(screenDistance, correctDistance, heightInGame) {
    return Math.round((screenDistance / correctDistance) * heightInGame);
  }

///////////////////////////////////////////////////////////////////////////////////////////////
// drawwall - gestion prototype des differentes texture et hauteur
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
      let texY = texStartY, screenY = screenStartY;
      screenY < dstEndY && screenY < this.displayHeight;
      screenY++, texY += texStepY
    ) {
      for (
        let texX = texStartX, screenX = screenStartX;
        screenX < dstEndX && screenX < this.displayWidth;
        screenX++, texX += texStepX
      ) {
        let textureX = Math.trunc(texX);
        let textureY = Math.trunc(texY);

        // problème de gestion du temps, demande beaucoup trop de ressources
        // Récupérez les secondes actuelles, cependant, à faire EN DEHORS DE LA BOUCLE !
        // const currentTime = new Date().getSeconds();

        // Récupérez les secondes actuelles, EN DEHORS DE LA BOUCLE, pour éviter la surcharge

        // METTRE VARIABLE DANS CHAQUE INSTANCE DE SPRITE POUR GERER LES ANIMATIONS
        const currentTime = new Date().getSeconds();

        // créer boucle qui prends en compte une valeur de chaque sprite (this.sprite.animationProgress)

        // Vérifiez si une seconde s'est écoulée depuis la dernière vérification
        if (currentTime !== lastTime) {
          // Incrémentez animationProgress pour chaque sprite
          spriteAnimationProgress += 1;
          if (spriteAnimationProgress === 3) {
            // problème : ça marche que pour un sprite ça, ou tous
            spriteAnimationProgress = 0;
          }
          //console.log(spriteAnimationProgress);
        }
        // applique une nouvelle valeur de comparaison pour boucle
        lastTime = currentTime;

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
// fonction drawsprite, ou les textures des sprites sont gérées
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
      };

      // Utilisez la structure de données pour accéder aux données appropriées en fonction de spriteType
      const spriteTexture = rayHit.sprite.spriteTexture;
      const spriteFlash = rayHit.sprite.spriteFlash;

      if (spriteData.hasOwnProperty(spriteTexture)) {
        this.drawTexturedRect(spriteData[spriteTexture],srcX,0,srcW,
          this.textureSize,dstX,rc.y,this.stripWidth,rc.h,spriteFlash
        );
      }
    }
  }

  drawWallStrip(rayHit, textureX, textureY, wallScreenHeight) {
    let swidth = 4;
    let sheight = 64;
    let imgx = rayHit.strip * this.stripWidth;
    
    let imgy = (this.displayHeight - wallScreenHeight) / 2;
    let imgw = this.stripWidth;
    let imgh = wallScreenHeight;
    // de base : appelle directement la fonction drawTexturedRect
    // Donc, on va devoir ajouter une condition
    // this.drawTexturedRect(this.wallsImageData, textureX, textureY, swidth, sheight, imgx, imgy, imgw, imgh);

            // algo de tri pour répartition des étages
            // IDEE => on remplace tous les murs de roche par cet algo pour le test
            // if ceilingHeight = 1                         ; bottom
            // if level =! 1 && level =! this.ceilingHeight ; middle
            // if level = this.ceilingHeight                ; top
            // /!\ level =! de 0 étages ! D'ou problème d'affichage.

            // if rocheN (new);
            // 10 = top (576px); 11 = middle (640px); 12 = bottom (704px)

            // IDEE : créer bloc conditionnel DANS le bloc conditionnel pour éviter les redondances
            // Pas besoin de faire le bottom dans la boucle, déjà appliquée précédemment

    // Créer 3 hauteurs pour chaque type de textures

    // TEST : si texture à un seul étage sélectionnée, 
    // aiguille automatiquement vers la palette sur 3 étages (bottom, middle, top) selon rendu du plafond ou pas

    // une texture = 64²px,
    // Texture Unit = 64
    // On utilise cette valeur de référence qu'on multiplie par le N° de la texture choisie
    const TextureUnit = 64;

    if (textureY === TextureUnit*2) {
        if (this.ceilingHeight === 1) {
            this.drawTexturedRect(this.wallsImageData, textureX, textureY, swidth, sheight, imgx, imgy, imgw, imgh);
        } else {
            this.drawTexturedRect(this.wallsImageData, textureX, 11*TextureUnit, swidth, sheight, imgx, imgy, imgw, imgh);
            
            for (let level = 1; level < this.ceilingHeight; ++level) {
                if (level === this.ceilingHeight-1) {
                    textureY = 9*TextureUnit;
                } else {
                    textureY = 10*TextureUnit;
                }
                
                this.drawTexturedRect(this.wallsImageData, textureX, textureY, swidth, sheight, imgx, imgy - level * wallScreenHeight, imgw, imgh);
            }
        }
    }

    // mur pierre (spécial)
    else if (textureY === 0 * TextureUnit) {
        if (this.ceilingHeight === 1) {
            this.drawTexturedRect(this.wallsImageData, textureX, textureY, swidth, sheight, imgx, imgy, imgw, imgh);
        } else {
            // TEST : on remplace les pixels par une valeur étalon : un bloc = 64px, donc choix numéro de texture * bloc = hauteur de la texture en pixel
            this.drawTexturedRect(this.wallsImageData, textureX, TextureUnit*18, swidth, sheight, imgx, imgy, imgw, imgh);
            
            // ne pas oublier qu'ils sont sensés être plus haut que tout le reste (un demi mur)
            for (let level = 1; level <= this.ceilingHeight; ++level) {
                if (level === this.ceilingHeight) {
                    textureY = TextureUnit*16;
                } else {
                    textureY = TextureUnit*17;
                }
                this.drawTexturedRect(this.wallsImageData, textureX, textureY, swidth, sheight, imgx, imgy - level * wallScreenHeight, imgw, imgh);
            }
        }
    }

    // murs ornés (mécanique de base)
    else if (textureY === 1*TextureUnit) {
        if (this.ceilingHeight === 1) {
            this.drawTexturedRect(this.wallsImageData, textureX, textureY, swidth, sheight, imgx, imgy, imgw, imgh);
        } else {
            this.drawTexturedRect(this.wallsImageData, textureX, TextureUnit*21, swidth, sheight, imgx, imgy, imgw, imgh);
            
            for (let level = 1; level < this.ceilingHeight; ++level) {
                if (level === this.ceilingHeight-1) {
                    textureY = 19*TextureUnit;
                } else {
                    textureY = 20*TextureUnit;
                }
                this.drawTexturedRect(this.wallsImageData, textureX, textureY, swidth, sheight, imgx, imgy - level * wallScreenHeight, imgw, imgh);
            }
        }
    }

    // forêt
        else if (textureY == 1472) {
            this.drawTexturedRect(this.wallsImageData, textureX, 1472, swidth, sheight, imgx, imgy, imgw, imgh);
            textureY =  1408;
            this.drawTexturedRect(this.wallsImageData, textureX, textureY, swidth, sheight, imgx, imgy - wallScreenHeight, imgw, imgh);
         
            }

    // COMPORTEMENT PAR DEFAUT
    // + étages spéciaux selon sélection (blocs "if")
    else {
        this.drawTexturedRect(this.wallsImageData, textureX, textureY, swidth, sheight, imgx, imgy, imgw, imgh);

        // PORTE MUR EN PIERRE
        if (textureY == 4*TextureUnit) {
            textureY = 0
            for (let level = 1; level < this.ceilingHeight; ++level) {
                this.drawTexturedRect(this.wallsImageData, textureX, textureY, swidth, sheight, imgx, imgy - level * wallScreenHeight, imgw, imgh);
            }
        }

        // porte du temple, je rajoute un étage pour test, cohérence architecturale
        else if (textureY == 5*TextureUnit) {
            textureY = 1*TextureUnit; 
            for (let level = 1; level < this.ceilingHeight; ++level) {
                this.drawTexturedRect(this.wallsImageData, textureX, textureY, swidth, sheight, imgx, imgy - level * wallScreenHeight, imgw, imgh);
            }
        }

        else if (textureY == 8*TextureUnit) {
            textureY = 7*TextureUnit; 
            for (let level = 1; level < this.ceilingHeight; ++level) {
                this.drawTexturedRect(this.wallsImageData, textureX, textureY, swidth, sheight, imgx, imgy - level * wallScreenHeight, imgw, imgh);
            }
        }

        // maison MAISON MAISON MAISOOOOOOOOOOOOOOON
        else if (textureY === 14*TextureUnit) {
            if (this.ceilingHeight === 1) {
               // none, pas d'étage.
            } else {
                for (let level = 1; level <= this.ceilingHeight; ++level) {
                    if (level === this.ceilingHeight) {
                        this.drawTexturedRect(this.wallsImageData, textureX, 12*TextureUnit, swidth, sheight, imgx, imgy - level * wallScreenHeight, imgw, imgh);
                    } else {
                    this.drawTexturedRect(this.wallsImageData, textureX, textureY, swidth, sheight, imgx, imgy - level * wallScreenHeight, imgw, imgh);
                    }
                }
            }
        }

        // fenêtre maison
        else if (textureY == 13*TextureUnit) { 
            if (this.ceilingHeight === 1) {
                // none, pas d'étage.
            } else {

            for (let level = 1; level <= this.ceilingHeight; ++level) {
                if (level === this.ceilingHeight) {
                    this.drawTexturedRect(this.wallsImageData, textureX, 12*TextureUnit, swidth, sheight, imgx, imgy - level * wallScreenHeight, imgw, imgh);
                } else {
                    this.drawTexturedRect(this.wallsImageData, textureX, textureY, swidth, sheight, imgx, imgy - level * wallScreenHeight, imgw, imgh);
                }
            }
        }
        }

        // porte maison
        else if (textureY == 15*TextureUnit) {
            textureY = 14*TextureUnit;
            if (this.ceilingHeight === 1) {
                // none, pas d'étage.
            } else {
            for (let level = 1; level <= this.ceilingHeight; ++level) {
                if (level === this.ceilingHeight) {
                    this.drawTexturedRect(this.wallsImageData, textureX, 12*TextureUnit, swidth, sheight, imgx, imgy - level * wallScreenHeight, imgw, imgh);
                } else {
                    this.drawTexturedRect(this.wallsImageData, textureX, textureY, swidth, sheight, imgx, imgy - level * wallScreenHeight, imgw, imgh);
                }
            }
            }
        }
        
        // COMPORTEMENT PAR DEFAUT
        else {
            // rajout d'un <= pour augmenter d'un étage les murs de pierre
            if (textureY === 0) {
                        // condition de rendu du plafond
                    if (this.ceilingHeight === 1 && ceilingRender === true) {
                        // si un étage, pas de boucle
                        // on enlève également "imgy - level * wallScreenHeight" de la fonction, évidemment.
                        this.drawTexturedRect(this.wallsImageData, textureX, textureY, swidth, sheight, imgx, imgy, imgw, imgh);
                    
                    // si plusieurs étages => boucle, et "inférieur ou égal" pour rajouter un étage.
                    // Condition si plafond ou pas.
                    } else if (this.ceilingHeight > 1 && ceilingRender === true) {
                        for (let level = 1; level < this.ceilingHeight; ++level) {
                                this.drawTexturedRect(this.wallsImageData, textureX, textureY, swidth, sheight, imgx, imgy - level * wallScreenHeight, imgw, imgh);
                        }
                    } else if (this.ceilingHeight > 1 && ceilingRender === false) {
                        for (let level = 1; level <= this.ceilingHeight; ++level) {
                    // sommet des murs en pierre si pas de plafond
                            if (this.ceilingHeight === level) {
                                // sommet
                                textureY = 16*TextureUnit;
                                this.drawTexturedRect(this.wallsImageData, textureX, textureY, swidth, sheight, imgx, imgy - level * wallScreenHeight, imgw, imgh);
                            } else {
                                // mur normal
                                this.drawTexturedRect(this.wallsImageData, textureX, textureY, swidth, sheight, imgx, imgy - level * wallScreenHeight, imgw, imgh);
                            }
                        }
                    } 
            } else {
                // sinon, pas de <= (inférieur ou égal) au nombre d'étage, sinon on aurait un étage en plus du max.
                for (let level = 1; level < this.ceilingHeight; ++level) {
                    this.drawTexturedRect(this.wallsImageData, textureX, textureY, swidth, sheight, imgx, imgy - level * wallScreenHeight, imgw, imgh);
                }
            }
        }
    }
  } 

  //////////////////////////////////////////////////////////////////////
  // Coloration sol si pas de texture
  //////////////////////////////////////////////////////////////////////

  drawSolidFloor() {
    for (let y = this.displayHeight / 2; y < this.displayHeight; ++y) {
      for (let x = 0; x < this.displayWidth; ++x) {
        Raycaster.setPixel(this.backBuffer, x, y, 111, 71, 59, 255);
      }
    }
  }

  //////////////////////////////////////////////////////////////////////
  // SkyBox
  //////////////////////////////////////////////////////////////////////

  drawSkybox() {
    // Calculer les facteurs d'échelle pour les coordonnées de texture
    let scaleX = this.skyboxImageData.width / this.displayWidth;
    let scaleY = this.skyboxImageData.height / this.displayHeight;

    // Calculer le décalage horizontal en fonction de l'angle de la caméra
    let offsetX = Math.floor((-this.player.rot / Math.PI) * this.skyboxImageData.width*3);

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
    rayHits.sort(function (a, b) {
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
    ray.vx = right
      ? Math.trunc(this.player.x / this.tileSize) * this.tileSize +
        this.tileSize
      : Math.trunc(this.player.x / this.tileSize) * this.tileSize - 1;
    ray.vy = this.player.y + (this.player.x - ray.vx) * Math.tan(rayAngle);

    // closest horizontal line
    ray.hy = up
      ? Math.trunc(this.player.y / this.tileSize) * this.tileSize - 1
      : Math.trunc(this.player.y / this.tileSize) * this.tileSize +
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

//////////////////////////////////////////////////////////////////////////////
/// Gestion interaction joueur avec monde (Move/Action)
//////////////////////////////////////////////////////////////////////////////

  async move(timeElapsed) {
    // écoute des changement d'état des variables
    let up = this.keysDown[KEY_UP] || this.keysDown[KEY_W];
    let down = this.keysDown[KEY_DOWN] || this.keysDown[KEY_S];
    let left = this.keysDown[KEY_LEFT] || this.keysDown[KEY_A];
    let right = this.keysDown[KEY_RIGHT] || this.keysDown[KEY_D];
    const action =  this.actionButtonClicked || this.keysDown[KEY_F] || this.keysDown[KEY_SPACE]; 

    let timeBasedFactor = timeElapsed / UPDATE_INTERVAL;

    let moveStep = this.player.speed * this.player.moveSpeed * timeBasedFactor;

    this.player.rot +=
      -this.player.dir * this.player.rotSpeed * timeBasedFactor;

    let newX = Math.trunc(this.player.x + Math.cos(this.player.rot) * moveStep);
    let newY = Math.trunc(
      this.player.y + -Math.sin(this.player.rot) * moveStep
    );

    let cellX = newX / this.tileSize;
    let cellY = newY / this.tileSize;

    let obstacleOnPath;

    // ACCELERATION
    const accelerationRate = 0.05; // Taux d'accélération
    const decelerationRate = 0.15; // Taux de décélération

    if (up || joystickForwardClicked === true) {
        this.player.speed = Math.min(this.player.speed + accelerationRate, 1);
      } else if (down || joystickBackwardClicked === true) {
        this.player.speed = Math.max(this.player.speed - accelerationRate, -1);
      } else {
      // Inertie/décélération si aucune touche n'est enfoncée
      if (this.player.speed > 0) {
        this.player.speed = Math.max(this.player.speed - decelerationRate, 0);
      } else if (this.player.speed < 0) {
        this.player.speed = Math.min(this.player.speed + decelerationRate, 0);
      }
    }

    // normalizing angle (contenu entre 0 et 2*pi)
    // + BONUS : anti-bug angle 0 (parallaxe et sprite), on ajoute ou enlève 1° (pi/180) selon l'angle.
    if (this.player.rot <= 0) {
      this.player.rot += 2 * Math.PI  - (Math.PI/180);
      console.log("changing angle");
    } else if (this.player.rot >= 2 * Math.PI) {
      this.player.rot -= 2 * Math.PI + (Math.PI/180);
      console.log("changing angle");
    } else {
      // nothing
    }

    // inertie rotation
    if (left || joystickLeftClicked === true) {
      this.player.dir = Math.max(this.player.dir - accelerationRate*2, -1);
    } else if (right || joystickRightClicked === true) {
      this.player.dir = Math.min(this.player.dir + accelerationRate*2, 1);
    } else {
      // Arrêt direct, sans décélération
      this.player.dir = 0;
    }

///////////////////////////////////////////////////////////////////////////////////////////////
//CALCUL DU QUADRANT CAMERA et collision glissante
///////////////////////////////////////////////////////////////////////////////////////////////

    this.playerQuadrant(this.player);

    if (this.isBlocking(cellX, cellY)) {
      this.handleSlidingCollision(this.player);
      return;
    }

//////////////////////////////////////////////////////////////////////////////
// COLLISION SPRITE
//////////////////////////////////////////////////////////////////////////////

    // prends en compte la valeur "blocking" dans Sprite
    // Si le sprite est bloquant (isBlocking==true), obstacle on path est true (bloquant)

    for (let i = 0; i < this.sprites.length; i++) {
      if (
        Math.floor(cellX) === Math.floor(this.sprites[i].x / this.tileSize) &&
        Math.floor(cellY) === Math.floor(this.sprites[i].y / this.tileSize)
      ) {
        // Si le sprite est bloquant (isBlocking==true), obstacle on path est true (bloquant)
        obstacleOnPath = this.sprites[i].isBlocking;
      }
    }

    // Suite détection sprite
    if (obstacleOnPath) {
      // console.log("obstacle !")
      return;
    } else {
      // ok, tout va
    }

///////////////////////////////////////////////////////////////////////////////////////////////
// ACTION ET TELEPORT FUNCTION // MARQUEUR : event événement téléporteur
///////////////////////////////////////////////////////////////////////////////////////////////

    if ( action || left || right || down || up || joystickLeftClicked || joystickRightClicked || joystickBackwardClicked || joystickForwardClicked ) {
      if (this.player.turn === true) {
        Sprite.resetToggle();
        this.inventoryMenuShowed = false;
      }
    }

///////////////////////////////////////////////////////////////////////////////////////////////
// ACTION Selon sprite type
///////////////////////////////////////////////////////////////////////////////////////////////

    if (action && this.player && this.player.turn == true) {
      this.handleSpriteAction(action);
    }

///////////////////////////////////////////////////////////////////////////////////////////////
// ACTION Téléporteur
///////////////////////////////////////////////////////////////////////////////////////////////

    // les listes des téléporteurs sont à présent stockés dans initMap

    if (action) {
      this.handleTeleportation(this.player, this.mapEventA, this.mapEventB, newX, newY, this.tileSize);
    }

    // set new position
    this.player.x = newX;
    this.player.y = newY;
  }

///////////////////////////////////////////////////////////////////////////////////////////////
// Logique de blocage
///////////////////////////////////////////////////////////////////////////////////////////////

  isBlocking(x, y) {
    // first make sure that we cannot move outside the boundaries of the level
    if (y < 0 || y >= this.mapHeight || x < 0 || x >= this.mapWidth)
      return true;

    // return true if the map block is not 0, ie. if there is a blocking wall.
    if (this.map[Math.floor(y)][Math.floor(x)] != 0) 
    {
      return true
    }
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
