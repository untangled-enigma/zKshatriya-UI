import Phaser from "phaser";
import { createHeroAnims } from "../anims/heroAnims";
import { sceneEvents } from "../events/EventCenter";
import { chectLocs } from "../zk/constants"
import { zkData } from "../zk/zkData";

export default class Game extends Phaser.Scene {
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private hero!: Phaser.Physics.Matter.Sprite;
  private minimap!: Phaser.Cameras.Scene2D.Camera;

  private gameEnded: boolean;
  private playerPath!: any[];

  private floorLayer!: Phaser.Tilemaps.TilemapLayer | null;
  private playerZk : zkData

  constructor() {
    super("game");
    this.playerPath = [];
    this.gameEnded = false;
    this.playerZk = new zkData();
  }

  preload() {
    this.cursors = this.input.keyboard!.createCursorKeys();
  }

  update(): void {
    if (!this.cursors || !this.hero || this.gameEnded) {
      return;
    }

    if (this.playerPath.length > 20) {
      sceneEvents.emit("game-over", this.playerPath);
      this.hero.setVelocity(0);
      this.hero.stop();
      this.gameEnded = true;
      return;
    }

    const SPEED = 8;
    let Direction;

    switch (true) {
      case this.cursors.left?.isDown:
        this.hero.setVelocity(-SPEED, 0);
        this.hero.anims.play("walk-left", true);
        Direction = 2;
        break;
      case this.cursors.right?.isDown:
        this.hero.setVelocity(SPEED, 0);
        this.hero.anims.play("walk-right", true);
        Direction = 3;
        break;
      case this.cursors.up?.isDown:
        this.hero.setVelocity(0, -SPEED);
        this.hero.anims.play("walk-up", true);
        Direction = 1;
        break;
      case this.cursors.down?.isDown:
        this.hero.setVelocity(0, SPEED);
        this.hero.anims.play("walk-down", true);
        Direction = 4;
        break;

      default: {
        //ToDo: stop the character at next tile
        this.hero.setVelocity(0);
        this.hero.stop();
      }
    }

  }

  getRootBody(body: any) {
    if (body.parent === body) {
      return body;
    }
    while (body.parent !== body) {
      body = body.parent;
    }
    return body;
  }

  create() {
    this.scene.run("game-ui");
    const map = this.make.tilemap({ key: "map" });

    const walls = map.addTilesetImage("walls", "walls");
    const floors = map.addTilesetImage("floors", "floors") ?? null;

    this.floorLayer = map.createLayer("floors", floors || "");
    const wallLayer = map.createLayer("walls", walls || "");

    wallLayer?.setCollisionByProperty({ collide: true });

    wallLayer?.setCullPadding(4, 4);
    this.floorLayer?.setCullPadding(4, 4);

    if (!wallLayer || !this.floorLayer) return;

    this.matter.world.convertTilemapLayer(wallLayer, {});

    createHeroAnims(this.anims);

    this.hero = this.matter.add.sprite(2000, 2000, "hero");

    this.hero.setBody({
      height: this.hero.height * 0.3,
      width: this.hero.width * 0.3,
    });

    this.hero.setFixedRotation();
    this.hero.setDepth(4);

    this.cameras.main.startFollow(this.hero, true);
    this.cameras.main.setZoom(0.7, 0.7);

    //Mini MAP

    //  The miniCam is 400px wide, so can display the whole world at a zoom of 0.2
    this.minimap = this.cameras
      .add(50, 450, 200, 200)
      .setZoom(0.09)
      .setName("mini");
    this.minimap.setBackgroundColor(0x000000);
    this.minimap.scrollX = -10000;
    this.minimap.scrollY = 20;

    this.minimap.startFollow(this.hero, true);

    this.createChests();

    this.matter.world.on("collisionstart", this.handleCollision, this);
  }

  async createChests() {
    const uiScene = this.scene.get('game-ui')

    //@ts-ignore
    const chests = await uiScene.zkappWorkerClient.getChests()

    for (const chestLoc of chests) {
      const chest = this.matter.add.image(
        chestLoc.x,
        chestLoc.y,
        "chest",
        undefined,
        {  
          restitution: 1,
          label: "chest",
        }
      );
      chest.setFixedRotation();
      chest.setStatic(true);
      chest.setData("mKey", chestLoc.key)
      
    }
  }

handleCollision(event: any) {
    for (let i = 0; i < event.pairs.length; i++) {
      // The tile bodies in this example are a mixture of compound bodies and simple rectangle
      // bodies. The "label" property was set on the parent body, so we will first make sure
      // that we have the top level body instead of a part of a larger compound body.
      const bodyA = this.getRootBody(event.pairs[i].bodyA);
      const bodyB = this.getRootBody(event.pairs[i].bodyB);

      if (bodyA.label === "chest" || bodyB.label === "chest") {
        const ballBody = bodyA.label === "chest" ? bodyA : bodyB;
        const ball = ballBody.gameObject;
        // A body may collide with multiple other bodies in a step, so we'll use a flag to
        // only tween & destroy the ball once.
        if (ball.isBeingDestroyed) {
          continue;
        }
        ball.isBeingDestroyed = true;

        this.matter.world.remove(ballBody);

        this.tweens.add({
          targets: ball,
          flipY: true,
          x: 0,
          y: 50,
          alpha: { value: 0, duration: 1000, ease: "Power1" },
          onComplete: ((ball: any) => {
            ball.destroy();
          }).bind(this, ball),
        });

        //add coins to bucket
        this.playerZk.addChest({x: ball.x , y:ball.y , key: ball.getData("mKey") });
     
        sceneEvents.emit("coin-collected");
             
      }
    }
  }
}
