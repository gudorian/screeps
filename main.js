const roleHarvester = require('role.harvester');
const roleUpgrader = require('role.upgrader');
const roleBuilder = require('role.builder');
const roleJanitor = require('role.janitor');
const roleButler = require('role.butler');
const roleDefender = require('role.defender');
const roleMCV = require('role.mcv');

const roomUi = require('room.ui');
const roomQueues = require('room.queues');

const Dict = require('dict');

const spawnBody = (maxCost = 300, main = ['WORK', 'WORK'], secondary = ['MOVE', 'CARRY'], others = []) => {
    const bodyTypeCost = Dict.creepBodyPartsCost;
    let creepBody = [];
    let bodyCost = 0;
    let changed = false;

    while (true) {
        main.map(bodyType => {
            if (canAffordBodyPart(bodyType, maxCost - bodyCost)) {
                bodyCost += bodyTypeCost[bodyType].cost;
                creepBody.push( bodyTypeCost[bodyType].type);
                changed = true;
            }
        });
        secondary.map(bodyType => {
            if (canAffordBodyPart(bodyType, maxCost - bodyCost)) {
                bodyCost += bodyTypeCost[bodyType].cost;
                creepBody.push( bodyTypeCost[bodyType].type);
                changed = true;
            }
        });
        if (!changed) {
            others.map(bodyType => {
                if (canAffordBodyPart(bodyType, maxCost - bodyCost)) {
                    bodyCost += bodyTypeCost[bodyType].cost;
                    creepBody.push( bodyTypeCost[bodyType].type);
                    changed = true;
                }
            });
        }

        if (!changed) {
            break;
        }
        changed = false;
    }

    //console.log('creepBody', creepBody, 'costs', bodyCost);

    return creepBody;
};

const canAffordBodyPart = (type, maxCost) => {
    //console.log(type, 'costs', Dict.creepBodyPartsCost[type].cost, 'with budget of', maxCost);
    return Dict.creepBodyPartsCost[type].cost <= maxCost;
};

const registerGlobals = () => {
    // Number range map
    Number.prototype.mapRange = function (in_min, in_max, out_min, out_max) {
        return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }
};

module.exports.loop = function () {
    registerGlobals();
    for (let name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            //console.log('Clearing non-existing creep memory:', name);
        }
    }

    /*let tower = Game.getObjectById('93549b96cb0e2b0722da8de0');
    if (tower) {
        let closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
        });
        if (closestDamagedStructure) {
            tower.repair(closestDamagedStructure);
        }

        let closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (closestHostile) {
            tower.attack(closestHostile);
        }
    }*/

    //Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE], 'HarvesterX',{memory: {role: 'harvester'}});
    /*for(var name in Game.rooms) {
        console.log('Room "'+name+'" has '+Game.rooms[name].energyAvailable+' energy');
    }
*/
    let energy = 0;
    let energyAvailable = 0;
    //console.log(JSON.stringify(Game.rooms));
    for(let name in Game.rooms) {
        roomUi.clear();
        let room = Game.rooms[name];
        let creeps = room.find(FIND_MY_CREEPS);
        creeps.map(creep => {
            if (!creep.memory.home) {
                creep.memory.home = room.name;
            }
        });

        if (room.controller && room.controller.my) {
            energy          = Game.rooms[name].energyAvailable;
            energyAvailable = Game.rooms[name].energyCapacityAvailable;

            let towers = room.find(FIND_STRUCTURES, {
                filter: (structure) => structure.structureType === STRUCTURE_TOWER
            });
            //let tower = Game.getObjectById('93549b96cb0e2b0722da8de0');
            towers.map(tower => {
                if (tower) {
                    let closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: (structure) => (structure.hits < Math.min(structure.hitsMax, 150000) && structure.structureType !== STRUCTURE_CONTAINER)
                                            || (structure.structureType === STRUCTURE_CONTAINER && structure.hits < structure.hitsMax)
                    });
                    if (closestDamagedStructure) {
                        tower.repair(closestDamagedStructure);
                    }

                    let closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
                    if (closestHostile) {
                        tower.attack(closestHostile);
                    }
                }
            });

            roomQueues.run(room.name);


            //let harvesters = _.filter(Game.creeps, (creep) => creep.memory.role === 'harvester');
            let roomCreeps = _.filter(Game.creeps, (c) => c.memory.home === room.name);
            let totalHarvesters = _.sum(roomCreeps, (c) => c.memory.role === 'harvester'); // Alt
            let totalButlers = _.sum(roomCreeps, (c) => c.memory.role === 'butler'); // Alt
            let upgraders = _.filter(roomCreeps, (creep) => creep.memory.role === 'upgrader');
            let builders = _.filter(roomCreeps, (creep) => creep.memory.role === 'builder');
            let totalJanitors = _.sum(roomCreeps, (c) => c.memory.role === 'janitor'); // Alt
            let totalDefenders = _.sum(roomCreeps, (c) => c.memory.role === 'defender'); // Alt
            let totalMCVs = _.sum(roomCreeps, (c) => c.memory.role === 'mcv'); // Alt


            roomUi.appendText('🔋 ' + energy + ' / ' + energyAvailable, 'yellow');
            roomUi.appendText('Harvesters: ' + totalHarvesters);
            roomUi.appendText('Butlers: ' + totalButlers);
            roomUi.appendText('Upgraders: ' + upgraders.length);
            roomUi.appendText('Builders: ' + builders.length);
            roomUi.appendText('Janitors: ' + totalJanitors);
            roomUi.appendText('Defenders: ' + totalDefenders);
            roomUi.appendText('MCVs: ' + totalMCVs);


            let spawns = room.find(FIND_MY_SPAWNS, { filter: (s) => s.spawning === null });
            let spawn = spawns.length > 0 ? spawns[0] : null;
            const queues = roomQueues.getRoomQueue(room.name);
            //console.log(spawn);
            if (spawn) {
                let energyFull = energy === energyAvailable || energy > 300;
                let newName = 'Unknown' + Game.time;
                if (totalHarvesters < Math.min(room.controller.level * 2, queues['energySites']['total'], 7) && energyFull) {
                    newName = 'Har ' + Game.time;
                    spawn.spawnCreep( spawnBody(Math.min(energyAvailable, 650), ['WORK', 'WORK'], ['CARRY', 'MOVE', 'CARRY', 'MOVE', 'CARRY', 'CARRY', 'WORK', 'CARRY']),
                        newName,
                        { memory: { home: room.name, role: 'harvester', targetId: null, sourceId: null }});
                } else if (totalButlers < 2 && energyFull) {
                    newName = 'But ' + Game.time;
                    spawn.spawnCreep(spawnBody(Math.min(energyAvailable, 400), ['CARRY', 'CARRY'], ['MOVE', 'MOVE', 'CARRY', 'MOVE', 'MOVE']),
                        newName,
                        {memory: {home: room.name, role: 'butler', targetId: null, sourceId: null}});
                } else if (upgraders.length < ((room.controller.level < 5) ? 4 : (room.controller.level === 8 ? 1 : 2)) && energyFull) {
                    newName = 'Upg ' + Game.time;
                    spawn.spawnCreep( spawnBody(Math.min(energyAvailable, 600), ['WORK', 'WORK'], ['CARRY', 'MOVE', 'CARRY', 'CARRY', 'MOVE', 'CARRY', 'CARRY', 'CARRY', 'CARRY']),
                        newName,
                        { memory: { home: room.name, role: 'upgrader', sourceId: null }});
                } else if (builders.length < Math.max((Game.flags['sendBuilders'] ? 8 : 0), Math.min(queues.constructionSites.length, 3)) && energyFull) {
                    newName = 'Bld ' + Game.time;
                    spawn.spawnCreep( spawnBody(Math.min(energyAvailable, 550), ['WORK', 'WORK'], ['CARRY', 'MOVE', 'CARRY', 'CARRY', 'MOVE', 'CARRY', 'CARRY']),
                        newName,
                        { memory: { home: room.name, role: 'builder', targetId: null, sourceId: null }});
                } else if (totalJanitors < 1 && energyFull) {
                    newName = 'Jan ' + Game.time;
                    spawn.spawnCreep(spawnBody(Math.min(energyAvailable, 500), ['WORK', 'WORK'], ['CARRY', 'MOVE', 'MOVE', 'CARRY', 'CARRY', 'MOVE']),
                        newName,
                        {memory: {home: room.name, role: 'janitor', targetId: null, sourceId: null}});
                } else if (totalDefenders < Math.max(1, queues.hostileCreeps.length * 2) && energyFull) {
                    newName = 'Def ' + Game.time;
                    spawn.spawnCreep( spawnBody(Math.min(energyAvailable, 890), ['RANGED_ATTACK', 'RANGED_ATTACK'],
                                                                            ['MOVE', 'RANGED_ATTACK', 'CARRY', 'MOVE', 'MOVE', 'MOVE',
                                                                                       'MOVE', 'TOUGH', 'TOUGH', 'TOUGH', 'TOUGH', 'TOUGH', 'TOUGH', 'TOUGH',
                                                                                       'TOUGH', 'TOUGH', 'TOUGH', 'TOUGH', 'TOUGH', 'TOUGH', 'TOUGH', 'TOUGH',
                                                                                       'TOUGH', 'TOUGH'], ['TOUGH']),
                        newName,
                        { memory: { home: room.name, role: 'defender', hostileId: null, targetId: null, looting: false }});
                }
                if (totalHarvesters === 0 /*&& !energyFull*/) { // try to buy cheap harvester
                    newName = '!Har ' + Game.time;
                    spawn.spawnCreep([WORK, CARRY, MOVE],
                        newName,
                        { memory: { home: room.name, role: 'harvester', targetId: null, sourceId: null }});
                } else if (totalButlers === 0 /*&& !energyFull*/) { // try to buy cheap harvester
                    newName = '!But ' + Game.time;
                    spawn.spawnCreep([CARRY, MOVE],
                        newName,
                        { memory: { home: room.name, role: 'butler', targetId: null, sourceId: null }});
                }

                if (Game.flags['deployMCV'] && totalMCVs < 1 && energy >= 840) {
                    newName = 'MCV ' + Game.time;
                    spawn.spawnCreep([CLAIM, MOVE, MOVE, MOVE, MOVE, TOUGH, TOUGH, TOUGH, TOUGH],
                        newName,
                        { memory: { home: room.name, role: 'mcv', targetId: null }});
                }
            }

            let spawnsSpawning = room.find(FIND_MY_SPAWNS, { filter: (s) => s.spawning !== null });
            spawnsSpawning.map(spawnSp => {
                if (spawnSp.spawning) {
                    let spawningCreep = Game.creeps[spawnSp.spawning.name];
                    spawnSp.room.visual.text(
                        '🛠️' + spawningCreep.memory.role,
                        spawnSp.pos.x + 1,
                        spawnSp.pos.y,
                        {align: 'left', opacity: 0.8});
                }

            });

            roomUi.renderUI(room.name);
        }

        creeps.map(creep => {
            //
            if (creep.memory.role === 'harvester') {
                //if (!energyFull) {
                roleHarvester.run(creep);
                /*} else {
                    roleUpgrader.run(creep);
                }*/
            }
            if (creep.memory.role === 'upgrader') {
                roleUpgrader.run(creep);
            }
            if (creep.memory.role === 'builder') {
                roleBuilder.run(creep);
            }
            if (creep.memory.role === 'janitor') {
                roleJanitor.run(creep);
            }
            if (creep.memory.role === 'defender') {
                roleDefender.run(creep);
            }
            if (creep.memory.role === 'butler') {
                roleButler.run(creep);
            }
            if (creep.memory.role === 'mcv') {
                roleMCV.run(creep);
            }

            /*if (creep.pos) {
                roomQueues.feedCreepHeatmap(creep.pos.roomName, creep.pos.x, creep.pos.y);
            }*/
        });

        /*let creepHeatmap = roomQueues.getCreepHeatmap(room.name);
        Object.keys(creepHeatmap).map(cordKey => {
           // console.log(cordKey, JSON.stringify(creepHeatmap[cordKey]));
            if (creepHeatmap[cordKey] >= 10) {
                let cords = cordKey.split('_');
                room.visual.circle(new RoomPosition(cords[0], cords[1], room.name),
                    {fill: `rgb(${Math.min(255, Math.ceil(creepHeatmap[cordKey] / 10))}, ${Math.max(0, 255-Math.ceil(creepHeatmap[cordKey] / 2))}, 0)`,
                        opacity: Math.max(Math.min(5 / (0.1 * creepHeatmap[cordKey]), 0.2), 0.9),
                        radius: Math.min(creepHeatmap[cordKey] / 1000, 0.6), stroke: 'red'});
                //console.log('yes 10')
                if (creepHeatmap[cordKey] >= 15 && room.controller.level > 4) {
                    new RoomPosition(cords[0], cords[1], room.name).createConstructionSite(STRUCTURE_ROAD);
                }
            }

        });*/

        //console.log(JSON.stringify(roomQueues.getRoomQueue(room.name).creepHeatmap));
    }



    /*for(let name in Game.rooms) {
        let queues = roomQueues.getRoomQueue(name);*/
       /* for (let name in Game.creeps) {

            let creep = Game.creeps[name];
                //if (creep.room.name === name) {
                if (creep.memory.role === 'harvester') {
                    //if (!energyFull) {
                    roleHarvester.run(creep);
                    /!*} else {
                        roleUpgrader.run(creep);
                    }*!/
                }
                if (creep.memory.role === 'upgrader') {
                    roleUpgrader.run(creep);
                }
                if (creep.memory.role === 'builder') {
                    roleBuilder.run(creep);
                }
                if (creep.memory.role === 'janitor') {
                    roleJanitor.run(creep);
                }
                if (creep.memory.role === 'defender') {
                    roleDefender.run(creep);
                }
                if (creep.memory.role === 'butler') {
                    roleButler.run(creep);
                }
                if (creep.memory.role === 'mcv') {
                    roleMCV.run(creep);
                }
        }*/


};