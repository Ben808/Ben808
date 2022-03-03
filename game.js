import Phaser from "https://codepen.io/libe2022/pen/poWbMod.js";
import Carrot from "https://codepen.io/libe2022/pen/vYJWqBx.js";

export default class Game extends Phaser.Scene {
  cakesCollected = 0;
  /** @type {Phaser.Types.Input.Keyboard.CursorKeys} */
  cursors;

  /** @type {Phaser.Physics.Arcade.StaticGroup} */
  platforms;

  /** @type {Phaser.Physics.Arcade.Sprite} */
  player;

  constructor() {
    super("game");
  }

  preload() {
    //base url of mr. nolan's github with all the stuff we use
    this.load.setBaseURL(
      "https://raw.githubusercontent.com/Ben808/Ultimate-game-/main"
    );
    //background image
    this.load.image(
      "background",
      "Assets/Screen%20Shot%202022-03-03%20at%2012.02.40%20PM.png"
    );
    //platforms
    this.load.image("platform", "Assets/ground_grass.png");
    //bunny standing still
    this.load.image("elephant", "Assets/elephant.png");
    //carrot
    this.load.image("carrot", "Assets/cake.png");
    this.load.audio("jump", "Assets/sfx/Jumper_assets_sfx_phaseJump1.wav");
    this.load.audio(
      "theme",
      "Assets/sfx/Jumper_assets_sfx_My_Hero_Academia_OST_-_You_Say_Run.mp3"
    );
    //input for player
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  create() {
    this.themeSound = this.sound.add("theme");

    this.themeSound.play({
      mute: false,
      volume: 1,
      rate: 1,
      detune: 0,
      seek: 0,
      loop: false,
      delay: 0
    });
    this.add.image(240, 320, "background").setScrollFactor(1, 0);

    //creates group of platforms locked in place
    this.platforms = this.physics.add.staticGroup();

    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(80, 400);
      const y = 150 * i;

      /** @type {Phaser.Physics.Arcade.Sprite} */
      const platform = this.platforms.create(x, y, "platform");
      platform.scale = 0.5;

      /** @type {Phaser.Physics.Arcade.Sprite} */
      const body = platform.body;
      body.updateFromGameObject();
    }

    //bunny sprite with scale 0.5
    this.player = this.physics.add.sprite(240, 320, "elephant").setScale(0.5);

    //bunny stops on platform now with collider
    this.physics.add.collider(this.platforms, this.player);

    //removing collision from top and sides
    this.player.body.checkCollision.up = false;
    this.player.body.checkCollision.left = false;
    this.player.body.checkCollision.right = false;

    //camera
    this.cameras.main.startFollow(this.player);

    //deadzone so it doesn't keep moving
    this.cameras.main.setDeadzone(this.scale.width * 1.5);

    const style = { color: "#000", fontSize: 24 };
    this.cakesCollectedText = this.add
      .text(240, 10, "Cakes: 0", style)
      .setScrollFactor(0)
      .setOrigin(0.5, 0);

    //the carrot
    this.carrots = this.physics.add.group({
      classType: Carrot
    });
    this.physics.add.collider(this.platforms, this.carrots);
    this.physics.add.overlap(
      this.player,
      this.carrots,
      this.handleCollectCarrot,
      undefined,
      this
    );
  }

  update(d, dt) {
    this.platforms.children.iterate((child) => {
      /** @type {Phaser.Physics.Arcade.Sprite} */
      const platform = child;

      const scrollY = this.cameras.main.scrollY;
      if (platform.y >= scrollY + 700) {
        platform.y = scrollY - Phaser.Math.Between(50, 75);
        platform.body.updateFromGameObject();
        this.addCarrotAbove(platform);
      }
    });
    //variable that is for when the player touches something below them
    const touchingDown = this.player.body.touching.down;

    //if true, the player will jump with y velocity -300
    if (touchingDown) {
      this.player.setVelocityY(-300);
    }

    //left and right movement
    if (this.cursors.left.isDown && !touchingDown) {
      this.player.setVelocityX(-220);
    } else if (this.cursors.right.isDown && !touchingDown) {
      this.player.setVelocityX(220);
    } else {
      this.player.setVelocityX(0);
    }

    this.horizontalWrap(this.player);

    const bottomPlatform = this.findBottomMostPlatform();
    if (this.player.y > bottomPlatform.y + 200) {
      this.scene.start("game-over");
    }
  }

  /**
   *
   * @param {Phaser.GameObjects.Sprite} sprite
   */

  horizontalWrap(sprite) {
    const halfWidth = sprite.displayWidth * 0.5;
    const gameWidth = this.scale.width;
    if (sprite.x < -halfWidth) {
      sprite.x = gameWidth + halfWidth;
    } else if (sprite.x > gameWidth + halfWidth) {
      sprite.x = -halfWidth;
    }
  }

  /**
   *  @param  {Phaser.GameObjects.Sprite} sprite
   */
  addCarrotAbove(sprite) {
    const y = sprite.y - sprite.displayHeight;

    /** @type {Phaser.Physics.Arcade.Sprite} */
    const carrot = this.carrots.get(sprite.x, y, "carrot");

    carrot.setActive(true);
    carrot.setVisible(true);

    this.add.existing(carrot);

    carrot.body.setSize(carrot.width, carrot.height);

    this.physics.world.enable(carrot);

    return carrot;
  }

  /**
   *  @param {Phaser.Physics.Arcade.Sprite} player
   *  @param {Carrot} carrot
   */
  handleCollectCarrot(player, carrot) {
    this.carrots.killAndHide(carrot);

    this.physics.world.disableBody(carrot.body);

    this.cakesCollected++;

    const value = `Cakes: ${this.cakesCollected}`;
    this.cakesCollectedText.text = value;
  }

  findBottomMostPlatform() {
    const platforms = this.platforms.getChildren();
    let bottomPlatform = platforms[0];

    for (let i = 1; i < platforms.length; ++i) {
      const platform = platforms[i];

      // discard any platforms that are above current
      if (platform.y < bottomPlatform.y) {
        continue;
      }

      bottomPlatform = platform;
    }

    return bottomPlatform;
  }
}
