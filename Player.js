////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Player
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

console.log("chargement de la classe Player.")


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
        // tick à chaque cycle
        // intégrer changement d'icone d'arme équipée dans l'UI d'exploration
        
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

        // Mise à jour des valeurs affichées
        document.getElementById("PlayerHPoutput").textContent = this.hp;
        document.getElementById("PlayerMPoutput").textContent = this.mp;
        document.getElementById("PlayerGoldOutput").textContent = this.gold;
        document.getElementById("PlayerStrOutput").textContent = this.strength;
        document.getElementById("PlayerDexOutput").textContent = this.dexterity;
        document.getElementById("PlayerIntOutput").textContent = this.intellect;

        // Mise à jour de l'icône de l'arme équipée
        const weaponIcon = document.getElementById("weaponIcon");
        weaponIcon.src = this.hands[0] ? this.hands[0].icon : "assets/icons/a.png";

        // Gestion du level up des caractéristiques
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

        // Régénération de mana
        if (this.mp < this.mpMax) {
            this.mp = Math.min(this.mp + (this.intellect / 50), this.mpMax);
        }

        // HP et MP max basés sur les caractéristiques
        this.hpMax = 10 + (this.strength - 5);
        this.mpMax = 10 + (this.intellect - 5);

        // Limiter HP au maximum
        this.hp = Math.min(this.hp, this.hpMax);

        // Vérification de l'état de mort
        if (this.hp <= 0 && gameOver === false) {
            Sprite.showGameOverCinematic();
            gameOver = true;
        }

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

        // Mise à jour des barres de progression
        updateProgressBar("hpBar", this.hp, this.hpMax);
        updateProgressBar("mpBar", this.mp, this.mpMax);
        updateProgressBar("strengthBar", this.XPstrength, 10);
        updateProgressBar("dexterityBar", this.XPdexterity, 10);
        updateProgressBar("intellectBar", this.XPintellect, 10);

        // Mise à jour du sort sélectionné
        if (this.spells && this.spells[this.selectedSpell]) {
            document.getElementById("selectedSpell").textContent = this.spells[this.selectedSpell].name;
            document.getElementById("castSpell").src = this.spells[this.selectedSpell].icon;
        }
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
                Raycaster.resetShowGameOver(); // Au cas où on vient d'un game over
                Raycaster.showMainMenu();
                break;

            // Bouton 21 - Back Menu
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
    // xyz
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
    
    // Fondu vers le noir
    await Raycaster.fadeToBlack(100);
    
    // Attendre au noir
    //    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Appeler door pendant que l'écran est noir
    await sprite.door(this, null);
    await this.raycaster.loadFloorCeilingImages();
    
    // Fondu depuis le noir
    await Raycaster.fadeFromBlack(100);
    
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
                            // sprite.lootClass = 5;

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