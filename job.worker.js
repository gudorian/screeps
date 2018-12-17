const roomQueues = require('room.queues');

const jobHarvest = (creep) => {
    let energySites = roomQueues.getRoomQueue(creep.room.name).energySites;
    let source = Game.getObjectById(creep.memory.sourceId);
    let sources = Object.keys(energySites);
    if (!source) {
        /*source = creep.pos.findClosestByPath(FIND_SOURCES);
        if (!source || source.id) {
            source = creep.pos.findClosestByRange(FIND_SOURCES);
        }*/
        //console.log(JSON.stringify(sources));
        if (sources.length > 0) {
            source = Game.getObjectById(sources[0]);
            creep.memory.sourceId = (source && source.id) ? source.id : null;
            roomQueues.run(creep.room.name);
        }
    }
    let harvest = creep.harvest(source);
    if (source && harvest === ERR_NOT_IN_RANGE) {
        let moved = creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
        if (moved === ERR_NO_PATH) {
            source = null;
        }
    }
    if ([ERR_NOT_ENOUGH_RESOURCES, ERR_INVALID_TARGET].indexOf(harvest) !== -1) {
        creep.memory.sourceId = null;
    }
    if (!source) {
        if (sources.length > 1) {
            source = Game.getObjectById(sources[1]);
            creep.memory.sourceId = (source && source.id) ? source.id : null;
            roomQueues.run(creep.room.name);
            creep.say('Try Site2');
        } else {
            creep.say('Wait harvest spot ready');
        }
    }
};

const jobCollectEnergy = (creep) => {
    /*
        let energySites = roomQueues.getRoomQueue(creep.room.name).energySites;
    */
    let source = Game.getObjectById(creep.memory.sourceId);
    if (!source) {
        /*
                let sources = Object.keys(energySites);
        */
        source = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType === STRUCTURE_CONTAINER
                    || structure.structureType === STRUCTURE_STORAGE
                ) && _.sum(structure.store) > creep.carryCapacity;
            }
        });
        creep.memory.sourceId = (source && source.id) ? source.id : null;
        /*
        if (sources.length > 0) {
            source = creep.memory.sourceId =  Game.getObjectById(sources[0]);
            roomQueues.run(creep.room.name);
        }*/
    }
    let withdraw = creep.withdraw(source, RESOURCE_ENERGY);
    if (source && withdraw === ERR_NOT_IN_RANGE) {
        let moved = creep.moveTo(source, {visualizePathStyle: {stroke: '#dd44cf'}});
        if (moved === ERR_NO_PATH) {
            source = null;
        }
    }
    if ([ERR_NOT_ENOUGH_RESOURCES, ERR_FULL, ERR_INVALID_ARGS].indexOf(withdraw) !== -1) {
        creep.memory.sourceId = null;
    }
    if (!source) {
        creep.say('No 🔋 stored')
    }
};

const jobLootEnergy = (creep) => {
    let source = Game.getObjectById(creep.memory.sourceId);
    if (!source) {
        source = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
            filter: (structure) => {
                return (_.sum(structure.store) > 0);
            }
        });
        creep.memory.sourceId = (source && source.id) ? source.id : null;
    }
    let pickup = creep.pickup(source);
    if (source && pickup === ERR_NOT_IN_RANGE) {
        let moved = creep.moveTo(source, {visualizePathStyle: {stroke: '#dd44cf'}});
        if (moved === ERR_NO_PATH) {
            source = null;
        }
    }
    if ([ERR_NOT_ENOUGH_RESOURCES, ERR_FULL, ERR_INVALID_TARGET].indexOf(pickup) !== -1) {
        creep.memory.sourceId = null;
    }
    if (!source) {
        creep.say('No loot =(')
    }
};

const jobTransferToStorage = (creep) => {
    let target = Game.getObjectById(creep.memory.targetId);
    if (!target) {
        target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType === STRUCTURE_CONTAINER
                    || structure.structureType === STRUCTURE_STORAGE
                ) && _.sum(structure.store) < structure.storeCapacity;
            }
        });
        if (!target) {
            target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType === STRUCTURE_EXTENSION
                        || structure.structureType === STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity;
                }
            });
        }
        creep.memory.targetId = target && target.id ? target.id : null;
    }
    if (target) {
        if (creep.transfer(target, RESOURCES_ALL) === ERR_NOT_IN_RANGE) {
            let moved = creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
            if (moved === ERR_NO_PATH) {
                target = null;
            }
        }
    }
};

module.exports = {
    jobHarvest,
    jobCollectEnergy,
    jobLootEnergy,
};