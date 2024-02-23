import settings from "../../settings";
import { getInqWaypoints } from "./../general/Waypoints";
import { registerWhen } from "../../utils/variables";
import { toTitleCase } from '../../utils/functions';

let hubWarps = {
    castle: {x: -250, y: 130, z: 45, unlocked: true},
    da: {x: 92, y: 75, z: 174, unlocked: true},
    hub: {x: -3, y: 70, z: -70, unlocked: true},
    museum: {x: -76, y: 76, z: 81, unlocked: true},
};

const inquisWarpKey = new KeyBind("Iqnuis Warp", Keyboard.KEY_NONE, "SkyblockOverhaul");
let tryWarp = false;
inquisWarpKey.registerKeyPress(() => {
    if (settings.inqWarpKey) {
        warps = getInqWaypoints();
        if (warps.length > 0) {
            getClosestWarp(warps[warps.length - 1][1], warps[warps.length - 1][2], warps[warps.length - 1][3]);
            if (warpPlayer) {
                ChatLib.command("warp " + closestWarp);
                tryWarp = true;
                setTimeout(() => {
                    tryWarp = false;
                }, 2000);
            }
        }
    }
});

register("chat", () => {
    if (tryWarp) {
        ChatLib.chat("§6[SBO] §4" + toTitleCase(closestWarp) + " is not unlocked!")
        hubWarps[closestWarp].unlocked = false;
    }
}).setCriteria("&r&cYou haven't unlocked this fast travel destination!&r");
// wenn scroll ulocked dann diese message &r&eYou may now Fast Travel to &r&aSkyBlock Hub &r&7- &r&bCrypts&r&e!&r
let closestWarp = undefined;

let warpPlayer = false;
let closestDistance = Infinity;
function getClosestWarp(x,y,z){
    let closestPlayerdistance = Math.sqrt(
        (Player.getLastX() - x)**2 +
        (Player.getLastY() - y)**2 +
        (Player.getLastZ() - z)**2
    );
    closestDistance = Infinity;
    for (let warp in hubWarps) {
        if (hubWarps[warp].unlocked){
            let distance = Math.sqrt(
                (hubWarps[warp].x - x)**2 +
                (hubWarps[warp].y - y)**2 +
                (hubWarps[warp].z - z)**2
            );
            if (distance < closestDistance) {
                closestDistance = distance;
                closestWarp = warp;
            }
        }
    }
    print(closestWarp);
    print(closestDistance);
    print(closestPlayerdistance);
    print(x);
    print(y);
    print(z);
    if (Math.round(parseInt(closestPlayerdistance)) > Math.round(parseInt(closestDistance))) {
        warpPlayer = true;
    }
    else {
        warpPlayer = false;
    }
}