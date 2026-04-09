/**
 * Mini-game System - Gambling mini-games
 * US-043: 小游戏系统
 */

/**
 * Mini-game types
 */
export enum MiniGameType {
  GUESS_SIZE = 'guess_size',       // 猜大小
  CARD_MATCH = 'card_match',       // 翻牌配对
}

/**
 * Mini-game result
 */
export interface MiniGameResult {
  success: boolean;
  goldChange: number;
  message: string;
  stats?: Record<string, number>;  // Game-specific stats
}

/**
 * Guess size game configuration
 */
export interface GuessSizeConfig {
  minBet: number;
  maxBet: number;
  betSteps: number[];  // Allowed bet amounts
}

/**
 * Guess size game state
 */
export interface GuessSizeState {
  currentNumber: number;    // 1-100
  bet: number;
  guess: 'big' | 'small' | null;
  result: 'win' | 'lose' | null;
  payout: number;
}

/**
 * Card match game configuration
 */
export interface CardMatchConfig {
  minBet: number;
  maxBet: number;
  gridWidth: number;        // Number of columns
  gridHeight: number;       // Number of rows
  timeLimit: number;        // Time limit in seconds
  basePayout: number;       // Base payout multiplier
}

/**
 * Card match game state
 */
export interface CardMatchState {
  cards: CardMatchCard[];
  flippedCards: number[];   // Indices of currently flipped cards
  matchedPairs: number;     // Number of matched pairs
  attempts: number;         // Total flip attempts
  timeRemaining: number;    // Seconds remaining
  bet: number;
  gameStarted: boolean;
  gameEnded: boolean;
}

/**
 * Card for card match game
 */
export interface CardMatchCard {
  id: number;
  symbol: string;           // Card symbol (emoji or character)
  matched: boolean;
  flipped: boolean;
}

/**
 * Default configurations
 */
export const DEFAULT_GUESS_SIZE_CONFIG: GuessSizeConfig = {
  minBet: 10,
  maxBet: 1000,
  betSteps: [10, 50, 100, 200, 500, 1000],
};

export const DEFAULT_CARD_MATCH_CONFIG: CardMatchConfig = {
  minBet: 20,
  maxBet: 500,
  gridWidth: 4,
  gridHeight: 3,
  timeLimit: 60,
  basePayout: 2,
};

/**
 * Card symbols for card match game
 */
const CARD_SYMBOLS = ['🗡️', '🔮', '💎', '🌙', '⭐', '🔥', '💧', '🌿', '⚡', '❄️', '☀️', '🌙'];

/**
 * Mini-game System class
 * Manages gambling mini-games
 */
export class MiniGameSystem {
  private guessSizeConfig: GuessSizeConfig;
  private cardMatchConfig: CardMatchConfig;

  constructor(
    guessSizeConfig?: Partial<GuessSizeConfig>,
    cardMatchConfig?: Partial<CardMatchConfig>
  ) {
    this.guessSizeConfig = { ...DEFAULT_GUESS_SIZE_CONFIG, ...guessSizeConfig };
    this.cardMatchConfig = { ...DEFAULT_CARD_MATCH_CONFIG, ...cardMatchConfig };
  }

  // ==================== 猜大小 (Guess Size) ====================

  /**
   * Initialize a new guess size game
   */
  initGuessSizeGame(): GuessSizeState {
    return {
      currentNumber: 0,
      bet: this.guessSizeConfig.minBet,
      guess: null,
      result: null,
      payout: 0,
    };
  }

  /**
   * Roll a number for guess size game
   */
  rollNumber(): number {
    // Roll a number between 1-100
    return Math.floor(Math.random() * 100) + 1;
  }

  /**
   * Play guess size game
   */
  playGuessSize(bet: number, guess: 'big' | 'small', playerGold: number): {
    state: GuessSizeState;
    result: MiniGameResult;
  } {
    // Validate bet
    if (bet < this.guessSizeConfig.minBet || bet > this.guessSizeConfig.maxBet) {
      return {
        state: this.initGuessSizeGame(),
        result: {
          success: false,
          goldChange: 0,
          message: `赌注必须在 ${this.guessSizeConfig.minBet} 到 ${this.guessSizeConfig.maxBet} 之间`,
        },
      };
    }

    if (bet > playerGold) {
      return {
        state: this.initGuessSizeGame(),
        result: {
          success: false,
          goldChange: 0,
          message: '你的金钱不足！',
        },
      };
    }

    // Roll the number
    const number = this.rollNumber();

    // Determine result (1-50 = small, 51-100 = big)
    const actualSize = number <= 50 ? 'small' : 'big';
    const won = guess === actualSize;

    // Calculate payout (win = 2x bet)
    const payout = won ? bet * 2 : 0;
    const goldChange = won ? bet : -bet;

    const state: GuessSizeState = {
      currentNumber: number,
      bet,
      guess,
      result: won ? 'win' : 'lose',
      payout,
    };

    return {
      state,
      result: {
        success: won,
        goldChange,
        message: won
          ? `恭喜！数字是 ${number}（${actualSize === 'big' ? '大' : '小'}），你赢得了 ${payout} 金币！`
          : `可惜！数字是 ${number}（${actualSize === 'big' ? '大' : '小'}），你输了 ${bet} 金币。`,
        stats: { number, actualSize: actualSize === 'big' ? 1 : 0 },
      },
    };
  }

  /**
   * Get guess size config
   */
  getGuessSizeConfig(): GuessSizeConfig {
    return { ...this.guessSizeConfig };
  }

  // ==================== 翻牌配对 (Card Match) ====================

  /**
   * Initialize a new card match game
   */
  initCardMatchGame(bet: number): CardMatchState {
    const totalCards = this.cardMatchConfig.gridWidth * this.cardMatchConfig.gridHeight;
    const pairs = totalCards / 2;

    // Create card pairs
    const symbols = CARD_SYMBOLS.slice(0, pairs);
    const cards: CardMatchCard[] = [];

    for (let i = 0; i < pairs; i++) {
      // Create two cards with same symbol
      cards.push(
        { id: i * 2, symbol: symbols[i], matched: false, flipped: false },
        { id: i * 2 + 1, symbol: symbols[i], matched: false, flipped: false }
      );
    }

    // Shuffle cards
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    // Reassign IDs after shuffle
    cards.forEach((card, index) => {
      card.id = index;
    });

    return {
      cards,
      flippedCards: [],
      matchedPairs: 0,
      attempts: 0,
      timeRemaining: this.cardMatchConfig.timeLimit,
      bet,
      gameStarted: false,
      gameEnded: false,
    };
  }

  /**
   * Flip a card in card match game
   */
  flipCard(state: CardMatchState, cardIndex: number): {
    state: CardMatchState;
    matchFound: boolean;
    gameComplete: boolean;
  } {
    // Can't flip if already flipped, matched, or game ended
    if (state.gameEnded || state.cards[cardIndex].flipped || state.cards[cardIndex].matched) {
      return { state, matchFound: false, gameComplete: false };
    }

    // Can only flip 2 cards at a time
    if (state.flippedCards.length >= 2) {
      return { state, matchFound: false, gameComplete: false };
    }

    // Start game timer on first flip
    if (!state.gameStarted) {
      state.gameStarted = true;
    }

    // Flip the card
    state.cards[cardIndex].flipped = true;
    state.flippedCards.push(cardIndex);
    state.attempts++;

    // Check for match if two cards are flipped
    if (state.flippedCards.length === 2) {
      const [first, second] = state.flippedCards;
      const card1 = state.cards[first];
      const card2 = state.cards[second];

      if (card1.symbol === card2.symbol) {
        // Match found
        card1.matched = true;
        card2.matched = true;
        state.matchedPairs++;
        state.flippedCards = [];

        // Check if game complete
        const totalPairs = state.cards.length / 2;
        const gameComplete = state.matchedPairs >= totalPairs;

        return { state, matchFound: true, gameComplete };
      }
    }

    return { state, matchFound: false, gameComplete: false };
  }

  /**
   * Unflip unmatched cards (after delay)
   */
  unflipCards(state: CardMatchState): CardMatchState {
    if (state.flippedCards.length === 2) {
      const [first, second] = state.flippedCards;
      if (!state.cards[first].matched && !state.cards[second].matched) {
        state.cards[first].flipped = false;
        state.cards[second].flipped = false;
      }
      state.flippedCards = [];
    }
    return state;
  }

  /**
   * Update time remaining (call each second)
   */
  updateTime(state: CardMatchState): CardMatchState {
    if (!state.gameStarted || state.gameEnded) {
      return state;
    }

    state.timeRemaining--;

    if (state.timeRemaining <= 0) {
      state.gameEnded = true;
      state.timeRemaining = 0;
    }

    return state;
  }

  /**
   * Calculate card match game result
   */
  calculateCardMatchResult(state: CardMatchState, _playerGold: number): MiniGameResult {
    const totalPairs = state.cards.length / 2;

    // Check if won
    if (state.matchedPairs >= totalPairs) {
      // Calculate payout based on time remaining and attempts
      const timeBonus = state.timeRemaining * 2;
      const efficiencyBonus = Math.max(0, (totalPairs * 2) - state.attempts + totalPairs);
      const totalPayout = state.bet * this.cardMatchConfig.basePayout + timeBonus + efficiencyBonus;

      return {
        success: true,
        goldChange: totalPayout - state.bet,
        message: `恭喜！你在 ${this.cardMatchConfig.timeLimit - state.timeRemaining} 秒内完成配对，赢得 ${totalPayout} 金币！`,
        stats: {
          matchedPairs: state.matchedPairs,
          attempts: state.attempts,
          timeUsed: this.cardMatchConfig.timeLimit - state.timeRemaining,
        },
      };
    } else {
      // Time ran out or game failed
      return {
        success: false,
        goldChange: -state.bet,
        message: `时间到！你配对了 ${state.matchedPairs}/${totalPairs} 对，输了 ${state.bet} 金币。`,
        stats: {
          matchedPairs: state.matchedPairs,
          attempts: state.attempts,
          timeUsed: this.cardMatchConfig.timeLimit,
        },
      };
    }
  }

  /**
   * Get card match config
   */
  getCardMatchConfig(): CardMatchConfig {
    return { ...this.cardMatchConfig };
  }

  // ==================== Utility Methods ====================

  /**
   * Check if player can afford minimum bet
   */
  canAffordMiniGame(type: MiniGameType, playerGold: number): boolean {
    switch (type) {
      case MiniGameType.GUESS_SIZE:
        return playerGold >= this.guessSizeConfig.minBet;
      case MiniGameType.CARD_MATCH:
        return playerGold >= this.cardMatchConfig.minBet;
      default:
        return false;
    }
  }

  /**
   * Get minimum bet for game type
   */
  getMinBet(type: MiniGameType): number {
    switch (type) {
      case MiniGameType.GUESS_SIZE:
        return this.guessSizeConfig.minBet;
      case MiniGameType.CARD_MATCH:
        return this.cardMatchConfig.minBet;
      default:
        return 0;
    }
  }

  /**
   * Get maximum bet for game type
   */
  getMaxBet(type: MiniGameType): number {
    switch (type) {
      case MiniGameType.GUESS_SIZE:
        return this.guessSizeConfig.maxBet;
      case MiniGameType.CARD_MATCH:
        return this.cardMatchConfig.maxBet;
      default:
        return 0;
    }
  }
}

/**
 * Default mini-game system instance
 */
export const miniGameSystem = new MiniGameSystem();