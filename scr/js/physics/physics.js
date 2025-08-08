import { CANVAS, GAME, PHYSICS, SCORING } from '../config/constants.js';

export class Physics {
    constructor() {
        this.score = 0;
        this.scoreCallback = null;
        this.collisionCallback = null;
        this.lastFlipperHit = { left: 0, right: 0 }; // Track last hit time
    }
    
    setScoreCallback(callback) {
        this.scoreCallback = callback;
    }
    
    setCollisionCallback(callback) {
        this.collisionCallback = callback;
    }
    
    addScore(points) {
        this.score += points;
        if (this.scoreCallback) {
            this.scoreCallback(points);
        }
    }
    
    checkWalls(ball) {
        // Define table boundaries including curved corners
        const cornerRadius = 35;
        const leftX = 15;
        const rightX = 385;
        const topY = GAME.TOP_WALL_Y;
        
        // Launcher chute boundaries
        const launcherLeft = 358;
        const launcherRight = 382;
        const launcherTop = 480;
        const launcherBottom = 750;
        
        // Corner centers
        const leftCornerX = leftX + cornerRadius;
        const leftCornerY = topY + cornerRadius;
        const rightCornerX = rightX - cornerRadius;
        const rightCornerY = topY + cornerRadius;
        
        // Check if ball is in launcher chute horizontally
        const inLauncherX = ball.x >= launcherLeft && ball.x <= launcherRight;
        
        // Before launch, constrain ball to launcher
        if (!ball.launched && inLauncherX && ball.y >= launcherTop) {
            // Constrain to launcher walls
            if (ball.x - ball.radius < launcherLeft) {
                ball.x = launcherLeft + ball.radius;
                ball.vx = Math.abs(ball.vx) * 0.9;
            }
            if (ball.x + ball.radius > launcherRight) {
                ball.x = launcherRight - ball.radius;
                ball.vx = -Math.abs(ball.vx) * 0.9;
            }
            // Keep at bottom before launch
            if (ball.y + ball.radius > launcherBottom) {
                ball.y = launcherBottom - ball.radius;
                ball.vy = 0;
            }
            return; // Skip other wall checks
        }
        
        // After launch, apply chute walls only while ascending in chute
        if (ball.launched && inLauncherX && ball.y > launcherTop && ball.y < launcherBottom) {
            // Only apply side walls if ball is moving up (launching)
            if (ball.vy < 0) {
                if (ball.x - ball.radius < launcherLeft) {
                    ball.x = launcherLeft + ball.radius;
                    ball.vx = Math.abs(ball.vx) * 0.9;
                }
                if (ball.x + ball.radius > launcherRight) {
                    ball.x = launcherRight - ball.radius;
                    ball.vx = -Math.abs(ball.vx) * 0.9;
                }
            }
            // No constraints when falling back down
        }
        
        // Add curve to trajectory as ball exits launcher
        if (ball.launched && ball.vy < 0 && ball.y > launcherTop - 50 && ball.y < launcherTop + 50) {
            ball.vx -= 0.2; // Gentle leftward curve on exit
        }
        
        // CRITICAL: First enforce hard boundaries - ball can NEVER go outside these
        const hardLeftBound = leftX - 10;  // Small buffer outside visible wall
        const hardRightBound = rightX + 10;
        const hardTopBound = topY - 10;
        
        if (ball.x < hardLeftBound + ball.radius) {
            ball.x = hardLeftBound + ball.radius;
            ball.vx = Math.abs(ball.vx) * 0.95;
            if (this.collisionCallback) {
                this.collisionCallback('wall', ball.x, ball.y, { color: '#0088ff' });
            }
        }
        if (ball.x > hardRightBound - ball.radius) {
            ball.x = hardRightBound - ball.radius;
            ball.vx = -Math.abs(ball.vx) * 0.95;
            if (this.collisionCallback) {
                this.collisionCallback('wall', ball.x, ball.y, { color: '#0088ff' });
            }
        }
        if (ball.y < hardTopBound + ball.radius) {
            ball.y = hardTopBound + ball.radius;
            ball.vy = Math.abs(ball.vy) * 0.95;
            if (this.collisionCallback) {
                this.collisionCallback('wall', ball.x, ball.y, { color: '#0088ff' });
            }
        }
        
        // Check corner regions with expanded detection area
        const cornerBuffer = 10; // Increased buffer to catch ball earlier
        const inLeftCornerRegion = ball.x < leftCornerX + cornerBuffer && ball.y < leftCornerY + cornerBuffer;
        const inRightCornerRegion = ball.x > rightCornerX - cornerBuffer && ball.y < rightCornerY + cornerBuffer;
        
        if (inLeftCornerRegion) {
            // Left corner - check distance from corner center
            const dx = ball.x - leftCornerX;
            const dy = ball.y - leftCornerY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = cornerRadius - ball.radius;
            
            // Only apply corner physics if ball is actually inside the curve
            if (dist < minDist && dx <= 0 && dy <= 0) {
                if (dist < 0.1) {
                    // Emergency push out
                    ball.x = leftCornerX - minDist * 0.707;
                    ball.y = leftCornerY - minDist * 0.707;
                    ball.vx = Math.abs(ball.vx) * 0.95;
                    ball.vy = Math.abs(ball.vy) * 0.95;
                } else {
                    const normalX = dx / dist;
                    const normalY = dy / dist;
                    ball.x = leftCornerX + normalX * minDist;
                    ball.y = leftCornerY + normalY * minDist;
                    
                    const dot = ball.vx * (-normalX) + ball.vy * (-normalY);
                    if (dot > 0) {
                        // Preserve more energy for realistic deflection
                        ball.vx = (ball.vx - 2 * dot * (-normalX)) * 0.95;
                        ball.vy = (ball.vy - 2 * dot * (-normalY)) * 0.95;
                    }
                }
                return; // Exit early to prevent other collision checks
            }
        } else if (inRightCornerRegion) {
            // Right corner - check distance from corner center
            const dx = ball.x - rightCornerX;
            const dy = ball.y - rightCornerY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = cornerRadius - ball.radius;
            
            // Only apply corner physics if ball is actually inside the curve
            // For right corner: ball must be to the right of center (dx >= 0) and above center (dy <= 0)
            if (dist < minDist) {
                if (dist < 0.1) {
                    // Emergency push out
                    ball.x = rightCornerX + minDist * 0.707;
                    ball.y = rightCornerY - minDist * 0.707;
                    ball.vx = -Math.abs(ball.vx) * 0.95;
                    ball.vy = Math.abs(ball.vy) * 0.95;
                } else {
                    const normalX = dx / dist;
                    const normalY = dy / dist;
                    ball.x = rightCornerX + normalX * minDist;
                    ball.y = rightCornerY + normalY * minDist;
                    
                    const dot = ball.vx * (-normalX) + ball.vy * (-normalY);
                    if (dot > 0) {
                        // Preserve more energy for realistic deflection
                        const dampingFactor = 0.95; // Much less damping
                        ball.vx = (ball.vx - 2 * dot * (-normalX)) * dampingFactor;
                        ball.vy = (ball.vy - 2 * dot * (-normalY)) * dampingFactor;
                        
                        // Add slight downward deflection for more natural pinball physics
                        if (ball.vy < 2) {
                            ball.vy += 1;
                        }
                    }
                }
                return; // Exit early to prevent other collision checks
            }
        }
        
        // Regular wall checks (only if not in corner)
        // Left wall (below corner)
        if (ball.y > leftCornerY && ball.x - ball.radius < leftX) {
            ball.x = leftX + ball.radius;
            ball.vx = Math.abs(ball.vx) * 0.9;
        }
        
        // Right wall (below corner) - skip launcher chute area
        if (ball.y > rightCornerY && ball.x + ball.radius > rightX) {
            // Skip wall collision if ball is in launcher chute area
            const inLauncherArea = ball.x >= launcherLeft - 10 && ball.x <= launcherRight + 10;
            if (!inLauncherArea) {
                ball.x = rightX - ball.radius;
                ball.vx = -Math.abs(ball.vx) * 0.9;
            }
        }
        
        // Top wall (only between corners)
        if (ball.y - ball.radius < topY && ball.x >= leftCornerX && ball.x <= rightCornerX) {
            ball.y = topY + ball.radius;
            ball.vy = Math.abs(ball.vy) * 0.9;
        }
        
        // Playfield boundary for unlaunched ball
        if (!ball.launched && ball.x < 350) {
            ball.x = 350;
            ball.vx = Math.abs(ball.vx) * 0.85;
        }
        
        // Angled guardrails near flippers
        if (ball.y > 650 && ball.y < 740) { // Only apply in guardrail zone
            // Left guardrail
            const leftGuardX = 15 + (ball.y - 650) * (100 - 15) / (730 - 650);
            if (ball.x - ball.radius < leftGuardX) {
                ball.x = leftGuardX + ball.radius;
                
                // More accurate angle calculation for the slope
                const dx = 100 - 15;
                const dy = 730 - 650;
                const slopeAngle = Math.atan2(dy, dx);
                
                // Normal perpendicular to slope (pointing right and up)
                const normal = { 
                    x: Math.sin(slopeAngle), 
                    y: -Math.cos(slopeAngle) 
                };
                
                const dot = ball.vx * normal.x + ball.vy * normal.y;
                
                // Only bounce if moving into the wall
                if (dot < 0) {
                    // Preserve more energy and add slight upward boost to prevent sliding
                    ball.vx = (ball.vx - 2 * dot * normal.x) * 0.9;
                    ball.vy = (ball.vy - 2 * dot * normal.y) * 0.9 - 0.5; // Small upward boost
                }
            }
            
            // Right guardrail - skip launcher area
            const rightGuardX = 385 - (ball.y - 650) * (385 - 300) / (730 - 650);
            if (ball.x + ball.radius > rightGuardX && ball.x < 358) { // Only apply if ball is not in launcher chute
                ball.x = rightGuardX - ball.radius;
                
                // More accurate angle calculation for the slope
                const dx = 300 - 385;
                const dy = 730 - 650;
                const slopeAngle = Math.atan2(dy, dx);
                
                // Normal perpendicular to slope (pointing left and up)
                const normal = { 
                    x: Math.sin(slopeAngle), 
                    y: -Math.cos(slopeAngle) 
                };
                
                const dot = ball.vx * normal.x + ball.vy * normal.y;
                
                // Only bounce if moving into the wall
                if (dot < 0) {
                    // Preserve more energy and add slight upward boost to prevent sliding
                    ball.vx = (ball.vx - 2 * dot * normal.x) * 0.9;
                    ball.vy = (ball.vy - 2 * dot * normal.y) * 0.9 - 0.5; // Small upward boost
                }
            }
        }
        
        // Final absolute boundary check - ensure ball never exits table bounds
        // This is the last line of defense
        const margin = 2; // Small margin inside canvas edges
        
        if (ball.x - ball.radius < margin) {
            ball.x = margin + ball.radius;
            ball.vx = Math.abs(ball.vx) * 0.9;
        }
        if (ball.x + ball.radius > CANVAS.WIDTH - margin) {
            ball.x = CANVAS.WIDTH - margin - ball.radius;
            ball.vx = -Math.abs(ball.vx) * 0.9;
        }
        if (ball.y - ball.radius < margin) {
            ball.y = margin + ball.radius;
            ball.vy = Math.abs(ball.vy) * 0.9;
        }
        
        // Final safety check for visible play area
        if (ball.x < leftX - 5 || ball.x > rightX + 5 || ball.y < topY - 5) {
            // Ball somehow escaped - reset to safe position
            ball.x = Math.max(leftX + ball.radius, Math.min(rightX - ball.radius, ball.x));
            ball.y = Math.max(topY + ball.radius, ball.y);
            ball.vx *= 0.85;
            ball.vy = Math.abs(ball.vy) * 0.85;
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
        
        // Dynamic collision width based on ball speed and flipper state
        const ballSpeed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
        const baseWidth = 8; // Increased from 5
        const speedBonus = Math.min(ballSpeed * 0.5, 5); // Add up to 5 pixels for fast balls
        const flipperWidth = flipper.isActive ? baseWidth + 3 : baseWidth; // Wider when active
        const totalWidth = flipperWidth + speedBonus;
        
        if (dist < ball.radius + totalWidth) {
            // Check cooldown to prevent multiple hits
            const now = Date.now();
            const lastHit = isLeft ? this.lastFlipperHit.left : this.lastFlipperHit.right;
            const cooldownMs = 100; // 100ms cooldown between hits
            
            if (now - lastHit < cooldownMs) {
                return; // Skip if hit too recently
            }
            
            // Update last hit time
            if (isLeft) {
                this.lastFlipperHit.left = now;
            } else {
                this.lastFlipperHit.right = now;
            }
            
            // Prevent division by zero
            if (dist < 0.1) {
                // Ball is on flipper pivot, push it away
                const angle = isLeft ? -Math.PI / 4 : -3 * Math.PI / 4;
                ball.x = fx + Math.cos(angle) * (ball.radius + totalWidth);
                ball.y = fy + Math.sin(angle) * (ball.radius + totalWidth);
            }
            
            // Calculate normal
            const normalX = dist > 0 ? (ball.x - closestX) / dist : 0;
            const normalY = dist > 0 ? (ball.y - closestY) / dist : -1;
            
            // Move ball out - use base width to prevent sticking
            ball.setPosition(
                closestX + normalX * (ball.radius + baseWidth + 2),
                closestY + normalY * (ball.radius + baseWidth + 2)
            );
            
            // Apply impulse with improved physics
            const flipperSpeed = flipper.getSpeed();
            const power = Math.max(PHYSICS.FLIPPER_BASE_POWER, flipperSpeed * 2.0); // Increased from 1.2
            
            // Add angle-dependent power for more control
            const flipperAngle = flipper.angle;
            const angleFactor = isLeft ? 
                Math.max(0.5, Math.sin(flipperAngle + Math.PI / 2)) :
                Math.max(0.5, Math.sin(-flipperAngle + Math.PI / 2));
            
            ball.setVelocity(
                normalX * power * angleFactor + (isLeft ? 3 : -3), // Increased from 2
                normalY * power * angleFactor - 6  // Increased from 4
            );
            
            this.addScore(SCORING.FLIPPER_HIT);
            
            if (this.collisionCallback) {
                this.collisionCallback('flipper', closestX, closestY, flipper);
            }
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
            
            if (this.collisionCallback) {
                this.collisionCallback('bumper', ball.x, ball.y, bumper);
            }
            
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
            
            if (this.collisionCallback) {
                const collisionX = closestX;
                const collisionY = closestY;
                this.collisionCallback('angledBumper', collisionX, collisionY, {
                    ...bumper,
                    startX: bumper.x1,
                    startY: bumper.y1,
                    endX: bumper.x2,
                    endY: bumper.y2
                });
            }
            
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
            
            // Determine which side of the target was hit for proper bounce
            const ballCenterX = ball.x;
            const ballCenterY = ball.y;
            const targetCenterX = target.x + target.width / 2;
            const targetCenterY = target.y + target.height / 2;
            
            // Calculate overlap on each axis
            const overlapX = (ball.radius + target.width / 2) - Math.abs(ballCenterX - targetCenterX);
            const overlapY = (ball.radius + target.height / 2) - Math.abs(ballCenterY - targetCenterY);
            
            // Bounce off the side with less overlap (the side we hit)
            if (overlapX < overlapY) {
                // Hit from left or right side
                if (ballCenterX < targetCenterX) {
                    ball.x = target.x - ball.radius;
                    ball.vx = -Math.abs(ball.vx) * 0.9;
                } else {
                    ball.x = target.x + target.width + ball.radius;
                    ball.vx = Math.abs(ball.vx) * 0.9;
                }
            } else {
                // Hit from top or bottom
                if (ballCenterY < targetCenterY) {
                    ball.y = target.y - ball.radius;
                    ball.vy = -Math.abs(ball.vy) * 0.9;
                } else {
                    ball.y = target.y + target.height + ball.radius;
                    ball.vy = Math.abs(ball.vy) * 0.9;
                }
            }
            
            this.addScore(target.points);
            
            if (this.collisionCallback) {
                this.collisionCallback('target', ball.x, ball.y, target);
            }
            
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
                
                // Improved spinner physics - deflect based on approach angle
                if (dist > 0) {
                    // Push ball away from spinner center
                    const normalX = dx / dist;
                    const normalY = dy / dist;
                    
                    // Move ball outside spinner radius
                    ball.x = spinner.x + normalX * (ball.radius + 20);
                    ball.y = spinner.y + normalY * (ball.radius + 20);
                    
                    // Calculate deflection based on approach velocity
                    const dot = ball.vx * normalX + ball.vy * normalY;
                    
                    // If approaching spinner, deflect with slight speed boost
                    if (dot < 0) {
                        // Reflect with small boost and slight random deflection
                        const randomAngle = (Math.random() - 0.5) * 0.3; // ±0.15 radians
                        const boostFactor = 1.15; // 15% speed boost
                        
                        // Calculate reflection
                        ball.vx = (ball.vx - 2 * dot * normalX) * boostFactor;
                        ball.vy = (ball.vy - 2 * dot * normalY) * boostFactor;
                        
                        // Apply slight rotation to velocity
                        const newVx = ball.vx * Math.cos(randomAngle) - ball.vy * Math.sin(randomAngle);
                        const newVy = ball.vx * Math.sin(randomAngle) + ball.vy * Math.cos(randomAngle);
                        ball.vx = newVx;
                        ball.vy = newVy;
                    }
                }
                
                this.addScore(SCORING.SPINNER_HIT);
                
                if (this.collisionCallback) {
                    this.collisionCallback('spinner', ball.x, ball.y, spinner);
                }
                
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
            // Normal perpendicular to ramp (pointing away from closest point)
            const normalX = (ball.x - closestX) / dist;
            const normalY = (ball.y - closestY) / dist;
            
            // Push ball outside ramp
            ball.x = closestX + normalX * (ball.radius + ramp.width / 2);
            ball.y = closestY + normalY * (ball.radius + ramp.width / 2);
            
            // Reflect velocity off the ramp with slight boost
            const dot = ball.vx * normalX + ball.vy * normalY;
            ball.vx = (ball.vx - 2 * dot * normalX) * 1.1; // 10% speed boost
            ball.vy = (ball.vy - 2 * dot * normalY) * 1.1;
            
            this.addScore(SCORING.RAMP_HIT);
            
            // Trigger collision callback
            if (this.collisionCallback) {
                this.collisionCallback('ramp', closestX, closestY, ramp);
            }
            
            return true;
        }
        
        return false;
    }
    
    checkDropTargetCollision(ball, target) {
        if (!target.dropped &&
            ball.x + ball.radius > target.x &&
            ball.x - ball.radius < target.x + target.width &&
            ball.y + ball.radius > target.y &&
            ball.y - ball.radius < target.y + target.height) {
            
            target.dropped = true;
            
            // Determine bounce direction
            const ballCenterX = ball.x;
            const ballCenterY = ball.y;
            const targetCenterX = target.x + target.width / 2;
            const targetCenterY = target.y + target.height / 2;
            
            const overlapLeft = (ball.x + ball.radius) - target.x;
            const overlapRight = (target.x + target.width) - (ball.x - ball.radius);
            const overlapTop = (ball.y + ball.radius) - target.y;
            const overlapBottom = (target.y + target.height) - (ball.y - ball.radius);
            
            const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
            
            if (minOverlap === overlapLeft) {
                ball.x = target.x - ball.radius;
                ball.vx = -Math.abs(ball.vx) * 0.8;
            } else if (minOverlap === overlapRight) {
                ball.x = target.x + target.width + ball.radius;
                ball.vx = Math.abs(ball.vx) * 0.8;
            } else if (minOverlap === overlapTop) {
                ball.y = target.y - ball.radius;
                ball.vy = -Math.abs(ball.vy) * 0.8;
            } else {
                ball.y = target.y + target.height + ball.radius;
                ball.vy = Math.abs(ball.vy) * 0.8;
            }
            
            this.addScore(target.points || SCORING.DROP_TARGET_HIT);
            
            if (this.collisionCallback) {
                this.collisionCallback('dropTarget', ballCenterX, ballCenterY, target);
            }
            
            return true;
        }
        return false;
    }
    
    checkSkillLaneCollision(ball, lane) {
        if (ball.x + ball.radius > lane.x &&
            ball.x - ball.radius < lane.x + lane.width &&
            ball.y + ball.radius > lane.y &&
            ball.y - ball.radius < lane.y + lane.height) {
            
            if (!lane.lit) {
                lane.lit = true;
                this.addScore(lane.points || SCORING.SKILL_LANE_HIT);
                
                if (this.collisionCallback) {
                    this.collisionCallback('skillLane', ball.x, ball.y, lane);
                }
            }
            
            return true;
        }
        return false;
    }
    
    checkLaneDividerCollision(ball, divider) {
        // Line segment collision
        const lineLen = Math.sqrt((divider.x2 - divider.x1) ** 2 + (divider.y2 - divider.y1) ** 2);
        if (lineLen === 0) return false;
        
        const t = Math.max(0, Math.min(1, ((ball.x - divider.x1) * (divider.x2 - divider.x1) + (ball.y - divider.y1) * (divider.y2 - divider.y1)) / (lineLen * lineLen)));
        const closestX = divider.x1 + t * (divider.x2 - divider.x1);
        const closestY = divider.y1 + t * (divider.y2 - divider.y1);
        
        const dist = Math.sqrt((ball.x - closestX) ** 2 + (ball.y - closestY) ** 2);
        
        if (dist < ball.radius + 2) { // 2 pixel width for dividers
            const normalX = (ball.x - closestX) / dist;
            const normalY = (ball.y - closestY) / dist;
            
            ball.x = closestX + normalX * (ball.radius + 2);
            ball.y = closestY + normalY * (ball.radius + 2);
            
            const dot = ball.vx * normalX + ball.vy * normalY;
            ball.vx = (ball.vx - 2 * dot * normalX) * 0.9;
            ball.vy = (ball.vy - 2 * dot * normalY) * 0.9;
            
            return true;
        }
        return false;
    }
    
    checkLaneCollision(ball, lane) {
        // Skip collision if ball is in launcher area (both launching up and falling down)
        const inLauncherArea = ball.x >= 340 && ball.x <= 382 && ball.y >= 480;
        
        if (inLauncherArea) {
            // Ball passes through the lane area when in launcher zone
            return false;
        }
        
        // Generic lane collision (outlanes and inlanes)
        const lineLen = Math.sqrt((lane.x2 - lane.x1) ** 2 + (lane.y2 - lane.y1) ** 2);
        if (lineLen === 0) return false;
        
        const t = Math.max(0, Math.min(1, ((ball.x - lane.x1) * (lane.x2 - lane.x1) + (ball.y - lane.y1) * (lane.y2 - lane.y1)) / (lineLen * lineLen)));
        const closestX = lane.x1 + t * (lane.x2 - lane.x1);
        const closestY = lane.y1 + t * (lane.y2 - lane.y1);
        
        const dist = Math.sqrt((ball.x - closestX) ** 2 + (ball.y - closestY) ** 2);
        
        if (dist < ball.radius + 4) { // 4 pixel width for lanes
            const normalX = (ball.x - closestX) / dist;
            const normalY = (ball.y - closestY) / dist;
            
            ball.x = closestX + normalX * (ball.radius + 4);
            ball.y = closestY + normalY * (ball.radius + 4);
            
            const dot = ball.vx * normalX + ball.vy * normalY;
            ball.vx = (ball.vx - 2 * dot * normalX) * 0.85;
            ball.vy = (ball.vy - 2 * dot * normalY) * 0.85;
            
            // Add score for outlanes (danger zones)
            if (lane.danger) {
                this.addScore(SCORING.OUTLANE_HIT || 50);
            }
            
            if (this.collisionCallback) {
                this.collisionCallback('lane', closestX, closestY, lane);
            }
            
            return true;
        }
        return false;
    }
}