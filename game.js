//Set variables for number of rows, columns and number of dot colors
let ROWS = 8; // 1 to 8
let COLS = 8; // 1 to 8
let DOT_COLORS = 8; //(a number from 1 to 8)
let TIMER = 60; //in second
let DEBUG_MODE = false;

let config = {
    type: Phaser.AUTO,
    width: 580,
    height: 680,
    scene: [Scene_00, Scene_01, Scene_02]
};

let game = new Phaser.Game(config);