let roomVisuals = [];

const ui = {

    clear: () => {
        roomVisuals = [];
    },

    appendText: (text, color = 'green', font = 0.8) => {
        roomVisuals.push((x, y, roomName = 'W7N3') => {
            new RoomVisual(roomName).text(text, x, y, {color: color, font: font, align: 'left'});
        })
    },

    /*appendCircle: (x, y, fill = 'white', radius = 2.15) => {
        new RoomVisual('W7N3').circle(5, 5,
            {fill: fill, radius: radius, stroke: 'red'});
    },*/

    renderUI: (roomName = 'W7N3', x = 2, y = 2) => {
        roomVisuals.map(item => {
            item(x, y, roomName);
            y += 1;
        });
        let uiSize = Math.round((Game.rooms[roomName].visual.getSize() / 512000) * 10000) / 100;
        //let redColor = uiSize.mapRange(0, 100, 0, 255);


        new RoomVisual(roomName).text(`UI size: ${uiSize} %`, x, y - 0.2, {color: `rgb(${5}, 255, 255`, font: 0.5, align: 'left'});
    },

};



module.exports = ui;