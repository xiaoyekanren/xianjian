/**
 * Sound System - Audio playback and management
 * US-053: 音效添加
 */

import Phaser from 'phaser';

/**
 * Sound effect types
 */
export enum SoundEffect {
  UI_CLICK = 'ui_click',
  UI_SELECT = 'ui_select',
  UI_CANCEL = 'ui_cancel',
  BATTLE_ATTACK = 'battle_attack',
  BATTLE_HIT = 'battle_hit',
  BATTLE_CRITICAL = 'battle_critical',
  BATTLE_SKILL = 'battle_skill',
  SKILL_FIRE = 'skill_fire',
  SKILL_ICE = 'skill_ice',
  SKILL_LIGHTNING = 'skill_lightning',
  SKILL_WIND = 'skill_wind',
  SKILL_HEAL = 'skill_heal',
  FOOTSTEP = 'footstep',
  LEVEL_UP = 'level_up',
  ITEM_GET = 'item_get',
  ITEM_USE = 'item_use',
  EQUIP = 'equip',
}

/**
 * Background music types
 */
export enum BackgroundMusic {
  TITLE = 'title',
  TOWN = 'town',
  BATTLE = 'battle',
  BOSS = 'boss',
  DUNGEON = 'dungeon',
  VICTORY = 'victory',
}

/**
 * Sound configuration
 */
export interface SoundConfig {
  volume: number;
  loop: boolean;
  rate?: number;
}

/**
 * Default sound configurations
 */
const DEFAULT_SFX_CONFIG: SoundConfig = {
  volume: 0.8,
  loop: false,
};

const DEFAULT_BGM_CONFIG: SoundConfig = {
  volume: 0.5,
  loop: true,
};

/**
 * Sound System class
 */
export class SoundSystem {
  private scene: Phaser.Scene;
  private currentBgmKey: string | null = null;
  private sfxVolume: number = 0.8;
  private bgmVolume: number = 0.5;
  private isMuted: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
  }

  setBgmVolume(volume: number): void {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted;
    this.scene.sound.mute = muted;
  }

  playSfx(effect: SoundEffect, config?: Partial<SoundConfig>): void {
    if (this.isMuted) return;

    const soundKey = `sfx_${effect}`;
    if (!this.scene.sound.get(soundKey)) {
      console.warn(`Sound effect "${soundKey}" not loaded`);
      return;
    }

    const finalConfig = {
      ...DEFAULT_SFX_CONFIG,
      volume: this.sfxVolume,
      ...config,
    };

    this.scene.sound.play(soundKey, finalConfig);
  }

  playBgm(music: BackgroundMusic, config?: Partial<SoundConfig>): void {
    const musicKey = `bgm_${music}`;

    if (this.currentBgmKey === musicKey) {
      const bgm = this.scene.sound.get(musicKey);
      if (bgm?.isPlaying) return;
    }

    this.stopBgm();

    if (!this.scene.sound.get(musicKey)) {
      console.warn(`Background music "${musicKey}" not loaded`);
      return;
    }

    const finalConfig = {
      ...DEFAULT_BGM_CONFIG,
      volume: this.bgmVolume,
      ...config,
    };

    this.scene.sound.play(musicKey, finalConfig);
    this.currentBgmKey = musicKey;
  }

  stopBgm(fadeOut: number = 0): void {
    if (this.currentBgmKey) {
      const bgm = this.scene.sound.get(this.currentBgmKey);
      if (bgm) {
        if (fadeOut > 0) {
          this.scene.tweens.add({
            targets: bgm,
            volume: 0,
            duration: fadeOut,
            onComplete: () => {
              bgm.stop();
              this.currentBgmKey = null;
            },
          });
        } else {
          bgm.stop();
          this.currentBgmKey = null;
        }
      }
    }
  }

  pauseBgm(): void {
    if (this.currentBgmKey) {
      const bgm = this.scene.sound.get(this.currentBgmKey);
      if (bgm?.isPlaying) {
        bgm.pause();
      }
    }
  }

  resumeBgm(): void {
    if (this.currentBgmKey) {
      const bgm = this.scene.sound.get(this.currentBgmKey);
      if (bgm?.isPaused) {
        bgm.resume();
      }
    }
  }

  playFootstep(): void {
    const rate = 0.9 + Math.random() * 0.2;
    this.playSfx(SoundEffect.FOOTSTEP, { rate });
  }

  playAttackSound(isCritical: boolean = false): void {
    this.playSfx(isCritical ? SoundEffect.BATTLE_CRITICAL : SoundEffect.BATTLE_ATTACK);
  }

  playSkillSound(element: string): void {
    const elementMap: Record<string, SoundEffect> = {
      fire: SoundEffect.SKILL_FIRE,
      ice: SoundEffect.SKILL_ICE,
      lightning: SoundEffect.SKILL_LIGHTNING,
      wind: SoundEffect.SKILL_WIND,
      heal: SoundEffect.SKILL_HEAL,
    };
    this.playSfx(elementMap[element.toLowerCase()] || SoundEffect.BATTLE_SKILL);
  }

  getState(): { sfxVolume: number; bgmVolume: number; isMuted: boolean } {
    return {
      sfxVolume: this.sfxVolume,
      bgmVolume: this.bgmVolume,
      isMuted: this.isMuted,
    };
  }

  loadState(state: { sfxVolume?: number; bgmVolume?: number; isMuted?: boolean }): void {
    if (state.sfxVolume !== undefined) this.sfxVolume = state.sfxVolume;
    if (state.bgmVolume !== undefined) this.bgmVolume = state.bgmVolume;
    if (state.isMuted !== undefined) this.isMuted = state.isMuted;
  }
}

/**
 * Sound asset keys for loading
 */
export const SOUND_ASSETS = {
  sfx: [
    { key: 'sfx_ui_click', path: 'assets/audio/sfx/ui_click.mp3' },
    { key: 'sfx_battle_attack', path: 'assets/audio/sfx/battle_attack.mp3' },
    { key: 'sfx_battle_hit', path: 'assets/audio/sfx/battle_hit.mp3' },
    { key: 'sfx_battle_critical', path: 'assets/audio/sfx/battle_critical.mp3' },
    { key: 'sfx_skill_fire', path: 'assets/audio/sfx/skill_fire.mp3' },
    { key: 'sfx_skill_ice', path: 'assets/audio/sfx/skill_ice.mp3' },
    { key: 'sfx_skill_lightning', path: 'assets/audio/sfx/skill_lightning.mp3' },
    { key: 'sfx_footstep', path: 'assets/audio/sfx/footstep.mp3' },
    { key: 'sfx_level_up', path: 'assets/audio/sfx/level_up.mp3' },
    { key: 'sfx_item_get', path: 'assets/audio/sfx/item_get.mp3' },
  ],
  bgm: [
    { key: 'bgm_title', path: 'assets/audio/bgm/title.mp3' },
    { key: 'bgm_town', path: 'assets/audio/bgm/town.mp3' },
    { key: 'bgm_battle', path: 'assets/audio/bgm/battle.mp3' },
    { key: 'bgm_boss', path: 'assets/audio/bgm/boss.mp3' },
    { key: 'bgm_victory', path: 'assets/audio/bgm/victory.mp3' },
  ],
};