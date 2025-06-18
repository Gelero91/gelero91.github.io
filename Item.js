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
        icon: "assets/icons/shortsword.png"
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