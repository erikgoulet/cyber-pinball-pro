import { CANVAS, GAME, PHYSICS, SCORING } from '../config/constants.js';

export class Physics {
    constructor() {
        this.score = 0;
        this.scoreCallback = null;
    }
    
    setScoreCallback(callback) {
        this.scoreCallback = callback;
    }
    
    addScore(points) {
        this.score += points;
        if (this.scoreCallback) {
            this.scoreCallback(points);
        }
    }
    
    checkWalls(ball) {
        // Left wall
        if (ball.x - ball.radius < 15) {
            ball.x = 15 + ball.radius;
            ball.vx = Math.abs(ball.vx) * 0.8;
        }
        
        // Right wall
        if (ball.x + ball.radius > 385) {
            ball.x = 385 - ball.radius;
            ball.vx = -Math.abs(ball.vx) * 0.8;
        }
        
        // Playfield boundary for unlaunched ball
        if (!ball.launched && ball.x < 350) {
            ball.x = 350;
            ball.vx = Math.abs(ball.vx) * 0.5;
        }
        
        // Top wall
        if (ball.y - ball.radius < GAME.TOP_WALL_Y) {
            ball.y = GAME.TOP_WALL_Y + ball.radius;
            ball.vy = Math.abs(ball.vy) * 0.8;
        }
        
        // Angled guardrails near flippers
        if (ball.y > 650) {
            // Left guardrail
            const leftGuardX = 15 + (ball.y - 650) * (100 - 15) / (730 - 650);
            if (ball.x - ball.radius < leftGuardX) {
                ball.x = leftGuardX + ball.radius;
                
                const angle = Math.atan2(80, 85);
                const normal = { x: Math.sin(angle), y: -Math.cos(angle) };
                
                const dot = ball.vx * normal.x + ball.vy * normal.y;
                ball.vx = (ball.vx - 2 * dot * normal.x) * 0.8;
                ball.vy = (ball.vy - 2 * dot * normal.y) * 0.8;
            }
            
            // Right guardrail
            const rightGuardX = 385 - (ball.y - 650) * (385 - 300) / (730 - 650);
            if (ball.x + ball.radius > rightGuardX) {
                ball.x = rightGuardX - ball.radius;
                
                const angle = Math.atan2(80, -85);
                const normal = { x: Math.sin(angle), y: -Math.cos(angle) };
                
                const dot = ball.vx * normal.x + ball.vy * normal.y;
                ball.vx = (ball.vx - 2 * dot * normal.x) * 0.8;
                ball.vy = (ball.vy - 2 * dot * normal.y) * 0.8;
            }
        }
    }
    
    checkFlipperCollision(ball, flipper, isLeft) {
        const fx = flipper.x;
        const fy = flipper.y;
        const endPoint = flipper.getEndPoint();
        const fex = endPoint.x;
        const fey = endPoint.y;
        
        // Get closest point on flipper
        const dx = fex - fx;
        const dy = fey - fy;
        const len = Math.sqrt(dx * dx + dy * dy);
        
        if (len === 0) return;
        
        const nx = dx / len;
        const ny = dy / len;
        
        const t = Math.max(0, Math.min(len, ((ball.x - fx) * nx + (ball.y - fy) * ny)));
        const closestX = fx + nx * t;
        const closestY = fy + ny * t;
        
        const dist = Math.sqrt((ball.x - closestX) * (ball.x - closestX) + (ball.y - closestY) * (ball.y - closestY));
        
        if (dist < ball.radius + 5) {
            // Calculate normal
            const normalX = (ball.x - closestX) / dist;
            const normalY = (ball.y - closestY) / dist;
            
            // Move ball out
            ball.setPosition(
                closestX + normalX * (ball.radius + 5),
                closestY + normalY * (ball.radius + 5)
            );
            
            // Apply impulse
            const flipperSpeed = flipper.getSpeed();
            const power = Math.max(PHYSICS.FLIPPER_BASE_POWER, flipperSpeed);
            
            ball.setVelocity(
                normalX * power + (isLeft ? 2 : -2),
                normalY * power - 3
            );
            
            this.addScore(SCORING.FLIPPER_HIT);
        }
    }
    
    checkBumperCollision(ball, bumper) {
        const dx = ball.x - bumper.x;
        const dy = ball.y - bumper.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < ball.radius + bumper.radius) {
            // Normalize
            const nx = dx / dist;
            const ny = dy / dist;
            
            // Move ball out
            ball.setPosition(
                bumper.x + nx * (ball.radius + bumper.radius),
                bumper.y + ny * (ball.radius + bumper.radius)
            );
            
            // Apply force
            ball.setVelocity(nx * bumper.power, ny * bumper.power);
            
            this.addScore(SCORING.BUMPER_HIT);
            
            // Visual feedback
            bumper.hit = 10;
            
            return true;
        }
        
        return false;
    }
    
    checkAngledBumperCollision(ball, bumper) {
        // Calculate distance to line segment
        const lineLen = Math.sqrt((bumper.x2 - bumper.x1) ** 2 + (bumper.y2 - bumper.y1) ** 2);
        const t = Math.max(0, Math.min(1, ((ball.x - bumper.x1) * (bumper.x2 - bumper.x1) + (ball.y - bumper.y1) * (bumper.y2 - bumper.y1)) / (lineLen * lineLen)));
        const closestX = bumper.x1 + t * (bumper.x2 - bumper.x1);
        const closestY = bumper.y1 + t * (bumper.y2 - bumper.y1);
        
        const dist = Math.sqrt((ball.x - closestX) ** 2 + (ball.y - closestY) ** 2);
        
        if (dist < ball.radius + bumper.width / 2) {
            // Calculate normal
            const dx = bumper.x2 - bumper.x1;
            const dy = bumper.y2 - bumper.y1;
            const len = Math.sqrt(dx * dx + dy * dy);
            
            // Normal perpendicular to the bumper
            const normalX = -dy / len;
            const normalY = dx / len;
            
            // Determine which side of the bumper the ball is on
            const side = (ball.x - bumper.x1) * normalX + (ball.y - bumper.y1) * normalY;
            const nx = side > 0 ? normalX : -normalX;
            const ny = side > 0 ? normalY : -normalY;
            
            // Move ball out
            const overlap = (ball.radius + bumper.width / 2) - dist;
            ball.x += nx * overlap;
            ball.y += ny * overlap;
            
            // Apply bounce
            const dot = ball.vx * nx + ball.vy * ny;
            ball.vx = ball.vx - 2 * dot * nx;
            ball.vy = ball.vy - 2 * dot * ny;
            
            // Add power boost
            ball.vx += nx * bumper.power;
            ball.vy += ny * bumper.power;
            
            this.addScore(SCORING.ANGLED_BUMPER_HIT);
            
            // Visual feedback
            bumper.hit = 10;
            
            return true;
        }
        
        return false;
    }
    
    checkTargetCollision(ball, target) {
        if (!target.hit &&
            ball.x + ball.radius > target.x &&
            ball.x - ball.radius < target.x + target.width &&
            ball.y + ball.radius > target.y &&
            ball.y - ball.radius < target.y + target.height) {
            
            target.hit = true;
            
            // Bounce
            if (ball.x < target.x + target.width / 2) {
                ball.vx = -Math.abs(ball.vx) * 0.8;
            } else {
                ball.vx = Math.abs(ball.vx) * 0.8;
            }
            
            this.addScore(target.points);
            
            return true;
        }
        
        return false;
    }
    
    checkSpinnerCollision(ball, spinner) {
        const dx = ball.x - spinner.x;
        const dy = ball.y - spinner.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < ball.radius + 20) {
            if (!spinner.spinning) {
                spinner.spinning = true;
                spinner.spinSpeed = 0.3;
                
                // Add spin to ball
                const angle = Math.atan2(dy, dx) + Math.PI / 2;
                ball.applyForce(Math.cos(angle) * 2, Math.sin(angle) * 2);
                
                this.addScore(SCORING.SPINNER_HIT);
                
                return true;
            }
        }
        
        return false;
    }
    
    checkRampCollision(ball, ramp) {
        // Simple distance to line segment
        const lineLen = Math.sqrt((ramp.x2 - ramp.x1) ** 2 + (ramp.y2 - ramp.y1) ** 2);
        const t = Math.max(0, Math.min(1, ((ball.x - ramp.x1) * (ramp.x2 - ramp.x1) + (ball.y - ramp.y1) * (ramp.y2 - ramp.y1)) / (lineLen * lineLen)));
        const closestX = ramp.x1 + t * (ramp.x2 - ramp.x1);
        const closestY = ramp.y1 + t * (ramp.y2 - ramp.y1);
        
        const dist = Math.sqrt((ball.x - closestX) ** 2 + (ball.y - closestY) ** 2);
        
        if (dist < ball.radius + ramp.width / 2) {
            // Boost along ramp
            const rampAngle = Math.atan2(ramp.y2 - ramp.y1, ramp.x2 - ramp.x1);
            const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
            
            ball.setVelocity(
                Math.cos(rampAngle) * speed * 1.2,
                Math.sin(rampAngle) * speed * 1.2
            );
            
            this.addScore(SCORING.RAMP_HIT);
            
            return true;
        }
        
        return false;
    }
}