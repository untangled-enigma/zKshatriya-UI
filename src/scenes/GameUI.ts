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

    //Create proofs button
    const proofsButton = this.add.text(20, 180, 'Proofs')
      .setPadding(10)
      .setStyle({ backgroundColor: '#111' })
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', this.onProofs, this)
      .on('pointerover', () => proofsButton.setStyle({ fill: '#f39c12' }))
      .on('pointerout', () => proofsButton.setStyle({ fill: '#FFF' }))

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

  async onProofs() {

  const dialog = await  this.CreateDialog(this)
     
  dialog.setPosition(400, 300)
      .layout()
      .modalPromise({
        defaultBehavior: false,
        manaulClose: true,
        duration: {
          in: 500,
          out: 500
        }
      })

  }

  async fetchProofText() {
    return `Demo content`
  }

  async requestProof(){

  }

 async CreateDialog(scene: any) {
    const content = await this.fetchProofText();
    var dialog = scene.rexUI.add.dialog({
      background: scene.rexUI.add.roundRectangle(0, 0, 100, 100, 20, 0x1565c0),

      title: scene.rexUI.add.label({
        background: scene.rexUI.add.roundRectangle(0, 0, 100, 40, 20, 0x003c8f),
        text: scene.add.text(0, 0, 'Proofs', {
          fontSize: '24px'
        }),
        space: {
          left: 15,
          right: 15,
          top: 10,
          bottom: 10
        }
      }),

      content: scene.add.text(0, 0, content, {
        fontSize: '24px'
      }),

      actions: [
        this.CreateLabel(scene, 'Request Proof'),
        this.CreateLabel(scene, 'Close')

      ],

      space: {
        title: 25,
        content: 25,
        action: 15,

        left: 20,
        right: 20,
        top: 20,
        bottom: 20,
      },

      align: {
        actions: 'right', // 'center'|'left'|'right'
      },

      expand: {
        content: false,  // Content is a pure text object
      }
    })
      .on('button.click', async (button, groupName, index, pointer, event) => {
        console.log(`button index ${index}`)

        if (index == 1) {
          //Close button clicked
          dialog.modalClose(null)
        }

        if(index== 0)
        {
         await this.requestProof();
        }

        // button.getElement('background').setStrokeStyle(1, 0xffffff);
      })
      .on('button.over', function (button: any) {
        button.getElement('background').setStrokeStyle(1, 0xffffff);
      })
      .on('button.out', function (button: any) {
        button.getElement('background').setStrokeStyle();
      });

    return dialog;
  }

  CreateLabel(scene:any, text:string) {
    return scene.rexUI.add.label({
        // width: 40,
        // height: 40,

        background: scene.rexUI.add.roundRectangle(0, 0, 0, 0, 20, 0x5e92f3),

        text: scene.add.text(0, 0, text, {
            fontSize: '24px'
        }),

        space: {
            left: 10,
            right: 10,
            top: 10,
            bottom: 10
        }
    });
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
