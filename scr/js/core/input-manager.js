export class InputManager {
    constructor() {
        this.leftFlipperActive = false;
        this.rightFlipperActive = false;
        this.charging = false;
        this.chargeStartTime = 0;
        this.callbacks = {
            leftFlipperDown: null,
            leftFlipperUp: null,
            rightFlipperDown: null,
            rightFlipperUp: null,
            bothFlippersDown: null,
            bothFlippersUp: null,
            chargeStart: null,
            chargeRelease: null
        };
        
        this.setupControls();
    }
    
    on(event, callback) {
        if (this.callbacks.hasOwnProperty(event)) {
            this.callbacks[event] = callback;
        }
    }
    
    setupControls() {
        const leftBtn = document.getElementById('leftBtn');
        const rightBtn = document.getElementById('rightBtn');
        const launchBtn = document.getElementById('launchBtn');
        
        // Prevent default touch behaviors
        [leftBtn, rightBtn, launchBtn].forEach(btn => {
            btn.addEventListener('touchstart', e => e.preventDefault());
            btn.addEventListener('touchend', e => e.preventDefault());
        });
        
        // Left flipper
        leftBtn.addEventListener('mousedown', () => this.handleLeftFlipperDown());
        leftBtn.addEventListener('mouseup', () => this.handleLeftFlipperUp());
        leftBtn.addEventListener('touchstart', () => this.handleLeftFlipperDown());
        leftBtn.addEventListener('touchend', () => this.handleLeftFlipperUp());
        
        // Right flipper
        rightBtn.addEventListener('mousedown', () => this.handleRightFlipperDown());
        rightBtn.addEventListener('mouseup', () => this.handleRightFlipperUp());
        rightBtn.addEventListener('touchstart', () => this.handleRightFlipperDown());
        rightBtn.addEventListener('touchend', () => this.handleRightFlipperUp());
        
        // Launch button
        launchBtn.addEventListener('mousedown', () => this.handleChargeStart());
        launchBtn.addEventListener('mouseup', () => this.handleChargeRelease());
        launchBtn.addEventListener('touchstart', () => this.handleChargeStart());
        launchBtn.addEventListener('touchend', () => this.handleChargeRelease());
        
        // Keyboard controls
        document.addEventListener('keydown', e => this.handleKeyDown(e));
        document.addEventListener('keyup', e => this.handleKeyUp(e));
    }
    
    handleLeftFlipperDown() {
        this.leftFlipperActive = true;
        if (this.callbacks.leftFlipperDown) {
            this.callbacks.leftFlipperDown();
        }
        // Check for both flippers
        if (this.rightFlipperActive && this.callbacks.bothFlippersDown) {
            this.callbacks.bothFlippersDown();
        }
    }
    
    handleLeftFlipperUp() {
        this.leftFlipperActive = false;
        if (this.callbacks.leftFlipperUp) {
            this.callbacks.leftFlipperUp();
        }
        // Check for both flippers release
        if (!this.rightFlipperActive && this.callbacks.bothFlippersUp) {
            this.callbacks.bothFlippersUp();
        }
    }
    
    handleRightFlipperDown() {
        this.rightFlipperActive = true;
        if (this.callbacks.rightFlipperDown) {
            this.callbacks.rightFlipperDown();
        }
        // Check for both flippers
        if (this.leftFlipperActive && this.callbacks.bothFlippersDown) {
            this.callbacks.bothFlippersDown();
        }
    }
    
    handleRightFlipperUp() {
        this.rightFlipperActive = false;
        if (this.callbacks.rightFlipperUp) {
            this.callbacks.rightFlipperUp();
        }
        // Check for both flippers release
        if (!this.leftFlipperActive && this.callbacks.bothFlippersUp) {
            this.callbacks.bothFlippersUp();
        }
    }
    
    handleChargeStart() {
        if (!this.charging) {
            this.charging = true;
            this.chargeStartTime = Date.now();
            if (this.callbacks.chargeStart) {
                this.callbacks.chargeStart();
            }
        }
    }
    
    handleChargeRelease() {
        if (this.charging) {
            const chargeTime = Date.now() - this.chargeStartTime;
            this.charging = false;
            if (this.callbacks.chargeRelease) {
                this.callbacks.chargeRelease(chargeTime);
            }
        }
    }
    
    handleKeyDown(e) {
        if (e.key === 'ArrowLeft' || e.key === 'a') {
            this.handleLeftFlipperDown();
        }
        if (e.key === 'ArrowRight' || e.key === 'd') {
            this.handleRightFlipperDown();
        }
        if (e.key === ' ') {
            e.preventDefault();
            this.handleChargeStart();
        }
    }
    
    handleKeyUp(e) {
        if (e.key === 'ArrowLeft' || e.key === 'a') {
            this.handleLeftFlipperUp();
        }
        if (e.key === 'ArrowRight' || e.key === 'd') {
            this.handleRightFlipperUp();
        }
        if (e.key === ' ') {
            this.handleChargeRelease();
        }
    }
    
    getChargePower() {
        if (!this.charging) return 0;
        const chargeTime = Math.min(Date.now() - this.chargeStartTime, 2500);
        return chargeTime / 2500;
    }
    
    isCharging() {
        return this.charging;
    }
}