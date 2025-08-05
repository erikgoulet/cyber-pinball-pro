export class Flipper {
    constructor(config) {
        this.x = config.x;
        this.y = config.y;
        this.angle = config.angle;
        this.length = config.length;
        this.targetAngle = config.targetAngle;
        this.activeAngle = config.activeAngle;
        this.restAngle = config.angle;
        this.isActive = false;
    }
    
    update() {
        // Smooth angle interpolation
        this.targetAngle = this.isActive ? this.activeAngle : this.restAngle;
        this.angle += (this.targetAngle - this.angle) * 0.3;
    }
    
    activate() {
        this.isActive = true;
    }
    
    deactivate() {
        this.isActive = false;
    }
    
    getEndPoint() {
        return {
            x: this.x + Math.cos(this.angle) * this.length,
            y: this.y + Math.sin(this.angle) * this.length
        };
    }
    
    getSpeed() {
        return Math.abs(this.targetAngle - this.angle) * 20;
    }
}