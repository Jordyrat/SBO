import { achievementsData } from "../../utils/variables";

let allAchievements = [];
rarityColorDict = {
    "Divine": "&b",
    "Mythic": "&d",
    "Legendary": "&6",
    "Epic": "&5",
    "Rare": "&9",
    "Uncommon": "&a",
    "Common": "&f"
}
class Achivement {
    constructor(name, description, rarity) {
        this.name = name;
        this.description = description;
        this.color = rarityColorDict[rarity];
        // this.sound = sound;

        allAchievements.push(this);
    }

    unlock() {
        if (achievementsData[this.name] == undefined) {
            achievementsData[this.name] = true;
            achievementsData.unlocked.push(this.name);
            achievementsData.save();
            Client.showTitle(`${this.color}${this.name}`, `&aAchievement Unlocked`, 0, 40, 20);
            new TextComponent(`&6[SBO] &aAchievement Unlocked &7>> ${this.color}${this.name}`).setHover("show_text", "&a" + this.description).chat();
            // World.playSound("ui.toast.challenge_complete",10,1);
        }
    }

    lock() {
        if (achievementsData[this.name] != undefined) {
            delete achievementsData[this.name];
            achievementsData.unlocked = achievementsData.unlocked.filter(achievement => achievement != this.name);
            achievementsData.save();
        }
    }

    isUnlocked() {
        return achievementsData[this.name] != undefined;
    }

    getName() {
        return this.name;
    }   

    getDisplayName() {
        return `${this.color}${this.name}`;
    }   

    getDescription() {
        return this.description;
    }   
}
// Raritys: Divinee, Mythic, Legendary, Epic, Rare, Uncommon, Common
// todo: add mc sound (maybe only for over epic rarity)
// funny names for the achievements
// be achievement

new Achivement("b2b Chimera", "Get 2 Chimera in a row", "Mythic"); 
new Achivement("b2b Stick", "Get 2 Sticks in a row", "Mythic"); 
new Achivement("b2b Relic", "Get 2 Relics in a row", "Divine"); 
new Achivement("b2b Inquisitor", "Get 2 Inquisitors in a row", "Epic"); 

new Achivement("Can i make a ladder now?", "Get 7 sticks in one event", "Epic");
new Achivement("Chimera V", "Get 16 chimera in one event", "Mythic");
new Achivement("Chimera VI", "Get 32 chimera in one event", "Divine");

new Achivement("First Chimera", "Get your first chimera", "Uncommon");
new Achivement("First lootshare Chimera", "Lootshare your first chimera", "Legendary");

new Achivement("First Stick", "Get your first stick", "Common");
new Achivement("ls Stick", "Lootshare a Stick", "Legendary"); // 1/6250 base chance

new Achivement("First Relic", "Get your first relic", "Rare");
new Achivement("1/25000", "Lootshare a Relic", "Divine"); // 1/25000 base chance

new Achivement("5k Burrows", "Get 5k burrows in one event", "Common"); 
new Achivement("10k Burrows", "Get 10k burrows in one event", "Uncommon"); 
new Achivement("15k Burrows", "Get 15k burrows in one event", "Epic"); 
new Achivement("20k Burrows", "Get 20k burrows in one event", "Legendary");  
new Achivement("Are you mentally stable?", "Get 25k burrows in one event", "Mythic"); 

new Achivement("So this is Diana", "1 hour of playtime in one event", "Common"); 
new Achivement("Is this really fun?", "10 hours of playtime in one event", "Uncommon");
new Achivement("No shower for me", "1 day of playtime in one event", "Rare");
new Achivement("Are you okay?", "2 days of playtime in one event", "Epic"); 
new Achivement("Sleep is downtime!", "3 days of playtime in one event", "Legendary"); 

new Achivement("Where Chimera?", "Get all other drops from an inquisitor", "Legendary");

//drystreaks
new Achivement("lf inquisitor", "250 mobs since inquisitor", "Common");
new Achivement("lf Chimera", "15 inquisitors since chimera", "Common");
new Achivement("lf Stick", "200 minotaur since stick", "Common");
new Achivement("lf Relic", "1000 champions since relic", "Uncommon");

new Achivement("you have legi griffin right?", "500 mobs since inquisitor", "Rare");
new Achivement("why do you still play?", "1000 mobs since inquisitor", "Legendary");



new Achivement("Real Diana Non", "Download SBO", "Divine");







export function unlockAchievement(name) {
    allAchievements.forEach(achievement => {
        if (achievement.name == name) {
            setTimeout(() => {
                achievement.unlock();
                achievement.lock();
            }, 1000);
            return;
        }
    })
}

register("command", () => {
    unlockAchievement("b2b Chimera");
    setTimeout(() => {
        unlockAchievement("First Achievement");
    }, 1000);
}).setName("sbotest");