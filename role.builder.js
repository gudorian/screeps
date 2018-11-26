const roleUpgrader = require('role.upgrader');

const roleBuilder = {

    /** @param {Creep} creep **/
    run: function (creep) {

        if (creep.memory.building && creep.carry.energy === 0) {
            creep.memory.building = false;
            creep.say('🔄 harvest');
        }
        if (!creep.memory.building && creep.carry.energy === creep.carryCapacity) {
            creep.memory.building = true;
            creep.say('🚧 build');
        }

        if (creep.memory.building) {
            creep.memory.sourceId = null;
            let target = Game.getObjectById(creep.memory.targetId);
            if (!target) {
                let assignedTargets = [];
                //console.log(builders);
                for (let name in Game.creeps) {
                    if (creep.memory.role === 'builder' && Game.creeps[name].memory.targetId) {
                        assignedTargets.push(Game.creeps[name].memory.targetId);
                    }
                }
                //console.log ('assigned targets', assignedTargets);

                target = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES, {
                    filter: (object) => assignedTargets.indexOf(object.id) === -1
                });
                creep.memory.targetId = target && target.id ? target.id : null;
                //console.log('add new target with id', target.id);
            }

            if (target) {
                if (creep.build(target) === ERR_NOT_IN_RANGE) {
                    creep.moveTo(target, {visualizePathStyle: {stroke: '#44ffff'}});
                }
            } else {
                creep.say('Nothing to build, run ⚡ upgrade');
                roleUpgrader.run(creep);
            }
        }
        else {
            //creep.memory.targetId = null;
            let source = Game.getObjectById(creep.memory.sourceId);
            if (!source) {
                source = creep.pos.findClosestByPath(FIND_SOURCES);
                if (!source || source.id) {
                    source = creep.pos.findClosestByRange(FIND_SOURCES);
                }
                creep.memory.sourceId = source.id;
            }
            if (creep.harvest(source) === ERR_NOT_IN_RANGE) {
                creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
    }
};

module.exports = roleBuilder;