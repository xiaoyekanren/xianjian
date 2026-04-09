import Phaser from 'phaser';

// Game configuration for Chinese Paladin Modern Remake
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 1920,
  height: 1080,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  backgroundColor: '#2d2d44',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [],
  render: {
    pixelArt: false,
    antialias: true,
  },
};

// Initialize the game
const game = new Phaser.Game(config);

// Export for potential debugging
export { game };