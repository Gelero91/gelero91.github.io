////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// PLAYER.JS - SYSTÈME DE JOUEUR POUR MOTEUR RAYCASTING 2.5D
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// TABLE DES MATIÈRES
//
// 1. CLASSE PRINCIPALE ET INITIALISATION
//    1.1 Constructeur et propriétés de base
//    1.2 Initialisation des statistiques
//    1.3 Références et dépendances
//
// 2. SYSTÈME DE STATISTIQUES ET PROGRESSION
//    2.1 Mise à jour des statistiques (statsUpdate)
//    2.2 Calculs de progression et level up
//    2.3 Gestion des barres de progression
//    2.4 Interface utilisateur dynamique
//
// 3. SYSTÈME DE SORTS
//    3.1 Sélection de sorts
//    3.2 Navigation dans le grimoire
//    3.3 Interface de sorts
//
// 4. SYSTÈME D'INVENTAIRE ET ÉQUIPEMENT
//    4.1 Affichage de l'inventaire
//    4.2 Détails des objets
//    4.3 Équipement et déséquipement
//    4.4 Interface d'équipement
//
// 5. SYSTÈME DE QUÊTES
//    5.1 Affichage des quêtes
//    5.2 Interface de journal de quêtes
//
// 6. CONTRÔLES ET INTERFACE UTILISATEUR
//    6.1 Gestion des boutons et navigation
//    6.2 Liaison des événements
//    6.3 Gestionnaire de boutons centralisé
//
// 7. SYSTÈME DE MOUVEMENT ET DÉPLACEMENT
//    7.1 Calculs géométriques
//    7.2 Gestion des collisions
//    7.3 Animations de mouvement
//    7.4 Téléportation et événements
//    7.5 Méthode move() principale
//
// 8. SYSTÈME D'ACTIONS ET INTERACTIONS
//    8.1 Actions avec sprites
//    8.2 Gestion des portes et téléporteurs
//    8.3 Combat et sorts
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

console.log("chargement de la classe Player.")

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 1. CLASSE PRINCIPALE ET INITIALISATION
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 1.1 Constructeur et propriétés de base
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class Player {
    constructor(name, x, y, rot, raycaster) {
        // Informations de base
        this.name = name;
        this.x = x;
        this.y = y;
        this.z = 0;
        this.dir = 0;
        this.rot = rot;
        this.quadrant = "";
        this.speed = 0;

        // Propriétés de mouvement
        this.tileSize = 1280;
        this.moveSpeed = Math.round(1280 / ((DESIRED_FPS / 60.0) * 16));
        this.rotSpeed = (1.5 * Math.PI) / 180;

        // États de mouvement et actions
        this.isMoving = false;
        this.isRotating = false;
        this.isTeleporting = false;
        this.isDooring = false;
        this.turn = true;

        // Historique de mouvement pour optimisations
        this.lastMoveWasForward = false;
        this.lastMoveWasBackward = false;
        this.continuousUpPressed = false;
        this.continuousDownPressed = false;
        this.continuousJoystickUp = false;
        this.continuousJoystickDown = false;

        // États des boutons
        this.button4Clicked = false;
        this.button5Clicked = false;
        this.button6Clicked = false;
        this.button7Clicked = false;
        this.button8Clicked = false;
        this.button9Clicked = false;
        this.buttonAClicked = false;
        this.actionButtonClicked = false;
        this.turnLeftButtonClicked = false;
        this.turnRightButtonClicked = false;
        this.LeftLeftButtonClicked = false;
        this.RightRightButtonClicked = false;

        // Initialisation des statistiques
        this.initStats();
        this.initInventoryAndSpells();
        this.initCombatStats();

        // Références système
        this.raycaster = raycaster;
        this.joystick = true;
        this.inventoryMenuShowed = false;
        this.lastAttackTime = 0;

        // Initialisation des anciens stats pour comparaison
        this.oldStrength = this.strength;
        this.oldIntellect = this.intellect;
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 1.2 Initialisation des statistiques
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    initStats(characterData) {
        // Statistiques de base
        this.hp = 10;
        this.mp = 10;
        this.hpMax = 10;
        this.mpMax = 10;
        this.strength = 5;
        this.dexterity = 5;
        this.intellect = 5;
        this.XPstrength = 0;
        this.XPdexterity = 0;
        this.XPintellect = 0;
        this.gold = 100;

        // Appliquer les bonus de spécialisation si fournis
        if (characterData && characterData.specialization) {
            switch(characterData.specialization) {
                case 'strength':
                    this.strength += 3;
                    break;
                case 'dexterity':
                    this.dexterity += 1;
                    this.dodge += 10;
                    this.criti += 10;
                    break;
                case 'magic':
                    this.intellect += 3;
                    break;
                case 'none':
                    this.strength += 1;
                    this.dexterity += 1;
                    this.intellect += 1;
                    break;
            }
        }
    }

    initInventoryAndSpells() {
        // Collections du joueur
        this.hands = [];
        this.torso = [];
        this.inventory = [];
        this.spells = [];
        this.quests = [];

        // Sélection de sort
        this.selectedSpell = 0;
        this.combatSpell = false;
    }

    initCombatStats() {
        // Statistiques de combat
        this.might = 1;
        this.dodge = 1;
        this.magic = 1;
        this.armor = 0;
        this.criti = 0;
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 1.3 Références et dépendances
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Liaison des contrôles - appelée lors de l'initialisation
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

        // Contrôles joystick
        this.initJoystickControls();
        
        // Liaison des boutons avec événements
        this.bindAllButtons();
    }

    initJoystickControls() {
        document.addEventListener("joystickchange", function(event) {
            const { up, down, left, right } = event.detail;
            joystickForwardClicked = up;
            joystickBackwardClicked = down;
            joystickLeftClicked = left;
            joystickRightClicked = right;
        });
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 2. SYSTÈME DE STATISTIQUES ET PROGRESSION
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 2.1 Mise à jour des statistiques (statsUpdate)
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    statsUpdate() {
        // Gestion de l'état des boutons
        this.updateButtonStates();
        
        // Mise à jour des valeurs affichées
        this.updateDisplayedValues();
        
        // Gestion du level up des caractéristiques
        this.handleLevelUps();
        
        // Régénération de mana
        this.handleManaRegeneration();
        
        // Calcul des stats max et limites
        this.updateMaxStats();
        
        // Vérification de l'état de mort
        this.checkDeathState();
        
        // Mise à jour des stats de combat
        this.updateCombatStats();
        
        // Mise à jour des barres de progression
        this.updateProgressBars();
        
        // Mise à jour de l'interface des sorts
        this.updateSpellInterface();

        if (this.buffedStats) {
            // Changer la couleur des stats buffées
            if (this.buffedStats.strength) {
                document.getElementById("PlayerStrOutput").style.color = "#66ff66";
            } else {
                document.getElementById("PlayerStrOutput").style.color = "";
            }
            
            if (this.buffedStats.armor) {
                document.getElementById("PlayerArmorOutput").style.color = "#66ff66";
            } else {
                document.getElementById("PlayerArmorOutput").style.color = "";
            }
        }
            // Indicateur de vitesse
            if (this.speedBuffActive) {
                document.getElementById("button5").style.filter = "hue-rotate(120deg)";
            } else {
                document.getElementById("button5").style.filter = "";
            }
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 2.2 Calculs de progression et level up
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    updateButtonStates() {
        // Liste de tous les boutons à gérer
        const allButtons = [
            'buttonA', 'button2', 'buttonB', 'button4', 'button5', 
            'button6', 'button7', 'button8', 'button9',
            'characterButton', 'mainMenuButton', 'previousSpell', 'nextSpell'
        ];

        // Déterminer si les boutons doivent être activés
        const buttonsEnabled = this.turn === true && commandBlocking !== true;
        
        // Appliquer l'état à tous les boutons
        allButtons.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (!button) return;
            
            if (buttonsEnabled) {
                button.style.opacity = '1';
                button.style.filter = 'none';
                button.style.pointerEvents = 'auto';
            } else {
                button.style.opacity = '0.3';
                button.style.filter = 'grayscale(100%)';
                button.style.pointerEvents = 'none';
            }
        });
    }

    updateDisplayedValues() {
        // Mise à jour des valeurs numériques
        document.getElementById("PlayerHPoutput").textContent = this.hp;
        document.getElementById("PlayerMPoutput").textContent = this.mp;
        document.getElementById("PlayerGoldOutput").textContent = this.gold;
        document.getElementById("PlayerStrOutput").textContent = this.strength;
        document.getElementById("PlayerDexOutput").textContent = this.dexterity;
        document.getElementById("PlayerIntOutput").textContent = this.intellect;

        // Mise à jour de l'icône de l'arme équipée
        const weaponIcon = document.getElementById("weaponIcon");
        weaponIcon.src = this.hands[0] ? this.hands[0].icon : "assets/icons/a.png";
    }

    handleLevelUps() {
        if (this.XPstrength >= 10) {
            this.XPstrength = 0;
            this.strength += 1;
            console.log("Strength leveled up!");
        }

        if (this.XPdexterity >= 10) {
            this.XPdexterity = 0;
            this.dexterity += 1;
            console.log("Dexterity leveled up!");
        }

        if (this.XPintellect >= 10) {
            this.XPintellect = 0;
            this.intellect += 1;
            console.log("Intellect leveled up!");
        }
    }

    handleManaRegeneration() {
        // Régénération de mana
        if (this.mp < this.mpMax) {
            this.mp = Math.min(this.mp + (this.intellect / 50), this.mpMax);
        }
    }

    updateMaxStats() {
        // HP et MP max basés sur les caractéristiques
        this.hpMax = 10 + (this.strength - 5);
        this.mpMax = 10 + (this.intellect - 5);

        // Limiter HP au maximum
        this.hp = Math.min(this.hp, this.hpMax);
    }

    checkDeathState() {
        // Vérification de l'état de mort
        if (this.hp <= 0 && gameOver === false) {
            Raycaster.deathEffect();
            gameOver = true;
        }
    }

    updateCombatStats() {
        // Mise à jour might et magic si les stats ont changé
        if (this.strength !== this.oldStrength) {
            this.might += (this.strength - 5);
            this.oldStrength = this.strength;
        }

        if (this.intellect !== this.oldIntellect) {
            this.magic += (this.intellect - 5);
            this.oldIntellect = this.intellect;
        }

        // Calcul de dodge et critical
        const baseDodge = this.dexterity * 2;
        const baseCriti = this.dexterity * 2;

        if (this.hands[0]) {
            this.dodge = baseDodge + this.hands[0].dodge;
            this.criti = baseCriti + this.hands[0].criti;
        } else {
            this.dodge = baseDodge;
            this.criti = baseCriti;
        }

        // Mise à jour des stats de combat affichées
        document.getElementById("PlayerMightOutput").textContent = this.might;
        document.getElementById("PlayerDodgeOutput").textContent = this.dodge;
        document.getElementById("PlayerMagicOutput").textContent = this.magic;
        document.getElementById("PlayerArmorOutput").textContent = this.armor;
        document.getElementById("PlayerCritiOutput").textContent = this.criti;
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 2.3 Gestion des barres de progression
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    updateProgressBars() {
        // Mise à jour des barres de progression
        updateProgressBar("hpBar", this.hp, this.hpMax);
        updateProgressBar("mpBar", this.mp, this.mpMax);
        updateProgressBar("strengthBar", this.XPstrength, 10);
        updateProgressBar("dexterityBar", this.XPdexterity, 10);
        updateProgressBar("intellectBar", this.XPintellect, 10);
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 2.4 Interface utilisateur dynamique
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    updateSpellInterface() {
        // Mise à jour du sort sélectionné
        if (this.spells && this.spells[this.selectedSpell]) {
            document.getElementById("selectedSpell").textContent = this.spells[this.selectedSpell].name;
            document.getElementById("castSpell").src = this.spells[this.selectedSpell].icon;
        }
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 3. SYSTÈME DE SORTS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 3.1 Sélection de sorts
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    nextSpell() {
        this.selectedSpell++;
        if (this.selectedSpell >= this.spells.length) {
            this.selectedSpell = 0;
        }
        this.updateSpellDisplay();
    }

    previousSpell() {
        this.selectedSpell--;
        if (this.selectedSpell < 0) {
            this.selectedSpell = this.spells.length - 1;
        }
        this.updateSpellDisplay();
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 3.2 Navigation dans le grimoire
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    updateSpellDisplay() {
        const currentSpellIcon = document.getElementById("castSpell");
        currentSpellIcon.src = this.spells[this.selectedSpell].icon;

        const currentSpellName = document.getElementById("selectedSpell");
        currentSpellName.textContent = this.spells[this.selectedSpell].name;
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 3.3 Interface de sorts
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // L'interface des sorts est gérée dans updateSpellInterface() section 2.4

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 4. SYSTÈME D'INVENTAIRE ET ÉQUIPEMENT
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 4.1 Affichage de l'inventaire
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
            this.generateInventoryList(inventoryList, itemDetailsPlaceholder);
        } else {
            this.showEmptyInventory(inventoryList, itemDetailsPlaceholder);
        }
    }

    generateInventoryList(inventoryList, itemDetailsPlaceholder) {
        // Générer la liste des objets
        this.inventory.forEach((item, index) => {
            const equippedMark = item.equipped ? "✓" : "";
            var itemIcon = this.inventory[index].icon;
            
            const isEquipped = item.equipped;
            const bgColor = isEquipped ? "rgba(0, 60, 0, 0.7)" : "#140c1c";
            
            const itemElement = this.createInventoryItemElement(item, index, itemIcon, isEquipped, bgColor, equippedMark);
            
            this.bindInventoryItemEvents(itemElement, index, isEquipped, itemDetailsPlaceholder);
            
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
    }

    createInventoryItemElement(item, index, itemIcon, isEquipped, bgColor, equippedMark) {
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
        
        return itemElement;
    }

    bindInventoryItemEvents(itemElement, index, isEquipped, itemDetailsPlaceholder) {
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
    }

    showEmptyInventory(inventoryList, itemDetailsPlaceholder) {
        inventoryList.innerHTML = '<div style="padding: 10px; text-align: center; color: #8a7b6c; width: 100%;">No items</div>';
        
        // S'assurer que le placeholder est visible
        if (itemDetailsPlaceholder) {
            itemDetailsPlaceholder.style.display = 'flex';
        }
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 4.2 Détails des objets
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    showItemDetails(index) {
        const item = this.inventory[index];
        const itemDetails = document.getElementById('item-details');
        
        if (!item || !itemDetails) return;
        
        // Déterminer l'icône et le type d'équipement
        let itemIcon = item.icon;
        let slotName = this.getSlotName(item.slot);
        
        // Construire la chaîne HTML des statistiques
        let statsHTML = this.buildStatsHTML(item);
        
        // Construire le HTML complet des détails
        itemDetails.innerHTML = this.buildItemDetailsHTML(item, itemIcon, slotName, statsHTML);
        
        // Ajouter l'écouteur d'événement pour le bouton d'action
        this.bindItemActionButton(item);
    }

    getSlotName(slot) {
        switch(slot) {
            case 1: return "Weapon";
            case 2: return "Armor";
            default: return "Item";
        }
    }

    buildStatsHTML(item) {
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
        
        return statsHTML;
    }

    buildItemDetailsHTML(item, itemIcon, slotName, statsHTML) {
        return `
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
    }

    bindItemActionButton(item) {
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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 4.3 Équipement et déséquipement
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    equipmentDisplay() {
        const handsContent = document.getElementById("handsContent");
        const torsoContent = document.getElementById("torsoContent");

        // Vérifier si hands est défini et non vide
        if (this.hands && this.hands.length > 0) {
            handsContent.innerHTML = `<button class="equipped-item" style="color:black;" data-item="${this.hands[0].name}">${this.hands[0].name}</button>`;
        } else {
            handsContent.innerHTML = "EMPTY";
        }

        // Vérifier si torso est défini et non vide
        if (this.torso && this.torso.length > 0) {
            torsoContent.innerHTML = `<button class="equipped-item" style="color:black;" data-item="${this.torso[0].name}">${this.torso[0].name}</button>`;
        } else {
            torsoContent.innerHTML = "EMPTY";
        }

        // Ajouter des gestionnaires d'événements aux boutons
        this.bindEquippedItemButtons();
    }

    bindEquippedItemButtons() {
        document.querySelectorAll(".equipped-item").forEach((itemButton) => {
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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 4.4 Interface d'équipement
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    toggleEquipment() {
        // AFFICHER INVENTAIRE
        this.displayInventory();
        this.equipmentDisplay();

        this.showEquipmentInterface();
        this.hideOtherInterfaces();
        this.configureEquipmentControls();
    }

    showEquipmentInterface() {
        var info = document.getElementById("info");
        var stats = document.getElementById("stats");
        var equipment = document.getElementById("equipment");
        var items = document.getElementById("items");

        info.style.display = "none";
        equipment.style.display = "block";
        stats.style.display = "none";
        items.style.display = "block";
    }

    hideOtherInterfaces() {
        var output = document.getElementById("output");
        var dialWindow = document.getElementById("dialogueWindow");

        output.style.display = "none";
        dialWindow.style.display = "none";
    }

    configureEquipmentControls() {
        var actionButton = document.getElementById('actionButtons');

        // Joystick configuration
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
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 5. SYSTÈME DE QUÊTES
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 5.1 Affichage des quêtes
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    displayQuests() {
        const questContent = document.getElementById("questContent");
        
        // Mettre à jour le compteur de quêtes
        this.updateQuestCounter();
    
        if (this.quests && this.quests.length > 0) {
            this.generateQuestInterface(questContent);
        } else {
            this.showEmptyQuests(questContent);
        }
    }

    updateQuestCounter() {
        const questCount = document.getElementById("quest-count");
        if (questCount) {
            const completedCount = this.quests.filter(quest => quest.completed).length;
            questCount.textContent = `${completedCount}/${this.quests.length}`;
        }
    }

    generateQuestInterface(questContent) {
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
        
        this.populateQuestList();
    }

    populateQuestList() {
        const questList = document.getElementById("quest-list");
        
        // Générer la liste des quêtes
        this.quests.forEach((quest, index) => {
            const questElement = this.createQuestElement(quest, index);
            this.bindQuestElementEvents(questElement, quest);
            questList.appendChild(questElement);
        });
        
        // Sélectionner automatiquement la première quête
        const firstQuest = questList.querySelector('.quest-item-entry');
        if (firstQuest) {
            firstQuest.click();
        }
    }

    createQuestElement(quest, index) {
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
        
        return questElement;
    }

    bindQuestElementEvents(questElement, quest) {
        questElement.addEventListener('click', () => {
            // Désélectionner tous les autres éléments
            document.querySelectorAll('.quest-item-entry').forEach(e => {
                e.style.borderColor = '#663300';
                e.style.backgroundColor = e.classList.contains('completed') ? 'rgba(0, 60, 0, 0.7)' : '#140c1c';
            });
            
            // Mettre en évidence l'élément sélectionné
            questElement.style.borderColor = '#ffaa00';
            questElement.style.backgroundColor = quest.completed ? 'rgba(20, 80, 20, 0.9)' : '#331a0c';
            
            // Afficher les détails
            this.showQuestDetails(quest);
            
            // Cacher le placeholder
            const placeholder = document.getElementById('quest-details-placeholder');
            if (placeholder) {
                placeholder.style.display = 'none';
            }
        });
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 5.2 Interface de journal de quêtes
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    showQuestDetails(quest) {
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
    }

    showEmptyQuests(questContent) {
        questContent.innerHTML = '<div style="padding: 10px; text-align: center; color: #8a7b6c;">No quests in progress</div>';
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 6. CONTRÔLES ET INTERFACE UTILISATEUR
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 6.1 Gestion des boutons et navigation
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    joystickBackButton() {
        this.resetInterfaceToDefault();
        this.resetControlsToDefault();
        this.resetInventoryState();
    }

    resetInterfaceToDefault() {
        document.getElementById("stats").style.display = "none";
        document.getElementById("info").style.display = "block";
        document.getElementById("equipment").style.display = "none";
        document.getElementById("items").style.display = "none";
        document.getElementById("quests").style.display = "none";
        document.getElementById("output").style.display = "block";
        document.getElementById("dialogueWindow").style.display = "none";
    }

    resetControlsToDefault() {
        document.getElementById("joystick-container").style.display = "block";
        document.getElementById("QuestButton").style.display = "block";
        document.getElementById("InventoryButton").style.display = "none";
        document.getElementById("joystickBackButtonContainer").style.display = "none";
        document.getElementById("actionButtons").style.display = "block";
    }

    resetInventoryState() {
        this.inventoryMenuShowed = false;
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 6.2 Liaison des événements
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    bindAllButtons() {
        let canClickSave = true;
        let canClickLoad = true;
        let canClickNextMap = true;
        const debounceDelay = 500;

        // Boutons avec debounce (anti double clic)
        this.bindButtonWithDebounce("saveButton", 16, canClickSave, debounceDelay);
        this.bindButtonWithDebounce("loadButton", 17, canClickLoad, debounceDelay);
        this.bindButtonWithDebounce("nextMapButton", 18, canClickNextMap, debounceDelay);

        // Autres boutons sans debounce
        this.bindRegularButtons();
    }

    bindButtonWithDebounce(buttonId, buttonNumber, canClick, debounceDelay) {
        this.bindButton(buttonId, buttonNumber, () => {
            if (canClick) {
                canClick = false;
                setTimeout(() => canClick = true, debounceDelay);
            }
        });
    }

    bindRegularButtons() {
        const buttonMappings = [
            ["button1", 1], ["button2", 2], ["button3", 3], ["button4", 4],
            ["button5", 5], ["button6", 6], ["button7", 7], ["button8", 8],
            ["button9", 9], ["joystickBackButton", 10], ["QuestButton", 11],
            ["InventoryButton", 12], ["previousSpell", 13], ["nextSpell", 15],
            ["newGameButton", 19], ["mainMenuButton", 20], ["backMenuButton", 21],
            ["buttonA", 1], ["buttonB", 14], ["characterButton", 3], ["cancelCreation", 22], ["createCharacter", 23]
        ];

        buttonMappings.forEach(([buttonId, buttonNumber]) => {
            this.bindButton(buttonId, buttonNumber);
        });
    }

    bindButton(buttonId, buttonNumber, additionalCallback = null) {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener("click", () => {
                if (additionalCallback) additionalCallback();
                this.handleButtonClick(buttonNumber);
            });
        }
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 6.3 Gestionnaire de boutons centralisé
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    handleButtonClick(buttonNumber) {
        switch (buttonNumber) {
            case 1: // ACTION (Bouton A)
                this.handleActionButton();
                break;
            
            case 2: // Non utilisé
                break;
                
            case 3: // EQUIPEMENT (Bouton B)
                this.handleEquipmentButton();
                break;
              
            case 4: // TOURNER A GAUCHE (flèche gauche)
                this.handleTurnLeft();
                break;  

            case 5: // AVANCER (flèche haut)
                this.handleMoveForward();
                break;
            
            case 6: // TOURNER A DROITE (flèche droite)
                this.handleTurnRight();
                break;

            case 7: // ESQUIVE A GAUCHE (flèche gauche)
                this.handleDodgeLeft();
                break;
                
            case 8: // RECULER (flèche bas)
                this.handleMoveBackward();
                break;
                
            case 9: // ESQUIVE A DROITE (flèche droite)
                this.handleDodgeRight();
                break;
                
            case 10: // Bouton retour
                this.handleBackButton();
                break;
                
            case 11: // Bouton quêtes
                this.handleQuestButton();
                break;
                
            case 12: // Bouton inventaire
                this.handleInventoryButton();
                break;
                
            case 13: // Sort précédent
                this.previousSpell();
                break;
                
            case 14: // Lancer sort / Bouton B
                this.handleSpellCast();
                break;
                
            case 15: // Sort suivant
                this.nextSpell();
                break;
                
            case 16: // Sauvegarder
                this.handleSaveGame();
                break;
                
            case 17: // Charger
                this.handleLoadGame();
                break;
                
            case 18: // Carte suivante
                this.handleNextMap();
                break;
                
            case 19: // Nouvelle partie
                this.handleNewGame();
                break;
                
            case 20: // Menu principal
                this.handleMainMenu();
                break;

            case 21: // Retour menu
                this.handleBackToGame();
                break;

            case 22: // cancel create caracter
                this.handleMainMenu();
                break;
            case 23: // création du personnage
                console.log("create character :");
                this.handleCreateCharacter(); // Ajouter l'appel à la méthode
                break;
                            
            default:
                console.log("Bouton non reconnu: " + buttonNumber);
        }
    }

    // Méthodes de gestion des boutons individuels
    handleActionButton() {
        Sprite.resetToggle();
        if (this.turn == true) {
            console.log('Action/Dialogue');
            this.buttonAClicked = true;
            this.actionButtonClicked = true;
        }
    }

    handleEquipmentButton() {
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
    }

    handleTurnLeft() {
        console.log("turnLeft");
        if (!this.isMoving && !this.isRotating && this.turn) {
            this.button7Clicked = true;
            this.turnLeftButtonClicked = true;
        }
    }

    handleMoveForward() {
        console.log("forward");
        if (!this.isMoving && !this.isRotating && this.turn) {
            this.button5Clicked = true;
        }
    }

    handleTurnRight() {
        console.log("turnRight");
        if (!this.isMoving && !this.isRotating && this.turn) {
            this.button9Clicked = true;
            this.turnRightButtonClicked = true;
        }
    }

    handleDodgeLeft() {
        console.log("LeftLeft");
        if (!this.isMoving && !this.isRotating && this.turn) {
            this.button7Clicked = true;
            this.LeftLeftButtonClicked = true;
        }
    }

    handleMoveBackward() {
        console.log("backward");
        if (!this.isMoving && !this.isRotating && this.turn) {
            this.button8Clicked = true;
        }
    }

    handleDodgeRight() {
        console.log("RightRight");
        if (!this.isMoving && !this.isRotating && this.turn) {
            this.button9Clicked = true;
            this.RightRightButtonClicked = true;
        }
    }

    handleBackButton() {
        this.joystickBackButton();
        this.inventoryMenuShowed = false;
        console.log("joystickBackButton");
    }

    handleQuestButton() {
        console.log("quest button");
        document.getElementById("QuestButton").style.display = "none";
        document.getElementById("InventoryButton").style.display = "block";

        this.displayQuests();

        document.getElementById("items").style.display = "none";
        document.getElementById("quests").style.display = "block";
    }

    handleInventoryButton() {
        console.log("inventory button");
        document.getElementById("QuestButton").style.display = "block";
        document.getElementById("InventoryButton").style.display = "none";

        document.getElementById("items").style.display = "block";
        document.getElementById("quests").style.display = "none";
    }

    handleSpellCast() {
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
    }

    handleSaveGame() {
        if (gameOver == false) {
            this.raycaster.saveGameState();
            Sprite.terminalLog("Player state saved!");
            Raycaster.showRenderWindow()
        } else {
            alert("You can't save if you're dead.");
        }
    }

    handleLoadGame() {
        pause(500);
        this.raycaster.loadGameState(this);
        Raycaster.resetVisualEffects();
        Raycaster.showRenderWindow()
        Sprite.resetTerminal();
        Sprite.terminalLog("Save loaded !");
    }

    handleNextMap() {
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
    }

    // xyz
    handleNewGame() {
        pause(500);
        
        console.log("caracter creation !")

        document.getElementById("mainMenuWindow").style.display = "none";
        document.getElementById("createCharacterWindow").style.display = "block";
    }

    // récupération des infos de la fiche de jeux
getCharacterData() {
    // Vérifier que les éléments existent
    console.log('Name input:', document.getElementById('characterName'));
    console.log('Face select:', document.getElementById('characterFace'));
    
    return {
        name: document.getElementById('characterName')?.value || 'Erreur',
        face: document.getElementById('characterFace')?.value || 'Erreur',
        specialization: document.getElementById('characterSpecialization')?.value || 'none',
        weapon: parseInt(document.getElementById('characterWeapon')?.value || 1),
        armor: parseInt(document.getElementById('characterArmor')?.value || 2),
        spells: [
            parseInt(document.getElementById('spell1')?.value) || null,
            parseInt(document.getElementById('spell2')?.value) || null
        ].filter(s => s !== null && s !== 0)
    };
}
    // XYZ
    async handleCreateCharacter() {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Récupérer les données AVANT de lancer newGame
        const characterData = this.getCharacterData();
        console.log(characterData);
        
        // Lancer une nouvelle partie
        this.raycaster.newGame();
        
        // Appliquer les données du personnage
        this.raycaster.createNewCharacter(characterData);
        
        // Mettre à jour l'interface
        document.getElementById("mainMenuWindow").style.display = "none";
        document.getElementById("createCharacterWindow").style.display = "none";
        
        Sprite.resetTerminal();
        Sprite.terminalLog("New game !");
        console.log("new game AND character !")
    }

    async handleMainMenu() {
        await new Promise(resolve => setTimeout(resolve, 500));
        document.getElementById('createCharacterWindow').style.display = 'none';
        Raycaster.resetShowGameOver();
        Raycaster.showMainMenu();
    }

    handleBackToGame() {
        pause(500);
        if (gameOver == false) {
            Raycaster.showRenderWindow();
        } else {
            alert('dead, so nope');
        }
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 7. SYSTÈME DE MOUVEMENT ET DÉPLACEMENT
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 7.1 Calculs géométriques
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

    calculateFrontPosition() {
        // S'assurer que la propriété quadrant est définie
        if (!this.quadrant) {
            this.playerQuadrant(this);
            
            if (!this.quadrant) {
                const rotDeg = (this.rot * 180 / Math.PI + 360) % 360;
                
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
            "est": { x: 1, y: 0 },
            "sud": { x: 0, y: 1 },
            "ouest": { x: -1, y: 0 }
        };
    
        const offset = frontOffsets[this.quadrant] || { x: 0, y: 0 };
        
        const frontX = Math.floor((this.x / this.tileSize) + offset.x);
        const frontY = Math.floor((this.y / this.tileSize) + offset.y);
    
        return { frontX, frontY };
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 7.2 Gestion des collisions
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    handleSlidingCollision(player, map) {
        if (!player) {
            console.error("Player is undefined.");
            return;
        }

        const { x, y, quadrant } = player;
        const tileSize = this.tileSize;
        const actualMap = map;

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

            if (actualMap[tileY][tileX] === 0) {
                player.x = newX;
                player.y = newY;
                break;
            }
        }
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 7.3 Animations de mouvement
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Les animations de mouvement sont intégrées dans la méthode move() principale

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 7.4 Téléportation et événements
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
                if (this.checkTeleportConditionAtoB(newX, newY, tileSize, mapEventA[i], oppositeOrientationA, tolerance)) {
                    await this.executeTeleportation(mapEventB[i], tileSize, player);
                    break;
                }
    
                // Vérification pour la téléportation depuis B vers A
                if (this.checkTeleportConditionBtoA(newX, newY, tileSize, mapEventB[i], oppositeOrientationB, tolerance)) {
                    await this.executeTeleportation(mapEventA[i], tileSize, player);
                    break;
                }
            }
        } finally {
            // Toujours libérer le verrou, même en cas d'erreur
            player.isTeleporting = false;
        }
    }

    checkTeleportConditionAtoB(newX, newY, tileSize, eventA, oppositeOrientationA, tolerance) {
        return Math.floor(newX / tileSize) === eventA[0] &&
               Math.floor(newY / tileSize) === eventA[1] &&
               (this.rot >= oppositeOrientationA - tolerance && this.rot <= oppositeOrientationA + tolerance);
    }

    checkTeleportConditionBtoA(newX, newY, tileSize, eventB, oppositeOrientationB, tolerance) {
        return Math.floor(newX / tileSize) === eventB[0] &&
               Math.floor(newY / tileSize) === eventB[1] &&
               (this.rot >= oppositeOrientationB - tolerance && this.rot <= oppositeOrientationB + tolerance);
    }

    async executeTeleportation(targetEvent, tileSize, player) {
        // Téléportation aux coordonnées données dans l'Event
        const newX = targetEvent[0] * tileSize + 640;
        const newY = targetEvent[1] * tileSize + 640;
        player.rot = targetEvent[2];

        // Variable de modification d'environnement
        ceilingRender = targetEvent[3];
        ceilingTexture = targetEvent[4];
        ceilingHeight = targetEvent[5];
        floorTexture = targetEvent[6];

        // On recharge toutes les textures
        this.raycaster.loadFloorCeilingImages();

        console.log(targetEvent[7]);

        // Évite les doubles téléportations
        await new Promise(resolve => setTimeout(resolve, 250));
        
        // Set new position
        player.x = newX;
        player.y = newY;
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 7.5 Méthode move() principale
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    async move(timeElapsed, map, eventA, eventB, sprites) {
        // PARAMÈTRES AJUSTABLES DE MOUVEMENT
        const movementConfig = this.getMovementConfig();
        
        // Récupération des entrées utilisateur
        const inputs = this.getUserInputs();
        
        // Réinitialiser les états des boutons
        this.resetButtonStates();
        
        // Si les commandes sont bloquées, ignorer les déplacements
        if (commandBlocking || !this.turn) {
            return;
        }
        
        // Éviter les mouvements multiples pendant une animation
        if (this.isMoving || this.isRotating || this.isTeleporting || this.isDooring) {
            return;
        }
        
        // Traitement des rotations
        if (inputs.left || inputs.right) {
            await this.handleRotation(inputs.left, inputs.right, movementConfig);
            return;
        }
        
        // Traitement des mouvements
        const movement = this.calculateMovement(inputs);
        if (movement.requested) {
            await this.handleMovement(movement, map, sprites, movementConfig, timeElapsed, eventA, eventB);
        }
        
        // Traitement des actions
        if (inputs.action && this.turn) {
            await this.handleSpriteAction(inputs.action, sprites);
            if (inputs.action) {
                await this.handleTeleportation(this, eventA, eventB, this.x, this.y, this.tileSize);
            }
        }
    }

    getMovementConfig() {
        return {
            ROTATION_DURATION: 500,
            DODGE_DURATION: 400,
            FORWARD_DURATION: 600,
            BACKWARD_DURATION: 500,
            CONTINUOUS_MOVE_SPEEDUP: 150,
            WALL_IMPACT_DURATION: 250,
            ENEMY_IMPACT_DURATION: 500,
            PUSH_WALL_FACTOR: 0.2,
            PUSH_ENEMY_FACTOR: 0.15,
            MOVEMENT_THRESHOLD: 0.1,
            ATTACK_COOLDOWN: 2000,
            CONTINUOUS_MOVE_DELAY: 50
        };
    }

    getUserInputs() {
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
        
        return { up, down, left, right, dodgeLeft, dodgeRight, action };
    }

    resetButtonStates() {
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
    }

    async handleRotation(left, right, config) {
        // Définir les angles cardinaux précis (en radians)
        const NORTH = Math.PI / 2;
        const EAST = 0;
        const SOUTH = 3 * Math.PI / 2;
        const WEST = Math.PI;
        
        this.isRotating = true;
        
        // Déterminer la rotation cible
        let targetRot = this.calculateTargetRotation(left, right, NORTH, EAST, SOUTH, WEST, config);
        
        // Animation de rotation
        await this.animateRotation(targetRot, config.ROTATION_DURATION);
        
        // Mise à jour du quadrant après rotation
        this.playerQuadrant(this);
        this.isRotating = false;
    }

    calculateTargetRotation(left, right, NORTH, EAST, SOUTH, WEST, config) {
        let targetRot;
        
        if (left) {
            if (Math.abs(this.rot - NORTH) < config.MOVEMENT_THRESHOLD) targetRot = WEST;
            else if (Math.abs(this.rot - EAST) < config.MOVEMENT_THRESHOLD) targetRot = NORTH;
            else if (Math.abs(this.rot - SOUTH) < config.MOVEMENT_THRESHOLD) targetRot = EAST;
            else if (Math.abs(this.rot - WEST) < config.MOVEMENT_THRESHOLD) targetRot = SOUTH;
        } else if (right) {
            if (Math.abs(this.rot - NORTH) < config.MOVEMENT_THRESHOLD) targetRot = EAST;
            else if (Math.abs(this.rot - EAST) < config.MOVEMENT_THRESHOLD) targetRot = SOUTH;
            else if (Math.abs(this.rot - SOUTH) < config.MOVEMENT_THRESHOLD) targetRot = WEST;
            else if (Math.abs(this.rot - WEST) < config.MOVEMENT_THRESHOLD) targetRot = NORTH;
        }
        
        return targetRot;
    }

    async animateRotation(targetRot, duration) {
        const startRot = this.rot;
        
        // Calculer la différence d'angle en prenant le chemin le plus court
        let angleDiff = targetRot - startRot;
        if (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        if (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
        
        const startTime = performance.now();
        let rotationComplete = false;
        
        // Fonction d'easing pour rotation fluide
        const easeInOutQuart = (t) => t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
        
        while (!rotationComplete) {
            const currentTime = performance.now();
            const elapsedTime = currentTime - startTime;
            
            let t = Math.min(elapsedTime / duration, 1);
            
            if (t >= 1) {
                rotationComplete = true;
                t = 1;
            }
            
            const easedT = easeInOutQuart(t);
            this.rot = startRot + angleDiff * easedT;
            
            await new Promise(resolve => requestAnimationFrame(resolve));
        }
        
        // Normaliser à la fin pour éviter les erreurs d'arrondi
        this.rot = targetRot;
    }

    calculateMovement(inputs) {
        // Définir les angles cardinaux
        const NORTH = Math.PI / 2;
        const EAST = 0;
        const SOUTH = 3 * Math.PI / 2;
        const WEST = Math.PI;
        const MOVEMENT_THRESHOLD = 0.1;
        
        let destX = Math.floor(this.x / this.tileSize);
        let destY = Math.floor(this.y / this.tileSize);
        
        let movementRequested = false;
        let isMovingBackward = false;
        let isDodging = false;
        
        if (inputs.up) {
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
        } else if (inputs.down) {
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
        } else if (inputs.dodgeLeft || inputs.dodgeRight) {
            // Esquive latérale (déplacement perpendiculaire à la direction)
            if (Math.abs(this.rot - NORTH) < MOVEMENT_THRESHOLD) {
                destX += inputs.dodgeLeft ? -1 : 1;
            } else if (Math.abs(this.rot - EAST) < MOVEMENT_THRESHOLD) {
                destY += inputs.dodgeLeft ? -1 : 1;
            } else if (Math.abs(this.rot - SOUTH) < MOVEMENT_THRESHOLD) {
                destX += inputs.dodgeLeft ? 1 : -1;
            } else if (Math.abs(this.rot - WEST) < MOVEMENT_THRESHOLD) {
                destY += inputs.dodgeLeft ? 1 : -1;
            }
            movementRequested = true;
            isDodging = true;
        }
        
        return { 
            requested: movementRequested, 
            destX, 
            destY, 
            isMovingBackward, 
            isDodging, 
            isForward: inputs.up,
            isBackward: inputs.down,
            isDodgeLeft: inputs.dodgeLeft,
            isDodgeRight: inputs.dodgeRight
        };
    }

    async handleMovement(movement, map, sprites, config, timeElapsed, eventA, eventB) {
        // Vérification des collisions
        const collisionResult = this.checkCollisions(movement.destX, movement.destY, map, sprites);
        
        if (collisionResult.hasCollision) {
            await this.handleCollisionMovement(collisionResult, movement, config);
        } else {
            await this.handleSuccessfulMovement(movement, config, timeElapsed);
        }
    }

    checkCollisions(destX, destY, map, sprites) {
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
        
        return {
            hasCollision: collidesWithWall || collidesWithSprite,
            withWall: collidesWithWall,
            withSprite: collidesWithSprite,
            sprite: collidedSprite
        };
    }

    async handleCollisionMovement(collisionResult, movement, config) {
        this.isMoving = true;
        
        if (collisionResult.withSprite && collisionResult.sprite.spriteType === "A") {
            await this.handleEnemyCollision(collisionResult.sprite, movement, config);
        } else {
            await this.handleWallCollision(movement, config);
        }
        
        this.isMoving = false;
    }

    async handleEnemyCollision(enemy, movement, config) {
        // Animation d'impact contre l'ennemi
        const impactAnimation = this.createImpactAnimation(movement, config.PUSH_ENEMY_FACTOR);
        await this.executeImpactAnimation(impactAnimation, config.ENEMY_IMPACT_DURATION);
        
        // Vérifier le délai avant de déclencher le combat
        const currentTime = Date.now();
        if (this.turn && !movement.isDodging && (currentTime - (this.lastAttackTime || 0) >= config.ATTACK_COOLDOWN)) {
            try {
                this.lastAttackTime = currentTime;
                await enemy.combat(this.might, this.criti, this);
            } catch (error) {
                console.error("Error:", error);
                this.turn = false;
            }
        } else if (this.turn && !movement.isDodging && (currentTime - (this.lastAttackTime || 0) < config.ATTACK_COOLDOWN)) {
            Sprite.terminalLog("Can't attack yet !");
        }
    }

    async handleWallCollision(movement, config) {
        // Animation d'impact sur obstacle
        const impactAnimation = this.createImpactAnimation(movement, config.PUSH_WALL_FACTOR);
        await this.executeImpactAnimation(impactAnimation, config.WALL_IMPACT_DURATION);
    }

    createImpactAnimation(movement, pushFactor) {
        const startX = this.x;
        const startY = this.y;
        const pushDistance = this.tileSize * pushFactor;
        
        let pushX = 0;
        let pushY = 0;
        
        // Calculer la direction de la poussée selon le type de mouvement
        const NORTH = Math.PI / 2;
        const EAST = 0;
        const SOUTH = 3 * Math.PI / 2;
        const WEST = Math.PI;
        const MOVEMENT_THRESHOLD = 0.1;
        
        if (movement.isDodging) {
            this.calculateDodgePush(pushDistance, movement.isDodgeLeft, NORTH, EAST, SOUTH, WEST, MOVEMENT_THRESHOLD);
        } else if (movement.isMovingBackward) {
            this.calculateBackwardPush(pushDistance, NORTH, EAST, SOUTH, WEST, MOVEMENT_THRESHOLD);
        } else {
            this.calculateForwardPush(pushDistance, NORTH, EAST, SOUTH, WEST, MOVEMENT_THRESHOLD);
        }
        
        return {
            startX,
            startY,
            pushX: this.tempPushX || 0,
            pushY: this.tempPushY || 0,
            maxPushX: startX + (this.tempPushX || 0),
            maxPushY: startY + (this.tempPushY || 0)
        };
    }

    calculateDodgePush(pushDistance, isDodgeLeft, NORTH, EAST, SOUTH, WEST, MOVEMENT_THRESHOLD) {
        if (Math.abs(this.rot - NORTH) < MOVEMENT_THRESHOLD) {
            this.tempPushX = isDodgeLeft ? -pushDistance : pushDistance;
            this.tempPushY = 0;
        } else if (Math.abs(this.rot - EAST) < MOVEMENT_THRESHOLD) {
            this.tempPushX = 0;
            this.tempPushY = isDodgeLeft ? -pushDistance : pushDistance;
        } else if (Math.abs(this.rot - SOUTH) < MOVEMENT_THRESHOLD) {
            this.tempPushX = isDodgeLeft ? pushDistance : -pushDistance;
            this.tempPushY = 0;
        } else if (Math.abs(this.rot - WEST) < MOVEMENT_THRESHOLD) {
            this.tempPushX = 0;
            this.tempPushY = isDodgeLeft ? pushDistance : -pushDistance;
        }
    }

    calculateBackwardPush(pushDistance, NORTH, EAST, SOUTH, WEST, MOVEMENT_THRESHOLD) {
        if (Math.abs(this.rot - NORTH) < MOVEMENT_THRESHOLD) {
            this.tempPushX = 0;
            this.tempPushY = pushDistance; // Sud (inverse du Nord)
        } else if (Math.abs(this.rot - EAST) < MOVEMENT_THRESHOLD) {
            this.tempPushX = -pushDistance; // Ouest (inverse de l'Est)
            this.tempPushY = 0;
        } else if (Math.abs(this.rot - SOUTH) < MOVEMENT_THRESHOLD) {
            this.tempPushX = 0;
            this.tempPushY = -pushDistance; // Nord (inverse du Sud)
        } else if (Math.abs(this.rot - WEST) < MOVEMENT_THRESHOLD) {
            this.tempPushX = pushDistance; // Est (inverse de l'Ouest)
            this.tempPushY = 0;
        }
    }

    calculateForwardPush(pushDistance, NORTH, EAST, SOUTH, WEST, MOVEMENT_THRESHOLD) {
        if (Math.abs(this.rot - NORTH) < MOVEMENT_THRESHOLD) {
            this.tempPushX = 0;
            this.tempPushY = -pushDistance; // Nord
        } else if (Math.abs(this.rot - EAST) < MOVEMENT_THRESHOLD) {
            this.tempPushX = pushDistance; // Est
            this.tempPushY = 0;
        } else if (Math.abs(this.rot - SOUTH) < MOVEMENT_THRESHOLD) {
            this.tempPushX = 0;
            this.tempPushY = pushDistance; // Sud
        } else if (Math.abs(this.rot - WEST) < MOVEMENT_THRESHOLD) {
            this.tempPushX = -pushDistance; // Ouest
            this.tempPushY = 0;
        }
    }

    async executeImpactAnimation(animation, duration) {
        // Fonctions d'easing
        const easeInOut = (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const easeOutBack = (t) => {
            const c1 = 1.70158;
            const c3 = c1 + 1;
            return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
        };
        
        // Phase 1: Poussée vers l'avant/arrière
        await this.animatePhase(animation, duration / 2, easeInOut, true);
        
        // Phase 2: Rebond
        await this.animatePhase(animation, duration / 2, easeOutBack, false);
        
        // Normalisation finale de la position
        this.x = animation.startX;
        this.y = animation.startY;
        this.z = 0;
    }

    async animatePhase(animation, duration, easingFunction, isForwardPhase) {
        const startTime = performance.now();
        let phaseComplete = false;
        
        while (!phaseComplete) {
            const currentTime = performance.now();
            const elapsedTime = currentTime - startTime;
            
            let t = Math.min(elapsedTime / duration, 1);
            
            if (t >= 1) {
                phaseComplete = true;
                t = 1;
            }
            
            const easedT = easingFunction(t);
            
            if (isForwardPhase) {
                this.x = animation.startX + animation.pushX * easedT;
                this.y = animation.startY + animation.pushY * easedT;
            } else {
                this.x = animation.maxPushX - animation.pushX * easedT;
                this.y = animation.maxPushY - animation.pushY * easedT;
            }
            
            await new Promise(resolve => requestAnimationFrame(resolve));
        }
    }

    async handleSuccessfulMovement(movement, config, timeElapsed) {
        this.isMoving = true;
        
        // Animation de déplacement améliorée
        const targetX = movement.destX * this.tileSize + this.tileSize / 2;
        const targetY = movement.destY * this.tileSize + this.tileSize / 2;
        
        // Durée du mouvement
        let movementDuration = this.calculateMovementDuration(movement, config);
        
        // Animation principale
        await this.animateMovement(targetX, targetY, movementDuration);
        
        // Gestion des réinitialisations d'interface
        if (this.turn) {
            Sprite.resetToggle();
            this.inventoryMenuShowed = false;
        }
        
        this.isMoving = false;
        
        // Gestion des mouvements continus
        await this.handleContinuousMovement(movement, config, timeElapsed);
    }

    calculateMovementDuration(movement, config) {
        let duration;
        
        if (movement.isDodging) {
            duration = config.DODGE_DURATION;
        } else {
            const isContinuousMovement = (movement.isForward && this.lastMoveWasForward) || 
                                       (movement.isBackward && this.lastMoveWasBackward);
            duration = movement.isMovingBackward ? 
                      (isContinuousMovement ? config.BACKWARD_DURATION - config.CONTINUOUS_MOVE_SPEEDUP : config.BACKWARD_DURATION) : 
                      (isContinuousMovement ? config.FORWARD_DURATION - config.CONTINUOUS_MOVE_SPEEDUP : config.FORWARD_DURATION);
        }
        
        // Mémoriser la direction du mouvement actuel
        this.lastMoveWasForward = movement.isForward;
        this.lastMoveWasBackward = movement.isBackward;
        
        // Ajustement de vitesse avec le sort Speed
        if (this.spells && this.spells.length > 0 && this.spells[this.selectedSpell].name === "Speed") {
            duration -= 50;
        }
        
        // Bornes min/max pour la durée
        return Math.max(Math.min(duration, 800), 200);
    }

    async animateMovement(targetX, targetY, duration) {
        const startX = this.x;
        const startY = this.y;
        
        const startTime = performance.now();
        let movementComplete = false;
        
        // Fonction d'easing
        const easeInOutQuart = (t) => t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
        
        while (!movementComplete) {
            const currentTime = performance.now();
            const elapsedTime = currentTime - startTime;
            
            let t = Math.min(elapsedTime / duration, 1);
            
            if (t >= 1) {
                movementComplete = true;
                t = 1;
            }
            
            const easedT = easeInOutQuart(t);
            
            this.x = startX + (targetX - startX) * easedT;
            this.y = startY + (targetY - startY) * easedT;
            
            await new Promise(resolve => requestAnimationFrame(resolve));
        }
        
        // Normalisation finale de la position
        this.x = targetX;
        this.y = targetY;
        this.z = 0;
    }

    async handleContinuousMovement(movement, config, timeElapsed) {
        // Déclencher immédiatement un nouveau mouvement si le bouton est toujours enfoncé
        if (this.continuousUpPressed || this.continuousJoystickUp) {
            await new Promise(resolve => setTimeout(resolve, config.CONTINUOUS_MOVE_DELAY));
            this.button5Clicked = true;
            this.move(timeElapsed, arguments[1], arguments[2], arguments[3], arguments[4]);
        } else if (this.continuousDownPressed || this.continuousJoystickDown) {
            await new Promise(resolve => setTimeout(resolve, config.CONTINUOUS_MOVE_DELAY));
            this.button8Clicked = true;
            this.move(timeElapsed, arguments[1], arguments[2], arguments[3], arguments[4]);
        }
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 8. SYSTÈME D'ACTIONS ET INTERACTIONS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 8.1 Actions avec sprites
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    async handleSpriteAction(action, sprites) {
        if (!action || !this || !this.turn) return;
    
        // Vérifier qu'aucune action n'est en cours
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

        const { frontX, frontY } = this.calculateFrontPosition();

        console.log(`Action detected! Looking at position (${frontX}, ${frontY})`);
        console.log(`Player position: (${Math.floor(this.x / this.tileSize)}, ${Math.floor(this.y / this.tileSize)}), quadrant: ${this.quadrant}`);

        let spriteFound = false;
        for (const sprite of sprites) {
            const spriteX = Math.floor(sprite.x / this.tileSize);
            const spriteY = Math.floor(sprite.y / this.tileSize);
            
            if (spriteX === frontX && spriteY === frontY) {
                spriteFound = true;
                console.log(`Sprite found at front position! Type: ${sprite.spriteType}`);
                
                await this.executeSpriteAction(sprite, currentTime);
                break;
            }
        }
        
        if (!spriteFound) {
            console.log("No sprite found at front position");
        }
        
        // Réinitialisation de la touche d'action après utilisation
        this.actionButtonClicked = false;
    }

    async executeSpriteAction(sprite, currentTime) {
        switch (sprite.spriteType) {
            case "A":
                await this.handleEnemyAction(sprite, currentTime);
                break;
            case "EXIT":
                await this.handleExitAction();
                break;
            case "DOOR":
                await this.handleDoorAction(sprite);
                return; // Important: sortir immédiatement pour éviter handleTeleportation
            case 0:
            case 2:
                await this.handleDialogueAction(sprite);
                break;
            case 1:
                console.log("Decoration sprite, no action");
                this.turn = false;
                break;
            case 3:
                await this.handleShopAction(sprite);
                break;
            case 4:
                console.log("Quest Giver sprite, not implemented yet");
                this.turn = false;
                break;
            case 5:
                await this.handleQuestCompletionAction(sprite);
                break;
            case 6:
                await this.handleChestAction(sprite);
                break;
            default:
                console.log(`Sprite type ${sprite.spriteType} has no specific action`);
                Sprite.resetToggle();
                break;
        }
    }

    async handleEnemyAction(sprite, currentTime) {
        console.log("Enemy detected, initiating combat!");
        this.lastAttackTime = currentTime;
        
        if (this.combatSpell) {
            console.log("Using combat spell");
            sprite.combatSpell(this, sprite);
        } else {
            console.log("Using normal attack");
            sprite.combat(this.might, this.criti, this);
        }
    }

    async handleExitAction() {
        commandBlocking = true;
        
        await Raycaster.fadeToBlack(300);
        Sprite.terminalLog('Level finished!')
        this.raycaster.nextMap();
        await Raycaster.fadeFromBlack(300);
        commandBlocking = false;
    }

    async handleDialogueAction(sprite) {
        console.log("Dialogue sprite detected");
        sprite.talk();
        
        setTimeout(() => {
            this.turn = false;
        }, 500);
    }

    async handleShopAction(sprite) {
        sprite.displayItemsForSale(this);
        this.turn = false;
    }

    async handleQuestCompletionAction(sprite) {
        console.log("Quest completion sprite");
        if (this.quests[0].completed === false) {
            this.quests[0].complete();
            console.log("test changement de texture");
            sprite.spriteTexture = 21;
            Sprite.resetToggle();
        } else {
            Sprite.terminalLog("I've already looted that.")
        }
        this.turn = false;
    }

    async handleChestAction(sprite) {
        console.log("chest !");
        if (sprite.step != 1) {
            sprite.generateLoot(this);
            sprite.spriteTexture = 21;
            sprite.step = 1;
            Sprite.resetToggle();
        } else {
            Sprite.terminalLog("I've already looted that.")
        }
        this.turn = false;
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 8.2 Gestion des portes et téléporteurs
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    async handleDoorAction(sprite) {
        // Fondu vers le noir
        await Raycaster.fadeToBlack(300);
        
        // Appeler door pendant que l'écran est noir
        await sprite.door(this, null, this.raycaster);
        await this.raycaster.loadFloorCeilingImages();
        
        // Fondu depuis le noir
        await Raycaster.fadeFromBlack(300);
        
        Sprite.terminalLog('You enter/exit the area.');
        
        // Réinitialiser l'état de l'action
        this.actionButtonClicked = false;
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 8.3 Combat et sorts
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Les méthodes de combat et sorts sont gérées par les sprites et le système de sorts
    // Les interactions sont coordonnées via handleSpriteAction

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FIN DE LA CLASSE PLAYER
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FIN DU FICHIER PLAYER.JS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////