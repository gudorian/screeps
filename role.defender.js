const findHostileTarget = (creep) => {
    let closestHostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (closestHostile) {
        creep.rangedAttack(closestHostile);
    }
};

const jobLoot = (creep) => {
    let target = Game.getObjectById(creep.memory.targetId);
    if (!target) {
        target = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES);
        if (!target) {
            target = creep.pos.findClosestByPath(FIND_TOMBSTONES);
        }
        creep.memory.targetId = (target && target.id) ? target.id : null;
        //console.log(creep.memory.targetId);
    }

    if (target && _.sum(creep.carry) < creep.carryCapacity) {
        console.log('loot');
        creep.memory['looting'] = true;
        let pickup = creep.pickup(target);
        console.log(pickup);
        if (pickup === ERR_NOT_IN_RANGE) {
            let moved = creep.moveTo(target, {visualizePathStyle: {stroke: 'blue'}});
            creep.say('Fetch loot!');
            if (moved === ERR_NO_PATH) {
                creep.memory.targetId = null;
            }
        } else if (pickup === ERR_INVALID_TARGET) {
            let withdraw = creep.withdraw(target, RESOURCE_ENERGY);
            if (withdraw === ERR_NOT_IN_RANGE) {
                let moved = creep.moveTo(target, {visualizePathStyle: {stroke: 'teal'}});
                creep.say('Go loot!');
                if (moved === ERR_NO_PATH) {
                    creep.memory.targetId = null;
                }
            } else if (withdraw === ERR_INVALID_TARGET) {
                creep.memory.targetId = null;
            }
        } else {
            creep.memory.targetId = null;
        }
    } else {
        creep.memory.looting = false;
    }
};

const jobDeposit = (creep) => {
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
            let moved = creep.moveTo(target, {visualizePathStyle: {stroke: 'lime'}});
            if (moved === ERR_NO_PATH) {
                creep.memory.targetId = null;
            }
        }
    }
};

const roleDefender = {

    /** @param {Creep} creep **/
    run: (creep) => {
        let rallyTo = Game.flags['RallyTo'] ? Game.flags['RallyTo'].pos : null;
        let hostile = Game.getObjectById(creep.memory.hostileId);

        if (!hostile) {
            //creep.memory.hostileId = null;
            hostile = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
            if (!hostile) {
                hostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            }
            creep.memory.hostileId = (hostile && hostile.id) ? hostile.id : null;
        } else {
            let rangedAttack = creep.rangedAttack(hostile);
            if (rangedAttack === ERR_NOT_IN_RANGE) {
                let moved = creep.moveTo(hostile, {visualizePathStyle: {stroke: 'red'}});
                creep.say('Moving!');
                if (moved === ERR_NO_PATH) {
                    creep.memory.hostileId = null;
                }
            }
            if ([ERR_INVALID_TARGET, ERR_BUSY, ERR_NO_BODYPART].indexOf(rangedAttack) !== -1) {
                creep.memory.hostileId = null;
                creep.say('Killed it?')
            }
            if (rangedAttack === OK) {
                creep.say('Zap zap!');
            }
        }

        if (!hostile && !creep.memory.hostileId) {
            if (_.sum(creep.carry) === creep.carryCapacity) {
                creep.memory.targetId = null;
            }
            if (creep.memory['looting'] || (!creep.memory.targetId && _.sum(creep.carry) <= 0)) {
                jobLoot(creep);
            }
            else if (!creep.memory['looting'] && _.sum(creep.carry) > 0) {
                jobDeposit(creep);
            }
            else if (rallyTo) {
                creep.memory.targetId = null;
                let targetPos = new RoomPosition(rallyTo.x, rallyTo.y, rallyTo.roomName);
                let result = creep.moveTo(targetPos);
                //console.log(`Result of creep.moveTo(new RoomPosition(${rallyTo.x}, ${rallyTo.y}, '${rallyTo.roomName}')): ${result}`);
                if (result === -2) {
                    //const path = creep.room.findPath(creep.pos, targetPos );
                    //console.log(`Path result was: ${JSON.stringify(path)}`);
                }
            } else {
                creep.memory.targetId = null;
            }
        }
    }
};

module.exports = roleDefender;