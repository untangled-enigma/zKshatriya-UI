import Phaser from "phaser";
import { sceneEvents } from "../events/EventCenter";
// import { Game } from '../zk/contracts'
// import { Tree, chectLocs } from "../zk/constants";
import { Field, Mina, PublicKey, Reducer, fetchAccount } from "o1js";
import type WebWorkerClient from '../zk/WebWorkerClient'


export default class GameUI extends Phaser.Scene {
  score: number;
  scoreText!: Phaser.GameObjects.Text;
  // saveButton!: Phaser.GameObjects.Text;
  displayAccount!: string;
  zkappWorkerClient!: WebWorkerClient;

  constructor() {
    super({ key: "game-ui" });
    this.score = 0;
  }

  async init() {

    this.add.text(20, 30, this.displayAccount, {
      fontStyle: "bold",
      backgroundColor: "white",
      fontSize: 20,
      color: "green",
    });

   
  }

 

  async create() {
    // await Game.compile()

    sceneEvents.once("coin-collected", this.createSaveButton, this);
    sceneEvents.on("coin-collected", this.handleCoinCollection, this);
    // this.scoreText = "Coins"
    this.scoreText = this.add.text(20, 50, `Score: ${this.score}`, {
      fontSize: 40,
      color: "black",
    });


  }

  createSaveButton() {
    const saveButton = this.add.text(20, 100, 'Save')
      .setPadding(10)
      .setStyle({ backgroundColor: '#111' })
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', this.onSave, this)
      .on('pointerover', () => saveButton.setStyle({ fill: '#f39c12' }))
      .on('pointerout', () => saveButton.setStyle({ fill: '#FFF' }))
  }

  async onSave() {
    //ToDo. clean and modularise
    const gameScene = this.scene.get("game")
    //@ts-ignore
    const playerChests = gameScene?.playerZk.myChests;

    console.log(`chests ${JSON.stringify(playerChests)}`);


    for (let i = 0; i < playerChests.length; i++) {
      await this.zkappWorkerClient.foundItem({ point: { x: playerChests[i].x, y: playerChests[i].y, key: playerChests[i].key } });
    }

    const finContent = playerChests.map((x:any) => x.key).join(",");
    console.log(`final items ${finContent}`);
    



  }

  handleCoinCollection() {
    console.count("handle coin")
    this.score++;
    this.sound.playAudioSprite("sfx", "ping");
    this.scoreText.setText(`Score: ${this.score}`);
  }


}
