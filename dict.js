const creepBodyPartsCost = {
    MOVE: {
        type: MOVE,
        cost: 50,
    },
    WORK: {
        type: WORK,
        cost: 100,
    },
    CARRY: {
        type: CARRY,
        cost: 50,
    },
    ATTACK: {
        type: ATTACK,
        cost: 80,
    },
    RANGED_ATTACK: {
        type: RANGED_ATTACK,
        cost: 150,
    },
    HEAL: {
        type: HEAL,
        cost: 250,
    },
    CLAIM: {
        type: CLAIM,
        cost: 600,
    },
    TOUGH: {
        type: TOUGH,
        cost: 10,
    },
};

const dictionary = {
    creepBodyPartsCost: creepBodyPartsCost,

};

module.exports = dictionary;