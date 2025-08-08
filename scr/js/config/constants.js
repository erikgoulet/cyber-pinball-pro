import { getIsMobile } from '../utils/device.js';

// Physics constants - adaptive based on device
const isMobile = getIsMobile();

export const PHYSICS = {
    GRAVITY: isMobile ? 0.3 : 0.4,          // Gentler gravity on mobile
    DAMPING: isMobile ? 0.993 : 0.995,      // Slightly more damping on mobile
    MAX_VELOCITY: isMobile ? 15 : 18.75,    // 20% slower on mobile
    FLIPPER_POWER: 35,
    FLIPPER_BASE_POWER: 15,
    // Speed zone settings for progressive slowing near flippers
    REACTION_ZONE_Y: 0.8,                   // Start slowing at 80% down the table
    REACTION_ZONE_FACTOR: isMobile ? 0.75 : 0.85  // Slow to 75% speed on mobile, 85% on desktop
};

// Canvas dimensions
export const CANVAS = {
    WIDTH: 400,
    HEIGHT: 800
};

// Ball configuration - also adaptive for mobile
export const BALL = {
    RADIUS: 8,
    INITIAL_X: 365,  // Moved slightly left for better launch clearance
    INITIAL_Y: 720,  // Start at bottom of launcher chute
    TRAIL_LENGTH: 20,
    LAUNCH_MIN_POWER: isMobile ? 20 : 25,   // Increased for reliable launch
    LAUNCH_MAX_POWER: isMobile ? 45 : 55,   // Increased to ensure ball reaches top
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
    RAMP_HIT: 75,
    DROP_TARGET_HIT: 250,
    SKILL_LANE_HIT: 100,
    OUTLANE_HIT: 50,
    LOOP_ENTER: 100,
    LOOP_COMPLETE: 1000,
    BALL_LOCKED: 500,
    CAPTIVE_BALL_HIT: 150,
    MULTIBALL_START: 2000
};