import Phaser from 'phaser'
import WebWorkerClient from '../zk/WebWorkerClient'

export default class Splash extends Phaser.Scene {
    constructor() {
        super('splash')
    }

    async timeout(seconds: number): Promise<void> {
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                resolve();
            }, seconds * 1000);
        });
    }

    openModal() {
        const scene = this;
        var config = {
            //@ts-ignore
            background: scene.rexUI.add.roundRectangle(0, 0, 100, 100, 20, 0x1565c0),
            //@ts-ignore
            title: scene.rexUI.add.label({
                //@ts-ignore
                background: scene.rexUI.add.roundRectangle(0, 0, 100, 40, 20, 0x003c8f),
                text: scene.add.text(0, 0, 'Instructions', {
                    fontSize: '1.5rem',
                    align : "center"
                }),
                space: {
                    left: 15,
                    right: 15,
                    top: 10,
                    bottom: 10
                }
            }),

            content: scene.add.text(0, 0, `Welcome to the world of zKshatriya 🔥, where adventure awaits you at every turn! 
        You are Minar, a young hero who must save the land from the evil Ganon and his minions. 😈 
        
        Along the way, you will explore dungeons 🏰, solve puzzles 🧩, collect items 🎁, and fight enemies ⚔️. 
        You will also meet many friends and allies who will help you on your quest. 👫
        Are you ready to embark on this epic journey with divine Zero Knowlegde powered by Mina Protocol ? 🚀
        Then grab your sword 🗡️ and shield 🛡️, and let's go! 🙌

        How to play (Version 0.1):
        1. Collect treasures by walking over them 💎
        2. Commit treasure to using SAVE button 💾

     Note: 📝
     - This game requires Mina Enabled wallet like Auro Wallet 💳
     - Game is live on Berkley network. Make sure you have enough balance for transactions 💰
     - Each Box is unique. So, can only be collected once. 🚫

        `, {
                fontSize: '1rem'
            }),

            actions: [
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
        }

        //@ts-ignore
        var dialog = scene.rexUI.add.dialog(config).setPosition(this.cameras.main.centerX, this.cameras.main.centerY)
            .layout()
            .modalPromise({
                defaultBehavior: false,
                // manaulClose: false,
                anyTouchClose: true,
                duration: {
                    in: 500,
                    out: 500
                }
            })
            .then(function (data: any) {
                // print.text += `${JSON.stringify(data)}\n`;
            })


    }

    async onDebug() {
        this.openModal()
    }
    async init() {
        //debug button
        const debugButton = this.add.text(20, 200, 'Debug')
            .setPadding(10)
            .setStyle({ backgroundColor: '#111' })
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', this.onDebug, this)
            .on('pointerover', () => debugButton.setStyle({ fill: '#f39c12' }))
            .on('pointerout', () => debugButton.setStyle({ fill: '#FFF' }))

    }

    async create() {

        const loadingX = this.cameras.main.centerX,
            loadingY = this.cameras.main.centerY - 30;

        const bar1 = this.add.nineslice(loadingX, loadingY, 'loading-ui', 'ButtonOrange');
        const fill1 = this.add.nineslice(loadingX - 114, loadingY - 2, 'loading-ui', 'ButtonOrangeFill1', 13, 39, 6, 6);

        fill1.setOrigin(0, 0.5);

        const loadingTween = this.tweens.add({
            targets: fill1,
            width: 228,
            duration: 10000,
            ease: 'sine.inout',
            yoyo: false,
        });

        const zkappWorkerClient = new WebWorkerClient();

        const title = this.add.text(loadingX - 150, loadingY - 190, 'zKshatriya', { font: '64px Arial' });
        title.setTint(0xff00ff, 0xffff00, 0x0000ff, 0xff0000);

        await this.timeout(5)

        if (import.meta.env.PROD) {
            await zkappWorkerClient.compileProgram();
        }

        const gameScene = this.scene.get('game-ui')
        //@ts-ignore
        gameScene.zkappWorkerClient = zkappWorkerClient

        //~~~~~~~~~~~~~~~ Destroy loading 
        loadingTween.destroy();
        fill1.destroy();
        bar1.destroy();

        const startButton = this.add.text(this.cameras.main.centerX, this.cameras.main.centerY, 'Start game')
            .setOrigin(0.5)
            .setPadding(10)
            .setFontSize(32)
            .setStyle({ backgroundColor: '#111' })
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', this.handleConnection, this)
            .on('pointerover', () => startButton.setStyle({ fill: '#f39c12' }))
            .on('pointerout', () => startButton.setStyle({ fill: '#FFF' }))

        //TODO: Add game instructions    

    }

    async handleConnection() {
        const gameScene = this.scene.get('game-ui')

        try {

            let token = localStorage.getItem('token')
            //@ts-ignore
            const accounts = await window.mina.requestAccounts();

            if (!token) {
                //@ts-ignore
                await gameScene.zkappWorkerClient.setActiveInstance()

                const sServiceUrl = import.meta.env.VITE_BACKEND_URL

                const { nonce } = await (await fetch(`${sServiceUrl}/api/auth/nonce/${accounts[0]}`)).json()

                //@ts-ignore
                gameScene.displayAccount = `${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`;

                const signatureData = await this.signMessage(nonce)

                const result = await (await fetch(`${sServiceUrl}/api/auth/login`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        address: signatureData.publicKey,
                        signature: signatureData.signature,
                        name: "demo"
                    }),
                })).json()

                localStorage.setItem("token", result.token)

                token = result.token
            }

            //@ts-ignore
            await gameScene.zkappWorkerClient.setGamer(accounts[0], token)

            this.scene.start("game")
        } catch (err) {
            // If the user has a wallet installed but has not created an account, an
            // exception will be thrown. Consider showing "not connected" in your UI.
            console.log(err);
        }

    }

    async signMessage(nonce: number) {
        //fetch nonce
        const signContent = {
            message: nonce.toString()
        }

        try {
            //@ts-ignore
            await window.mina?.switchChain({ chainId: "mainnet" });
            //@ts-ignore
            const result = await window.mina?.signMessage(signContent)
            return result

        } catch (err) {
            // If the user has a wallet installed but has not created an account, an
            // exception will be thrown. Consider showing "not connected" in your UI.
            console.log(err);
        }

    }
}
