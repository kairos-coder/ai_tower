// ═══════════════════════════════════════════
// config.js — All constants, balance knobs, magic numbers
// ═══════════════════════════════════════════

const CONFIG = {
    // Grid
    GRID: {
        COLS: 16,
        ROWS: 24,
        GROUND_ROW: 18,
        CELL_SIZE: 36,
    },

    // Canvas
    CANVAS: {
        WIDTH: 16 * 36,  // GRID.COLS * GRID.CELL_SIZE
        HEIGHT: 600,
    },

    // Economy
    ECONOMY: {
        STARTING_MONEY: 200,
        TICK_INTERVAL: 10.0, // seconds between income pulses
    },

    // Room costs
    COSTS: {
        residential: 40,
        commercial: 60,
        utility: 30,
        elevator: 100,
    },

    // Base income per tick
    BASE_INCOME: {
        residential: 15,
        commercial: 25,
        utility: 0,
    },

    // Utility bonus per unit
    UTILITY_BONUS: 0.15, // +15% global income per utility room

    // Elevator
    ELEVATOR: {
        DEFAULT_CAPACITY: 6,
        DEFAULT_SPEED: 0.8, // floors per second
    },

    // Happiness
    HAPPINESS: {
        NEUTRAL: 0.7,
        DRIFT_RATE: 0.05,       // how fast happiness returns to neutral
        ELEVATOR_BONUS: 0.02,   // per tick, for adjacent elevator
        UTILITY_BONUS: 0.03,    // per tick, for adjacent utility
        CROWDING_PENALTY: 0.03, // per tick, no empty neighbors
        HAPPY_THRESHOLD: 0.7,
        NEUTRAL_THRESHOLD: 0.4,
    },

    // Colors
    COLORS: {
        RESIDENTIAL: '#e8a87c',
        COMMERCIAL: '#85cdca',
        UTILITY: '#c38d9e',
        ELEVATOR: '#ff6b6b',
        GROUND: '#6b6b3d',
        GRID_LINE: '#1a1a35',
        SKY_TOP: '#0a0a1e',
        SKY_MID: '#1a1a35',
        SKY_BOT: '#0d0d20',
        EMPTY_CELL: '#111125',
        HAPPY: '#6bcb77',
        NEUTRAL: '#ffd93d',
        UNHAPPY: '#ff6b6b',
        GOLD: '#ffd93d',
        LOG_DEFAULT: '#aaa',
        LOG_SUCCESS: '#6bcb77',
        LOG_WARNING: '#ffd93d',
        LOG_ERROR: '#ff6b6b',
        LOG_INFO: '#4ec9e0',
    },

    // Logging
    LOG: {
        MAX_ENTRIES: 30,
    },

    // Residents
    RESIDENTS: {
        DEFAULT_PER_RESIDENTIAL: 3,
        MAX_PER_RESIDENTIAL: 6,
    },
};

// Export for future module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}
window.CONFIG = CONFIG;
