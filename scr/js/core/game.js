import { Ball } from '../entities/ball.js';
import { Flipper } from '../entities/flipper.js';
import { Physics } from '../physics/physics.js';
import { Renderer } from '../ui/renderer.js';
import { UIDisplay } from '../ui/ui-display.js';
import { InputManager } from './input-manager.js';
import { ELEMENTS } from '../config/elements.js';
import { GAME, BALL, SCORING } from '../config/constants.js';
import { ParticleSystem } from '../effects/particle-system.js';
import { AudioManager } from '../audio/audio-manager.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.renderer = new Renderer(canvas);
        this.uiDisplay = new UIDisplay(this);
        this.physics = new Physics();
        this.input = new InputManager();
        this.particleSystem = new ParticleSystem();
        this.audioManager = new AudioManager();
        
        this.gameRunning = false;
        this.score = 0;
        this.ballsLeft = GAME.INITIAL_BALLS;
        this.highScore = parseInt(localStorage.getItem('pinballHighScore') || '0');
        this.waitingForNextBall = false;
        
        // Extra ball tracking
        this.extraBallThresholds = [10000, 25000, 50000, 100000]; // Score milestones
        this.nextExtraBallIndex = 0;
        this.extraBallsEarned = 0;
        
        this.ball = new Ball();
        this.flippers = {
            left: new Flipper(ELEMENTS.flippers.left),
            right: new Flipper(ELEMENTS.flippers.right)
        };
        
        // Deep copy game elements
        this.elements = {
            bumpers: JSON.parse(JSON.stringify(ELEMENTS.bumpers)),
            angledBumpers: JSON.parse(JSON.stringify(ELEMENTS.angledBumpers)),
            targets: JSON.parse(JSON.stringify(ELEMENTS.targets)),
            dropTargets: JSON.parse(JSON.stringify(ELEMENTS.dropTargets)),
            skillLanes: JSON.parse(JSON.stringify(ELEMENTS.skillLanes)),
            laneDividers: JSON.parse(JSON.stringify(ELEMENTS.laneDividers)),
            spinners: JSON.parse(JSON.stringify(ELEMENTS.spinners)),
            outlanes: JSON.parse(JSON.stringify(ELEMENTS.outlanes)),
            inlanes: JSON.parse(JSON.stringify(ELEMENTS.inlanes)),
            ramps: JSON.parse(JSON.stringify(ELEMENTS.ramps)),
            upperLoop: JSON.parse(JSON.stringify(ELEMENTS.upperLoop)),
            ballLock: JSON.parse(JSON.stringify(ELEMENTS.ballLock)),
            captiveBall: JSON.parse(JSON.stringify(ELEMENTS.captiveBall))
        };
        
        // Multi-ball tracking
        this.balls = [this.ball];
        this.multiballActive = false;
        
        this.setupInputHandlers();
        this.setupPhysicsCallbacks();
        this.setupAudio();
        this.updateUI();
    }
    
    setupInputHandlers() {
        this.input.on('leftFlipperDown', () => {
            if (this.gameRunning) {
                this.flippers.left.activate();
                this.audioManager.play('flipper-up', { volume: 0.8 });
            }
        });
        
        this.input.on('leftFlipperUp', () => {
            this.flippers.left.deactivate();
            this.audioManager.play('flipper-down', { volume: 0.6 });
        });
        
        this.input.on('rightFlipperDown', () => {
            if (this.gameRunning) {
                this.flippers.right.activate();
                this.audioManager.play('flipper-up', { volume: 0.8 });
            }
        });
        
        this.input.on('rightFlipperUp', () => {
            this.flippers.right.deactivate();
            this.audioManager.play('flipper-down', { volume: 0.6 });
        });
        
        this.input.on('chargeStart', () => {
            if (this.gameRunning && !this.ball.launched) {
                // Charging handled in input manager
            }
        });
        
        this.input.on('chargeRelease', (chargeTime) => {
            if (this.gameRunning && !this.ball.launched) {
                const clampedTime = Math.min(chargeTime, BALL.MAX_CHARGE_TIME);
                const power = BALL.LAUNCH_MIN_POWER + (clampedTime / BALL.MAX_CHARGE_TIME) * (BALL.LAUNCH_MAX_POWER - BALL.LAUNCH_MIN_POWER);
                this.ball.launch(power);
                
                // Play launch sound with power-based pitch
                const launchPitch = 0.8 + (power / BALL.LAUNCH_MAX_POWER) * 0.4;
                this.audioManager.play('ball-launch', {
                    volume: 0.9,
                    pitch: launchPitch
                });
                
                // Decrement balls when launching
                this.ballsLeft--;
                
                // Reset power meter
                document.getElementById('powerBar').style.width = '0%';
                
                // Update UI to show balls remaining
                this.updateUI();
            }
        });
        
        // Start button
        document.getElementById('startBtn').onclick = () => {
            this.start().catch(error => {
                console.error('Error starting game:', error);
            });
        };
        
        // Audio controls
        this.setupAudioControls();
    }
    
    setupPhysicsCallbacks() {
        this.physics.setScoreCallback((points) => {
            this.addScore(points);
        });
        
        this.physics.setCollisionCallback((type, x, y, element) => {
            switch(type) {
                case 'bumper':
                    this.particleSystem.createSparkEffect(x, y, element.color || '#ff6600');
                    this.audioManager.play('bumper-hit', {
                        volume: 0.6,
                        pitch: 0.9 + Math.random() * 0.2
                    });
                    break;
                case 'angledBumper':
                    const angle = Math.atan2(element.endY - element.startY, element.endX - element.startX) + Math.PI / 2;
                    this.particleSystem.createSparkEffect(x, y, element.color || '#ff00ff', angle);
                    this.audioManager.play('angledBumper-hit', {
                        volume: 0.7,
                        pitch: 1.0 + Math.random() * 0.3
                    });
                    break;
                case 'target':
                    this.particleSystem.createCollisionEffect(x, y, '#00ffff', 0.5);
                    this.audioManager.play('target-hit', {
                        volume: 0.8,
                        pitch: 1.0
                    });
                    break;
                case 'spinner':
                    this.particleSystem.createCollisionEffect(x, y, '#ffff00', 0.7);
                    this.audioManager.play('spinner-hit', {
                        volume: 0.5,
                        pitch: 1.2 + Math.random() * 0.4
                    });
                    break;
                case 'flipper':
                    this.particleSystem.createCollisionEffect(x, y, '#00ff00', 0.6);
                    this.audioManager.play('ball-bounce', {
                        volume: 0.4,
                        pitch: 1.1 + Math.random() * 0.2
                    });
                    break;
                case 'wall':
                    this.particleSystem.createCollisionEffect(x, y, '#0088ff', 0.3);
                    this.audioManager.play('wall-hit', {
                        volume: this.audioManager.calculateSpatialVolume(x, y) * 0.7,
                        pitch: this.audioManager.calculatePitchVariation(element)
                    });
                    break;
                case 'ramp':
                    this.particleSystem.createCollisionEffect(x, y, '#00ff00', 0.8);
                    this.audioManager.play('ramp-hit', {
                        volume: this.audioManager.calculateSpatialVolume(x, y) * 0.9,
                        pitch: 0.9 + Math.random() * 0.2
                    });
                    break;
                case 'dropTarget':
                    this.particleSystem.createCollisionEffect(x, y, '#00ff00', 0.8);
                    this.audioManager.play('target-hit', {
                        volume: 0.9,
                        pitch: 0.7
                    });
                    break;
                case 'skillLane':
                    this.particleSystem.createCollisionEffect(x, y, '#ffff00', 0.5);
                    this.audioManager.play('spinner-hit', {
                        volume: 0.7,
                        pitch: 1.2
                    });
                    break;
                case 'lane':
                    if (element.danger) {
                        this.particleSystem.createCollisionEffect(x, y, '#ff0000', 0.3);
                        this.audioManager.play('wall-hit', {
                            volume: 0.5,
                            pitch: 0.8
                        });
                    }
                    break;
                case 'loopEnter':
                    this.particleSystem.createCollisionEffect(x, y, '#00ffff', 1.0);
                    this.audioManager.play('ramp-hit', {
                        volume: 1.0,
                        pitch: 1.3
                    });
                    this.elements.upperLoop.active = true;
                    break;
                case 'ballLocked':
                    this.particleSystem.createCollisionEffect(x, y, '#ff00ff', 1.0);
                    this.audioManager.play('target-hit', {
                        volume: 1.0,
                        pitch: 0.8
                    });
                    // Check if ready for multiball
                    if (this.elements.ballLock.locked.length >= 3 && !this.multiballActive) {
                        this.startMultiball();
                    }
                    break;
                case 'captiveBallHit':
                    this.particleSystem.createCollisionEffect(x, y, '#ffff00', 0.8);
                    this.audioManager.play('bumper-hit', {
                        volume: 0.8,
                        pitch: 1.0
                    });
                    // Activate ball lock after 5 captive ball hits
                    if (element.hits >= 5 && !this.elements.ballLock.active) {
                        this.elements.ballLock.active = true;
                        this.particleSystem.createCollisionEffect(this.elements.ballLock.x + 20, this.elements.ballLock.y + 30, '#ff00ff', 2.0);
                    }
                    break;
            }
        });
    }
    
    setupAudio() {
        // Load audio settings from localStorage
        this.audioManager.loadSettings();
        
        // Audio will be initialized when game starts (in start() method)
        // This ensures proper user gesture context for mobile browsers
    }
    
    setupAudioControls() {
        // Audio controls removed
    }
    
    async start() {
        document.getElementById('menu').classList.add('hidden');
        this.gameRunning = true;
        this.ballsLeft = GAME.INITIAL_BALLS;
        this.score = 0;
        
        // Reset extra ball tracking
        this.nextExtraBallIndex = 0;
        this.extraBallsEarned = 0;
        
        // Initialize audio within user gesture context (critical for mobile)
        try {
            await this.audioManager.initialize();
            console.log('Audio initialized successfully in game start');
            
            // Start ambient music if available and enabled
            if (this.audioManager.settings.enabled) {
                this.audioManager.play('ambient-music', { volume: 0.3 });
            }
        } catch (error) {
            console.warn('Audio initialization failed:', error);
            // Game continues without audio
        }
        
        this.updateUI();
        this.resetBall();
    }
    
    resetBall() {
        this.ball.reset();
        
        // Reset targets
        this.elements.targets.forEach(target => target.hit = false);
        
        // Reset angled bumper animations
        this.elements.angledBumpers.forEach(bumper => bumper.hit = 0);
        
        // Update UI since ball.launched is now false
        this.updateUI();
    }
    
    update() {
        if (!this.gameRunning) return;
        
        // Update charge meter and ball position when charging
        if (this.input.isCharging() && !this.ball.launched) {
            const power = this.input.getChargePower();
            document.getElementById('powerBar').style.width = (power * 100) + '%';
            
            // Move ball down with plunger when charging
            this.ball.y = BALL.INITIAL_Y + (power * 30);
        }
        
        // Update flippers
        this.flippers.left.update();
        this.flippers.right.update();
        
        // Update ball physics (velocity only, not position)
        this.ball.update();
        
        if (this.ball.launched) {
            // Continuous collision detection - check multiple substeps
            const steps = 5; // Increased steps for better accuracy
            const deltaX = this.ball.vx / steps;
            const deltaY = this.ball.vy / steps;
            
            for (let i = 0; i < steps; i++) {
                // Move ball a fraction of its velocity
                this.ball.x += deltaX;
                this.ball.y += deltaY;
                
                // Check collisions at this position
                this.physics.checkWalls(this.ball);
                this.physics.checkFlipperCollision(this.ball, this.flippers.left, true);
                this.physics.checkFlipperCollision(this.ball, this.flippers.right, false);
                
                // Check element collisions
                this.elements.bumpers.forEach(bumper => {
                    this.physics.checkBumperCollision(this.ball, bumper);
                });
                
                this.elements.angledBumpers.forEach(bumper => {
                    this.physics.checkAngledBumperCollision(this.ball, bumper);
                });
                
                this.elements.targets.forEach(target => {
                    this.physics.checkTargetCollision(this.ball, target);
                });
                
                this.elements.spinners.forEach(spinner => {
                    this.physics.checkSpinnerCollision(this.ball, spinner);
                });
                
                this.elements.ramps.forEach(ramp => {
                    this.physics.checkRampCollision(this.ball, ramp);
                });
                
                // Check new elements
                this.elements.dropTargets.forEach(target => {
                    this.physics.checkDropTargetCollision(this.ball, target);
                });
                
                this.elements.skillLanes.forEach(lane => {
                    this.physics.checkSkillLaneCollision(this.ball, lane);
                });
                
                this.elements.laneDividers.forEach(divider => {
                    this.physics.checkLaneDividerCollision(this.ball, divider);
                });
                
                this.elements.outlanes.forEach(lane => {
                    this.physics.checkLaneCollision(this.ball, lane);
                });
                
                this.elements.inlanes.forEach(lane => {
                    this.physics.checkLaneCollision(this.ball, lane);
                });
                
                // Phase 2 elements
                this.elements.upperLoop.segments.forEach(segment => {
                    this.physics.checkUpperLoopCollision(this.ball, segment);
                });
                
                this.physics.checkBallLockCollision(this.ball, this.elements.ballLock);
                this.physics.checkCaptiveBallCollision(this.ball, this.elements.captiveBall);
            }
            
            // Update trail with final position
            this.ball.trail.push({ x: this.ball.x, y: this.ball.y });
            if (this.ball.trail.length > BALL.TRAIL_LENGTH) {
                this.ball.trail.shift();
            }
            
            // Check if ball is lost
            if (this.ball.y > GAME.BALL_LOST_Y && !this.waitingForNextBall) {
                // Play ball lost sound
                this.audioManager.play('ball-lost', { volume: 0.8 });
                
                if (this.ballsLeft > 0) {
                    this.waitingForNextBall = true;
                    setTimeout(() => {
                        this.resetBall();
                        this.waitingForNextBall = false;
                    }, 1000);
                } else {
                    this.gameOver();
                }
            }
        }
        
        // Update spinners
        this.elements.spinners.forEach(spinner => {
            if (spinner.spinning) {
                spinner.angle += spinner.spinSpeed;
                spinner.spinSpeed *= 0.95;
                if (Math.abs(spinner.spinSpeed) < 0.05) {
                    spinner.spinning = false;
                }
            }
        });
        
        // Update angled bumper animations
        this.elements.angledBumpers.forEach(bumper => {
            if (bumper.hit > 0) bumper.hit--;
        });
        
        // Update bumper animations
        this.elements.bumpers.forEach(bumper => {
            if (bumper.hit > 0) bumper.hit--;
        });
        
        // Check if all drop targets are dropped and reset them
        if (this.elements.dropTargets.every(target => target.dropped)) {
            // Reset all drop targets after a short delay
            setTimeout(() => {
                this.elements.dropTargets.forEach(target => {
                    target.dropped = false;
                });
                // Bonus for completing all drop targets
                this.addScore(1000);
                this.particleSystem.createCollisionEffect(200, 200, '#00ff00', 1.0);
                this.audioManager.play('target-hit', {
                    volume: 1.0,
                    pitch: 1.5
                });
            }, 500);
        }
        
        // Check if all skill lanes are lit
        if (this.elements.skillLanes.every(lane => lane.lit)) {
            // Reset lanes and give bonus
            this.elements.skillLanes.forEach(lane => {
                lane.lit = false;
            });
            this.addScore(2000);
            this.particleSystem.createCollisionEffect(200, 100, '#ffff00', 1.0);
            this.audioManager.play('spinner-hit', {
                volume: 1.0,
                pitch: 1.8
            });
        }
        
        // Update UI display
        this.uiDisplay.update();
        
        // Update captive ball spring back
        if (this.elements.captiveBall.currentY > this.elements.captiveBall.y) {
            this.elements.captiveBall.currentY -= 1;
        }
        
        // Check upper loop completion
        if (this.elements.upperLoop.active) {
            // Simple completion check - would need more sophisticated tracking
            this.elements.upperLoop.completions++;
            this.elements.upperLoop.active = false;
            this.addScore(SCORING.LOOP_COMPLETE);
            this.particleSystem.createCollisionEffect(350, 135, '#00ffff', 2.0);
        }
        
        // Update particle system
        this.particleSystem.update(1/60);
    }
    
    startMultiball() {
        this.multiballActive = true;
        this.addScore(SCORING.MULTIBALL_START);
        
        // Release locked balls
        const Ball = this.ball.constructor;
        this.elements.ballLock.locked.forEach((pos, index) => {
            setTimeout(() => {
                const newBall = new Ball();
                newBall.x = pos.x;
                newBall.y = pos.y;
                newBall.vx = -5 - Math.random() * 10;
                newBall.vy = -10 - Math.random() * 5;
                newBall.launched = true;
                this.balls.push(newBall);
            }, index * 500);
        });
        
        this.elements.ballLock.locked = [];
        this.elements.ballLock.active = false;
        
        // Big celebration effect
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                this.particleSystem.createCollisionEffect(
                    100 + Math.random() * 200,
                    200 + Math.random() * 200,
                    '#ff00ff',
                    2.0
                );
            }, i * 100);
        }
    }
    
    draw() {
        this.renderer.clear();
        this.renderer.drawGrid();
        this.renderer.drawWalls();
        this.renderer.drawLauncherChute(this.ball, this.input.isCharging(), this.input.getChargePower());
        
        // Draw new elements
        this.renderer.drawSkillLanes(this.elements.skillLanes);
        this.renderer.drawLaneDividers(this.elements.laneDividers);
        
        // Draw Phase 2 elements
        this.renderer.drawUpperLoop(this.elements.upperLoop);
        this.renderer.drawBallLock(this.elements.ballLock);
        this.renderer.drawCaptiveBall(this.elements.captiveBall);
        
        // Check if ball is passing under outlanes (launcher area)
        const ballUnderBridge = this.ball.x >= 340 && this.ball.x <= 382 && 
                               this.ball.y >= 480;
        
        // Draw ball before outlanes if it's passing under
        if (ballUnderBridge) {
            this.renderer.drawBall(this.ball, this.input.isCharging());
        }
        
        this.renderer.drawOutlanes(this.elements.outlanes);
        this.renderer.drawInlanes(this.elements.inlanes);
        
        // Draw existing elements
        this.renderer.drawRamps(this.elements.ramps);
        this.renderer.drawTargets(this.elements.targets);
        this.renderer.drawDropTargets(this.elements.dropTargets);
        this.renderer.drawAngledBumpers(this.elements.angledBumpers);
        this.renderer.drawBumpers(this.elements.bumpers);
        this.renderer.drawSpinners(this.elements.spinners);
        this.renderer.drawFlippers(this.flippers);
        
        // Draw main ball after outlanes if it's not passing under
        if (!ballUnderBridge) {
            this.renderer.drawBall(this.ball, this.input.isCharging());
        }
        
        // Draw additional balls for multiball
        for (let i = 1; i < this.balls.length; i++) {
            if (this.balls[i] && !this.balls[i].locked) {
                this.renderer.drawBall(this.balls[i], false);
            }
        }
        
        // Draw particles
        this.particleSystem.draw(this.renderer.ctx);
        
        // Draw UI display
        this.uiDisplay.draw(this.renderer.ctx);
        
        if (this.gameRunning === false && this.ballsLeft <= 0) {
            this.renderer.drawGameOver(this.score);
        }
    }
    
    addScore(points) {
        this.score += points;
        
        // Check for extra ball reward
        if (this.nextExtraBallIndex < this.extraBallThresholds.length) {
            if (this.score >= this.extraBallThresholds[this.nextExtraBallIndex]) {
                this.awardExtraBall();
                this.nextExtraBallIndex++;
            }
        }
        
        this.updateUI();
    }
    
    awardExtraBall() {
        this.ballsLeft++;
        this.extraBallsEarned++;
        
        // Visual feedback for extra ball
        this.showExtraBallMessage();
        
        // Play extra ball sound
        this.audioManager.play('extra-ball', { volume: 1.0 });
        
        console.log(`EXTRA BALL! Total earned: ${this.extraBallsEarned}`);
    }
    
    showExtraBallMessage() {
        // Create temporary message element
        const message = document.createElement('div');
        message.textContent = 'EXTRA BALL!';
        message.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 48px;
            font-weight: bold;
            color: #0ff;
            text-shadow: 0 0 20px #0ff;
            z-index: 1000;
            animation: pulse 2s ease-out;
            pointer-events: none;
        `;
        
        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
                50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(1); }
            }
        `;
        document.head.appendChild(style);
        
        // Add to game container
        document.getElementById('gameContainer').appendChild(message);
        
        // Remove after animation
        setTimeout(() => {
            message.remove();
            style.remove();
        }, 2000);
    }
    
    updateUI() {
        // HTML UI removed - all display handled by canvas HUD (uiDisplay)
    }
    
    gameOver() {
        this.gameRunning = false;
        
        // Play game over sound
        this.audioManager.play('game-over', { volume: 0.9 });
        
        // Save high score
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('pinballHighScore', this.highScore);
            this.updateUI();
        }
        
        // Show menu after delay
        setTimeout(() => {
            document.getElementById('menu').classList.remove('hidden');
        }, 2000);
    }
}