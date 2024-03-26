import Phaser from "phaser";
import { sceneEvents } from "../events/EventCenter";
import type WebWorkerClient from '../zk/WebWorkerClient'


export default class GameUI extends Phaser.Scene {
  scoreText!: Phaser.GameObjects.Text;
  itemsText!: Phaser.GameObjects.Text;
  // saveButton!: Phaser.GameObjects.Text;
  displayAccount!: string;
  zkappWorkerClient!: WebWorkerClient;

  constructor() {
    super({ key: "game-ui" });
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
    sceneEvents.once("coin-collected", this.createSaveButton, this);
    sceneEvents.on("coin-collected", this.handleCoinCollection, this);
    // on Chain Score
    this.scoreText = this.add.text(20, 50, `Score: <fetching>`, {
      fontSize: 25,
      fontFamily: "Roboto",
      color: "black",
    });

    //collected Items
    this.itemsText = this.add.text(20, 80, `Items: <fetching>`, {
      fontSize: 20,
      fontFamily: "Roboto",
      backgroundColor: "white",
      color: "black",
    });

    
    this.refreshStats()

  }

  createSaveButton() {
    const saveButton = this.add.text(20, 150, 'Save')
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
    const items = gameScene?.playerZk.myChests;


    if (import.meta.env.PROD) {
      for (let i = 0; i < items.length; i++) {
        await this.zkappWorkerClient.foundItem({ point: { x: items[i].x, y: items[i].y, key: items[i].key } });
      }
    }
    await this.zkappWorkerClient.commitTreasure(items)

    //@ts-ignore
    gameScene?.playerZk.clear()

    this.refreshStats()

  }

  async refreshStats() {
    const gameScene = this.scene.get("game")
    //@ts-ignore
    const itemsCount = gameScene?.playerZk.myChests.length;
    const score = await this.zkappWorkerClient.getScore()

    this.scoreText.setText(`Score: ${score}`);
    this.itemsText.setText(`Items: ${itemsCount}`)
  }

  handleCoinCollection() {
    console.count("Item No.")
    this.sound.playAudioSprite("sfx", "ping");
    this.refreshStats()
  }


}
