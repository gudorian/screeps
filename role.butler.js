const jobWorker = require('job.worker');

const roleButler = {

    /** @param {Creep} creep **/
    run: function (creep) {
        if (creep.carry.energy < creep.carryCapacity) {
            creep.memory.targetId = null;
            jobWorker.jobCollectEnergy(creep);
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
                /*target = creep.pos.findClosestByPath(FIND_TOMBSTONES, {
                    filter: (structure) => {
                        return (_.sum(structure.store) > 0);
                    }
                });
                if (!target) {
                    target = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, /!*{
                        filter: (structure) => {
                            return (_.sum(structure.store) > 0);
                        }
                    }*!/);
                }*/
                //if (!target) {
                target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType === STRUCTURE_EXTENSION
                            || structure.structureType === STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity;
                    }
                });
               // }
                if (!target) {
                    target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                        filter: (structure) => {
                            return (structure.structureType === STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
                        }
                    });
                }
                creep.memory.targetId = target && target.id ? target.id : null;
            }
            if (target) {
                let transfer = creep.transfer(target, RESOURCE_ENERGY);
                if (transfer === ERR_NOT_IN_RANGE) {
                    let moved = creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                    if (moved === ERR_NO_PATH) {
                        target = null;
                    }
                }
                if ([ERR_FULL, ERR_INVALID_ARGS, ERR_INVALID_TARGET, ERR_NOT_ENOUGH_RESOURCES].indexOf(transfer)) {
                    creep.memory.targetId = null;
                }
            }
        }
    }
};

module.exports = roleButler;