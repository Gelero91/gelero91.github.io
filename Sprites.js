////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SPRITES.JS - SYSTÈME DE SPRITES ET ENTITÉS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// TABLE DES MATIÈRES
//
// 1. CLASSE SPRITE PRINCIPALE
//    1.1 Constructeur et propriétés
//    1.2 Configuration des types de sprites
//    1.3 Système de loot et récompenses
//
// 2. SYSTÈME D'INTELLIGENCE ARTIFICIELLE
//    2.1 IA et déplacements ennemis
//    2.2 Pathfinding et mouvements
//    2.3 Système d'attaque automatique
//
// 3. SYSTÈME DE COMBAT
//    3.1 Combat joueur vs ennemis
//    3.2 Système de sorts de combat
//    3.3 Animations et effets de combat
//    3.4 Gestion des dégâts et feedback visuel
//
// 4. SYSTÈME DE COMMERCE
//    4.1 Interface de boutique
//    4.2 Achat et vente d'objets
//    4.3 Gestion des inventaires
//
// 5. SYSTÈME DE DIALOGUE
//    5.1 Système de dialogue interactif
//    5.2 Gestion des conversations
//    5.3 Cinématiques et animations
//
// 6. SYSTÈME D'INTERFACE UTILISATEUR
//    6.1 Terminal et logs
//    6.2 Animations et effets visuels
//    6.3 Gestion des menus et navigation
//
// 7. SYSTÈME DE PORTES ET TÉLÉPORTATION
//    7.1 Gestion des portes
//    7.2 Transitions entre zones
//    7.3 Effets de téléportation
//
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

console.log("chargement de la classe Sprites.");

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 1. CLASSE SPRITE PRINCIPALE
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 1.1 Constructeur et propriétés
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
        lootClass = null
    ) {
        // Position et dimensions
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
        this.h = h;

        // État de rendu
        this.hit = false;
        this.screenPosition = null;
        this.spriteFlash = 0;
        this.ang = ang;

        // Type et apparence
        this.spriteType = spriteType;
        this.spriteTexture = spriteTexture;

        // Propriétés de gameplay
        this.isBlocking = isBlocking;
        this.attackable = attackable;
        this.hp = hp;
        this.dmg = dmg;
        this.turn = turn;
        this.animationProgress = animationProgress;

        // Dialogue et interaction
        this.spriteName = spriteName;
        this.spriteFace = spriteFace;
        this.spriteTalk = spriteTalk;
        this.spriteSell = spriteSell;
        
        // Identification et état
        this.id = id;
        this.step = step;

        // Gestion du système de loot
        this.initializeLootClass(lootClass, spriteType, hp, dmg);

        // Propriétés de combat et mouvement
        this.lastAttackTime = null;
        this.isMoving = false;
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 1.2 Configuration des types de sprites
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    /*
    Types de sprites avec comportements spécifiques :
    
    0 = Décoration sans interaction (non bloquant)
    1 = Décoration alternative (bloquant)
    2 = PNJ avec dialogues
    3 = Marchand (boutique avec items)
    4 = Quest giver (donneur de quêtes - non implémenté)
    5 = Quest end (fin de quête/interaction spéciale)
    6 = Coffre au trésor (avec loot)
    10 = Sprites décoratifs multiples (génère 2 sprites herbe aléatoires)
    "A" = Ennemi (combat, IA, loot)
    "DOOR" = Porte intérieur/extérieur (téléportation 2 cases)
    "EXIT" = Sortie vers carte suivante
    
    Structure des données sprites : [ID, x, y, type, texture, face, name, dialogue, items, hp, dmg, lootClass]
    
    Textures disponibles (1-23) :
    1=PNJ1, 2=Garde, 3=PNJ2, 4=Roche, 5=Tonneau, 6=Buisson, 7=Pancarte,
    8=Slime, 9=Trésor, 10=Cadavre, 11=Statue, 12=Brasier, 13=Herbes,
    14=Gobelin, 15=Arbre, 16=Colonne, 17=Sac, 18=Sac (var),
    19=Animation slash, 20=Animation spark, 21=Coffre ouvert, 
    22=Chauve-souris, 23=Liannes vivantes
    */

    initializeLootClass(lootClass, spriteType, hp, dmg) {
        if (lootClass === null || lootClass === 0) {
            if (spriteType === "A") {
                // Calcul automatique pour les ennemis
                const calculatedClass = Sprite.calculateLootClass(hp, dmg);
                const classLetters = ["a", "b", "c", "d", "e", "f"];
                this.lootClass = classLetters[calculatedClass];
                console.log(`Enemy created: HP=${hp}, DMG=${dmg}, Calculated class=${calculatedClass}, Loot class=${this.lootClass}`);
            } else if (spriteType === 6) {
                // Classe par défaut pour les coffres
                this.lootClass = "c";
                console.log(`Chest default lootClass: ${this.lootClass} for ${this.spriteName}`);
            } else {
                this.lootClass = null;
            }
        } else {
            this.lootClass = lootClass;
            console.log(`Sprite lootClass from data: ${this.lootClass} for ${this.spriteName}`);
        }
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 1.3 Système de loot et récompenses
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Tables de loot statiques pour la classe Sprite
    static lootTables = {
        "a": { minGold: 0, maxGold: 0, itemChance: 0, possibleItems: [] },
        "b": { minGold: 5, maxGold: 15, itemChance: 0.1, possibleItems: [1, 2, 3, 4, 5, 6, 7, 8, 9] },
        "c": { minGold: 10, maxGold: 30, itemChance: 0.2, possibleItems: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]  },
        "d": { minGold: 25, maxGold: 60, itemChance: 0.3, possibleItems: [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 18, 19]  },
        "e": { minGold: 50, maxGold: 120, itemChance: 0.5, possibleItems: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]  },
        "f": { minGold: 100, maxGold: 250, itemChance: 0.7, possibleItems: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30]  }
    };

    /**
     * Calcule automatiquement la classe de loot basée sur les statistiques de l'ennemi
     * @param {number} hp - Points de vie de l'ennemi
     * @param {number} dmg - Dégâts de l'ennemi
     * @return {number} - Classe de loot calculée (1-5)
     */
    static calculateLootClass(hp, dmg) {
        const effectiveDmg = dmg || 1;
        let baseClass = Math.floor(hp / effectiveDmg);
        baseClass += Math.floor(dmg / 2);
        return Math.max(1, Math.min(5, baseClass));
    }

    generateLoot(player) {
        // Si c'est un nombre, donner directement l'objet
        if (typeof this.lootClass === 'number') {
            const item = Item.getItemById(this.lootClass);
            if (item) {
                item.give(player);
                Sprite.displayLootAnimation(`You found ${item.name}!`, 'item');
            }
            player.statsUpdate(player);
            return;
        }
        
        // Si c'est une lettre, utiliser la table de loot
        const lootTable = Sprite.lootTables[this.lootClass];
        if (!lootTable || this.lootClass === "a") {
            return;
        }
        
        // Générer une quantité aléatoire d'or avec variance
        const baseGold = Math.floor(Math.random() * (lootTable.maxGold - lootTable.minGold + 1)) + lootTable.minGold;
        const goldModifier = (this.hp * this.dmg) / 10;
        const goldAmount = Math.floor(baseGold * (1 + goldModifier / 100));
        
        // Ajouter l'or au joueur
        player.gold += goldAmount;
        Sprite.displayLootAnimation(`You found ${goldAmount} gold coins!`, 'gold');
        
        // Déterminer si un objet est obtenu
        const baseItemChance = lootTable.itemChance;
        const difficultyBonus = (this.hp * this.dmg) / 200;
        const adjustedItemChance = Math.min(0.95, baseItemChance + difficultyBonus);
        
        const getItem = Math.random() < adjustedItemChance;
        
        if (getItem && lootTable.possibleItems.length > 0) {
            // Trier les objets par valeur
            const sortedItems = [...lootTable.possibleItems].sort((a, b) => {
                const itemA = Item.getItemById(a);
                const itemB = Item.getItemById(b);
                
                const valueA = itemA.price || (itemA.might + itemA.magic + itemA.armor + itemA.dodge);
                const valueB = itemB.price || (itemB.might + itemB.magic + itemB.armor + itemB.dodge);
                
                return valueA - valueB;
            });
            
            // Calcul d'un index pondéré favorisant les meilleurs objets pour les ennemis forts
            const powerRatio = Math.min(1, (this.hp * this.dmg) / 50);
            const weightedIndex = Math.floor(Math.random() * (1 + powerRatio) * sortedItems.length);
            const clampedIndex = Math.min(weightedIndex, sortedItems.length - 1);
            
            const itemId = sortedItems[clampedIndex];
            const lootItem = Item.getItemById(itemId);
            
            if (lootItem) {
                lootItem.give(player);
                
                let qualityDesc = "a";
                if (clampedIndex >= sortedItems.length * 0.8) qualityDesc = "an exceptional";
                else if (clampedIndex >= sortedItems.length * 0.6) qualityDesc = "a valuable";
                else if (clampedIndex >= sortedItems.length * 0.4) qualityDesc = "a good";
                
                Sprite.displayLootAnimation(`You found ${qualityDesc} ${lootItem.name}!`, 'item');
            }
        }
        
        player.statsUpdate(player);
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 2. SYSTÈME D'INTELLIGENCE ARTIFICIELLE
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 2.1 IA et déplacements ennemis
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
    
    // Si on est en contact avec le joueur, attaquer
    if (distanceToPlayer <= 1) {
        if (!this.lastAttackTime || (Date.now() - this.lastAttackTime) >= 2000) {
            this.attackPlayer(player);
            
            // Planifier une attaque supplémentaire dans 2 secondes
            this.lastAttackTime = Date.now();
            setTimeout(() => {
                if (this.hp > 0 && player.hp > 0) {
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
    
    // Zone de détection
    const detectionRange = 5;
    const isChasing = distanceToPlayer <= detectionRange;
    const moveChance = isChasing ? 0.8 : 0.4;
    
    if (Math.random() > moveChance) {
        return false;
    }
    
    let directionToMove = null;
    
    if (isChasing) {
        // Mode poursuite: essayer de se rapprocher du joueur
        const dx = playerCellX - currentCellX;
        const dy = playerCellY - currentCellY;
        
        // Choisir l'axe avec la plus grande différence
        if (Math.abs(dx) >= Math.abs(dy)) {
            directionToMove = dx > 0 ? { dx: 1, dy: 0 } : { dx: -1, dy: 0 };
            
            if (!this.isValidMove(directionToMove, map, sprites, player, currentCellX, currentCellY)) {
                directionToMove = dy > 0 ? { dx: 0, dy: 1 } : { dx: 0, dy: -1 };
            }
        } else {
            directionToMove = dy > 0 ? { dx: 0, dy: 1 } : { dx: 0, dy: -1 };
            
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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 2.2 Pathfinding et mouvements
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Vérifier si un mouvement est valide
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
    
    // Vérifier si la case est vide (< 1 = traversable, >= 1 = mur) - MODIFIÉ pour textures de sol
    if (map[newCellY][newCellX] >= 1) {
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
                return false;
            }
        }
    }
    
    return true;
}

    // Essayer un mouvement aléatoire
    tryRandomMove(map, sprites, player, currentCellX, currentCellY) {
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
        
        return false;
    }

    // Exécuter le mouvement avec animation
    async executeMove(direction, currentCellX, currentCellY, tileSize) {
        const newCellX = currentCellX + direction.dx;
        const newCellY = currentCellY + direction.dy;
        
        this.isMoving = true;
        
        // Positions initiale et finale
        const startX = this.x;
        const startY = this.y;
        const targetX = newCellX * tileSize + tileSize / 2;
        const targetY = newCellY * tileSize + tileSize / 2;
        
        const animationDuration = 600;
        
        // Fonction d'easing pour animation fluide
        const easeInOutQuart = (t) => t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
        
        // Animation du déplacement
        const startTime = performance.now();
        let animationComplete = false;
        
        while (!animationComplete) {
            const currentTime = performance.now();
            const elapsedTime = currentTime - startTime;
            
            let t = Math.min(elapsedTime / animationDuration, 1);
            
            if (t >= 1) {
                animationComplete = true;
                t = 1;
            }
            
            const easedT = easeInOutQuart(t);
            
            // Mettre à jour la position
            this.x = startX + (targetX - startX) * easedT;
            this.y = startY + (targetY - startY) * easedT;
            
            // Petit effet de rebond vertical
            this.z = 5 * Math.sin(Math.PI * t);
            
            await new Promise(resolve => requestAnimationFrame(resolve));
        }
        
        // S'assurer que la position finale est exacte
        this.x = targetX;
        this.y = targetY;
        this.z = 0;
        
        this.isMoving = false;
        return true;
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 2.3 Système d'attaque automatique
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Amélioration de la méthode attackPlayer
    attackPlayer(player) {
        if (player.hp <= 0 || this.hp <= 0) return;
        
        // Animation de l'attaque
        this.startAttackAnimation();
        
        const chanceEchec = Math.floor(Math.random() * 100);
        
        if (chanceEchec > player.dodge) {
            // L'attaque réussit
            if (player.armor >= this.dmg) {
                Sprite.terminalLog("Your armor absorbs all the damages.", 1);
                Raycaster.armorAbsorbFlash();
            } else {
                const damageDone = this.dmg - player.armor;
                
                // Afficher les dégâts subis
                Sprite.showDamageNumber(damageDone, player.x, player.y, false);
                
                Sprite.displayCombatAnimation(`${this.spriteName || "The enemy"} attacks : ${damageDone} dmg !`, 2);
                
                // Tremblement proportionnel aux dégâts
                const shakeIntensity = Math.min(20, 5 + damageDone * 2);
                Sprite.screenShake(shakeIntensity, 300);
                
                Raycaster.playerDamageFlash();
                player.hp -= damageDone;
                
                if (player.hp <= 0) {
                    Sprite.terminalLog("You're dead !");
                    Sprite.deathEffect();
                }
            }
        } else {
            // Le joueur esquive
            Sprite.terminalLog(`You dodge ${this.spriteName || "the enemy"}'s attack !`, 2);
            player.XPdexterity += 1;
            Raycaster.dodgeEffect();
        }
        
        player.statsUpdate(player);
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 3. SYSTÈME DE COMBAT
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 3.1 Combat joueur vs ennemis
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    attack(target) {
        if (target.armor >= this.dmg) {
            let entry = "Your armor absorbs all the damages.";
            Sprite.terminalLog(entry, 1);
        } else {
            let entry = "The opponent attacks :" + (this.dmg - target.armor) + "dmg";
            Sprite.terminalLog(entry, 2);
            Raycaster.playerDamageFlash();
            target.hp -= this.dmg - target.armor;
        }
    }

    // Amélioration de la méthode playerAttack
    playerAttack(damage, criti, player) {
        const chanceCriti = Math.floor(Math.random() * 100);
        var factor = 1;
        
        if (chanceCriti < criti) {
            factor = 2;
            
            // Effets visuels pour coup critique
            Sprite.criticalHitZoom();
            Sprite.screenShake(15, 400);
            Sprite.terminalLog('Critical hit !', 5);
            
            player.XPdexterity += 1;
        }
        
        const finalDamage = damage * factor;
        this.hp -= finalDamage;
        
        // Afficher les dégâts
        Sprite.showDamageNumber(finalDamage, this.x, this.y, factor > 1);
        
        // Effets existants
        this.invokeAnimationSprite(player, 19);
        this.hitAnimation(player);
        this.startSpriteFlash();
        
        // Léger tremblement pour les hits normaux
        if (factor === 1) {
            Sprite.screenShake(5, 200);
        }
        
        player.XPstrength += 1;
        
        var entry = 'You attack :' + finalDamage + " dmg";
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
    
            player.statsUpdate(player);
        } else {
            const chanceEchec = Math.floor(Math.random() * 100);
    
            if (chanceEchec > player.dodge) {
                setTimeout(() => this.attack(player), 500);
            } else {
                Sprite.terminalLog('You dodge the attack.', 1);
                player.XPdexterity += 1;
                console.log(player.XPdexterity + "pts dexterity experience.");
            }
        }
        Sprite.resetToggle();
    }

    async combat(damage, criti, player) {
        // Blocage des commandes pour éviter les interférences
        commandBlocking = true;

        if (player.turn == true) {
            player.turn = false;
            this.playerAttack(damage, criti, player);
            
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
                this.lastAttackTime = Date.now();
            }
            
            Sprite.resetToggle();
            player.turn = true;
        } else {
            console.log('not your turn');
        }

        commandBlocking = false;
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 3.2 Système de sorts de combat
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    async combatSpell(player, target) {
        commandBlocking = true;
        
        if (player.turn == true) {
            player.spells[player.selectedSpell].cast(player, target);

            // Appeler la méthode pour invoquer le sprite d'animation
            this.invokeAnimationSprite(player, 20, 500);
            this.hitAnimation(player)
            this.enemyAttackUpdate(player);

            player.turn = false;
            player.combatSpell = false;
        } else {
            console.log('not your turn');
        }
        
        commandBlocking = false;
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 3.3 Animations et effets de combat
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

    // Méthode pour invoquer le sprite d'animation
    invokeAnimationSprite(player, usedTexture, delay = 300) {
        // Stocker la position initiale du sprite de combat
        const initialCombatSpritePosition = {
            x: Sprite.combatAnimationSprite.x,
            y: Sprite.combatAnimationSprite.y
        };

        // Mise à jour du sprite de combat pour l'effet cosmétique
        Sprite.updateCombatAnimationSprite({
            x: (player.x + this.x) / 2,
            y: (player.y + this.y) / 2,
            spriteTexture: usedTexture,
        });

        // Retourner le sprite de combat à sa position initiale après le délai
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
        const recoilDistance = 600;
        const recoilDuration = 750;

        // Calcul de l'angle en degrés
        const angleDeg = (player.rot * 180 / Math.PI + 360) % 360;

        // Détermination du quadrant en fonction de l'angle
        const quadrants = [
            {min: 337.5, max: 360, name: "est"},
            {min: 0, max: 22.5, name: "est"},
            {min: 22.5, max: 67.5, name: "nord-est"},
            {min: 67.5, max: 112.5, name: "nord"},
            {min: 112.5, max: 157.5, name: "nord-ouest"},
            {min: 157.5, max: 202.5, name: "ouest"},
            {min: 202.5, max: 247.5, name: "sud-ouest"},
            {min: 247.5, max: 292.5, name: "sud"},
            {min: 292.5, max: 337.5, name: "sud-est"}
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
            "est": {dx: 1, dy: 0},
            "nord-est": {dx: 1, dy: -1},
            "nord": {dx: 0, dy: -1},
            "nord-ouest": {dx: -1, dy: -1},
            "ouest": {dx: -1, dy: 0},
            "sud-ouest": {dx: -1, dy: 1},
            "sud": {dx: 0, dy: 1},
            "sud-est": {dx: 1, dy: 1}
        };

        const {dx, dy} = recoilDirections[quadrantName];

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

    // Recul au contact de l'ennemi
    static recoilPlayer(player) {
        const recoilDistance = 800;
        const recoilDuration = 300;

        // Calcul de l'angle en degrés
        const angleDeg = (player.rot * 180 / Math.PI + 360) % 360;

        // Détermination de la direction de recul basée sur l'angle
        const recoilDirections = [
            {min: 337.5, max: 360, dx: -1, dy: 0},
            {min: 0, max: 22.5, dx: -1, dy: 0},
            {min: 22.5, max: 67.5, dx: -1, dy: 1},
            {min: 67.5, max: 112.5, dx: 0, dy: 1},
            {min: 112.5, max: 157.5, dx: 1, dy: 1},
            {min: 157.5, max: 202.5, dx: 1, dy: 0},
            {min: 202.5, max: 247.5, dx: 1, dy: -1},
            {min: 247.5, max: 292.5, dx: 0, dy: -1},
            {min: 292.5, max: 337.5, dx: -1, dy: -1}
        ];

        let dx = 0, dy = 0;

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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 3.4 Gestion des dégâts et feedback visuel
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Effet de tremblement d'écran lors des impacts
    static screenShake(intensity = 10, duration = 300) {
        const gameWindow = document.getElementById("gameWindow");
        const startTime = performance.now();
        
        const shakeAnimation = () => {
            const elapsed = performance.now() - startTime;
            const progress = elapsed / duration;
            
            if (progress < 1) {
                // Diminuer l'intensité au fil du temps
                const currentIntensity = intensity * (1 - progress);
                
                // Générer des offsets aléatoires
                const offsetX = (Math.random() - 0.5) * currentIntensity;
                const offsetY = (Math.random() - 0.5) * currentIntensity;
                
                gameWindow.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
                
                requestAnimationFrame(shakeAnimation);
            } else {
                // Réinitialiser la position
                gameWindow.style.transform = '';
            }
        };
        
        requestAnimationFrame(shakeAnimation);
    }

    // Effet de zoom lors des coups critiques
    static criticalHitZoom(duration = 400) {
        const mainCanvas = document.getElementById("mainCanvas");
        const startTime = performance.now();
        
        // Sauvegarder le style original
        const originalTransform = mainCanvas.style.transform || '';
        mainCanvas.style.transition = 'none';
        
        const zoomAnimation = () => {
            const elapsed = performance.now() - startTime;
            const progress = elapsed / duration;
            
            if (progress < 1) {
                let scale;
                if (progress < 0.2) {
                    // Zoom in rapide
                    scale = 1 + (progress / 0.2) * 0.15;
                } else {
                    // Retour progressif
                    scale = 1.15 - ((progress - 0.2) / 0.8) * 0.15;
                }
                
                mainCanvas.style.transform = `scale(${scale})`;
                requestAnimationFrame(zoomAnimation);
            } else {
                mainCanvas.style.transform = originalTransform;
            }
        };
        
        requestAnimationFrame(zoomAnimation);
    }

    // Indicateur de dégâts flottant
    static showDamageNumber(damage, x, y, isCritical = false) {
        const outputElement = document.getElementById("output");
        
        // Créer l'élément de dégâts
        const damageDiv = document.createElement('div');
        damageDiv.style.cssText = `
            position: absolute;
            left: 50%;
            top: 30%;
            transform: translateX(-50%);
            font-size: ${isCritical ? '28px' : '20px'};
            font-weight: bold;
            color: ${isCritical ? '#ff3333' : '#ffaa00'};
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            pointer-events: none;
            z-index: 1000;
            font-family: monospace;
        `;
        
        damageDiv.textContent = isCritical ? `${damage}!` : damage;
        outputElement.appendChild(damageDiv);
        
        // Animation
        const startTime = performance.now();
        const duration = 1500;
        const startY = 30;
        
        const animateDamage = () => {
            const elapsed = performance.now() - startTime;
            const progress = elapsed / duration;
            
            if (progress < 1) {
                // Monter et fade out
                const yOffset = startY - (progress * 50);
                const opacity = 1 - (progress * 0.8);
                const scale = 1 + (progress * 0.3);
                
                damageDiv.style.top = `${yOffset}%`;
                damageDiv.style.opacity = opacity;
                damageDiv.style.transform = `translateX(-50%) scale(${scale})`;
                
                requestAnimationFrame(animateDamage);
            } else {
                damageDiv.remove();
            }
        };
        
        requestAnimationFrame(animateDamage);
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 4. SYSTÈME DE COMMERCE
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 4.1 Interface de boutique
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
        
        // Ajouter les écouteurs d'événements
        document.getElementById('buy-option').addEventListener('click', () => {
            this.displayBuyInterface(player);
        });
        
        document.getElementById('sell-option').addEventListener('click', () => {
            this.displaySellInterface(player);
        });
        
        document.getElementById('back-button').addEventListener('click', () => {
            Sprite.resetToggle();
        });
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 4.2 Achat et vente d'objets
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
                    <span style="color: #ffcc00; font-weight: bold; font-size:smaller;">${priceDisplay}</span>
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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 4.3 Gestion des inventaires
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

    // Vendre un objet au joueur
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
// 5. SYSTÈME DE DIALOGUE
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 5.1 Système de dialogue interactif
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Compter les dialogues
    countDialogues() {
        return this.spriteTalk.length;
    }

    // Gérer les dialogues et visages
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

    // Définir showNextDialogue comme une fonction const pour une meilleure capture de contexte
    const showNextDialogue = () => {
        if (currentDialogue < this.spriteTalk.length) {
            let [face, name, entry] = this.spriteTalk[currentDialogue];

            if (face && name && entry) {
                // Créer des copies pour ne pas modifier les données originales
                let displayFace = face;
                let displayName = name;
                let displayEntry = entry;
                
                // Remplacer %PLAYER% SEULEMENT si c'est exactement %PLAYER%
                if (displayName === "%PLAYER%" && playerName) {
                    displayName = playerName;
                }
                
                // Remplacer %PLAYERFACE% SEULEMENT si c'est exactement %PLAYERFACE%
                if (displayFace === "%PLAYERFACE%" && playerFace) {
                    displayFace = playerFace;
                }
                
                // Remplacer %PLAYER% dans le texte du dialogue si présent
                if (displayEntry.includes("%PLAYER%") && playerName) {
                    displayEntry = displayEntry.replace(/%PLAYER%/g, playerName);
                }
                
                dialogue.innerHTML = `<font style="font-weight: bold;">${displayName} </font> :<font style="font-style: italic;"><br><br>${displayEntry}</font>`;
                faceOutput.src = IMAGES[displayFace] || '';
                allDialoguesLog += `<font style="font-weight: bold;">${displayName} </font> :<font style="font-style: italic;"><br><br>${displayEntry}</font><br>`;
            }

            currentDialogue++;
        } else {
            // Fin du dialogue - retirer l'écouteur d'événements
            if (activeKeyListener) {
                document.removeEventListener("keydown", activeKeyListener);
                activeKeyListener = null;
            }
            
            for (let i = 0; i < this.spriteTalk.length; i++) {
                let [face, name, entry] = this.spriteTalk[i];
                
                // Créer des copies pour ne pas modifier les données originales
                let displayName = name;
                let displayEntry = entry;
                
                // Remplacer %PLAYER% SEULEMENT si c'est exactement %PLAYER%
                if (displayName === "%PLAYER%" && playerName) {
                    displayName = playerName;
                }
                
                // Remplacer %PLAYER% dans le texte si présent
                if (displayEntry.includes("%PLAYER%") && playerName) {
                    displayEntry = displayEntry.replace(/%PLAYER%/g, playerName);
                }
                
                Sprite.terminalLog(`${displayName} :</br>${displayEntry}</br>`, 4);
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

    static showGameOver() {
        const mainCanvas = document.getElementById("mainCanvas");
        const gameOverWindow = document.getElementById("cinematicWindow").addEventListener;

        mainCanvas.style = "display:none";
        gameOverWindow.style = "display:block";
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 5.2 Gestion des conversations
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Fonction showCinematic avec fade simple sur la fenêtre cinématique
static async showCinematic(cinematicSteps, onComplete = null) {
    // Bloquer les commandes 
    commandBlocking = true;
    
    const dialogue = document.getElementById("dialogue");
    const faceOutput = document.getElementById("faceOutput");
    const dialWindow = document.getElementById("dialogueWindow");
    const outputElement = document.getElementById("output");
    const nextButton = document.getElementById("nextButton");
    const mainCanvas = document.getElementById("mainCanvas");
    const cinematicWindow = document.getElementById("cinematicWindow");

    // Cacher le canvas et montrer l'image cinématique
    mainCanvas.style.display = "none";
    cinematicWindow.style.display = "block";
    outputElement.style.display = "none";
    dialWindow.style.display = "block";
    
    // Préparer la transition CSS
    cinematicWindow.style.transition = "opacity 0.3s ease-in-out";
    cinematicWindow.style.opacity = "0"; // Commencer invisible pour le fade in initial
    
    let currentStep = 0;
    let keyListener = null;
    let isTransitioning = false;
    
    const showNextStep = async () => {
        if (isTransitioning) return;
        
        if (currentStep < cinematicSteps.length) {
            isTransitioning = true;
            
            // Fade out (sauf pour la première slide)
            if (currentStep > 0) {
                cinematicWindow.style.opacity = "0";
                await new Promise(resolve => setTimeout(resolve, 300));
            }
            
            const step = cinematicSteps[currentStep];
            
            // Changer l'image et le dialogue
            if (step.image) {
                const imageKey = step.image.replace('assets/', '').replace('.png', '').replace('.jpg', '');
                cinematicWindow.src = IMAGES[imageKey] || step.image;
            }
            
            if (step.face && step.name && step.text) {
                // Remplacer %PLAYER% dans le nom
                let displayName = step.name;
                if (displayName === '%PLAYER%' && playerName) {
                    displayName = playerName;
                }
                
                // Remplacer %PLAYERFACE% dans le visage
                let displayFace = step.face;
                if (displayFace === '%PLAYERFACE%' && playerFace) {
                    displayFace = playerFace;
                }
                
                // Remplacer %PLAYER% dans le texte aussi si nécessaire
                let displayText = step.text;
                if (displayText.includes('%PLAYER%') && playerName) {
                    displayText = displayText.replace(/%PLAYER%/g, playerName);
                }
                
                dialogue.innerHTML = `<font style="font-weight: bold;">${displayName} </font> :<font style="font-style: italic;"><br><br>${displayText}</font>`;
                const faceKey = displayFace.replace('assets/', '').replace('.png', '').replace('.jpg', '');
                faceOutput.src = IMAGES[faceKey] || '';
            }
            
            // Petit délai pour charger l'image
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Fade in
            cinematicWindow.style.opacity = "1";
            await new Promise(resolve => setTimeout(resolve, 300));
            
            currentStep++;
            isTransitioning = false;
        } else {
            // Fin de la cinématique - fade out final
            cinematicWindow.style.opacity = "0";
            await new Promise(resolve => setTimeout(resolve, 300));
            
            document.removeEventListener("keydown", keyListener);
            
            // Restaurer l'opacité pour la prochaine fois
            cinematicWindow.style.opacity = "1";
            
            if (onComplete && typeof onComplete === 'function') {
                onComplete();
            } else {
                mainCanvas.style.display = "block";
                cinematicWindow.style.display = "none";
                outputElement.style.display = "block";
                dialWindow.style.display = "none";
                commandBlocking = false;
            }
        }
    };
    
    // Écouteurs d'événements
    keyListener = (event) => {
        if (!isTransitioning && (event.code === "Space" || event.key.toLowerCase() === "f")) {
            event.preventDefault();
            showNextStep();
        }
    };
    
    const newNextButton = nextButton.cloneNode(true);
    nextButton.parentNode.replaceChild(newNextButton, nextButton);
    newNextButton.addEventListener("click", () => {
        if (!isTransitioning) showNextStep();
    });
    document.addEventListener("keydown", keyListener);
    
    // Première étape
    showNextStep();
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 5.3 Cinématiques et animations
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Cinématique de game over
    static showGameOverCinematic() {
        commandBlocking = true;

        const gameOverCinematic = [
            {
                image: 'assets/game over.png',
                face: 'faceGuard',
                name: 'Death',
                text: 'Your journey ends here...'
            },
            {
                image: 'assets/game over.png',
                face: 'faceGuard',
                name: 'Death',
                text: 'Rest in peace.'
            }
        ];

        // Utiliser showCinematic avec un callback pour retourner au menu
        Sprite.showCinematic(gameOverCinematic, () => {
            // À la fin de la cinématique, retourner au menu principal
            Raycaster.showMainMenu();
            commandBlocking = false;
        });
    }

    // Cinématique d'introduction
// Dans Sprite.js - Méthode showIntroCinematic complète
static showIntroCinematic() {
    commandBlocking = true;

    const introCinematic = [
        {
            image: 'assets/intro/1.jpg',
            face: '%PLAYERFACE%',
            name: '%PLAYER%',
            text: "I don't really know where I come from... I was an orphan, left for dead in the desert."
        },
        {
            image: 'assets/intro/2.jpg',
            face: '%PLAYERFACE%',
            name: '%PLAYER%',
            text: "By chance, I was taken in by a bard who was resting after a life of adventure."
        },
        {
            image: 'assets/intro/3.jpg',
            face: '%PLAYERFACE%',
            name: '%PLAYER%',
            text: "He taught me to read and write, while telling me about his incredible adventures."
        },
        {
            image: 'assets/intro/4.jpg',
            face: '%PLAYERFACE%',
            name: '%PLAYER%',
            text: "He felt I wouldn't stay in one place for long. I wanted to discover the world too."
        },
        {
            image: 'assets/intro/5.jpg',
            face: '%PLAYERFACE%',
            name: '%PLAYER%',
            text: "He taught me everything he knew. Combat, magic, trickery... Everything that makes an adventurer."
        },
        {
            image: 'assets/intro/6.jpg',
            face: '%PLAYERFACE%',
            name: '%PLAYER%',
            text: "Now I'm an adult, ready to risk everything, because I need to know I can live on my own. Without help."
        },
        {
            image: 'assets/intro/7.jpg',
            face: '%PLAYERFACE%',
            name: '%PLAYER%',
            text: "I hope my youthful whim won't lead me to death... There's only one way to find out."
        }
    ];

    // Utiliser showCinematic avec un callback pour retourner au menu
    Sprite.showCinematic(introCinematic, () => {
        // À la fin de la cinématique, retourner au menu principal
        // Raycaster.showMainMenu();
        Raycaster.showRenderWindow();
        commandBlocking = false;
    });
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 6. SYSTÈME D'INTERFACE UTILISATEUR
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 6.1 Terminal et logs
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Fonction principale de log du terminal avec apparition en fondu
    // n'affiche pas les doublons consécutifs si le style = 0
    static terminalLog(entry, style = 0) {
        const outputElement = document.getElementById("output");
        
        // Si style = 0, vérifier les doublons consécutifs
        if (style === 0) {
            // Récupérer toutes les lignes existantes
            const existingLines = outputElement.querySelectorAll('.terminal-line');
            
            // Vérifier si le dernier message est identique (répétition consécutive)
            if (existingLines.length > 0) {
                const lastLine = existingLines[existingLines.length - 1];
                const lastContentDiv = lastLine.querySelector('.terminal-content');
                if (lastContentDiv && lastContentDiv.innerHTML === entry) {
                    // C'est une répétition consécutive, ne pas l'ajouter
                    return;
                }
            }
        }
        
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
        logLine.setAttribute('data-repeat-count', '1'); // Initialiser le compteur
        
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
        messageContent.setAttribute('data-original-message', entry); // Stocker le message original
        
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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 6.2 Animations et effets visuels
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
// 6.3 Gestion des menus et navigation
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 7. SYSTÈME DE PORTES ET TÉLÉPORTATION
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 7.1 Gestion des portes
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async door(player, textureSet, raycaster) {
    // Vérification du verrou global de porte AVANT tout
    if (doorLockActive) {
        console.log("Door action already in progress - aborting");
        return;
    }

    // Activer immédiatement le verrou global
    doorLockActive = true;
    commandBlocking = true;

    // Vérifier le cooldown
    const currentTime = Date.now();
    if (!this.lastDoorTime) {
        this.lastDoorTime = 0;
    }
    
    const timeSinceLastDoor = currentTime - this.lastDoorTime;
    
    if (timeSinceLastDoor < 500) { // 500ms de cooldown
        doorLockActive = false;
        commandBlocking = false;
        return;
    }

    // Vérifier qu'aucune autre action n'est en cours
    
    // mise ne commentaire pour tester door à collision
    /*
    if (player.isMoving || player.isRotating || player.isTeleporting || player.isDooring) {
        console.log("Cannot use door - player is busy");
        doorLockActive = false;
        commandBlocking = false;
        return;
    }
    */
    
    // Mettre à jour le temps de la dernière action
    this.lastDoorTime = currentTime;
    
    // Marquer qu'une action de porte est en cours
    player.isDooring = true;
    
    try {
        // Store initial position
        const initialX = player.x;
        const initialY = player.y;
        
        // Determine floor texture to use
        let floor;
        if (textureSet === null) {
            floor = 1;
        } else if (textureSet) {
            floor = floorType;
        }
    
        // Calculate new position based on player's facing direction
        const tileSize = 1280;
        const teleportDistance = 2 * tileSize;
        
        // Apply teleportation based on direction
        if (player.quadrant === "nord") {
            player.y -= teleportDistance;
        } else if (player.quadrant === "est") {
            player.x += teleportDistance;
        } else if (player.quadrant === "sud") {
            player.y += teleportDistance;
        } else if (player.quadrant === "ouest") {
            player.x -= teleportDistance;
        } else {
            console.log("Invalid quadrant - diagonal movement not supported");
            // Libérer les verrous avant de sortir
            player.isDooring = false;
            doorLockActive = false;
            commandBlocking = false;
            return;
        }
        
        // Toggle ceiling rendering and update environment properties
        if (ceilingRender === true) {
            // Vérifier que mapData existe
            if (mapData && mapData.playerStart) {
                // Restore map default values
                ceilingRender = mapData.playerStart.ceilingRender || false;
                ceilingHeight = mapData.playerStart.ceilingHeight || 2;
                ceilingTexture = mapData.playerStart.ceilingTexture || 1;
                floorTexture = mapData.playerStart.floorTexture || 1;
            } else {
                // Valeurs par défaut
                ceilingRender = false;
                ceilingHeight = 2;
                ceilingTexture = 2;
                floorTexture = 1;
            }
        } else {
            // Turn ceiling rendering on with specific values
            ceilingRender = true;
            ceilingHeight = 1;
            
            // Utiliser la texture du plafond de la carte si disponible
            if (mapData && mapData.ceilingTexture) {
                ceilingTexture = mapData.ceilingTexture;
            } else {
                ceilingTexture = 2;
            }
            
            floorTexture = floor || 3;
        }
        
        // Recharger les textures
        if (raycaster) {
            raycaster.loadFloorCeilingImages();
        }
        
        // Pause courte pour permettre la mise à jour visuelle
        // await new Promise(resolve => setTimeout(resolve, 50));
        
        // Attendre un peu plus pour s'assurer que tout est terminé
        await new Promise(resolve => setTimeout(resolve, 50));
        
    } catch (error) {
        console.error("Error in door function:", error);
    } finally {
        // Toujours libérer les verrous
        player.isDooring = false;
        commandBlocking = false;
        
        // Délai supplémentaire avant de libérer le verrou global
        setTimeout(() => {
            doorLockActive = false;
        }, 100);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 7.2 Transitions entre zones
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// 7.3 Effets de téléportation
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FIN DU FICHIER SPRITES.JS
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////