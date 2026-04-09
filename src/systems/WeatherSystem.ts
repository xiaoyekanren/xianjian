/**
 * Weather and Time System - Dynamic weather and day/night cycle
 * US-044: 天气时间系统
 */

/**
 * Weather types
 */
export enum WeatherType {
  CLEAR = 'clear',         // 晴天
  RAIN = 'rain',           // 雨天
  SNOW = 'now',            // 雪天
  FOG = 'fog',             // 雾天
  NIGHT = 'night',         // 夜晚
}

/**
 * Time of day
 */
export enum TimeOfDay {
  DAWN = 'dawn',           // 黎明 (5:00-7:00)
  MORNING = 'morning',     // 上午 (7:00-12:00)
  AFTERNOON = 'afternoon', // 下午 (12:00-17:00)
  DUSK = 'dusk',           // 黄昏 (17:00-19:00)
  NIGHT = 'night',         // 夜晚 (19:00-5:00)
}

/**
 * Weather configuration
 */
export interface WeatherConfig {
  type: WeatherType;
  intensity: number;       // 0.0-1.0
  duration: number;        // Duration in game minutes
  particleCount?: number;  // Number of particles for visual effect
  particleSpeed?: number;  // Particle fall speed
  color?: string;          // Overlay color
}

/**
 * Time configuration
 */
export interface TimeConfig {
  currentHour: number;     // 0-23
  currentMinute: number;   // 0-59
  dayCount: number;        // Number of days elapsed
  timeScale: number;       // Game minutes per real second
}

/**
 * Weather effect on gameplay
 */
export interface WeatherEffect {
  weatherType: WeatherType;
  enemyStatModifier?: {
    attack?: number;       // Percentage modifier
    defense?: number;
    speed?: number;
  };
  movementModifier?: number; // Movement speed modifier
  visibilityRange?: number;  // Visibility distance
  encounterRate?: number;    // Random encounter rate modifier
}

/**
 * Default weather effects
 */
const WEATHER_EFFECTS: Record<WeatherType, WeatherEffect> = {
  [WeatherType.CLEAR]: {
    weatherType: WeatherType.CLEAR,
    encounterRate: 1.0,
    movementModifier: 1.0,
    visibilityRange: 1.0,
  },
  [WeatherType.RAIN]: {
    weatherType: WeatherType.RAIN,
    enemyStatModifier: { attack: 1.1, speed: 0.9 },
    movementModifier: 0.9,
    visibilityRange: 0.8,
    encounterRate: 1.2,
  },
  [WeatherType.SNOW]: {
    weatherType: WeatherType.SNOW,
    enemyStatModifier: { attack: 0.9, speed: 0.8 },
    movementModifier: 0.8,
    visibilityRange: 0.6,
    encounterRate: 0.8,
  },
  [WeatherType.FOG]: {
    weatherType: WeatherType.FOG,
    enemyStatModifier: { defense: 1.1 },
    movementModifier: 1.0,
    visibilityRange: 0.5,
    encounterRate: 1.5,
  },
  [WeatherType.NIGHT]: {
    weatherType: WeatherType.NIGHT,
    enemyStatModifier: { attack: 1.15, speed: 1.1 },
    movementModifier: 1.0,
    visibilityRange: 0.7,
    encounterRate: 1.3,
  },
};

/**
 * Time-based lighting configuration
 */
const TIME_LIGHTING: Record<TimeOfDay, { ambient: number; color: string }> = {
  [TimeOfDay.DAWN]: { ambient: 0.8, color: '#FFB6C1' },
  [TimeOfDay.MORNING]: { ambient: 1.0, color: '#FFFFFF' },
  [TimeOfDay.AFTERNOON]: { ambient: 0.95, color: '#FFF8DC' },
  [TimeOfDay.DUSK]: { ambient: 0.7, color: '#FFA07A' },
  [TimeOfDay.NIGHT]: { ambient: 0.4, color: '#4169E1' },
};

/**
 * Weather System class
 * Manages weather, time, and their effects on gameplay
 */
export class WeatherSystem {
  private currentWeather: WeatherConfig;
  private time: TimeConfig;
  private weatherQueue: WeatherConfig[] = [];
  private weatherTimer: number = 0;

  constructor(config?: Partial<TimeConfig>) {
    this.currentWeather = {
      type: WeatherType.CLEAR,
      intensity: 0,
      duration: 0,
    };

    this.time = {
      currentHour: 8,  // Start at 8 AM
      currentMinute: 0,
      dayCount: 1,
      timeScale: 10,   // 10 game minutes per real second
      ...config,
    };
  }

  // ==================== Time Management ====================

  /**
   * Update game time
   * @param deltaMs Real milliseconds elapsed
   */
  updateTime(deltaMs: number): void {
    const realSeconds = deltaMs / 1000;
    const gameMinutes = realSeconds * this.time.timeScale;

    this.time.currentMinute += gameMinutes;

    // Handle hour overflow
    while (this.time.currentMinute >= 60) {
      this.time.currentMinute -= 60;
      this.time.currentHour++;

      // Handle day overflow
      if (this.time.currentHour >= 24) {
        this.time.currentHour = 0;
        this.time.dayCount++;
        this.onDayChange();
      }
    }

    // Update weather duration
    this.weatherTimer -= gameMinutes;
    if (this.weatherTimer <= 0 && this.weatherQueue.length > 0) {
      this.setNextWeather();
    }
  }

  /**
   * Get current time of day
   */
  getTimeOfDay(): TimeOfDay {
    const hour = this.time.currentHour;

    if (hour >= 5 && hour < 7) return TimeOfDay.DAWN;
    if (hour >= 7 && hour < 12) return TimeOfDay.MORNING;
    if (hour >= 12 && hour < 17) return TimeOfDay.AFTERNOON;
    if (hour >= 17 && hour < 19) return TimeOfDay.DUSK;
    return TimeOfDay.NIGHT;
  }

  /**
   * Get formatted time string
   */
  getTimeString(): string {
    const hour = Math.floor(this.time.currentHour).toString().padStart(2, '0');
    const minute = Math.floor(this.time.currentMinute).toString().padStart(2, '0');
    return `${hour}:${minute}`;
  }

  /**
   * Get current hour (0-23)
   */
  getCurrentHour(): number {
    return this.time.currentHour;
  }

  /**
   * Get day count
   */
  getDayCount(): number {
    return this.time.dayCount;
  }

  /**
   * Set time directly
   */
  setTime(hour: number, minute: number = 0): void {
    this.time.currentHour = Math.max(0, Math.min(23, hour));
    this.time.currentMinute = Math.max(0, Math.min(59, minute));
  }

  /**
   * Get lighting for current time
   */
  getLighting(): { ambient: number; color: string } {
    return TIME_LIGHTING[this.getTimeOfDay()];
  }

  /**
   * Check if it's night time
   */
  isNight(): boolean {
    return this.getTimeOfDay() === TimeOfDay.NIGHT;
  }

  // ==================== Weather Management ====================

  /**
   * Set current weather
   */
  setWeather(weather: WeatherConfig): void {
    this.currentWeather = { ...weather };
    this.weatherTimer = weather.duration;
    console.log(`Weather changed to ${weather.type} (intensity: ${weather.intensity})`);
  }

  /**
   * Set weather by type
   */
  setWeatherType(type: WeatherType, intensity: number = 0.5, duration: number = 60): void {
    this.setWeather({ type, intensity, duration });
  }

  /**
   * Get current weather
   */
  getCurrentWeather(): WeatherConfig {
    return { ...this.currentWeather };
  }

  /**
   * Get weather type
   */
  getWeatherType(): WeatherType {
    return this.currentWeather.type;
  }

  /**
   * Queue next weather
   */
  queueWeather(weather: WeatherConfig): void {
    this.weatherQueue.push(weather);
  }

  /**
   * Set next weather from queue
   */
  private setNextWeather(): void {
    const nextWeather = this.weatherQueue.shift();
    if (nextWeather) {
      this.setWeather(nextWeather);
    }
  }

  /**
   * Generate random weather
   */
  generateRandomWeather(): WeatherConfig {
    const types = [WeatherType.CLEAR, WeatherType.RAIN, WeatherType.SNOW, WeatherType.FOG];
    const type = types[Math.floor(Math.random() * types.length)];
    const intensity = 0.3 + Math.random() * 0.7;
    const duration = 30 + Math.random() * 120;

    return { type, intensity, duration };
  }

  /**
   * Get weather effect on gameplay
   */
  getWeatherEffect(): WeatherEffect {
    // Combine weather and time effects
    const weatherEffect = WEATHER_EFFECTS[this.currentWeather.type];
    const timeEffect = this.isNight() ? WEATHER_EFFECTS[WeatherType.NIGHT] : null;

    if (!timeEffect) return weatherEffect;

    // Combine effects
    return {
      weatherType: this.currentWeather.type,
      enemyStatModifier: {
        attack: (weatherEffect.enemyStatModifier?.attack || 1) * (timeEffect.enemyStatModifier?.attack || 1),
        defense: (weatherEffect.enemyStatModifier?.defense || 1) * (timeEffect.enemyStatModifier?.defense || 1),
        speed: (weatherEffect.enemyStatModifier?.speed || 1) * (timeEffect.enemyStatModifier?.speed || 1),
      },
      movementModifier: (weatherEffect.movementModifier || 1) * (timeEffect.movementModifier || 1),
      visibilityRange: Math.min(
        weatherEffect.visibilityRange || 1,
        timeEffect.visibilityRange || 1
      ),
      encounterRate: (weatherEffect.encounterRate || 1) * (timeEffect.encounterRate || 1),
    };
  }

  /**
   * Get weather particle configuration for visual effects
   */
  getParticleConfig(): {
    enabled: boolean;
    type: 'rain' | 'snow' | 'fog' | 'none';
    count: number;
    speed: number;
    color: string;
  } {
    const baseCount = 100;
    const count = Math.floor(baseCount * this.currentWeather.intensity);

    switch (this.currentWeather.type) {
      case WeatherType.RAIN:
        return {
          enabled: true,
          type: 'rain',
          count,
          speed: 300 + this.currentWeather.intensity * 200,
          color: '#6699CC',
        };
      case WeatherType.SNOW:
        return {
          enabled: true,
          type: 'snow',
          count: Math.floor(count * 0.5),
          speed: 50 + this.currentWeather.intensity * 30,
          color: '#FFFFFF',
        };
      case WeatherType.FOG:
        return {
          enabled: true,
          type: 'fog',
          count: Math.floor(count * 0.3),
          speed: 10,
          color: '#CCCCCC',
        };
      default:
        return {
          enabled: false,
          type: 'none',
          count: 0,
          speed: 0,
          color: '#FFFFFF',
        };
    }
  }

  // ==================== Event Handlers ====================

  /**
   * Handle day change
   */
  private onDayChange(): void {
    console.log(`Day ${this.time.dayCount} begins`);

    // Random chance for weather change
    if (Math.random() < 0.5) {
      const newWeather = this.generateRandomWeather();
      this.queueWeather(newWeather);
    }
  }

  // ==================== Save/Load ====================

  /**
   * Export weather and time state
   */
  exportState(): {
    weather: WeatherConfig;
    time: TimeConfig;
    weatherQueue: WeatherConfig[];
  } {
    return {
      weather: { ...this.currentWeather },
      time: { ...this.time },
      weatherQueue: this.weatherQueue.map(w => ({ ...w })),
    };
  }

  /**
   * Load weather and time state
   */
  loadState(state: { weather: WeatherConfig; time: TimeConfig; weatherQueue?: WeatherConfig[] }): void {
    this.currentWeather = { ...state.weather };
    this.time = { ...state.time };
    this.weatherQueue = (state.weatherQueue || []).map(w => ({ ...w }));
    this.weatherTimer = state.weather.duration;
  }

  /**
   * Reset to defaults
   */
  reset(): void {
    this.currentWeather = {
      type: WeatherType.CLEAR,
      intensity: 0,
      duration: 0,
    };
    this.time = {
      currentHour: 8,
      currentMinute: 0,
      dayCount: 1,
      timeScale: 10,
    };
    this.weatherQueue = [];
    this.weatherTimer = 0;
  }
}

/**
 * Default weather system instance
 */
export const weatherSystem = new WeatherSystem();