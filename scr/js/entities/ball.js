import { BALL, PHYSICS, CANVAS } from '../config/constants.js';

export class Ball {
    constructor(x = BALL.INITIAL_X, y = BALL.INITIAL_Y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.radius = BALL.RADIUS;
        this.launched = false;
        this.trail = [];
    }
    
    update() {
        if (!this.launched) return;
        
        // Apply physics
        this.vy += PHYSICS.GRAVITY;
        this.vx *= PHYSICS.DAMPING;
        this.vy *= PHYSICS.DAMPING;
        
        // Limit velocity
        const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
        if (speed > PHYSICS.MAX_VELOCITY) {
            this.vx = (this.vx / speed) * PHYSICS.MAX_VELOCITY;
            this.vy = (this.vy / speed) * PHYSICS.MAX_VELOCITY;
        }
        
        // NOTE: Position update moved to after collision detection
    }
    
    updatePosition() {
        // Update position
        this.x += this.vx;
        this.y += this.vy;
        
        // Update trail
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > BALL.TRAIL_LENGTH) {
            this.trail.shift();
        }
    }
    
    launch(power) {
        // Launch upward from plunger
        this.vy = -power;
        // Stronger leftward angle to clear the right-side obstacles
        this.vx = -8 - (Math.random() * 4); // -8 to -12 for stronger leftward launch
        this.launched = true;
    }
    
    reset() {
        this.x = BALL.INITIAL_X;
        this.y = BALL.INITIAL_Y;
        this.vx = 0;
        this.vy = 0;
        this.launched = false;
        this.trail = [];
    }
    
    applyForce(fx, fy) {
        this.vx += fx;
        this.vy += fy;
    }
    
    setVelocity(vx, vy) {
        this.vx = vx;
        this.vy = vy;
    }
    
    setPosition(x, y) {
        this.x = x;
        this.y = y;
    }
}