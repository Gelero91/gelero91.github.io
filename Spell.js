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