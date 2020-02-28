/** Scene 01: In-game **/

//Object to keep track of index position of each Dot
function BoardIndex(i, j) {
    this.i = i;
    this.j = j;
}

class Scene_01 extends  Phaser.Scene {

    //Class methods
    constructor() {
        super({key: "Scene_01"});
    }

    preload() {
        //load sprites
        this.load.image('hex', 'assets/dots.png');
        //load audio
        this.load.audio('collect', 'assets/audio/audio_00.wav');
        this.load.audio('collect_loop', 'assets/audio/audio_01.wav');
    }

    create() {
        this.initData();
        this.cameras.main.setBackgroundColor('#17202A');

        //Set the size and position of game board
        this.boardWidth = this.boardData[0].length * this.DotWidth + this.DotWidth * 0.5;
        this.boardHeight = this.boardData.length * this.DotHeight / 2 + (this.boardData.length + 1) * this.DotHeight / 4;
        this.boardPosX = (config.width - this.boardWidth)/2; //anchor: top-left
        this.boardPosY = (config.height - this.boardHeight)/2; //anchor: top-left

        //Set the timer
        this.setTimer();

        //Initialize the game board
        this.boardInit(this);

        //Mouse inputs
        this.mouseOnPointerDown();
        this.mouseOnPointerUp();

        //Display texts
        this.displayTexts();

        //Debug Mode Switch (Press D to turn on or off debug mode)
        this.input.keyboard.on('keyup_D', function(event) {
            DEBUG_MODE = !DEBUG_MODE;
            this.mouseText.setVisible(DEBUG_MODE);
            this.dotPositionText.setVisible(DEBUG_MODE);
            this.selectListText.setVisible(DEBUG_MODE);
        }, this);

        //Fade in
        this.rectFrame = this.add.rectangle(0,0,config.width, config.height, 0x17202A, 1);
        this.rectFrame.setOrigin(0,0);
        this.sceneState = 0;
    }

    update() {
        // Check if some positions in the game board are empty and fill them with new dots
        if (this.needRefill) {
            this.refillBoard(this);
        }
        //Time is up. Move to next scene
        if (this.timer <= 0) {
            this.scene.start("Scene_02", {score : this.score});
        }
        //Animation when dots are removed
        if (this.clearDots) {
            this.removeDots();
        }

        //Fade in
        if (this.sceneState === 0) {
            this.rectFrame.setAlpha(this.rectFrame.alpha - 0.02);
            if (this.rectFrame.alpha === 0) {
                this.sceneState++;
            }
        }
    }

    boardInit(game) {
        this.gameBoard=game.add.group(); //keep track of all the dots in the board
        this.selectedDots = game.add.group(); //Keep track of the dots selected by player

        this.sketchGameBoard(game); //Sketch the initial game board
        this.dotInputs(game); //How each individual dot reacts to input

    }

    //Initialize data
    initData() {
        this.clearDots = false;
        this.DotWidth=52;//for horizontal
        this.DotHeight=61;//this is for horizontal
        this.selectedIndices = [];
        //Initialize the board with the corresponding size
        //Restrict the number of rows and columns between 1 and 8
        if (ROWS < 1) ROWS = 1;
        else if (ROWS > 8) ROWS = 8;
        if (COLS < 1) COLS = 1;
        else if (COLS > 8)  COLS = 8;

        this.boardData = new Array(ROWS);
        for (let i = 0; i < this.boardData.length; i++) {
            this.boardData[i] = new Array(COLS);
        }

        //Set color range
        //Restrict the number of colors between 1 and 8
        if (DOT_COLORS < 1) DOT_COLORS = 1;
        else if (DOT_COLORS > 8) DOT_COLORS = 8;
        this.colorPool = [];
        for (let i = 0; i < 8; i++) {
            this.colorPool.push(i);
        }
        for (let i =0; i < 8 - DOT_COLORS; i++) {
            this.colorPool.sort();
            this.colorPool.pop();
        }
        this.selectedColor = -1;

        this.mouseIsDown = false;
        this.needRefill = false;

        this.lastPosition = {x : -1, y: -1};

        this.score = 0;
        this.fillDelay = true;
        this.timer = TIMER;
        if (this.timer < 0) this.timer = 1;
        else if (this.timer > 3599) this.timer = 3599;
        this.isLoop = false;
    }
    sketchGameBoard(game) {
        let hOffset = this.DotWidth;
        let vOffset = this.DotHeight * 3/4;
        let xIniPos = this.boardPosX + this.DotWidth*0.5;
        let yIniPos = this.boardPosY + this.DotHeight*0.5;
        let xPos;
        let yPos;

        //Loop to assign colored dots to every gameboard position
        for (let i = 0; i < this.boardData.length; i++) {
            if (i % 2 === 0) {
                xPos = xIniPos + this.DotWidth*0.5;
            } else {
                xPos = xIniPos;
            }
            yPos = yIniPos + (i * vOffset);
            for (let j = 0; j < this.boardData[i].length; j++) {
                if (this.boardData[i][j] !== -1) {
                    //Pick a random color from color pool
                    this.boardData[i][j] = this.colorPool[Phaser.Math.RND.integerInRange(0,DOT_COLORS-1)];
                    let hexColor =  this.boardData[i][j];

                    //create tile
                    let hexagon = game.add.image(xPos, yPos, 'hex').setInteractive();
                    hexagon.boardIndex = new BoardIndex(i, j);
                    //set tile color
                    hexagon = this.setTileColor(hexagon, hexColor);
                    this.gameBoard.add(hexagon);

                }
                xPos += hOffset;
            }
        }
    }
    //dots removed animation
    removeDots() {
        this.selectedDots.children.iterate(function (child) {
            child.setAlpha(child.alpha-0.05);
            child.setY(child.y-1);
        }, this);
        if (this.selectedDots.getChildren()[0].alpha <= 0) {
            this.clearDots = false;
            this.selectedDots.clear(true,true);
        }
    }
    //Mouse input functions
    mouseOnPointerDown() {
        this.input.on('pointerdown', function(pointer){
            this.mouseIsDown = true;
            this.mouseText.setText('mouse: ' + this.mouseIsDown);
        }, this);

    }
    mouseOnPointerUp() {
        this.input.on('pointerup', function(pointer){
            this.mouseIsDown = !this.mouseIsDown;
            this.lastPosition.x = -1;
            this.lastPosition.y = -1;
            //When more than one dots of the same color are the selected
            if (this.selectedIndices.length > 1) {
                this.clearDots = true;
                this.selectedDots.children.iterate(function (child) {
                    child.setAlpha(1);
                }, this);
                //Check if we have a loop
                if (this.isLoop) {
                    let color = this.boardData[this.selectedIndices[0].i][this.selectedIndices[0].j];
                    for (let i = 0; i < this.boardData.length; i++) {
                        for (let j = 0; j < this.boardData[i].length; j++) {
                            if (this.boardData[i][j] === color) {
                                this.score++;
                                this.boardData[i][j] = -1;
                            }
                        }
                    }
                    this.cameras.main.setBackgroundColor(this.selectedColor);
                    this.time.delayedCall(200, function (game) {
                        game.cameras.main.setBackgroundColor('#17202A');
                    }, [this], this);
                    this.sound.play('collect_loop');
                } else { //If not loop, collect the selected dots
                    for (let i = 0; i < this.selectedIndices.length; i++) {
                        this.boardData[this.selectedIndices[i].i][this.selectedIndices[i].j] = -1;
                    }
                    //Calculate score
                    this.score += this.selectedIndices.length;
                }

                //Update the colors of the dots on the board based on the updated board data
                this.gameBoard.children.iterate(function (child) {
                    child = this.setTileColor(child, this.boardData[child.boardIndex.i][child.boardIndex.j]);
                }, this);
                this.needRefill = true;

                //Display new score
                this.scoreText.setText('Score: ' + this.score);
                this.sound.play('collect');

            }
            //Clear selected dots
            this.selectedIndices = [];
            if (!this.clearDots) this.selectedDots.clear(true,true);
            this.isLoop = false;
            this.graphics.clear();

            //Update info for debugging
            this.mouseText.setText('mouse: ' + this.mouseIsDown);
            this.selectListText.setText('Size: ' + this.selectedIndices.length);
        }, this);
    }

    //Dots input functions
    dotInputs(game) {
        let hexagon;
        this.graphics = game.add.graphics();

        //Iterate through all dots to check for input
        this.gameBoard.children.iterate(function(child){
            //Add the dot that the pointer goes over to the selected-dots list only if the list if empty
            // or the dot has the same color as the ones already in the list
            child.on('pointerover', function(pointer){
                hexagon = game.add.image(child.x, child.y, 'hex');
                hexagon.setTint(0xffffffff).setAlpha(0.2);
                this.dotPositionText.setText('i: ' + child.boardIndex.i + ' j: ' + child.boardIndex.j);
                if (this.mouseIsDown && !this.isLoop) {
                    let lastColor = -1;
                    let isNeighbor = false;
                    let selLength =  this.selectedIndices.length;

                    if (selLength > 0) {
                        let indexI = this.selectedIndices[selLength - 1].i;
                        let indexJ = this.selectedIndices[selLength - 1].j;

                        let iDiff = Math.abs(indexI - child.boardIndex.i);
                        if (iDiff === 0) {
                            if (Math.abs(indexJ - child.boardIndex.j) === 1) {
                                isNeighbor = true;
                            }
                        } else if (iDiff === 1) {
                            let jDiff = indexJ - child.boardIndex.j;
                            if (indexI % 2 !== 0) {
                                if ((jDiff === 0 || jDiff === 1)) isNeighbor = true;
                            } else {
                                if ((jDiff === 0 || jDiff === -1)) isNeighbor = true;
                            }
                        }

                        lastColor = this.boardData[indexI][indexJ];
                    }
                    let currentColor = this.boardData[child.boardIndex.i][child.boardIndex.j];
                    if (lastColor === -1 || (isNeighbor && lastColor === currentColor)) {
                        let dotFound = false;
                        this.isLoop = false;
                        for (let i = 0; i < this.selectedIndices.length; i++) {
                            if ((child.boardIndex.i === this.selectedIndices[i].i) &&
                                (child.boardIndex.j === this.selectedIndices[i].j)) {
                                if (i === 0 && selLength > 3) {
                                    this.isLoop = true;
                                }
                                dotFound = true;
                                break;
                            }
                        }
                        if (!dotFound || this.isLoop) {
                            if (this.lastPosition.x !== -1 && this.lastPosition.y !== -1) {
                                this.graphics.lineStyle(3, 0xffffff);
                                this.graphics.strokeLineShape(new Phaser.Geom.Line(this.lastPosition.x,this.lastPosition.y,child.x,child.y));
                            }
                            this.lastPosition.x = child.x;
                            this.lastPosition.y = child.y;
                            this.graphics.fillStyle(0xffffff);
                            this.graphics.fillCircle(child.x, child.y, 5);
                            this.selectedIndices.push(new BoardIndex(child.boardIndex.i, child.boardIndex.j));
                            this.selectedDots.add(game.add.image(child.x, child.y, 'hex').setTint(0xffffffff).setAlpha(0.2));
                            this.selectListText.setText('Size: ' + this.selectedDots.getLength());
                        }
                    }

                }
            }, this);

            //Remove focus effect when pointer is out of the dot
            child.on('pointerout', function(pointer) {
                if (this.mouseIsDown && this.selectedDots.getLength() === 0) {
                    this.selectedDots.add(game.add.image(child.x, child.y, 'hex').setTint(0xffffffff).setAlpha(0.2));
                }
                this.dotPositionText.setText('i: 0 j: 0 ');
                hexagon.destroy();
            }, this);

            //When a dot is touch, or mouse-click, add it to the selected-dots list
            child.on('pointerdown', function(pointer) {
                this.selectedColor = child.dotColor;
                this.selectedIndices = [];
                this.selectedIndices.push(new BoardIndex(child.boardIndex.i, child.boardIndex.j));
                this.lastPosition.x = child.x;
                this.lastPosition.y = child.y;
                this.graphics.fillStyle(0xffffff);
                this.graphics.fillCircle(child.x, child.y, 5);
                this.selectListText.setText('Size: ' + this.selectedIndices.length);
            }, this);
        }, this);
    }

    //Timer functions
    setTimer() {
        //Timer
        let minute = Math.floor(this.timer/60);
        if (minute < 10) minute = '0' + minute;
        let second = this.timer%60;
        if (second < 10) second = '0' + second;

        this.timerText = this.add.text(config.width/2, this.boardPosY - 40, minute + ':' + second,
            {fontSize: '32px', fill: '#fff', fontStyle: 'bold'});
        this.timerText.setOrigin(0.5,1);
        this.time.addEvent({
            delay: 1000,
            callback: this.updateTimer,
            args: [this],
            loop: true
        }, this);
    }
    updateTimer(scene) {
        if (scene.timer > 0) {
            scene.timer -= 1;
        }
        let minute = Math.floor(scene.timer/60);
        if (minute < 10) minute = '0' + minute;
        let second = scene.timer%60;
        if (second < 10) second = '0' + second;
        if (scene.timer <= 10) {
            if (scene.timer % 2 === 0)
             scene.timerText.setColor('#d92121');
        }

        scene.timerText.setText(minute + ':' + second);

    }

    //Utilities functions
    refillBoard(game) {
        if (this.fillDelay) game.time.delayedCall(150, function (scene) {
            scene.fillDelay = false;
        },[this]);
        else {
            this.fillDelay = true;
            let filled = true;
            for (let i = this.boardData.length - 1; i >= 0; i--) {
                for (let j = this.boardData[i].length - 1; j >= 0; j--) {
                    if (this.boardData[i][j] === -1) {
                        filled = false;
                        if (i > 0) {
                            this.boardData[i][j] = this.boardData[i - 1][j];
                            this.boardData[i - 1][j] = -1;
                        } else {
                            this.boardData[i][j] = this.colorPool[Phaser.Math.RND.integerInRange(0,DOT_COLORS-1)];
                        }
                    }
                }
            }
            this.gameBoard.children.iterate(function (child) {
                child = this.setTileColor(child, this.boardData[child.boardIndex.i][child.boardIndex.j]);
            }, this);
            if (filled) this.needRefill = false;
        }
    } //Assign new dots to empty position in the board
    setTileColor(hexagon, hexValue) {
        hexagon.setAlpha(1);
        switch(hexValue) {
            case -1:
                hexagon.setAlpha(0);
                break;
            case 0:
                hexagon.dotColor = 0xd92121;
                break;
            case 1:
                hexagon.dotColor = 0x2A3268;
                break;
            case 2:
                hexagon.dotColor = 0xffa500;
                break;
            case 3:
                hexagon.dotColor = 0x008000;
                break;
            case 4:
                hexagon.dotColor = 0x008080; //Teal
                break;
            case 5:
                hexagon.dotColor = 0xe24c00; //Orange
                break;
            case 6:
                hexagon.dotColor = 0xffc0cb; //Pink
                break;
            case 7:
                hexagon.dotColor = 0x6a0dad; //Violet
                break;
        }
        hexagon.setTint(hexagon.dotColor);
        return hexagon;
    } //Set dot's color based on its value from boardData array
    displayTexts() {
        //Display Score
        this.scoreText = this.add.text(config.width/2, this.boardPosY + this.boardHeight + 40, 'Score: ' + this.score,
            {fontSize: '32px', fill: '#fff', fontStyle: 'bold'});
        this.scoreText.setOrigin(0.5, 0);

        //Debug texts
        this.mouseText = this.add.text(16, 20, 'mouse: ' + this.mouseIsDown, {fontSize: '20px', fill: '#fff'});
        this.mouseText.setVisible(DEBUG_MODE);
        this.dotPositionText = this.add.text(16, 60, 'i: 0 j: 0 ', {fontSize: '20px', fill: '#fff'});
        this.dotPositionText.setVisible(DEBUG_MODE);
        this.selectListText = this.add.text(16, 100, 'Size: ' + this.selectedIndices.length, {fontSize: '20px', fill: '#fff'});
        this.selectListText.setVisible(DEBUG_MODE);

    } // Display score and debugging information
}