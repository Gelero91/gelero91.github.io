////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Quêtes
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

console.log("chargement de la classe Quest.")


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
