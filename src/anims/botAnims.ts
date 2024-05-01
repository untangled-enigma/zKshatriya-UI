import Phaser from "phaser"
export const botRun = (anims: Phaser.Animations.AnimationManager) => {
    const BOT_FRAMERATE = 30;
    const repeat = 0
    anims.create({
        key: 'run-left',
        frames: anims.generateFrameNumbers('bot', { start: 17, end: 33 }),
        frameRate: BOT_FRAMERATE,
        repeat
    });
    anims.create({
        key: 'run-up',
        frames: anims.generateFrameNumbers('bot', { start: 34, end: 50 }),
        frameRate: BOT_FRAMERATE,
        repeat
    });
    anims.create({
        key: 'run-right',
        frames: anims.generateFrameNumbers('bot', { start: 51, end: 67 }),
        frameRate: BOT_FRAMERATE,
        repeat
    });
    anims.create({
        key: 'run-down',
        frames: anims.generateFrameNumbers('bot', { start: 0, end: 16 }),
        frameRate: BOT_FRAMERATE,
        repeat
    });

    // anims.create({
    //     key: 'idle',
    //     frames: anims.generateFrameNumbers('bot', { frames: [0] }),
    // });
}