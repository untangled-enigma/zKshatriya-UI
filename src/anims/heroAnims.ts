import Phaser from "phaser"
export const createHeroAnims = (anims: Phaser.Animations.AnimationManager) => {
    const HERO_FRAMERATE = 15;
    const repeat = 1
    anims.create({
        key: 'walk-left',
        frames: anims.generateFrameNumbers('hero', { start: 20, end: 29 }),
        frameRate: HERO_FRAMERATE,
        repeat
    });
    anims.create({
        key: 'walk-up',
        frames: anims.generateFrameNumbers('hero', { start: 10, end: 19 }),
        frameRate: HERO_FRAMERATE,
        repeat
    });
    anims.create({
        key: 'walk-down',
        frames: anims.generateFrameNumbers('hero', { start: 30, end: 39 }),
        frameRate: HERO_FRAMERATE,
        repeat
    });
    anims.create({
        key: 'walk-right',
        frames: anims.generateFrameNumbers('hero', { start: 0, end: 9 }),
        frameRate: HERO_FRAMERATE,
        repeat
    });

    anims.create({
        key: 'idle',
        frames: anims.generateFrameNumbers('hero', { frames: [0] }),
    });
}

export const createHeroAttack = (anims: Phaser.Animations.AnimationManager) => {
    const HERO_FRAMERATE = 10;
    const HERO_KEY = 'heroAttack'
    anims.create({
        key: 'attack-right',
        frames: anims.generateFrameNumbers(HERO_KEY, { start: 0, end: 9 }),
        frameRate: HERO_FRAMERATE,
        repeat: 0
    });
    anims.create({
        key: 'attack-up',
        frames: anims.generateFrameNumbers(HERO_KEY, { start: 10, end: 19 }),
        frameRate: HERO_FRAMERATE,
        repeat: 0
    });
    anims.create({
        key: 'attack-left',
        frames: anims.generateFrameNumbers(HERO_KEY, { start: 20, end: 29 }),
        frameRate: HERO_FRAMERATE,
        repeat: 0
    });
    anims.create({
        key: 'attack-down',
        frames: anims.generateFrameNumbers(HERO_KEY, { start: 30, end: 39 }),
        frameRate: HERO_FRAMERATE,
        repeat: 0
    });

}