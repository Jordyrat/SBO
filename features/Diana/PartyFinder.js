import { request } from "../../../requestV2";
import { getPartyMembers } from "../../utils/functions";

let api = "https://api.skyblockoverhaul.com";

function getPartyInfo(party) {
    // remove duplicates 
    party = [...new Set(party)].join(",");
    // remove empty strings from partylist (idk why this works but it does)
    party = party.filter(Boolean);
    // remove user from partylist
    party = party.filter((name) => name != Player.getName());
    request({
        url: api + "/partyInfo?party=" + party,
        json: true
    }).then((response)=> {
        printPartyInfo(response.PartyInfo)
    }).catch((error)=> {
        console.error(error);
    });
}

// function queueAsPlayer() {
//     // Queue as a player
//     let success = false;
//     request({
//         url: api + "/addPlayerToQueue?PlayerName=" + Player.getName(),
//         json: true
//     }).then((response)=>{
//         success = response.Success;
//         if (success) {
//             ChatLib.chat("Successfully queued as " + Player.getName());
//         }
//         else {
//             ChatLib.chat("Failed to queue as " + Player.getName());
//         }    
//     }).catch((error)=>{
//         console.error(error);
//     });
// }

// function removeFromQueue() {
//     // Remove player from queue
//     let success = false;
//     request({
//         url: api + "/removePlayerFromQueue?PlayerName=" + Player.getName(),
//         json: true
//     }).then((response)=>{
//         success = response.Success;
//         if (success) {
//             ChatLib.chat("Successfully removed " + Player.getName() + " from queue");
//         }
//         else {
//             ChatLib.chat("Failed to remove " + Player.getName() + " from queue");
//         }
//         getQueuePlayer();
//     }).catch((error)=>{
//         console.error(error);
//     });
// }
    
// let queue = [];
// function getQueuePlayer() {
//     // Get the queue
//     request({
//         url: api + "/queuePlayer",
//         json: true
//     }).then((response)=>{
//         queue = response.Queue;
//         ChatLib.chat("Queue: ");
//         if (queue.length == 0) {
//             ChatLib.chat("Empty");
//         }
//         for (let i = 0; i < queue.length; i++) {
//             ChatLib.chat("name: " + queue[i].name + " sb lvl: " + queue[i].sbLvl + " eman9 " + queue[i].eman9 + " kills: " + queue[i].mythosKills + " legi pet: " + queue[i].legPet);
//         }
//     }).catch((error)=>{
//         console.error(error);
//     });
// }

// register("command", () => {
//     queueAsPlayer();
// }).setName("sboqueue");

// // each player in queue has a name, rank, sbLvl, eman9, mythosKills, legPet
// register("command", () => {
//     getQueuePlayer();
// }).setName("sbopf");

register("chat", (party) => {
    setTimeout(() => {
        // send clickable message to execute command
        new TextComponent("&6[SBO] &eClick to check party members").setClick("run_command", "/sbocheckp").setHover("show_text", "/sbocheckp").chat();
    }, 100);
}).setCriteria("&eYou have joined ${party} &r&eparty!&r");

// &eYou'll be partying with: &r&b[MVP&r&c+&r&b] vxnp&r&e, &r&b[MVP&r&0+&r&b] saltyarcher&r&e, &r&6[MVP&r&2++&r&6] Boi_&r&e, &r&b[MVP&r&2+&r&b] rigis&r
// You have joined [MVP++] Tricksyz's party!

let lastUsed = 0;
register("command", () => {
    if (Date.now() - lastUsed > 60000 || lastUsed == 0) { // 1 minutes
        lastUsed = Date.now();
        try {
            ChatLib.chat("&6[SBO] &eChecking party members...");
            let party = getPartyMembers();
            if (party.length == 0) {
                ChatLib.chat("&6[SBO] &eNo party members found. try /pl and /sbocheckp again if your in a party.");
                return;
            }
            getPartyInfo(party);
        } catch (error) {
            ChatLib.chat("&6[SBO] &eUnexpected error occurred while checking party members. Please try /pl and /sbocheckp again.");
            console.error(error);
        }
    }
    else {
        ChatLib.chat("&6[SBO] &ePlease wait 1 minutes before checking party members again.");
    }
}).setName("sbocheckp");

function printPartyInfo(partyinfo) {
    for (let i = 0; i < partyinfo.length; i++) {
        if (partyinfo[i].legPet) { // to remove all player without legendary griffin pet
            ChatLib.chat("&6[SBO] &eName: " + partyinfo[i].name + " | LvL: " + partyinfo[i].sbLvl + " | Eman9: " + (partyinfo[i].eman9 ? "&4✓" : "&a✗") + "&e | Kills: " + partyinfo[i].mythosKills);
        }
    }
}