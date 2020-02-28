/** Scene 02: Post-game Menu **/

class Scene_02 extends Phaser.Scene {
    constructor() {
        super({key: "Scene_02"});
    }

    preload() {}
    init(data) {
        this.score = data.score;
    } //Load score from previous scene
    create() {
        this.initData();
        this.cameras.main.setBackgroundColor('#17202A');
        let menuX = config.width / 2;
        let menuY = config.height / 4;

        //Display score
        let scoreText00 = this.add.text(menuX, menuY, "Your Score",
            {fontSize: '32px', fill: '#fff', fontStyle: 'bold'});
        scoreText00.setOrigin(0.5);
        menuY +=  (scoreText00.height + 40);

        let scoreText01 = this.add.text(menuX, menuY, this.score,
            {fontSize: '62px', fill: '#fff', fontStyle: 'bold'});
        scoreText01.setOrigin(0.5);

        //Comment based on score
        menuY +=  (scoreText01.height + 10);
        let comment = '';
        if (this.score <= 10) {
            comment = 'Let\'s Try Harder!';
        } else if (this.score <= 100) {
            comment = 'Well Done!';
        } else {
            comment = 'Excellent!';
        }
        let scoreText02 = this.add.text(menuX, menuY, comment,
            {fontSize: '24px', fill: '#fff', fontStyle: 'italic'});
        scoreText02.setOrigin(0.5);

        // Display Menu Options
        menuY = config.height * 3/4;
        Scene_00.addMenuOption(menuX, menuY,"Try Again", "Scene_01", this);
        Scene_00.addMenuOption(menuX, menuY,"Main Menu", "Scene_00", this);

        //Fade in
        this.rectFrame = this.add.rectangle(0,0,config.width, config.height, 0x17202A, 1);
        this.rectFrame.setOrigin(0,0);
        this.sceneState = 0;
    }

    initData() {
        this.menuSize = 0;
        this.lockControl = false;
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


}