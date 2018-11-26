const roleHarvester = {

    /** @param {Creep} creep **/
    run: function (creep) {
        if (creep.carry.energy < creep.carryCapacity) {
            creep.memory.targetId = null;
            let source = Game.getObjectById(creep.memory.sourceId);
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
            }
        }
        else {
            creep.memory.sourceId = null;
            let target = Game.getObjectById(creep.memory.targetId);
            if (!target) {
                target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType === STRUCTURE_EXTENSION ||
                            structure.structureType === STRUCTURE_SPAWN) && structure.energy < structure.energyCapacity;
                    }
                });
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
                if (creep.transfer(target, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
                    let moved = creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
                    if (moved === ERR_NO_PATH) {
                        target = null;
                    }
                }
            }
        }
    }
};

module.exports = roleHarvester;