import { getIsMobile } from '../utils/device.js';

// Physics constants - adaptive based on device
const isMobile = getIsMobile();

export const PHYSICS = {
    GRAVITY: isMobile ? 0.3 : 0.4,          // Gentler gravity on mobile
    DAMPING: isMobile ? 0.99 : 0.995,       // More damping on mobile
    MAX_VELOCITY: isMobile ? 12 : 18.75,    // 36% slower on mobile
    FLIPPER_POWER: 25,
    FLIPPER_BASE_POWER: 10,
    // Speed zone settings for progressive slowing near flippers
    REACTION_ZONE_Y: 0.7,                   // Start slowing at 70% down the table
    REACTION_ZONE_FACTOR: isMobile ? 0.6 : 0.8  // Slow to 60% speed on mobile, 80% on desktop
};

// Canvas dimensions
export const CANVAS = {
    WIDTH: 400,
    HEIGHT: 800
};

// Ball configuration - also adaptive for mobile
export const BALL = {
    RADIUS: 8,
    INITIAL_X: 370,
    INITIAL_Y: 600,
    TRAIL_LENGTH: 20,
    LAUNCH_MIN_POWER: isMobile ? 12 : 18.75,   // Lower launch power on mobile
    LAUNCH_MAX_POWER: isMobile ? 30 : 45,       // Lower max power on mobile
    MAX_CHARGE_TIME: 2500
};

// Game settings
export const GAME = {
    INITIAL_BALLS: 3,
    BALL_LOST_Y: 820,
    TOP_WALL_Y: 50
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