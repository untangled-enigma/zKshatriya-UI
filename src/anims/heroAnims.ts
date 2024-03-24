import Phaser from "phaser"
export const createHeroAnims = (anims: Phaser.Animations.AnimationManager) => {
    const HERO_FRAMERATE = 15;

    anims.create({
        key: 'walk-left',
        frames: anims.generateFrameNumbers('hero', { start: 20, end: 29 }),
        frameRate: HERO_FRAMERATE,
        repeat: -1
    });
    anims.create({
        key: 'walk-up',
        frames: anims.generateFrameNumbers('hero', { start: 10, end: 19 }),
        frameRate: HERO_FRAMERATE,
        repeat: -1
    });
    anims.create({
        key: 'walk-down',
        frames: anims.generateFrameNumbers('hero', { start: 30, end: 39 }),
        frameRate: HERO_FRAMERATE,
        repeat: -1
    });
    anims.create({
        key: 'walk-right',
        frames: anims.generateFrameNumbers('hero', { start: 0, end: 9 }),
        frameRate: HERO_FRAMERATE,
        repeat: -1
    });

    anims.create({
        key: 'idle',
        frames: anims.generateFrameNumbers('hero', { frames: [0] }),
    });
}