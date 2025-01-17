/// <reference types="../CTAutocomplete" />
import "./features/Diana/DianaBurrows";
import "./features/Kuudra";
import "./features/Diana/DianaMobDetect";
import "./features/general/CopyMessage";
import "./features/general/PartyCommands";
import "./features/general/Waypoints";
import "./features/general/fossilSolver";
import "./features/general/messageHider";
import "./features/general/pickuplog";
import "./features/guis/BobberCounter";
import "./features/guis/LegionCounter";
import "./features/slayer/BlazeSlayer";
import "./utils/overlays";
import "./features/Diana/PartyFinder";
import "./features/general/QOL";
import "./features/guis/SlayerGuis";
import "./features/general/CrownTracker";
import "./features/Diana/DianaAchievements";
import "./features/guis/Achievements";
import "./features/guis/PastDianaEvents";
import "./features/guis/PartyFinderGUI";
import "./features/general/TestFeatures";
import { data, registerWhen } from "./utils/variables";
import { isDataLoaded } from "./utils/checkData";
import settings from "./settings";

register("command", (args1, ...args) => {
    if (args1 == undefined) {
        settings.openGUI()
    } else {
        switch (args1.toLowerCase()) { 
            case "help":
                ChatLib.chat("&6[SBO] &eCommands:")
                ChatLib.chat("&7> &a/sbo &7- &eOpen the settings")
                ChatLib.chat("&7> &a/sbo help &7- &eShow this message")
                ChatLib.chat("&7> &a/sboguis &7- &eOpen the GUIs and move them around (or: /sbomoveguis)")
                ChatLib.chat("&7> &a/sboclearburrows &7- &eClear all burrow waypoints (or: /sbocb)")
                ChatLib.chat("&7> &a/sbocheck <player> &7- &eCheck a player (or: /sboc <player>)")
                ChatLib.chat("&7> &a/sbocheckp &7- &eCheck your party (alias /sbocp)")
                ChatLib.chat("&7> &a/sboimporttracker <profilename> &7- &eImport skyhanni/skytils tracker")
                ChatLib.chat("&7> &a/sboimporttrackerundo &7- &eUndo the tracker import")
                ChatLib.chat("&7> &a/sbodc &7- &eDiana dropchances")
                ChatLib.chat("&7> &a/sbopartyblacklist &7- &eParty commands blacklisting")
                ChatLib.chat("&7> &a/sbobacktrackachivements &7- &eBacktrack achievements")
                ChatLib.chat("&7> &a/sboachievements &7- &eOpens the achievements GUI")
                ChatLib.chat("&7> &a/sbolockachievements &7- &eLocks all Achievements (needs confirmation)")
                ChatLib.chat("&7> &a/sbopde &7- &eOpens the Past Diana Events GUI")
                ChatLib.chat("&7> &a/sboactiveuser &7- &eShows the active user of the mod")
                ChatLib.chat("&7> &a/sbopf &7- &eOpens the PartyFinder GUI")
                ChatLib.chat("&7> &a/sbopartycommands &7- &eDisplays all diana partycommands")
                ChatLib.chat("&7> &a/sboresetavgmftracker &7- &eResets the avg mf tracker")
                ChatLib.chat("&7> &a/sboresetstatstracker &7- &eResets the stats tracker")
                break;
            default:
                ChatLib.chat("&6[SBO] &eUnknown command. Use /sbo help for a list of commands")
                break;
        }
    }
}).setName("skyblockoverhaul").setAliases("sbo");

// Title bug fix
register("worldLoad", () => {
    Client.showTitle("", "", 0, 40, 20);
});

// dowload msg beispiel
const newVersion = "0.4.6" // hier neue version eintragen wenn changelog angezeigt werden soll
const downloadMsgReg = register("step", () => {
    if (!World.isLoaded()) return
    if (!isDataLoaded()) return
    if (data.downloadMsg) {
        downloadMsgReg.unregister()
        return
    }
    ChatLib.chat(ChatLib.getChatBreak("&b-"))
    ChatLib.chat(`&aThanks for importing &6SBO`)
    ChatLib.chat(`&7> &ayou can open the settings with /sbo`)
    ChatLib.chat(`&7> &athe party finder with /sbopf`)
    ChatLib.chat(`&7> &aa list of useful commands with /sbo help`)
    ChatLib.chat(ChatLib.getChatBreak("&b-"))

    data.downloadMsg = true
    data.changelogVersion = newVersion
    data.save()
    
    downloadMsgReg.unregister()
}).setFps(1)

// changelog beispiel
const changeLogReg = register("step", () => {
    if (!World.isLoaded()) return
    if (!isDataLoaded()) return
    if (!data.downloadMsg) return
    if (data.changelogVersion === newVersion) { 
        changeLogReg.unregister()
        return
    }
    ChatLib.chat(ChatLib.getChatBreak("&b-"))
    ChatLib.chat(`&6[SBO] &r&bVersion &e${newVersion}&r`)
    ChatLib.chat(`&aChangelog:`)
    ChatLib.chat(`&7> &7- &aAdded a new Experimental guess wich uses the arrwos and there particle color from the dug up burrow to guess the next burrow (thx to @KaasPeer)`)
    ChatLib.chat(`&7> &7- &aAdded an option to not warp when a burrow is nearby (dont warp if a burrow is nearby)`)
    ChatLib.chat(`&7> &7- &aAdded !chimls as an extra PartyCommand`)
    ChatLib.chat(`&7> &7- &aAdded a command to undo the tracker import (/sboimporttrackerundo)`)
    ChatLib.chat(`&7> &7- &aAdded a command to reset Avg Mf tracker (/sboresetavgmftracker)`)
    ChatLib.chat(`&7> &7- &aAdded a command to reset stats tracker (/sboresetstatstracker)`)
    ChatLib.chat(`&7> &7- &aRemoved skytils tracker import`)
    ChatLib.chat(`&7> &7- &aSome small bugfixes as always`)
    ChatLib.chat(ChatLib.getChatBreak("&b-"))

    data.changelogVersion = newVersion
    data.save()
    changeLogReg.unregister()
}).setFps(1)