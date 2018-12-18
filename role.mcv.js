/*var Cache = require('Cache');
var CreepScout = function(creep, roomHandler) {
    this.cache = new Cache();
    this.creep = creep;
    this.roomHandler = roomHandler;
};

CreepScout.prototype.init = function() {
    this.remember('role', 'CreepScout');
    if(this.remember('role')) {
        this.remember('roomName', this.creep.room.name);
    }
    if(this.moveToNewRoom() == true) {
        return;
    }
    if(this.avoidEnemy()) {
        return;
    }
    this.act();
};

CreepScout.prototype.act = function() {
    this.conquer();
};

CreepScout.prototype.findController = function() {
    return this.creep.room.find(
        FIND_STRUCTURES,
        {
            filter: function(structure) {
                if(structure.structureType == STRUCTURE_CONTROLLER) {
                    return true;
                }

                return false;
            }
        }
    );
};

CreepScout.prototype.conquer = function() {
    var controller = this.findController();
    if(controller.length != 0) {
        controller = controller[0];
    }

    this.creep.moveTo(controller);
    this.creep.claimController(controller);
}*/

const roleMcv = {
    creep: null,
    targetRoom: null,

    run: (creep) => {
        //console.log(this);
        roleMcv.creep = creep;
        roleMcv.targetRoom = Game.flags['deployMCV'] ? Game.flags['deployMCV'].pos : null;
        if (roleMcv.creep && roleMcv.targetRoom) {
            if (roleMcv.creep.pos.roomName !== roleMcv.targetRoom.roomName) {
                roleMcv.moveToRoom();
            } else {
                roleMcv.conquer();
            }
        }
    },

    moveToRoom: () => {
        let targetPos = new RoomPosition(roleMcv.targetRoom.x, roleMcv.targetRoom.y, roleMcv.targetRoom.roomName);
        let result = roleMcv.creep.moveTo(targetPos);
        //console.log(`Result of creep.moveTo(new RoomPosition(${rallyTo.x}, ${rallyTo.y}, '${rallyTo.roomName}')): ${result}`);
        if (result === -2) {
            const path = creep.room.findPath(creep.pos, targetPos );
            //console.log(`Path result was: ${JSON.stringify(path)}`);
        }
    },

    findController: () => {
        return roleMcv.creep.room.find(
            FIND_STRUCTURES,
            {
                filter: function(structure) {
                    if (structure.structureType === STRUCTURE_CONTROLLER) {
                        return true;
                    }

                    return false;
                }
            }
        );
    },

    conquer: () => {
        let controller = roleMcv.findController();
        if (controller.length !== 0) {
            controller = controller[0];
        }

        roleMcv.creep.moveTo(controller);
        roleMcv.creep.claimController(controller);
    }
};

module.exports = roleMcv;