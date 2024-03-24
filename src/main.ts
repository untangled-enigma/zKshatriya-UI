import Phaser from 'phaser'

import UIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin"
import Game from './scenes/Game'
import Preloader from './scenes/Preloader'
import GameUI from './scenes/GameUI'
import Splash from './scenes/Splash'

// let width = 1200
// let height = 800

const config: Phaser.Types.Core.GameConfig = {
	audio: {
        disableWebAudio: true
    },
	type: Phaser.AUTO,
	scale: {
        mode: Phaser.Scale.ScaleModes.RESIZE,
        parent: 'app',
        autoCenter: Phaser.Scale.CENTER_BOTH,
		// zoom:0.6,
    },
	plugins : {
		scene : [
			{
				plugin : UIPlugin,
				mapping:'rexUI',
				key: 'rexUI',
				sceneKey: "rexUI"
			}
		]
	} ,
	physics: {
		default: "matter",
		arcade: {
			gravity: {y:0}
		},
		matter : {
			// debug: true,
			gravity: {y:0}, 	
		}
	},
	scene: [Preloader,Splash,Game,GameUI],
}

export default new Phaser.Game(config)