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

        var healEffect = 5 + caster.magic

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

// Effet de buff de force
static strengthBuffEffect(caster, target) {
    Raycaster.playerHealFlash();
    
    // Sauvegarder la force originale si pas déjà fait
    if (!target.originalStrength) {
        target.originalStrength = target.strength;
    }
    
    // Appliquer le buff
    const buffAmount = caster.magic;
    target.strength += buffAmount;
    target.buffedStats = target.buffedStats || {};
    target.buffedStats.strength = true;
    
    // Durée du buff (en millisecondes)
    const duration = 30000; // 30 secondes
    
    // Annuler un buff précédent s'il existe
    if (target.strengthBuffTimeout) {
        clearTimeout(target.strengthBuffTimeout);
    }
    
    // Programmer la fin du buff
    target.strengthBuffTimeout = setTimeout(() => {
        target.strength = target.originalStrength;
        delete target.buffedStats.strength;
        delete target.originalStrength;
        Sprite.displayCombatAnimation(`${target.name}'s strength returns to normal.`, 4);
        target.statsUpdate(target);
    }, duration);
    
    caster.XPintellect += 2;
    Sprite.displayCombatAnimation(`${target.name} gains +${buffAmount} strength for 30 seconds!`, 4);
    target.statsUpdate(target);
}

// Effet de buff de vitesse (déjà mentionné dans votre code)
static speedBuffEffect(caster, target) {
    Raycaster.playerHealFlash();
    
    // Le buff de vitesse est déjà géré dans calculateMovementDuration
    // On ajoute juste un timer visuel
    target.speedBuffActive = true;
    
    const duration = 20000; // 20 secondes
    
    if (target.speedBuffTimeout) {
        clearTimeout(target.speedBuffTimeout);
    }
    
    target.speedBuffTimeout = setTimeout(() => {
        target.speedBuffActive = false;
        Sprite.displayCombatAnimation(`${target.name}'s speed returns to normal.`, 4);
    }, duration);
    
    caster.XPintellect += 1;
    Sprite.displayCombatAnimation(`${target.name} moves faster for 20 seconds!`, 4);
}

// Effet de buff de protection (armure temporaire)
static shieldBuffEffect(caster, target) {
    Raycaster.armorAbsorbFlash();
    
    if (!target.originalArmor) {
        target.originalArmor = target.armor;
    }
    
    const buffAmount = 1 + caster.magic;
    target.armor += buffAmount;
    target.buffedStats = target.buffedStats || {};
    target.buffedStats.armor = true;
    
    const duration = 45000; // 45 secondes
    
    if (target.armorBuffTimeout) {
        clearTimeout(target.armorBuffTimeout);
    }
    
    target.armorBuffTimeout = setTimeout(() => {
        target.armor = target.originalArmor;
        delete target.buffedStats.armor;
        delete target.originalArmor;
        Sprite.displayCombatAnimation(`${target.name}'s magical shield fades.`, 4);
        target.statsUpdate(target);
    }, duration);
    
    caster.XPintellect += 2;
    Sprite.displayCombatAnimation(`${target.name} is protected by a magical shield (+${buffAmount} armor)!`, 4);
    target.statsUpdate(target);
}

// Effet de buff de régénération
static regenerationBuffEffect(caster, target) {
    Raycaster.playerHealFlash();
    
    // Annuler la régénération précédente si elle existe
    if (target.regenInterval) {
        clearInterval(target.regenInterval);
    }
    
    const healPerTick = caster.magic;;
    const duration = 15000; // 15 secondes
    const tickRate = 1000; // Soigne toutes les secondes
    
    let ticksRemaining = duration / tickRate;
    
    target.regenInterval = setInterval(() => {
        if (ticksRemaining <= 0 || target.hp <= 0) {
            clearInterval(target.regenInterval);
            delete target.regenInterval;
            Sprite.displayCombatAnimation(`${target.name}'s regeneration ends.`, 4);
            return;
        }
        
        target.hp = Math.min(target.hp + healPerTick, target.hpMax);
        Sprite.displayCombatAnimation(`${target.name} regenerates ${healPerTick} HP.`, 4);
        target.statsUpdate(target);
        ticksRemaining--;
    }, tickRate);
    
    caster.XPintellect += 2;
    Sprite.displayCombatAnimation(`${target.name} starts regenerating health!`, 4);
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
        description: "Heal the player for 5hp + 1/Magic.",
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
    },{
    id: 3,
    name: "Strength",
    manaCost: 10,
    description: "Increase strength by 1 by Magic for 30 seconds.",
    effect: Spell.strengthBuffEffect,
    selfCast: true,
    icon: "assets/icons/strength.png"
},
{
    id: 4,
    name: "OLD_Speed",
    manaCost: 8,
    description: "Move faster for 20 seconds.",
    effect: Spell.speedBuffEffect,
    selfCast: true,
    icon: "assets/icons/speed.png"
},
{
    id: 5,
    name: "Mage Shield",
    manaCost: 10,
    description: "Magical protection (+1 armor/magic) for 45 seconds.",
    effect: Spell.shieldBuffEffect,
    selfCast: true,
    icon: "assets/icons/mageShield.png"
},
{
    id: 6,
    name: "Regeneration",
    manaCost: 10,
    description: "Regenerate 1HP/Magic per second for 15 seconds.",
    effect: Spell.regenerationBuffEffect,
    selfCast: true,
    icon: "assets/icons/regen.png"
}
];