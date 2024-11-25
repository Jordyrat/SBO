import settings from "../../settings";
import { checkMayorTracker, data, initializeTrackerMayor, registerWhen, resetTracker } from "../../utils/variables";
import { getWorld } from "../../utils/world";
import {
    isInSkyblock,
    toTitleCase,
    gotLootShare,
    getAllowedToTrackSacks,
    playCustomSound,
    calcPercent,
    mobDeath4SecsTrue,
    getBazaarPriceDiana,
    getDianaAhPrice,
    formatNumber,
    getMagicFind,
    mobDeathEntityName
} from '../../utils/functions';
import { itemOverlay, mobOverlay, mythosMobHpOverlay, statsOverlay, avgMagicFindOverlay } from "../guis/DianaGuis";
import { mobDeath2SecsTrue } from "../../utils/functions";
import { isDataLoaded } from "../../utils/checkData";
import { dianaTrackerMayor as trackerMayor, dianaTrackerSession as trackerSession, dianaTrackerTotal as trackerTotal, initializeTracker, dianaTimerlist } from "../../utils/variables";
import { checkDiana } from "../../utils/checkDiana";
import { trackSinceMob, unlockAchievement, trackAchievementsItem, achievementItems, trackMagicFind } from "./DianaAchievements";
import { getDateMayorElected, getSkyblockDate } from "../../utils/mayor";

// todo: 
// todo end

// track items with pickuplog //
let b2bStick = false;
let b2bChim = false;
export function dianaLootCounter(item, amount) {
    let rareDrops = ["&9DWARF_TURTLE_SHELMET", "&5CROCHET_TIGER_PLUSHIE", "&5ANTIQUE_REMEDIES", "&5MINOS_RELIC"]; //  "&5ROTTEN_FLESH"
    let countThisIds = ["ENCHANTED_ANCIENT_CLAW", "ANCIENT_CLAW", "ENCHANTED_GOLD", "ENCHANTED_IRON"]
    let checkBool = true;
    if (mobDeath2SecsTrue() || gotLootShare()) {
        if (checkDiana()) {
            for (let i in countThisIds.values()) {
                if (item === i) {
                    trackItem(item, "items", amount);
                    checkBool = false;
                }
            }
            if (checkBool) {
                if (item == "MINOS_RELIC") {
                    if(settings.sendSinceMessage) {
                        new TextComponent(`&6[SBO] &r&eTook &r&c${data.champsSinceRelic} &r&eChampions to get a Relic!`).setClick("run_command", `/ct copy [SBO] Took ${data.champsSinceRelic} Champions to get a Relic!`).setHover("show_text", "&eClick To Copy").chat();
                    }
                    if (data.champsSinceRelic == 1) {
                        ChatLib.chat("&6[SBO] &cb2b Relic!")
                        unlockAchievement(5) // b2b relic
                    }
                    if (gotLootShare()) unlockAchievement(17) // relic ls
                    data.champsSinceRelic = 0;
                    if (settings.lootAnnouncerScreen) {
                        if (settings.lootAnnouncerPrice) {
                            Client.Companion.showTitle(`&5&lMinos Relic!`, `&6${formatNumber(getDianaAhPrice("MINOS_RELIC"))} coins`, 0, 25, 35);
                        }
                        else {
                            Client.showTitle(`&5&lMinos Relic!`, "", 0, 25, 35);
                        }
                    }
                    if (settings.lootAnnouncerParty) {
                        ChatLib.command("pc [SBO] RARE DROP! Minos Relic!");

                    }
                    playCustomSound(settings.relicSound, settings.relicVolume);
                }
                for (let i in rareDrops.values()) {
                    color = i.slice(0, 2);
                    if (item === i.slice(2)) {
                        tempString = item.replace("_", " ").replace("_", " ").toLowerCase();
                        tempString = toTitleCase(tempString);
                        if (settings.copyRareDrop) {
                            let finalText = "[SBO] RARE DROP! " + tempString;
                            ChatLib.command(`ct copy ${finalText}`, true);
                            ChatLib.chat("§6[SBO] §eCopied Rare Drop Message!§r");
                        }
                        if (settings.lootAnnouncerChat) {
                            ChatLib.chat("&6[SBO] &r&6&lRARE DROP! " + color + tempString);
                        }
                        if (settings.inquisAnnouncerParty) {
                            if (mobDeathEntityName() === "Minos Inquisitor") {
                                ChatLib.command("pc [SBO] RARE DROP! " + tempString)
                            }
                        }
                        if (item != "MINOS_RELIC") {
                            playCustomSound(settings.sprSound, settings.sprVolume);
                        }
                        if (settings.dianaTracker) {
                            trackItem(item, "items", amount);
                        }
                    }
                }
            }
        }
    }
}

export function trackLootWithSacks(ammount, item) {
    let countThisIds = ["Enchanted Gold", "Enchanted Iron", "Ancient Claw"] // , "Rotten Flesh"
    if (getAllowedToTrackSacks() && checkDiana()) {
        for (let i in countThisIds.values()) {
            if (item == i) {
                trackItem(item.replaceAll(" ", "_").toUpperCase(), "items", parseInt(ammount));
            }
        }
    }
}

let forbiddenCoins = [1, 5, 20, 1000, 2000, 3000, 4000, 5000, 7500, 8000, 10000, 12000, 15000, 20000, 25000, 40000, 50000]
export function trackScavengerCoins(coins) {
    if (!checkDiana()) return;
    if (mobDeath4SecsTrue() || gotLootShare()) {
        if (!forbiddenCoins.includes(coins) && coins < 65000) {
            trackItem("scavengerCoins", "items", coins);
            trackItem("coins", "items", coins);
        }
    }
}

// track logic //
export function trackItem(item, category, amount) {
    if (isDataLoaded()) {
        dianaTimerlist.forEach(timer => {
            timer.start();
            timer.continue();
            timer.updateActivity();
        });

        if (category === "mobs") {
            data.mobsSinceInq += 1;
            if (data.mobsSinceInq == 2) b2bInq = false;
        }
        trackOne(trackerMayor, item, category, "Mayor", amount);
        trackOne(trackerSession, item, category, "Session", amount);
        trackOne(trackerTotal, item, category, "Total", amount);

        itemOverlay();
        mobOverlay();
        statsOverlay();
        avgMagicFindOverlay();
        data.save();
    }
}

function trackOne(tracker, item, category, type, amount) {
    if (type == "Mayor") {
        checkMayorTracker();
    }
    if (tracker[category][item] != null) {
        tracker[category][item] += amount;
    }
    else {
        tracker[category][item] = amount;
    }

    if (category === "mobs"  && item != "Minos Inquisitor Ls") {
        if (tracker["mobs"]["TotalMobs"] != null) {
            tracker["mobs"]["TotalMobs"] += amount;
        }
        else {
            tracker["mobs"]["TotalMobs"] = amount;
        }
    }
    tracker.save();
    if (type == "Mayor") {
        if (achievementItems.includes(item)) {
            trackAchievementsItem(tracker.items, item);
        }
        if (category == "mobs") {
            trackSinceMob();
        }
    }
}

function checkCustomChimMessage(magicFind) {
    let text = settings.customChimMessage;
    if (!settings.chimMessageBool) return [false, ""];
    if (text != "") {
        if (text.includes("{mf}")) {
            let mfMessage = "";
            if (magicFind > 0) {
                mfMessage = "(+" + magicFind + "%" + " ✯ Magic Find)";
            } else {
                mfMessage = "";
            }
            text = text.replace(/{mf}/g, mfMessage);
        }
        if (text.includes("{amount}")) {
            let amount = trackerMayor["items"]["Chimera"] + trackerMayor["items"]["ChimeraLs"];
            text = text.replace(/{amount}/g, amount);
        }
        return [true, text];
    } else {
        return [false, ""];
    }
}

register("command", () => {
    let [replaceChimMessage, customChimMessage] = checkCustomChimMessage(400);
    if(replaceChimMessage) {
        ChatLib.chat(customChimMessage);
    }
}).setName("sbochimtest");

// command to reset session tracker
register("command", () => {
    let tempTracker = initializeTracker();
    for (let key in tempTracker) {
        trackerSession[key] = tempTracker[key];
    }
    dianaTimerlist[2].reset();
    trackerSession.save();
    itemOverlay();
    mobOverlay();
}).setName("sboresetsession");
    
// total burrow tracker //
registerWhen(register("chat", (burrow, event) => {
    if (isDataLoaded()) {
        trackItem("Total Burrows", "items", 1);
        burrow = burrow.removeFormatting();
        if (settings.fourEyedFish) {
            if (burrow == "(2/4)" || burrow == "(3/4)") {
                trackItem("coins", "items", 4000);
                trackItem("fishCoins", "items", 4000);
            }
            else {
                trackItem("coins", "items", 2000);
                trackItem("fishCoins", "items", 2000);
            }
        }
    }
    if (settings.cleanDianaChat) cancel(event);
}).setCriteria("&r&eYou dug out a Griffin Burrow! &r&7${burrow}&r"), () => getWorld() === "Hub" && settings.dianaTracker);

registerWhen(register("chat", (burrow, event) => {
    if (isDataLoaded()) {
        trackItem("Total Burrows", "items", 1);
        if (settings.fourEyedFish) {
            trackItem("coins", "items", 2000);
            trackItem("fishCoins", "items", 2000);
        }
    }
    if (settings.cleanDianaChat) cancel(event);
}).setCriteria("&r&eYou finished the Griffin burrow chain!${burrow}"), () => getWorld() === "Hub" && settings.dianaTracker);

register("chat", (event) => {
    if (settings.cleanDianaChat) cancel(event);
}).setCriteria("&r&eFollow the arrows to find the &r&6treasure&r&e!&r");

// --for spade spam
registerWhen(register("chat", (time, event) => {
    cancel(event);
}).setCriteria("&r&cThis ability is on cooldown for${time}"), () => getWorld() === "Hub" && settings.cleanDianaChat);

registerWhen(register("chat", (waste, event) => {
    cancel(event);
}).setCriteria("&r&7Warping${waste}"), () => getWorld() === "Hub" && settings.cleanDianaChat);

// mob tracker
let b2bInq = false;
registerWhen(register("chat", (woah, arev, mob, skytils, event) => {
    if (isDataLoaded() && isInSkyblock()) {
        switch (mob) {
            case "Minos Inquisitor":
                data.inqsSinceChim += 1;
                trackItem(mob, "mobs", 1);
                let currentTime = Date.now();
                let timeDiff = currentTime - data.lastInqDate;
                let hours = Math.floor(timeDiff / (1000 * 60 * 60));
                let minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
                let seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
                let timeString = `${hours}h ${minutes}m ${seconds}s`;

                if(data.lastInqDate && data.lastInqDate !== 0) {
                    new TextComponent(`&6[SBO] &r&eTook &r&c${data.mobsSinceInq} &r&eMobs and &c${timeString}&e to get an Inquis!`).setClick("run_command", `/ct copy [SBO] Took ${data.mobsSinceInq} Mobs and ${timeString} to get an Inquis!`).setHover("show_text", "&eClick To Copy").chat();
                }
                else {
                    new TextComponent(`&6[SBO] &r&eTook &r&c${data.mobsSinceInq} &r&eMobs to get an Inquis!`).setClick("run_command", `/ct copy [SBO] Took ${data.mobsSinceInq} Mobs to get an Inquis!`).setHover("show_text", "&eClick To Copy").chat();
                }
                data.lastInqDate = Date.now();

                if (b2bInq && data.mobsSinceInq == 1) {
                    ChatLib.chat("&6[SBO] &cb2b2b Inquisitor!")
                    unlockAchievement(7) // b2b2b inq
                }
                if (data.mobsSinceInq == 1 && !b2bInq) {
                    ChatLib.chat("&6[SBO] &cb2b Inquisitor!")
                    unlockAchievement(6) // b2b inq
                    b2bInq = true;
                }
                if (data.inqsSinceChim == 2) b2bChim = false;

                data.mobsSinceInq = 0;        
                break;
            case "Minos Champion":
                data.champsSinceRelic += 1;
                trackItem(mob, "mobs", 1);
                break;
            case "Minotaur":
                data.minotaursSinceStick += 1;
                if (data.minotaursSinceStick == 2) b2bStick = false;
                trackItem(mob, "mobs", 1);
                break;
            case "Minos Hunter":
            case "Gaia Construct":
            case "Siamese Lynxes":
                trackItem(mob, "mobs", 1);
                break;       
        }
    }
    if (settings.cleanDianaChat) cancel(event);
}).setCriteria("&r&c&l${woah} &r&eYou dug ${arev}&r&2${mob}&r&e!${skytils}"), () => getWorld() === "Hub" && (settings.dianaTracker || (settings.dianaStatsTracker || settings.sendSinceMessage)));

// track items from chat //
registerWhen(register("chat", (drop) => {
    if (isDataLoaded() && isInSkyblock()) {
        drop=drop.slice(2);
        switch (drop) {
            case "Griffin Feather":
            case "Crown of Greed":
            case "Washed-up Souvenir":
                trackItem(drop, "items", 1);
                break;
        }
    }
}).setCriteria("&r&6&lRARE DROP! &r&eYou dug out a &r${drop}&r&e!&r"), () => getWorld() === "Hub" && settings.dianaTracker);

registerWhen(register("chat", (coins) => {
    if (isDataLoaded() && isInSkyblock()) {
        let coins2 = parseInt(coins.replace(",", ""))
        trackItem("coins", "items", coins2);
    }
}).setCriteria("&r&6&lWow! &r&eYou dug out &r&6${coins} coins&r&e!&r"), () => getWorld() === "Hub" && settings.dianaTracker);

registerWhen(register("chat", (drop, event) => {
    if (isDataLoaded() && checkDiana() && isInSkyblock()) {
        let magicFind = getMagicFind(drop);
        let mfPrefix = "";
        if (magicFind > 0) mfPrefix = " (+" + magicFind + "%" + " ✯ Magic Find)";
        drop = drop.slice(2, 16); // 8 statt 16 für potato und carrot
        switch (drop) {
            case "Enchanted Book":
                if (settings.lootAnnouncerScreen) {
                    if (settings.lootAnnouncerPrice) {
                        Client.Companion.showTitle(`&d&lChimera!`, `&6${formatNumber(getBazaarPriceDiana("ENCHANTMENT_ULTIMATE_CHIMERA_1"))} coins`, 0, 25, 35);
                    }
                    else {
                        Client.Companion.showTitle(`&d&lChimera!`, "", 0, 25, 35);
                    }
                }

                playCustomSound(settings.chimSound, settings.chimVolume);
                if (gotLootShare()) {
                    if (settings.sendSinceMessage) {
                        new TextComponent(`&6[SBO] &r&eTook &r&c${data.inqsSinceLsChim} &r&eInquisitors to get a lootshare Chimera!`).setClick("run_command", `/ct copy [SBO] Took ${data.inqsSinceLsChim} Inquisitors to get a lootshare Chimera!`).setHover("show_text", "&eClick To Copy").chat();
                    }
                    setTimeout(() => {
                        data.inqsSinceLsChim = 0;
                    }, 50);
                    trackItem("ChimeraLs", "items", 1); // ls chim
                    let [replaceChimMessage, customChimMessage] = checkCustomChimMessage(magicFind);
                    if (replaceChimMessage) {
                        cancel(event)
                        ChatLib.chat(customChimMessage);
                    }
                    if (settings.lootAnnouncerParty || settings.inquisAnnouncerParty) {
                        if (replaceChimMessage) {
                            ChatLib.command("pc " + customChimMessage);
                        } else {
                            ChatLib.command("pc [SBO] RARE DROP! Chimera!" + mfPrefix);
                        }
                    }
                }
                else {
                    if (magicFind > 0) trackMagicFind(magicFind, true);
                    if (settings.dianaAvgMagicFind) {
                        if (magicFind > 0) {
                            if (data.last10ChimMagicFind.length >= 10) {
                                data.last10ChimMagicFind.shift();
                            }
                            data.last10ChimMagicFind.push(magicFind);
                        
                            let sum = data.last10ChimMagicFind.reduce((a, b) => a + b, 0);
                            data.avgChimMagicFind = parseInt(sum / data.last10ChimMagicFind.length);
                            avgMagicFindOverlay();
                        }
                    }
                    if (settings.dianaTracker) {
                        trackItem("Chimera", "items", 1);
                    }
                    if (settings.sendSinceMessage) {
                        new TextComponent(`&6[SBO] &r&eTook &r&c${data.inqsSinceChim} &r&eInquisitors to get a Chimera!`).setClick("run_command", `/ct copy [SBO] Took ${data.inqsSinceChim} Inquisitors to get a Chimera!`).setHover("show_text", "&eClick To Copy").chat();
                    }
                    if (b2bChim && data.inqsSinceChim == 1) {
                        ChatLib.chat("&6[SBO] &cb2b2b Chimera!")
                        unlockAchievement(2) // b2b2b chim
                    }
                    if (data.inqsSinceChim == 1 && !b2bChim) {
                        ChatLib.chat("&6[SBO] &cb2b Chimera!")
                        b2bChim = true;
                        unlockAchievement(1) // b2b chim
                    }

                    data.inqsSinceChim = 0;
                    let [replaceChimMessage, customChimMessage] = checkCustomChimMessage(magicFind);
                    if (replaceChimMessage) {
                        cancel(event)
                        ChatLib.chat(customChimMessage);
                    }
                    if (settings.lootAnnouncerParty || settings.inquisAnnouncerParty) {
                        if (replaceChimMessage) {
                            ChatLib.command("pc " + customChimMessage);
                        } else {
                            ChatLib.command("pc [SBO] RARE DROP! Chimera!" + mfPrefix);
                        }
                    }
                }
                break;
            case "Daedalus Stick":
                if (gotLootShare()) {
                    unlockAchievement(15)
                }
                else{
                    if (magicFind > 0) trackMagicFind(magicFind);
                    if (settings.dianaAvgMagicFind) {
                        if (magicFind > 0) {
                            if (data.last10StickMagicFind.length >= 10) {
                                data.last10StickMagicFind.shift();
                            }
                            data.last10StickMagicFind.push(magicFind);

                            let sum = data.last10StickMagicFind.reduce((a, b) => a + b, 0);
                            data.avgStickMagicFind = parseInt(sum / data.last10StickMagicFind.length);
                            avgMagicFindOverlay();
                        }
                    }
                }
                if (settings.sendSinceMessage) {
                    new TextComponent(`&6[SBO] &r&eTook &r&c${data.minotaursSinceStick} &r&eMinotaurs to get a Daedalus Stick!`).setClick("run_command", `/ct copy [SBO] Took ${data.minotaursSinceStick} Minotaurs to get a Daedalus Stick!`).setHover("show_text", "&eClick To Copy").chat();
                }
                if (b2bStick && data.minotaursSinceStick == 1) {
                    ChatLib.chat("&6[SBO] &cb2b2b Daedalus Stick!")
                    unlockAchievement(4) // b2b2b stick
                }
                if (data.minotaursSinceStick == 1 && !b2bStick) {
                    ChatLib.chat("&6[SBO] &cb2b Daedalus Stick!")
                    b2bStick = true;
                    unlockAchievement(3) // b2b stick
                }

                data.minotaursSinceStick = 0;
                if (settings.lootAnnouncerScreen) {
                    if (settings.lootAnnouncerPrice) {
                        Client.Companion.showTitle(`&6&lDaedalus Stick!`, `&6${formatNumber(getBazaarPriceDiana("DAEDALUS_STICK"))} coins`, 0, 25, 35);
                    }
                    else {
                        Client.Companion.showTitle(`&6&lDaedalus Stick!`, "", 0, 25, 35);
                    }
                }
                if (settings.lootAnnouncerParty) {
                    ChatLib.command("pc [SBO] RARE DROP! Daedalus Stick!" + mfPrefix);
                }

                playCustomSound(settings.stickSound, settings.stickVolume);
                if (settings.dianaTracker) {
                    trackItem(drop, "items", 1);
                }
                break;
        }
    }
}).setCriteria("&r&6&lRARE DROP! &r${drop}"), () => settings.dianaTracker || (settings.dianaStatsTracker || settings.sendSinceMessage || settings.dianaAvgMagicFind || settings.chimMessageBool));

// refresh overlay //
let tempSettingLoot = -1;
let tempSettingBazzar = -1;
registerWhen(register("step", () => {
    tempSettingLoot = settings.dianaLootTrackerView;
    tempSettingBazzar = settings.bazaarSettingDiana
    itemOverlay();
}).setFps(1), () => settings.dianaTracker && (tempSettingLoot !== settings.dianaLootTrackerView || tempSettingBazzar !== settings.bazaarSettingDiana));

let tempSettingMob = -1;
registerWhen(register("step", () => {
    tempSettingMob = settings.dianaMobTrackerView;
    mobOverlay();
}).setFps(1), () => settings.dianaTracker && tempSettingMob !== settings.dianaMobTrackerView);

let firstLoadReg = register("tick", () => {
    if (isInSkyblock() && isDataLoaded()) {
        itemOverlay();
        mobOverlay();
        statsOverlay();
        avgMagicFindOverlay();
        mythosMobHpOverlay([]);
        firstLoadReg.unregister();
    }
})

// import tracker feature
const translateDictSh = {
    "SKYBLOCK_COIN": "coins",
    "GRIFFIN_FEATHER": "Griffin Feather",
    "CROWN_OF_GREED": "Crown of Greed",
    "WASHED_UP_SOUVENIR": "Washed-up Souvenir",
    "ULTIMATE_CHIMERA;1": "Chimera",
    "DAEDALUS_STICK": "Daedalus Stick",
    "MINOS_INQUISITOR": "Minos Inquisitor",
    "MINOS_CHAMPION": "Minos Champion",
    "MINOTAUR": "Minotaur",
    "GAIA_CONSTRUCT": "Gaia Construct",
    "SIAMESE_LYNXES": "Siamese Lynxes",
    "MINOS_HUNTER": "Minos Hunter"
};

let totalImportedMobs = 0;
let oldTracker = {
    mayor: {},
    total: {},
    session: {}
}
let importedATracker = false;
function importDianaTracker(profileName, importType) {
    totalImportedMobs = 0;
    ChatLib.chat("&6[SBO] &aImporting from SkyHanni...");
    let shConfig = JSON.parse(FileLib.read("./config/skyhanni/config.json"));
    if (shConfig == undefined) {
        ChatLib.chat("&6[SBO] &cSkyHanni not found. cant import tracker");
        return;
    }
    let activePlayer = shConfig.storage.players[Player.getUUID()]
    if (activePlayer == undefined) {
        ChatLib.chat("&6[SBO] &cPlayer not found in skyhanni config.");
        return;
    }
    let activeProfile = activePlayer.profiles[profileName.toLowerCase()];
    if (activeProfile == undefined) {
        ChatLib.chat("&6[SBO] &cProfile not found. Please check if the profile name is correct.");
        return;
    }
    let dianaShTracker = activeProfile.diana
    
    oldTracker.mayor = JSON.parse(JSON.stringify(trackerMayor))
    oldTracker.total = JSON.parse(JSON.stringify(trackerTotal))
    oldTracker.session = JSON.parse(JSON.stringify(trackerSession))
    importedATracker = true;
    if (importType == "overwrite") {
        resetTracker("total");
        resetTracker("mayor");
        resetTracker("session");
    }

    transferTracker("items", importType, trackerTotal, dianaShTracker.dianaProfitTracker);
    transferTracker("mobs", importType, trackerTotal, dianaShTracker.mythologicalMobTracker.count);

    if (dianaShTracker.dianaProfitTrackerPerElectionSeason) {
        if (dianaShTracker.dianaProfitTrackerPerElectionSeason[getDateMayorElected().getFullYear()]) {
            transferTracker("items", importType, trackerMayor, dianaShTracker.dianaProfitTrackerPerElectionSeason[getDateMayorElected().getFullYear()-1]);
        }
    }
    if (dianaShTracker.mythologicalMobTrackerPerElectionSeason) {
        if (dianaShTracker.mythologicalMobTrackerPerElectionSeason[getDateMayorElected().getFullYear()]) {
            transferTracker("mobs", importType, trackerMayor, dianaShTracker.mythologicalMobTrackerPerElectionSeason[getDateMayorElected().getFullYear()-1].count);
        }
    }
    ChatLib.chat("&6[SBO] &aTracker imported!");
    new TextComponent("&7[&bTo revert back to your old tracker, click here&7]").setClick("run_command", "/sboimporttrackerundo").setHover("show_text", "Click Me").chat();
    trackerMayor.save();
    trackerTotal.save();
    itemOverlay();
    mobOverlay();
}

function transferData(type, itemKey, ammount, importType, tracker) {
    if (type == "items") {
        if (importType == "overwrite") {
            tracker.items[itemKey] = ammount;
        }
        else if (importType == "add") {
            tracker.items[itemKey] += ammount;
        }
    }
    else if (type == "mobs") {
        if (importType == "overwrite") {
            tracker.mobs[itemKey] = ammount;
        }
        else if (importType == "add") {
            tracker.mobs[itemKey] += ammount;
        }
        totalImportedMobs += ammount;
    }
}

function transferTracker(type, importType, toTracker, fromTracker) { 
    totalImportedMobs = 0;
    if (type == "mobs") {
        Object.keys(fromTracker).forEach((item) => {
            let itemKey = item;
            if (translateDictSh[item]) itemKey = translateDictSh[item];
            transferData(type, itemKey, fromTracker[item], importType, toTracker);
        });

        if (importType == "overwrite") {
            toTracker.mobs["TotalMobs"] = totalImportedMobs;
        } else {
            toTracker.mobs["TotalMobs"] += totalImportedMobs;
        }
    } else {
        Object.keys(fromTracker.items).forEach((item) => {
            let itemKey = item;
            if (translateDictSh[item]) itemKey = translateDictSh[item];
            transferData(type, itemKey, fromTracker.items[item].totalAmount, importType, toTracker);
        });

        if (importType == "overwrite") {
            toTracker.items["Total Burrows"] = fromTracker.burrowsDug
        } else {
            toTracker.items["Total Burrows"] += fromTracker.burrowsDug
        }
    }
}

register("command", (args1, ...args) => {
    if (args1 != undefined) {
        ChatLib.chat(ChatLib.getChatBreak("&b-"))
        ChatLib.chat("&aDo you want to overwrite or add on top of your current diana tracker");
        new TextComponent("&7[&bTo overwrite, click here&7]").setClick("run_command", "/dianatrackerimportcheck2 " + args1 + " overwrite").setHover("show_text", "Click Me").chat();
        new TextComponent("&7[&bTo add to your tracker, click here&7]").setClick("run_command", "/dianatrackerimportcheck2 " + args1 + " add").setHover("show_text", "Click Me").chat();
        ChatLib.chat(ChatLib.getChatBreak("&b-"))
    } else {
        ChatLib.chat("&6[SBO] &eEnter your Profile name to import your Diana tracker. /sboimporttracker <profilename>");
    }
}).setName("sboimporttracker");

register("command", (args1, args2, ...args) => {
    if (args1 != undefined && args2 != undefined) {
        ChatLib.chat(ChatLib.getChatBreak("&b-"))
        if (args2 == "overwrite") {
            ChatLib.chat("&aAre you sure you want to overwrite your diana tracker? (Total, Mayor, Session)");
        }
        else if (args2 == "add") {
            ChatLib.chat("&aAre you sure you want to add the imported tracker to your diana tracker? (Total, Mayor, Session)");
        }
        new TextComponent("&7[&bYES&7]").setClick("run_command", "/dianatrackerimporttracker " + args1 + " " + args2).setHover("show_text", "Click Me").chat();
        ChatLib.chat(ChatLib.getChatBreak("&b-"))
    } else {
        ChatLib.chat("&6[SBO] &cInvalid arguments. use /sboimporttracker <profilename>");
    }
}).setName("dianatrackerimportcheck2");

register("command", (args1, args2, ...args) => {
    if (args1 != undefined && args2 != undefined) {
        importDianaTracker(args1, args2);
    }
    else {
        ChatLib.chat("&6[SBO] &cInvalid arguments. use /sboimporttracker <profilename>");
    }
}).setName("dianatrackerimporttracker");

register("command", () => {
    if (importedATracker) {
        ChatLib.chat("&6[SBO] &aReverted back to your old tracker.");
        trackerMayor = Object.assign(trackerMayor, oldTracker.mayor);
        trackerTotal = Object.assign(trackerTotal, oldTracker.total);
        trackerSession = Object.assign(trackerSession, oldTracker.session);
        trackerMayor.save();
        trackerTotal.save();
        itemOverlay();
        mobOverlay();
    }
}).setName("sboimporttrackerundo");

register("command", () => {
    data.last10ChimMagicFind = [];
    data.avgChimMagicFind = 0;
    data.last10StickMagicFind = [];
    data.avgStickMagicFind = 0;
    data.save();
    avgMagicFindOverlay();
}).setName("sboresetavgmftracker");

register("command", () => {
    data.mobsSinceInq = 0;
    data.inqsSinceChim = 0;
    data.minotaursSinceStick = 0;
    data.champsSinceRelic = 0;
    data.inqsSinceLsChim = 0;
    data.save();
    statsOverlay();
}).setName("sboresetstatstracker");