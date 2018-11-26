const roleHarvester = require('role.harvester');
const roleUpgrader = require('role.upgrader');
const roleBuilder = require('role.builder');
const roleJanitor = require('role.janitor');

const roomUi = require('room.ui');

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

    console.log('creepBody', creepBody, 'costs', bodyCost);

    return creepBody;
};

const canAffordBodyPart = (type, maxCost) => {
    //console.log(type, 'costs', Dict.creepBodyPartsCost[type].cost, 'with budget of', maxCost);
    return Dict.creepBodyPartsCost[type].cost <= maxCost;
};


module.exports.loop = function () {
    roomUi.clear();
    for (let name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
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

    for(let name in Game.rooms) {
        energy          = Game.rooms[name].energyAvailable;
        energyAvailable = Game.rooms[name].energyCapacityAvailable;

        let towers = Game.rooms[name].find(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType === STRUCTURE_TOWER
        });
        //let tower = Game.getObjectById('93549b96cb0e2b0722da8de0');
        towers.map(tower => {
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
            }
        });
    }

    //let harvesters = _.filter(Game.creeps, (creep) => creep.memory.role === 'harvester');
    let totalHarvesters = _.sum(Game.creeps, (c) => c.memory.role === 'harvester'); // Alt
    let upgraders = _.filter(Game.creeps, (creep) => creep.memory.role === 'upgrader');
    let builders = _.filter(Game.creeps, (creep) => creep.memory.role === 'builder');
    let totalJanitors = _.sum(Game.creeps, (c) => c.memory.role === 'janitor'); // Alt


    roomUi.appendText('🔋 ' + energy + ' / ' + energyAvailable, 'yellow');
    roomUi.appendText('Harvesters: ' + totalHarvesters);
    roomUi.appendText('Upgraders: ' + upgraders.length);
    roomUi.appendText('Builders: ' + builders.length);
    roomUi.appendText('Janitors: ' + totalJanitors);


    let energyFull = energy === energyAvailable;
    let newName = 'Unknown' + Game.time;
    if (totalHarvesters < 2 && energyFull) {
        newName = 'Har ' + Game.time;
        Game.spawns['Spawn1'].spawnCreep( spawnBody(energyAvailable, ['WORK', 'WORK'], ['CARRY', 'MOVE', 'MOVE']),
            newName,
            { memory: { role: 'harvester', targetId: null, sourceId: null }});
    } else if (upgraders.length < 3 && energyFull) {
        newName = 'Upg ' + Game.time;
        Game.spawns['Spawn1'].spawnCreep( spawnBody(energyAvailable, ['WORK', 'WORK'], ['CARRY', 'MOVE', 'CARRY', 'CARRY']),
            newName,
            { memory: { role: 'upgrader', sourceId: null }});
    } else if (builders.length < 3 && energyFull) {
        newName = 'Bld ' + Game.time;
        Game.spawns['Spawn1'].spawnCreep( spawnBody(energyAvailable, ['WORK', 'WORK'], ['CARRY', 'MOVE', 'CARRY']),
            newName,
            { memory: { role: 'builder', targetId: null, sourceId: null }});
    } else if (totalJanitors < 1 && energyFull) {
        newName = 'Jan ' + Game.time;
        Game.spawns['Spawn1'].spawnCreep( spawnBody(energyAvailable, ['WORK', 'WORK'], ['CARRY', 'MOVE', 'MOVE']),
            newName,
            { memory: { role: 'janitor', targetId: null, sourceId: null }});
    } else if (totalHarvesters === 0 && !energyFull) { // try to buy cheap harvester
        newName = 'Har ' + Game.time;
        Game.spawns['Spawn1'].spawnCreep([WORK, CARRY, MOVE],
            newName,
            { memory: { role: 'harvester', targetId: null, sourceId: null }});
    } /*else {
        console.log(spawnBody());
    }*/

    if (Game.spawns['Spawn1'].spawning) {
        let spawningCreep = Game.creeps[Game.spawns['Spawn1'].spawning.name];
        Game.spawns['Spawn1'].room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            Game.spawns['Spawn1'].pos.x + 1,
            Game.spawns['Spawn1'].pos.y,
            {align: 'left', opacity: 0.8});
    }

    for (let name in Game.creeps) {
        let creep = Game.creeps[name];
        if (creep.memory.role === 'harvester') {
            if (!energyFull) {
                roleHarvester.run(creep);
            } else {
                roleUpgrader.run(creep);
            }
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
    }

    roomUi.renderUI();
};