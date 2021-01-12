import Mine from "./mine";

export default class Player extends Phaser.Physics.Arcade.Sprite{
    constructor(scene, x, y, name, frame, params) {
        super(scene, x, y, name, frame);
        scene.physics.world.enable(this);
        scene.add.existing(this);
        this.lastMineTime = 0;
        this.abilities  = params.abilities || []
    }

    update() {
        const body = this.body;
        this.body.setVelocity(0);
        //const speed = this.maxSpeed; // original
        let speed = this.maxSpeed + 200; // прибавил максимальной скорости, выглядит бодрее; сейчас 100+200=300
        //console.log("speed = " + speed);
        let base_speed = 100; // чтобы не гонять все времяна максималке, будем изначально юзать меньшую
        // скорость, аля первая передача
        const cursors = this.cursors;
        if (this.abilities.includes('mines'))
        {
            if (cursors.space.isDown && this.scene.time.now - this.lastMineTime > 1000) {
                this.lastMineTime = this.scene.time.now;
                this.scene.characterFactory.buildMine(this.body.x, this.body.y);
                //console.log('space is down'); dont work?
            }
        }

        if (cursors.space.isDown)
        {
            console.log('space is down');
            //base_speed -= 100;
            speed += 100; // типо прибавили скорость при переключении передачи
            console.log("space speed = " + speed);
        }

        if (cursors.left.isDown) {
            body.velocity.x -= speed // original
            console.log("body.velocity.x in left= " + body.velocity.x);
        } else if (cursors.right.isDown) {
            body.velocity.x += speed // original
            //body.velocity.x += base_speed //
            console.log("body.velocity.x in right= " + body.velocity.x);
        }

        // Vertical movement
        if (cursors.up.isDown) {
            body.setVelocityY(-speed);
        } else if (cursors.down.isDown) {
            body.setVelocityY(speed);
        }
        // Normalize and scale the velocity so that player can't move faster along a diagonal
        //body.velocity.normalize().scale(speed); // original; может сильно затормозить анимации,
        // мб стоит отключить или изменить макс скорость
        this.updateAnimation();
    };
    updateAnimation() {
        const animations = this.animationSets.get('Walk');
        const animsController = this.anims;
        const x = this.body.velocity.x; // original
        //const x = this.body.velocity.x + 50; // теперь по кд проигрывается анимация хотьбы вправо,
        // в тч если персонаж стоит; при измении направления анимация хотьбы в другие стороны работает верно
        const y = this.body.velocity.y;
        if (x!==0 || y !== 0 && this.footstepsMusic.isPaused)
        {
            this.footstepsMusic.resume();
        }
        if (x < 0) {
            animsController.play(animations[0], true); // идет в лево

        } else if (x > 0) {
            animsController.play(animations[1], true); // идет в право
        } else if (y < 0) {
            animsController.play(animations[2], true); // идет вверх
        } else if (y > 0) {
            animsController.play(animations[3], true); // идет вниз
        } else {
            this.footstepsMusic.pause(); // так надо
            this.footstepsMusic.play(); // так тоже надо
            this.footstepsMusic.pause(); // не трогать!
            const currentAnimation = animsController.currentAnim;
            if (currentAnimation) {
                const frame = currentAnimation.getLastFrame();
                this.setTexture(frame.textureKey, frame.textureFrame);
            }
        }
    }
}
