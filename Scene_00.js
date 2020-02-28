/** Scene 00: Main Menu **/
class Scene_00 extends Phaser.Scene {
    constructor() {
        super({key: "Scene_00"});
    }

    preload() {}
    create() {
        this.initData();

        this.cameras.main.setBackgroundColor('#17202A');
        let menuX = config.width / 2;
        let menuY = config.height / 2;
        //Draw title
        this.drawTitle();

        // Display Menu Options
        Scene_00.addMenuOption(menuX, menuY,'Play', 'Scene_01', this);

        //Fade in
        this.rectFrame = this.add.rectangle(0,0,config.width, config.height, 0x17202A, 1);
        this.rectFrame.setOrigin(0,0);
        this.sceneState = 0;
    }
    update() {
        //Fade in
        if (this.sceneState === 0) {
            this.rectFrame.setAlpha(this.rectFrame.alpha - 0.02);
            if (this.rectFrame.alpha === 0) {
                this.sceneState++;
            }
        }
    }

    //Initialize data
    initData() {
        this.menuSize = 0;
        this.lockControl = false;
        this.graphics = this.add.graphics();
    }

    //Draw game's title
    drawTitle() {
        let title = this.add.text(config.width/2, config.height/4, 'D.O.T.S', {fontSize: '72px', fill: '#fff'});
        title.setOrigin(0.5, 0.5);
        let x1 = config.width/4;
        let y1 = title.y + title.height;
        let x2 = config.width * 3/4;
        let y2 = y1;

        //line seperators
        this.graphics.lineStyle(3, 0xffffff);
        this.graphics.strokeLineShape(new Phaser.Geom.Line(x1,y1,x2,y2));
        y1 = title.y - title.height;
        y2 = y1;
        this.graphics.strokeLineShape(new Phaser.Geom.Line(x1,y1,x2,y2));

        //Developer name
        let name = this.add.text(20, config.height - 20, 'Thong Nguyen', {fontSize: '18px', fill: '#fff'});
        name.setOrigin(0, 1);

    }

    //utility function to add menu option
    static addMenuOption(menuX, menuY, textContent, goto, context) {
        let textObj = context.add.text(menuX, menuY + 60 * context.menuSize,
            textContent, {fontSize: '32px', fill: '#fff'});
        context.menuSize++;
        textObj.setOrigin(0.5);
        textObj.setInteractive();
        textObj.on('pointerdown', function(pointer) {
            if (!context.lockControl) {
                context.lockControl = true;
                textObj.setColor('#737373');
                context.time.delayedCall(150, function (game) {
                    game.scene.start(goto);
                }, [context], context);
            }
        }, context);
        textObj.on('pointerover', function(pointer) {
            if (!context.lockControl) {
                textObj.setColor('#C0C0C0');
            }
        }, context);
        textObj.on('pointerout', function(pointer) {
            if (!context.lockControl) {
                textObj.setColor('#fff');
            }
        }, context);
    }
}
