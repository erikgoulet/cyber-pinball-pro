// Physics constants
export const PHYSICS = {
    GRAVITY: 0.4,
    DAMPING: 0.985,
    MAX_VELOCITY: 25,
    FLIPPER_POWER: 20,
    FLIPPER_BASE_POWER: 8
};

// Canvas dimensions
export const CANVAS = {
    WIDTH: 400,
    HEIGHT: 800
};

// Ball configuration
export const BALL = {
    RADIUS: 8,
    INITIAL_X: 370,
    INITIAL_Y: 600,
    TRAIL_LENGTH: 20,
    LAUNCH_MIN_POWER: 25,
    LAUNCH_MAX_POWER: 60,
    MAX_CHARGE_TIME: 2500
};

// Game settings
export const GAME = {
    INITIAL_BALLS: 3,
    BALL_LOST_Y: 820,
    TOP_WALL_Y: 120
};

// Colors
export const COLORS = {
    PRIMARY: '#00ffff',
    SECONDARY: '#ff6600',
    ACCENT: '#ff00ff',
    BACKGROUND: '#001122',
    GRID: 'rgba(0, 255, 255, 0.1)',
    TRAIL: 'rgba(0, 255, 255, 0.5)'
};

// Scoring
export const SCORING = {
    FLIPPER_HIT: 25,
    BUMPER_HIT: 100,
    ANGLED_BUMPER_HIT: 150,
    TARGET_HIT: 500,
    SPINNER_HIT: 50,
    RAMP_HIT: 75
};