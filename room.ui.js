let roomVisuals = [];

const ui = {

    clear: () => {
        roomVisuals = [];
    },
    appendText: (text, color = 'green', font = 0.8) => {
        roomVisuals.push((x, y) => {
            new RoomVisual('W1N4').text(text, x, y, {color: color, font: font, align: 'left'});
        })
    },
    renderUI: (x = 2, y = 2) => {
        roomVisuals.map(item => {
            item(x, y);
            y += 1;
        });
    },

};



module.exports = ui;