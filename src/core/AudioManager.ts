/**
 * Audio Manager - Manages sound effect and music playback
 * US-002: 音效播放管理
 */

import Phaser from 'phaser';

/**
 * Audio channel types
 */
export type AudioChannel = 'bgm' | 'sfx' | 'voice';

/**
 * Audio configuration interface
 */
export interface AudioConfig {
  volume: number;
  loop: boolean;
  channel: AudioChannel;
}

/**
 * Audio state tracking
 */
interface AudioState {
  key: string;
  sound: Phaser.Sound.BaseSound | null;
  volume: number;
  isPlaying: boolean;
}

/**
 * Audio Manager class
 * Handles music, sound effects, and voice audio playback
 */
export class AudioManager {
  private channelVolumes: Map<AudioChannel, number>;
  private masterVolume: number = 1.0;
  private currentBGM: AudioState | null = null;
  private sfxPool: Map<string, AudioState>;
  private muted: boolean = false;

  constructor() {
    this.channelVolumes = new Map([
      ['bgm', 0.7],
      ['sfx', 0.8],
      ['voice', 1.0],
    ]);
    this.sfxPool = new Map();
  }

  /**
   * Play background music
   */
  playBGM(
    scene: Phaser.Scene,
    key: string,
    options: Partial<AudioConfig> = {}
  ): void {
    const volume = (options.volume ?? 1.0) * this.getEffectiveVolume('bgm');
    const loop = options.loop ?? true;

    // Stop current BGM if playing
    if (this.currentBGM?.isPlaying) {
      this.stopBGM(scene, false);
    }

    const sound = scene.sound.add(key, {
      volume,
      loop,
    });

    sound.play();

    this.currentBGM = {
      key,
      sound,
      volume,
      isPlaying: true,
    };
  }

  /**
   * Stop background music
   */
  stopBGM(scene: Phaser.Scene, fadeOut: boolean = true): void {
    if (!this.currentBGM || !this.currentBGM.sound) return;

    if (fadeOut && this.currentBGM.isPlaying) {
      // Fade out over 1 second using tweens on volume property
      const sound = this.currentBGM.sound;
      scene.tweens.add({
        targets: sound,
        volume: 0,
        duration: 1000,
        onComplete: () => {
          sound.stop();
          sound.destroy();
          this.currentBGM = null;
        },
      });
    } else {
      this.currentBGM.sound.stop();
      this.currentBGM.sound.destroy();
      this.currentBGM = null;
    }
  }

  /**
   * Pause background music
   */
  pauseBGM(): void {
    if (this.currentBGM?.sound && this.currentBGM.isPlaying) {
      this.currentBGM.sound.pause();
      this.currentBGM.isPlaying = false;
    }
  }

  /**
   * Resume background music
   */
  resumeBGM(): void {
    if (this.currentBGM?.sound && !this.currentBGM.isPlaying) {
      this.currentBGM.sound.resume();
      this.currentBGM.isPlaying = true;
    }
  }

  /**
   * Play a sound effect
   */
  playSFX(
    scene: Phaser.Scene,
    key: string,
    options: Partial<AudioConfig> = {}
  ): Phaser.Sound.BaseSound | null {
    const volume = (options.volume ?? 1.0) * this.getEffectiveVolume('sfx');

    const sound = scene.sound.add(key, {
      volume,
      loop: false,
    });

    sound.play();

    // Track in SFX pool for cleanup
    const state: AudioState = {
      key,
      sound,
      volume,
      isPlaying: true,
    };

    const poolKey = key + '_' + Date.now();
    sound.once('complete', () => {
      this.sfxPool.delete(poolKey);
    });

    this.sfxPool.set(poolKey, state);

    return sound;
  }

  /**
   * Play voice audio (for dialogues)
   */
  playVoice(
    scene: Phaser.Scene,
    key: string,
    options: Partial<AudioConfig> = {}
  ): Phaser.Sound.BaseSound | null {
    const volume = (options.volume ?? 1.0) * this.getEffectiveVolume('voice');

    const sound = scene.sound.add(key, {
      volume,
      loop: false,
    });

    sound.play();

    return sound;
  }

  /**
   * Calculate effective volume for a channel
   */
  private getEffectiveVolume(channel: AudioChannel): number {
    if (this.muted) return 0;
    return this.masterVolume * (this.channelVolumes.get(channel) || 1.0);
  }

  /**
   * Set master volume (0.0 to 1.0)
   */
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
  }

  /**
   * Get master volume
   */
  getMasterVolume(): number {
    return this.masterVolume;
  }

  /**
   * Set volume for a specific channel
   */
  setChannelVolume(channel: AudioChannel, volume: number): void {
    this.channelVolumes.set(channel, Math.max(0, Math.min(1, volume)));
    this.updateChannelVolume(channel);
  }

  /**
   * Get volume for a specific channel
   */
  getChannelVolume(channel: AudioChannel): number {
    return this.channelVolumes.get(channel) || 1.0;
  }

  /**
   * Update volumes for all currently playing audio
   */
  private updateAllVolumes(): void {
    this.updateChannelVolume('bgm');
  }

  /**
   * Update volume for a specific channel
   */
  private updateChannelVolume(channel: AudioChannel): void {
    const effectiveVolume = this.getEffectiveVolume(channel);

    if (channel === 'bgm' && this.currentBGM?.sound) {
      // Cast to WebAudioSound for volume control, or use tween approach
      // Phaser sounds support volume property when using Web Audio
      const sound = this.currentBGM.sound as Phaser.Sound.WebAudioSound;
      if (sound.setVolume) {
        sound.setVolume(effectiveVolume);
      }
      this.currentBGM.volume = effectiveVolume;
    }
  }

  /**
   * Mute all audio
   */
  mute(): void {
    this.muted = true;
    this.updateAllVolumes();
  }

  /**
   * Unmute all audio
   */
  unmute(): void {
    this.muted = false;
    this.updateAllVolumes();
  }

  /**
   * Toggle mute state
   */
  toggleMute(): boolean {
    this.muted = !this.muted;
    this.updateAllVolumes();
    return this.muted;
  }

  /**
   * Check if audio is muted
   */
  isMuted(): boolean {
    return this.muted;
  }

  /**
   * Check if BGM is playing
   */
  isBGMPlaying(): boolean {
    return this.currentBGM?.isPlaying ?? false;
  }

  /**
   * Get current BGM key
   */
  getCurrentBGMKey(): string | null {
    return this.currentBGM?.key ?? null;
  }

  /**
   * Crossfade to new BGM
   */
  crossfadeBGM(
    scene: Phaser.Scene,
    newKey: string,
    duration: number = 2000
  ): void {
    const newVolume = this.getEffectiveVolume('bgm');

    // Fade out current BGM
    if (this.currentBGM?.sound) {
      const oldSound = this.currentBGM.sound;
      scene.tweens.add({
        targets: oldSound,
        volume: 0,
        duration,
        onComplete: () => {
          oldSound.stop();
          oldSound.destroy();
        },
      });
    }

    // Play new BGM at volume 0 and fade in
    const newSound = scene.sound.add(newKey, {
      volume: 0,
      loop: true,
    });

    newSound.play();

    scene.tweens.add({
      targets: newSound,
      volume: newVolume,
      duration,
      onComplete: () => {
        this.currentBGM = {
          key: newKey,
          sound: newSound,
          volume: newVolume,
          isPlaying: true,
        };
      },
    });
  }

  /**
   * Stop all sound effects
   */
  stopAllSFX(): void {
    for (const state of this.sfxPool.values()) {
      if (state.sound) {
        state.sound.stop();
        state.sound.destroy();
      }
    }
    this.sfxPool.clear();
  }

  /**
   * Cleanup audio manager
   */
  cleanup(): void {
    this.currentBGM?.sound?.stop();
    this.currentBGM?.sound?.destroy();
    this.currentBGM = null;
    this.stopAllSFX();
  }

  /**
   * Get audio configuration for saving
   */
  getAudioConfig(): { masterVolume: number; channelVolumes: Map<AudioChannel, number>; muted: boolean } {
    return {
      masterVolume: this.masterVolume,
      channelVolumes: new Map(this.channelVolumes),
      muted: this.muted,
    };
  }

  /**
   * Load audio configuration
   */
  loadAudioConfig(config: { masterVolume?: number; channelVolumes?: Map<AudioChannel, number>; muted?: boolean }): void {
    if (config.masterVolume !== undefined) {
      this.masterVolume = config.masterVolume;
    }
    if (config.channelVolumes) {
      this.channelVolumes = new Map(config.channelVolumes);
    }
    if (config.muted !== undefined) {
      this.muted = config.muted;
    }
    this.updateAllVolumes();
  }
}