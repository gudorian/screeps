const jobWorker = require('job.worker');

const roleJanitor = {

    /** @param {Creep} creep **/
    run: function (creep) {
        if (creep.memory.reparing && creep.carry.energy === 0) {
            creep.memory.reparing = false;
            creep.say('🔄 harvest');
        }
        if (!creep.memory.reparing && creep.carry.energy === creep.carryCapacity) {
            creep.memory.reparing = true;
            creep.say('🛠 repairing');
        }

        if (creep.memory.reparing) {
            creep.memory.sourceId = null;
            let target = Game.getObjectById(creep.memory.targetId);
            if (!target) {
                let assignedTargets = [];
                //console.log(builders);
                for (let name in Game.creeps) {
                    if (creep.memory.role === 'janitor' && Game.creeps[name].memory.targetId) {
                        assignedTargets.push(Game.creeps[name].memory.targetId);
                    }
                }
                let closestDamagedStructure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (structure) => structure.hits < Math.min(structure.hitsMax, 50000) //(structure.hits / structure.hitsMax) <= 0.6
                        && [STRUCTURE_ROAD, STRUCTURE_WALL].indexOf(structure.structureType) === -1
                        && assignedTargets.indexOf(structure.id) === -1
                });
                if (!closestDamagedStructure) {
                    closestDamagedStructure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                        filter: (structure) => structure.hits < Math.min(structure.hitsMax, 50000) //(structure.hits / structure.hitsMax) <= 0.8
                                            && assignedTargets.indexOf(structure.id) === -1
                    });
                }
                //console.log ('assigned targets', assignedTargets);

                /*target = creep.pos.findClosestByRange(FIND_MY_STRUCTURES, {
                    filter: (object) => {
                        let health = object.ticksToDecay !== undefined ? (object.hits / object.hitsMax) : 1;
                        //console.log('hits', object.hits, object.hitsMax, health);
                        console.log(object.structureType, health <= 0.6);
                        return assignedTargets.indexOf(object.id) === -1
                               && health <= 0.6;
                    }
                });*/
                //console.log('closestDamagedStructure', closestDamagedStructure);
                creep.memory.targetId = (closestDamagedStructure && closestDamagedStructure.id)
                                        ? closestDamagedStructure.id
                                        : null;
                //console.log('add new target with id', target.id);
            }

            if (target) {
                if (creep.repair(target) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#ff2144'}});
                } else {
                    creep.memory.targetId = null;
                }
            } else {
                //creep.say('Nothing to fix, run 🚧 build');
                //roleUpgrader.run(creep);
            }
        }
        else {
            //creep.memory.sourceId = null;
            creep.memory.targetId = null;
            jobWorker.jobCollectEnergy(creep);
            if (creep.memory.sourceId === null) {
                jobWorker.jobLootEnergy(creep);
            }

            /*let source = Game.getObjectById(creep.memory.sourceId);
            if (!source) {
                source = creep.pos.findClosestByPath(FIND_SOURCES);
                if (!source || source.id) {
                    source = creep.pos.findClosestByRange(FIND_SOURCES);
                }
                creep.memory.sourceId = source.id;
            }
            if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
            }*/
        }
    }
};

module.exports = roleJanitor;