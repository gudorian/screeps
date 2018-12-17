let roomVisuals = [];

const ui = {

    clear: () => {
        roomVisuals = [];
    },

    appendText: (text, color = 'green', font = 0.8) => {
        roomVisuals.push((x, y) => {
            new RoomVisual('W7N3').text(text, x, y, {color: color, font: font, align: 'left'});
        })
    },

    /*appendCircle: (x, y, fill = 'white', radius = 2.15) => {
        new RoomVisual('W7N3').circle(5, 5,
            {fill: fill, radius: radius, stroke: 'red'});
    },*/

    renderUI: (x = 2, y = 2) => {
        roomVisuals.map(item => {
            item(x, y);
            y += 1;
        });
    },

};



module.exports = ui;