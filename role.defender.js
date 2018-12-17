const findHostileTarget = (creep) => {
    let closestHostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
    if (closestHostile) {
        creep.rangedAttack(closestHostile);
    }
};

const roleDefender = {

    /** @param {Creep} creep **/
    run: function (creep) {
        let hostile = Game.getObjectById(creep.memory.hostileId);

        if (!hostile) {
            //creep.memory.hostileId = null;
            hostile = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS);
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
                creep.say('Killed it!?')
            }
            if (rangedAttack === OK) {
                creep.say('Zap zap!')
            }
        }

        if (!creep.memory.hostileId) {
            let rallyTo = Game.flags['RallyTo'] ? Game.flags['RallyTo'].pos : null;
            if (rallyTo) {
                let targetPos = new RoomPosition(rallyTo.x, rallyTo.y, rallyTo.roomName);
                let result = creep.moveTo(targetPos);
                console.log(`Result of creep.moveTo(new RoomPosition(${rallyTo.x}, ${rallyTo.y}, '${rallyTo.roomName}')): ${result}`);
                if (result === -2) {
                    const path = creep.room.findPath(creep.pos, targetPos );
                    console.log(`Path result was: ${JSON.stringify(path)}`);
                }
            }
            /*let rallyTo = Game.flags['RallyTo'] ? Game.flags['RallyTo'].pos : null;
            if (creep.memory['explored'] === undefined) {
                creep.memory['explored'] = 0;
            }

            console.log(rallyTo, creep.room.name, creep.pos);
            //console.log(JSON.stringify(rallyTo));

            //creep.moveTo(Game.flags['Flag1']);
            if (rallyTo && creep.memory['explored'] < 1) {
                let move = creep.moveTo(rallyTo, {visualizePathStyle: {stroke: 'orange'}, reusePath: 10 });
                console.log(move);
                creep.say('Exploring')
                if (move === ERR_NO_PATH) {
                    creep.say('NO PATH!');
                    creep.moveTo(rallyTo.x, rallyTo.y);
                    creep.memory['explored'] = creep.memory['explored'] + 1;
                }

            } else {
                creep.say('Chilling');
                creep.memory['explored'] = 0;
                //creep.move(RIGHT);
                //creep.moveTo(Game.flags['Flag2']);
            }*/
        }
    }
};

module.exports = roleDefender;