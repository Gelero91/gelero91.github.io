////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Objets
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

console.log("chargement de la classe Item.")


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

// Item constructor(id, name, slot, equipped, power, strength, dexterity, intellect, might, magic, dodge, armor, criti, price, icon)
Item.itemList = [
    // ========== OBJETS DE BASE (ID 1-10) ==========
    // ARMURES (1-4)
    {
        id: 1,
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
        price: 10,
        icon: "assets/icons/cape0.png"
    },
    {
        id: 2,
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
        price: 10,
        icon: "assets/icons/tunic0.png"
    },
    {
        id: 3,
        name: "C.mail",
        slot: 2,
        equipped: false,
        power: 0,
        strength: 0,
        dexterity: 0,
        intellect: 0,
        might: 0,
        magic: 0,
        dodge: 0,
        armor: 2,
        criti: 0,
        price: 10,
        icon: "assets/icons/mail0.png"
    },
    {
        id: 4,
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
        price: 10,
        icon: "assets/icons/armor0.png"
    },
    // ARMES (5-10)
    {
        id: 5,
        name: "Sword",
        slot: 1,
        equipped: false,
        power: 0,
        strength: 0,
        dexterity: 0,
        intellect: 0,
        might: 1,
        magic: 0,
        dodge: 2,
        armor: 0,
        criti: 0,
        price: 10,
        icon: "assets/icons/sword0.png"
    },
    {
        id: 6,
        name: "Club",
        slot: 1,
        equipped: false,
        power: 0,
        strength: 0,
        dexterity: 0,
        intellect: 0,
        might: 2,
        magic: 0,
        dodge: 0,
        armor: 0,
        criti: 0,
        price: 10,
        icon: "assets/icons/club0.png"
    },
    {
        id: 7,
        name: "Axe",
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
        criti: 2,
        price: 10,
        icon: "assets/icons/axe0.png"
    },
    {
        id: 8,
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
        price: 10,
        icon: "assets/icons/staff0.png"
    },
    {
        id: 9,
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
        price: 10,
        icon: "assets/icons/dagger0.png"
    },
    {
        id: 10,
        name: "M.sword",
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
        price: 10,
        icon: "assets/icons/magicSword.png"
    },

    // ========== OBJETS +1 (ID 11-20) ==========
    // ARMURES +1 (11-14)
    {
        id: 11,
        name: "Cape +1",
        slot: 2,
        equipped: false,
        power: 0,
        strength: 0,
        dexterity: 0,
        intellect: 1,
        might: 0,
        magic: 0,
        dodge: 0,
        armor: 2,
        criti: 0,
        price: 100,
        icon: "assets/icons/cape1.png"
    },
    {
        id: 12,
        name: "Tunic +1",
        slot: 2,
        equipped: false,
        power: 0,
        strength: 0,
        dexterity: 1,
        intellect: 0,
        might: 0,
        magic: 0,
        dodge: 0,
        armor: 2,
        criti: 0,
        price: 100,
        icon: "assets/icons/tunic1.png"
    },
    {
        id: 13,
        name: "C.mail +1",
        slot: 2,
        equipped: false,
        power: 0,
        strength: 0,
        dexterity: 0,
        intellect: 0,
        might: 0,
        magic: 0,
        dodge: 0,
        armor: 3,
        criti: 0,
        price: 100,
        icon: "assets/icons/mail1.png"
    },
    {
        id: 14,
        name: "Armor +1",
        slot: 2,
        equipped: false,
        power: 0,
        strength: 0,
        dexterity: -2,
        intellect: 0,
        might: 0,
        magic: 0,
        dodge: 0,
        armor: 5,
        criti: 0,
        price: 100,
        icon: "assets/icons/armor1.png"
    },
    // ARMES +1 (15-20)
    {
        id: 15,
        name: "Sword +1",
        slot: 1,
        equipped: false,
        power: 0,
        strength: 0,
        dexterity: 0,
        intellect: 0,
        might: 2,
        magic: 0,
        dodge: 4,
        armor: 0,
        criti: 0,
        price: 100,
        icon: "assets/icons/sword1.png"
    },
    {
        id: 16,
        name: "Club +1",
        slot: 1,
        equipped: false,
        power: 0,
        strength: 0,
        dexterity: 0,
        intellect: 0,
        might: 3,
        magic: 0,
        dodge: 0,
        armor: 0,
        criti: 0,
        price: 100,
        icon: "assets/icons/club1.png"
    },
    {
        id: 17,
        name: "Axe +1",
        slot: 1,
        equipped: false,
        power: 0,
        strength: 0,
        dexterity: 0,
        intellect: 0,
        might: 2,
        magic: 0,
        dodge: 0,
        armor: 0,
        criti: 4,
        price: 100,
        icon: "assets/icons/axe1.png"
    },
    {
        id: 18,
        name: "Staff +1",
        slot: 1,
        equipped: false,
        power: 0,
        strength: 0,
        dexterity: 0,
        intellect: 0,
        might: 0,
        magic: 2,
        dodge: 0,
        armor: 0,
        criti: 0,
        price: 100,
        icon: "assets/icons/staff1.png"
    },
    {
        id: 19,
        name: "Dagger +1",
        slot: 1,
        equipped: false,
        power: 0,
        strength: 0,
        dexterity: 0,
        intellect: 0,
        might: 1,
        magic: 0,
        dodge: 12,
        armor: 0,
        criti: 12,
        price: 100,
        icon: "assets/icons/dagger1.png"
    },
    {
        id: 20,
        name: "M.Sword +1",
        slot: 1,
        equipped: false,
        power: 0,
        strength: 0,
        dexterity: 0,
        intellect: 0,
        might: 4,
        magic: 3,
        dodge: 0,
        armor: 0,
        criti: 0,
        price: 100,
        icon: "assets/icons/magicSword.png"
    },

    // ========== OBJETS +2 (ID 21-30) ==========
    // ARMURES +2 (21-24)
    {
        id: 21,
        name: "Cape +2",
        slot: 2,
        equipped: false,
        power: 0,
        strength: 0,
        dexterity: 0,
        intellect: 2,
        might: 0,
        magic: 0,
        dodge: 0,
        armor: 3,
        criti: 0,
        price: 1000,
        icon: "assets/icons/cape2.png"
    },
    {
        id: 22,
        name: "Tunic +2",
        slot: 2,
        equipped: false,
        power: 0,
        strength: 0,
        dexterity: 2,
        intellect: 0,
        might: 0,
        magic: 0,
        dodge: 0,
        armor: 3,
        criti: 0,
        price: 1000,
        icon: "assets/icons/tunic2.png"
    },
    {
        id: 23,
        name: "C.mail +2",
        slot: 2,
        equipped: false,
        power: 0,
        strength: 0,
        dexterity: 0,
        intellect: 0,
        might: 0,
        magic: 0,
        dodge: 0,
        armor: 4,
        criti: 0,
        price: 1000,
        icon: "assets/icons/mail2.png"
    },
    {
        id: 24,
        name: "Armor +2",
        slot: 2,
        equipped: false,
        power: 0,
        strength: 0,
        dexterity: -3,
        intellect: 0,
        might: 0,
        magic: 0,
        dodge: 0,
        armor: 7,
        criti: 0,
        price: 1000,
        icon: "assets/icons/armor2.png"
    },
    // ARMES +2 (25-30)
    {
        id: 25,
        name: "Sword +2",
        slot: 1,
        equipped: false,
        power: 0,
        strength: 0,
        dexterity: 0,
        intellect: 0,
        might: 3,
        magic: 0,
        dodge: 6,
        armor: 0,
        criti: 0,
        price: 1000,
        icon: "assets/icons/sword2.png"
    },
    {
        id: 26,
        name: "Club +2",
        slot: 1,
        equipped: false,
        power: 0,
        strength: 0,
        dexterity: 0,
        intellect: 0,
        might: 4,
        magic: 0,
        dodge: 0,
        armor: 0,
        criti: 0,
        price: 1000,
        icon: "assets/icons/club2.png"
    },
    {
        id: 27,
        name: "Axe +2",
        slot: 1,
        equipped: false,
        power: 0,
        strength: 0,
        dexterity: 0,
        intellect: 0,
        might: 3,
        magic: 0,
        dodge: 0,
        armor: 0,
        criti: 6,
        price: 1000,
        icon: "assets/icons/axe2.png"
    },
    {
        id: 28,
        name: "Staff +2",
        slot: 1,
        equipped: false,
        power: 0,
        strength: 0,
        dexterity: 0,
        intellect: 0,
        might: 0,
        magic: 3,
        dodge: 0,
        armor: 0,
        criti: 0,
        price: 1000,
        icon: "assets/icons/staff2.png"
    },
    {
        id: 29,
        name: "Dagger +2",
        slot: 1,
        equipped: false,
        power: 0,
        strength: 0,
        dexterity: 0,
        intellect: 0,
        might: 2,
        magic: 0,
        dodge: 14,
        armor: 0,
        criti: 14,
        price: 1000,
        icon: "assets/icons/dagger2.png"
    },
    {
        id: 30,
        name: "M.sword +2",
        slot: 1,
        equipped: false,
        power: 0,
        strength: 0,
        dexterity: 0,
        intellect: 0,
        might: 5,
        magic: 4,
        dodge: 0,
        armor: 0,
        criti: 0,
        price: 1000,
        icon: "assets/icons/magicSword.png"
    }
];