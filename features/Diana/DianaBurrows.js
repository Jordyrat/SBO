import { registerWhen } from "../../utils/variables";
import settings from "../../settings";
import { getWorld } from "../../utils/world";
import { checkDiana } from "../../utils/checkDiana";
import { createBurrowWaypoints, removeBurrowWaypoint, removeBurrowWaypointBySmoke, setBurrowWaypoints } from "../general/Waypoints";



class EvictingQueue {
    constructor(capacity) {
        this.capacity = capacity;
        this.queue = [];
    }

    add(item) {
        if (this.queue.length >= this.capacity) {
            this.queue.shift(); // Remove the oldest item
        }
        this.queue.push(item);
    }

    contains(item) {
        return this.queue.includes(item);
    }

    clear() {
        this.queue = [];
    }
}
const EnumParticleTypes = net.minecraft.util.EnumParticleTypes
const S2APacketParticles = net.minecraft.network.play.server.S2APacketParticles


class ParticleType {
    constructor(typeCheck) {
        this.check = typeCheck;
    }
}

const ParticleTypes = {
    EMPTY: new ParticleType(packet =>
        packet.func_179749_a().toString() == "CRIT_MAGIC" &&
        parseInt(packet.func_149222_k()) == 4 &&
        parseFloat(packet.func_149227_j()).toFixed(2) == 0.01 &&
        parseFloat(packet.func_149221_g()).toFixed(1) == 0.5 &&
        parseFloat(packet.func_149224_h()).toFixed(1) == 0.1 &&
        parseFloat(packet.func_149223_i()).toFixed(1) == 0.5
    ),
    MOB: new ParticleType(packet =>
        packet.func_179749_a().toString() == "CRIT" &&
        parseInt(packet.func_149222_k()) == 3 &&
        parseFloat(packet.func_149227_j()).toFixed(2) == 0.01 &&
        parseFloat(packet.func_149221_g()).toFixed(2) == 0.5 &&
        parseFloat(packet.func_149224_h()).toFixed(1) == 0.1 &&
        parseFloat(packet.func_149223_i()).toFixed(2) == 0.5
    ),
    TREASURE: new ParticleType(packet =>
        packet.func_179749_a().toString() == "DRIP_LAVA" &&
        parseInt(packet.func_149222_k()) == 2 &&
        parseFloat(packet.func_149227_j()).toFixed(2) == 0.01 &&
        parseFloat(packet.func_149221_g()).toFixed(2) == 0.35 &&
        parseFloat(packet.func_149224_h()).toFixed(1) == 0.1 &&
        parseFloat(packet.func_149223_i()).toFixed(2) == 0.35
    ),
    FOOTSTEP: new ParticleType(packet =>
        packet.func_179749_a().toString() == "FOOTSTEP" &&
        parseInt(packet.func_149222_k()) == 1 &&
        parseInt(packet.func_149227_j()) == 0 &&
        parseFloat(packet.func_149221_g().toFixed(2)) == 0.05 &&
        parseInt(packet.func_149224_h()) == 0 &&
        parseFloat(packet.func_149223_i().toFixed(2)) == 0.05
    ),
    ENCHANT: new ParticleType(packet =>
        packet.func_179749_a().toString() == "ENCHANTMENT_TABLE" &&
        parseInt(packet.func_149222_k()) == 5 &&
        parseFloat(packet.func_149227_j()).toFixed(2) == 0.05 &&
        parseFloat(packet.func_149221_g()).toFixed(1) == 0.5 &&
        parseFloat(packet.func_149224_h()).toFixed(1) == 0.4 &&
        parseFloat(packet.func_149223_i()).toFixed(1) == 0.5
    ),
};

function getParticleType(packet) {
    for (let key in ParticleTypes) {
        if (ParticleTypes[key].check(packet)) {
            return key;
        }
    }
    return null;
}


class Diggable {
    constructor(x, y, z, type) {
        x = x;
        y = y;
        z = z;
        type = type;
        blockPos = new BlockPos(x, y, z);
    }

    get waypointText() {
        switch (type) {
            case 0: return '§aStart (Particle)';
            case 1: return '§cMob (Particle)';
            case 2: return '§6Treasure (Particle)';
            default: return 'Burrow (Particle)';
        }
    }

}

class Burrow extends Diggable {
    constructor(x, y, z, hasFootstep, hasEnchant, type) {
        super(x, y, z, type);
        hasFootstep = hasFootstep;
        hasEnchant = hasEnchant;
    }

    static fromVec3(vec3, hasFootstep, hasEnchant, type) {
        return new Burrow(vec3.x, vec3.y, vec3.z, hasFootstep, hasEnchant, type);
    }
}

let burrows = {};
let burrowshistory = new EvictingQueue(5);

function burrowDetect(packet) {
    typename = packet.func_179749_a().toString();
    if (typename != "FOOTSTEP" && typename != "CRIT_MAGIC" && typename != "CRIT" && typename != "DRIP_LAVA" && typename != "ENCHANTMENT_TABLE") return;
    // print("Particle: " + typename);
    const particleType = getParticleType(packet);
    // print("Particle Type: " + particleType);
    if (!particleType) return;
    // print("Went trhorugh: ");
    const pos = new BlockPos(packet.func_149220_d(), packet.func_149226_e(), packet.func_149225_f()).down();
    const posstring = pos.getX() + " " + pos.getY() + " " + pos.getZ(); 
    if (burrowshistory.contains(posstring)) return;
    // print("posstring: " + posstring);
    
    if (!burrows[posstring]) {
        burrows[posstring] = [new Burrow(pos.x, pos.y, pos.z, null), { x : pos.x, y : pos.y, z : pos.z }, [packet.func_149220_d(), packet.func_149226_e(), packet.func_149225_f()]];
    }

    switch (particleType) {
        case "FOOTSTEP":
            burrows[posstring][0].hasFootstep = true;
            break;
        case "ENCHANT":
            burrows[posstring][0].hasEnchant = true;
            break;
        case "EMPTY":
            burrows[posstring][0].type = 0;
            break;
        case "MOB":
            burrows[posstring][0].type = 1;
            break;
        case "TREASURE":
            burrows[posstring][0].type = 2;
            break;
    }
}

let removedBurrow = null;
function removeBurrowBySmoke(x, y, z) {
    removedBurrow = removeBurrowWaypointBySmoke(x, y, z);
    // print("x" + x + " y: " + (y-1) + " z: " + z)
    const posstring = x + " " + (y - 1) + " " + z;
    // remove burrow from burrows
    delete burrows[posstring];
    if(removedBurrow != null) {
        burrowshistory.add(removedBurrow);
        // print("Burrow removed Smoke: " + removedBurrow);
    }
}

function resetBurrows() {
    setBurrowWaypoints([]);
    burrows = {};
    burrowshistory.clear();
}

let digPos = null;
function refreshBurrows() {
    if(digPos == null) return;
    result = removeBurrowWaypoint(digPos, burrows);
    burrows = result.burrows;
    removedBurrow = result.removedBurrow;
    if (removedBurrow != null) {
        burrowshistory.add(removedBurrow);
        // print("Burrow removed: " + removedBurrow);
    }
}



registerWhen(register("chat", (burrow) => {
    refreshBurrows();
}).setCriteria("&r&eYou dug out a Griffin Burrow! &r&7${burrow}&r"), () => settings.dianaBurrowDetect);

registerWhen(register("chat", (burrow) => {
    refreshBurrows();
}).setCriteria("&r&eYou finished the Griffin burrow chain!${burrow}"), () => settings.dianaBurrowDetect);

registerWhen(register("chat", (died) => {
    resetBurrows();
}).setCriteria(" ☠ You ${died}."), () => getWorld() == "Hub" && settings.dianaBurrowDetect);

registerWhen(register("spawnParticle", (particle, type, event) => {
    if (!checkDiana()) return;
    if (type.toString() == "SMOKE_LARGE") {
        const particlepos = particle.getPos();
        const xyz = [particlepos.getX(), particlepos.getY(), particlepos.getZ()];
        const [x, y , z] = [xyz[0], xyz[1], xyz[2]];
        // print("x: " + x + " y: " + y + " z: " + z);
        // print("Smoke: " + x + " " + y + " " + z);
        removeBurrowBySmoke(x, y, z);
    }
}), () => settings.dianaBurrowDetect && getWorld() == "Hub");

registerWhen(register("worldUnload", () => {
    resetBurrows();
}), () => settings.dianaBurrowDetect);


register("command", () => {
    resetBurrows();
    ChatLib.chat("§6[SBO] §4Burrow Waypoints Cleared!§r")
}).setName("sboclearburrows").setAliases("sbocb"); 

register("step", () => {
    // test command print all burrows to console
    // print("Burrows: ");
    for (let key in burrows) {
        // print each burrow with cords and type
        // print("x: " + burrows[key][1].x + " y: " + burrows[key][1].y + " z: " + burrows[key][1].z + " type: " + burrows[key][0].type);
        if (burrows[key][0].type == undefined) return;
        createBurrowWaypoints(burrows[key][0].type, burrows[key][1].x, burrows[key][1].y +1, burrows[key][1].z, [], burrows[key][2]);
    }
}).setFps(4);

// registerWhen(register("packetReceived", (packet)=> {
//     burrowDetect(packet)
// }).setFilteredClass(net.minecraft.network.play.server.S2APacketParticles), () => settings.dianaBurrowDetect && getWorld() == "Hub");
register("packetReceived", (packet) => {
    // print("Packet type: " + packet.func_179749_a().toString());
    // print("Packet count: " + parseInt(packet.func_149222_k()));
    // print("Packet speed: " + parseFloat(packet.func_149227_j()).toFixed(2));
    // print("Packet xOffset: " + parseFloat(packet.func_149221_g()).toFixed(1));
    // print("Packet yOffset: " + parseFloat(packet.func_149224_h()).toFixed(1));
    // print("Packet zOffset: " + parseFloat(packet.func_149223_i()).toFixed(1));

    burrowDetect(packet)
}).setFilteredClass(S2APacketParticles);

const C07PacketPlayerDigging = net.minecraft.network.play.client.C07PacketPlayerDigging
const C08PacketPlayerBlockPlacement = net.minecraft.network.play.client.C08PacketPlayerBlockPlacement

register("packetSent", (packet, event) => {
    let action = packet.func_180762_c()
    let pos = new BlockPos(packet.func_179715_a()).down()
    // print("Action: " + action + " Pos: " + pos)
    if(action == C07PacketPlayerDigging.Action.START_DESTROY_BLOCK) {
        let x = pos.getX();
        let y = pos.getY() +2;
        let z = pos.getZ();
    
        if (pos.getX() < 0) {
            x = x+ 1;
        }
        if (pos.getZ() < 0) {
            z = z + 1;
        }
        if (burrows[x + " " + (y-1) + " " + z]) {
            digPos =  new BlockPos(x, y, z);
        }   
    }
    
}).setFilteredClass(C07PacketPlayerDigging);
