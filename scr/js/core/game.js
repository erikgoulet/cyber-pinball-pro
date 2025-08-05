import { Ball } from '../entities/Ball.js';
import { Flipper } from '../entities/Flipper.js';
import { Physics } from '../physics/Physics.js';
import { Renderer } from '../ui/Renderer.js';
import { InputManager } from './InputManager.js';
import { ELEMENTS } from '../config/elements.js';
import { GAME, BALL, SCORING } from '../config/constants.js';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.renderer = new Renderer(canvas);
        this.physics = new Physics();
        this.input = new InputManager();
        
        this.gameRunning = false;
        this.score = 0;
        this.ballsLeft = GAME.INITIAL_BALLS;
        this.highScore = parseInt(localStorage.getItem('pinballHighScore') || '0');
        
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
            spinners: JSON.parse(JSON.stringify(ELEMENTS.spinners)),
            ramps: JSON.parse(JSON.stringify(ELEMENTS.ramps))
        };
        
        this.setupInputHandlers();
        this.setupPhysicsCallbacks();
        this.updateUI();
    }
    
    setupInputHandlers() {
        this.input.on('leftFlipperDown', () => {
            if (this.gameRunning) this.flippers.left.activate();
        });
        
        this.input.on('leftFlipperUp', () => {
            this.flippers.left.deactivate();
        });
        
        this.input.on('rightFlipperDown', () => {
            if (this.gameRunning) this.flippers.right.activate();
        });
        
        this.input.on('rightFlipperUp', () => {
            this.flippers.right.deactivate();
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
                
                // Reset power meter
                document.getElementById('powerBar').style.width = '0%';
            }
        });
        
        // Start button
        document.getElementById('startBtn').onclick = () => this.start();
    }
    
    setupPhysicsCallbacks() {
        this.physics.setScoreCallback((points) => {
            this.addScore(points);
        });
    }
    
    start() {
        document.getElementById('menu').classList.add('hidden');
        this.gameRunning = true;
        this.ballsLeft = GAME.INITIAL_BALLS;
        this.score = 0;
        this.updateUI();
        this.resetBall();
    }
    
    resetBall() {
        this.ball.reset();
        
        // Reset targets
        this.elements.targets.forEach(target => target.hit = false);
        
        // Reset angled bumper animations
        this.elements.angledBumpers.forEach(bumper => bumper.hit = 0);
    }
    
    update() {
        if (!this.gameRunning) return;
        
        // Update charge meter
        if (this.input.isCharging() && !this.ball.launched) {
            const power = this.input.getChargePower();
            document.getElementById('powerBar').style.width = (power * 100) + '%';
        }
        
        // Update flippers
        this.flippers.left.update();
        this.flippers.right.update();
        
        // Update ball
        this.ball.update();
        
        if (this.ball.launched) {
            // Check collisions
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
            
            // Check if ball is lost
            if (this.ball.y > GAME.BALL_LOST_Y) {
                this.ballsLeft--;
                this.updateUI();
                
                if (this.ballsLeft > 0) {
                    setTimeout(() => this.resetBall(), 1000);
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
    }
    
    draw() {
        this.renderer.clear();
        this.renderer.drawGrid();
        this.renderer.drawWalls();
        this.renderer.drawLauncherChute(this.ball, this.input.isCharging(), this.input.getChargePower());
        this.renderer.drawRamps(this.elements.ramps);
        this.renderer.drawTargets(this.elements.targets);
        this.renderer.drawAngledBumpers(this.elements.angledBumpers);
        this.renderer.drawBumpers(this.elements.bumpers);
        this.renderer.drawSpinners(this.elements.spinners);
        this.renderer.drawFlippers(this.flippers);
        this.renderer.drawBall(this.ball, this.input.isCharging());
        
        if (this.gameRunning === false && this.ballsLeft === 0) {
            this.renderer.drawGameOver(this.score);
        }
    }
    
    addScore(points) {
        this.score += points;
        this.updateUI();
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('balls').textContent = this.ballsLeft;
        document.getElementById('highScore').textContent = this.highScore;
    }
    
    gameOver() {
        this.gameRunning = false;
        
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