const jobWorker = require('job.worker');
const roleUpgrader = require('role.upgrader');

const roleBuilder = {
    creep: null,
    targetRoom: null,

    moveToRoom: () => {
        let targetPos = new RoomPosition(roleBuilder.targetRoom.x, roleBuilder.targetRoom.y, roleBuilder.targetRoom.roomName);
        let result = roleBuilder.creep.moveTo(targetPos);
        //console.log(`Result of creep.moveTo(new RoomPosition(${rallyTo.x}, ${rallyTo.y}, '${rallyTo.roomName}')): ${result}`);
        if (result === -2) {
            //const path = roleBuilder.creep.room.findPath(roleBuilder.creep.pos, targetPos );
            //console.log(`Path result was: ${JSON.stringify(path)}`);
        }
    },

    /** @param {Creep} creep **/
    run: function (creep) {
        roleBuilder.creep = creep;
        roleBuilder.targetRoom = Game.flags['sendBuilders'] ? Game.flags['sendBuilders'].pos : null;
        if (roleBuilder.targetRoom && creep.carry.energy === creep.carryCapacity && roleBuilder.targetRoom.roomName !== creep.pos.roomName) {
            roleBuilder.moveToRoom();
        } else {
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
                        filter: (object) => assignedTargets.indexOf(object.id) <= 3
                    });

                    /*if (!target) {
                        for (let n in Game.rooms) {
                            let room = Game.rooms[n];
                            target = room.find(FIND_CONSTRUCTION_SITES, {
                                filter: (object) => assignedTargets.indexOf(object.id) === -1
                            });
                            if (target) { break; }
                        }
                    }*/

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
            } else {
                //creep.memory.targetId = null;
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
                    creep.moveTo(source, {visualizePathStyle: {stroke: '#ffaa00'}});
                }*/
            }
        }
    }
};

module.exports = roleBuilder;