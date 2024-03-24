import Phaser from 'phaser'

export default class Preloader extends Phaser.Scene {
    constructor() {
        super('preloader')
    }

    preload() {
        this.load.image('walls', 'tiles/walls/walls.png');
        this.load.image('floors', 'tiles/floors/floors.png');
        this.load.image('chest', 'misc/object.png');

        this.load.tilemapTiledJSON('map', 'tiles/t_map.json');

        this.load.spritesheet('hero', 'hero/hero.png', {
            frameWidth: 148,
            frameHeight: 144,
        });  

        this.load.audioSprite('sfx', 'misc/fx_mixdown.json', [
            'misc/fx_mixdown.ogg',
        ]);

        //loading prompt
        this.load.atlas('loading-ui', 'misc/nine-slice.png', 'misc/nine-slice.json');

    }
    create() {
        this.scene.start('splash')
    }


 

}
