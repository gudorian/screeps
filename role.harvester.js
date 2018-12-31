const jobWorker = require('job.worker');
/*const roomQueues = require('room.queues');

const jobHarvest = (creep) => {
    let energySites = roomQueues.getRoomQueue(creep.room.name).energySites;
    let source = Game.getObjectById(creep.memory.sourceId);
    if (!source) {
        let sources = Object.keys(energySites);
        /!*source = creep.pos.findClosestByPath(FIND_SOURCES);
        if (!source || source.id) {
            source = creep.pos.findClosestByRange(FIND_SOURCES);
        }*!/
        if (sources.length > 0) {
            source = Game.getObjectById(sources[0]);
            creep.memory.sourceId = source.id || null;
            roomQueues.run(creep.room.name);
        }
    }
    if (source && creep.harvest(source) === ERR_NOT_IN_RANGE) {
        let moved = creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
        if (moved === ERR_NO_PATH) {
            source = null;
        }
    }
    if (!source) {
        creep.say('Wait harvest spot ready')
    }
};*/

const roleHarvester = {

    /** @param {Creep} creep **/
    run: function (creep) {
        if (creep.carry.energy < creep.carryCapacity) {
            creep.memory.targetId = null;
            jobWorker.jobHarvest(creep);
            /*let source = Game.getObjectById(creep.memory.sourceId);
            if (!source) {
                source = creep.pos.findClosestByPath(FIND_SOURCES);
                if (!source || source.id) {
                    source = creep.pos.findClosestByRange(FIND_SOURCES);
                }
                creep.memory.sourceId = source.id;
            }
            if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                let moved = creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
                if (moved === ERR_NO_PATH) {
                    source = null;
                }
            }*/
        }
        else {
            creep.memory.sourceId = null;
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
                if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    let moved = creep.moveTo(target, {reusePath: 10, visualizePathStyle: {stroke: '#ffffff'}});
                    if (moved === ERR_NO_PATH) {
                        creep.memory.targetId = null;
                    }
                }
            }
        }
    }
};

module.exports = roleHarvester;