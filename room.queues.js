const ui = require('room.ui');
const roomQueue = {
    energySites: {},
    mineralSites: {},
    constructionSites: [],
    hostileCreeps: [],
};
let roomQueues = {};
let creepHeatmaps = {};

const canMoveToPos = (room, x, y) => {
    let roomPos = new RoomPosition(x, y, room.name);
    //console.log(roomPos);
    //const road = roomPos.lookFor()
    const terrain = new Room.Terrain(room.name);
    switch(terrain.get(x, y)) {
        case TERRAIN_MASK_WALL:
            const structures = roomPos.lookFor(LOOK_STRUCTURES);
            if (structures.length && _.filter(structures, (s) => s.structureType === STRUCTURE_ROAD)) {
                room.visual.circle(roomPos,
                    {fill: 'yellow', radius: 0.15, stroke: 'orange'});
                return true;
            }
            room.visual.circle(roomPos,
                {fill: 'red', radius: 0.15, stroke: 'red'});
            return false;
        case TERRAIN_MASK_LAVA:
            room.visual.circle(roomPos,
                {fill: 'red', radius: 0.15, stroke: 'darkred'});
            return false;
        case TERRAIN_MASK_SWAMP:
            room.visual.circle(roomPos,
                {fill: 'green', radius: 0.15, stroke: 'darkgreen'});
                return true;
        case 0:
            room.visual.circle(roomPos,
                {fill: 'green', radius: 0.15, stroke: 'green'});
            return true;
    }

};

const getSurroundingCoordinates = (x, y) => {

    return [
        { x: x, y: y - 1 },
        { x: x - 1, y: y - 1 },
        { x: x - 1, y: y },

        { x: x, y: y + 1 },
        { x: x + 1, y: y + 1 },
        { x: x + 1, y: y },

        { x: x - 1, y: y + 1 },
        { x: x + 1, y: y - 1 },
    ];
};

const findEnergySites = (room) => {
    let sources = room.find(FIND_SOURCES);
    let claimedSources = getClaimedSites(room, 'sourceId');
    //console.log(claimedSources);
    let energySites = { total: 0};
    sources.map(source => {
        room.visual.circle(source.pos,
            {fill: 'blue', radius: 0.55, stroke: 'lightblue'});
/*
        canMoveToPos(room, source.pos.x, source.pos.y - 1);
        canMoveToPos(room, source.pos.x - 1, source.pos.y - 1);
        canMoveToPos(room, source.pos.x - 1, source.pos.y);

        canMoveToPos(room, source.pos.x + 1, source.pos.y);
        canMoveToPos(room, source.pos.x, source.pos.y + 1);
        canMoveToPos(room, source.pos.x + 1, source.pos.y + 1);

        canMoveToPos(room, source.pos.x - 1, source.pos.y + 1);
        canMoveToPos(room, source.pos.x + 1, source.pos.y - 1);*/
        if (!energySites[source.id]) {
            energySites[source.id] = [];
        }
        getSurroundingCoordinates(source.pos.x, source.pos.y).map(pos => {
            //console.log('energy_left', source.energy > 0);
            if (canMoveToPos(room, pos.x, pos.y)) {
                energySites['total'] = energySites['total'] + 1;
            }
            if (source.energy > 0) {
                //console.log('claimed', claimedSources.indexOf(source.id) === -1);
                if (canMoveToPos(room, pos.x, pos.y) && claimedSources.indexOf(source.id) === -1) {
                    //if (source.energy > 0) {
                    energySites[source.id].push(new RoomPosition(pos.x, pos.y, room.name));
                    //}
                } else {
                    let newClaimedSources = [];
                    let gotOne = false;
                    claimedSources.map(claimedSource => {
                        //console.log(claimedSource, '===', source.id, gotOne);
                        if (claimedSource !== source.id || gotOne) {
                            //console.log('push');
                            newClaimedSources.push(claimedSource);
                        } else {
                            //console.log('ignore');
                            gotOne = true;
                        }
                    });
                    claimedSources = newClaimedSources;
                }
                //console.log(claimedSources);
            }
        });
        //console.log(energySites[source.id].length);

        if (energySites[source.id].length <= 0) {
            //console.log('delete');
            delete(energySites[source.id]);
        }
    });

    //console.log(JSON.stringify(energySites));
    return energySites;
};

const getClaimedSites = (room, jobType) => {
    let assignedSites = [];
    //console.log(builders);
    for (let name in Game.creeps) {
        if (/*creep.memory.role === 'janitor' && */Game.creeps[name].memory[jobType]) {
            assignedSites.push(Game.creeps[name].memory[jobType]);
        }
        //console.log(name);
    }

    return assignedSites;
};

const findConstructionSites = (room) => {
    return room.find(FIND_CONSTRUCTION_SITES) || [];
};

const findHostileCreeps = (room) => {
    return room.find(FIND_HOSTILE_CREEPS) || [];
};

const queues = {

    run: (roomName) => {
        const room = Game.rooms[roomName];
        let tempRoomQueue = {...roomQueue};
        tempRoomQueue['energySites'] = findEnergySites(room);
        tempRoomQueue['constructionSites'] = findConstructionSites(room);
        tempRoomQueue['hostileCreeps'] = findHostileCreeps(room);
        //console.log('hostiles', tempRoomQueue['hostileCreeps'].length);

        roomQueues = {...roomQueues, [room.name]: tempRoomQueue};
        //console.log(JSON.stringify(roomQueues));
    },

    getRoomQueue(room) {
        return roomQueues[room] || roomQueue;
    },

    getCreepHeatmap(roomName) {
        return creepHeatmaps[roomName] || {};

    },

    feedCreepHeatmap: (roomName, x, y) => {
        let tempCreepHeatmap = {...creepHeatmaps[roomName]};
        let cordKey = x + '_' + y;
        if (tempCreepHeatmap[cordKey]) {
            tempCreepHeatmap[cordKey] = tempCreepHeatmap[cordKey] + 1;
        } else {
            tempCreepHeatmap[cordKey] = 1;
        }

        creepHeatmaps = {...creepHeatmaps, [roomName]: tempCreepHeatmap};
    }

};



module.exports = queues;