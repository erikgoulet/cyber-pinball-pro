import { CANVAS, COLORS, GAME } from '../config/constants.js';

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.canvas.width = CANVAS.WIDTH;
        this.canvas.height = CANVAS.HEIGHT;
    }
    
    clear() {
        this.ctx.fillStyle = COLORS.BACKGROUND;
        this.ctx.fillRect(0, 0, CANVAS.WIDTH, CANVAS.HEIGHT);
    }
    
    drawGrid() {
        this.ctx.strokeStyle = COLORS.GRID;
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i < CANVAS.WIDTH; i += 30) {
            this.ctx.beginPath();
            this.ctx.moveTo(i, GAME.TOP_WALL_Y);
            this.ctx.lineTo(i, CANVAS.HEIGHT);
            this.ctx.stroke();
        }
        
        for (let i = GAME.TOP_WALL_Y; i < CANVAS.HEIGHT; i += 30) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, i);
            this.ctx.lineTo(CANVAS.WIDTH, i);
            this.ctx.stroke();
        }
    }
    
    drawWalls() {
        this.ctx.strokeStyle = COLORS.PRIMARY;
        this.ctx.lineWidth = 3;
        
        // Left wall
        this.ctx.beginPath();
        this.ctx.moveTo(15, GAME.TOP_WALL_Y);
        this.ctx.lineTo(15, 650);
        this.ctx.lineTo(100, 730);
        this.ctx.stroke();
        
        // Right wall
        this.ctx.beginPath();
        this.ctx.moveTo(385, GAME.TOP_WALL_Y);
        this.ctx.lineTo(385, 650);
        this.ctx.lineTo(300, 730);
        this.ctx.stroke();
        
        // Top wall
        this.ctx.beginPath();
        this.ctx.moveTo(15, GAME.TOP_WALL_Y);
        this.ctx.lineTo(385, GAME.TOP_WALL_Y);
        this.ctx.stroke();
    }
    
    drawLauncherChute(ball, charging, chargePower) {
        if (!ball.launched) {
            this.ctx.strokeStyle = COLORS.SECONDARY;
            this.ctx.lineWidth = 2;
            
            // Vertical launch channel
            this.ctx.beginPath();
            this.ctx.moveTo(358, 620);
            this.ctx.lineTo(358, 480);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(382, 620);
            this.ctx.lineTo(382, 480);
            this.ctx.stroke();
            
            // Launch indicator
            this.ctx.setLineDash([5, 5]);
            this.ctx.beginPath();
            this.ctx.arc(370, 600, 20, 0, Math.PI * 2);
            this.ctx.stroke();
            
            // Show launch trajectory when charging
            if (charging) {
                this.ctx.globalAlpha = chargePower * 0.6;
                this.ctx.strokeStyle = COLORS.SECONDARY;
                this.ctx.lineWidth = 3;
                this.ctx.setLineDash([]);
                
                this.ctx.beginPath();
                this.ctx.moveTo(370, 600);
                this.ctx.lineTo(370, 600 - 200 * chargePower);
                this.ctx.stroke();
                
                // Arrow head
                this.ctx.beginPath();
                this.ctx.moveTo(365, 600 - 200 * chargePower + 10);
                this.ctx.lineTo(370, 600 - 200 * chargePower);
                this.ctx.lineTo(375, 600 - 200 * chargePower + 10);
                this.ctx.stroke();
                
                this.ctx.globalAlpha = 1;
                this.ctx.lineWidth = 2;
            }
            
            this.ctx.setLineDash([]);
        }
    }
    
    drawRamps(ramps) {
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.lineWidth = 12;
        this.ctx.lineCap = 'round';
        this.ctx.shadowColor = '#00ff00';
        this.ctx.shadowBlur = 10;
        
        ramps.forEach(ramp => {
            this.ctx.beginPath();
            this.ctx.moveTo(ramp.x1, ramp.y1);
            this.ctx.lineTo(ramp.x2, ramp.y2);
            this.ctx.stroke();
        });
        
        this.ctx.shadowBlur = 0;
    }
    
    drawTargets(targets) {
        targets.forEach(target => {
            this.ctx.fillStyle = target.hit ? 'rgba(102, 102, 102, 0.5)' : 'rgba(255, 0, 255, 0.8)';
            this.ctx.fillRect(target.x, target.y, target.width, target.height);
            
            this.ctx.strokeStyle = target.hit ? '#666666' : COLORS.ACCENT;
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(target.x, target.y, target.width, target.height);
        });
    }
    
    drawAngledBumpers(bumpers) {
        bumpers.forEach(bumper => {
            const scale = bumper.hit > 0 ? 1.3 : 1;
            
            // Calculate perpendicular for thickness
            const dx = bumper.x2 - bumper.x1;
            const dy = bumper.y2 - bumper.y1;
            const len = Math.sqrt(dx * dx + dy * dy);
            const perpX = (-dy / len) * bumper.width / 2;
            const perpY = (dx / len) * bumper.width / 2;
            
            // Draw bumper as filled polygon
            this.ctx.fillStyle = bumper.color;
            this.ctx.strokeStyle = bumper.color;
            this.ctx.lineWidth = 2;
            this.ctx.shadowColor = bumper.color;
            this.ctx.shadowBlur = 20 * scale;
            
            this.ctx.beginPath();
            this.ctx.moveTo(bumper.x1 - perpX, bumper.y1 - perpY);
            this.ctx.lineTo(bumper.x2 - perpX, bumper.y2 - perpY);
            this.ctx.lineTo(bumper.x2 + perpX, bumper.y2 + perpY);
            this.ctx.lineTo(bumper.x1 + perpX, bumper.y1 + perpY);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
            
            // Highlight edge
            this.ctx.shadowBlur = 0;
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(bumper.x1 - perpX, bumper.y1 - perpY);
            this.ctx.lineTo(bumper.x2 - perpX, bumper.y2 - perpY);
            this.ctx.stroke();
        });
    }
    
    drawBumpers(bumpers) {
        bumpers.forEach(bumper => {
            const scale = bumper.hit > 0 ? 1.1 : 1;
            
            this.ctx.fillStyle = bumper.color;
            this.ctx.strokeStyle = bumper.color;
            this.ctx.lineWidth = 3;
            this.ctx.shadowColor = bumper.color;
            this.ctx.shadowBlur = 15;
            
            this.ctx.beginPath();
            this.ctx.arc(bumper.x, bumper.y, bumper.radius * scale, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
            
            // Highlight
            this.ctx.shadowBlur = 0;
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            this.ctx.beginPath();
            this.ctx.arc(bumper.x - bumper.radius * 0.3, bumper.y - bumper.radius * 0.3, bumper.radius * 0.3, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    drawSpinners(spinners) {
        spinners.forEach(spinner => {
            this.ctx.save();
            this.ctx.translate(spinner.x, spinner.y);
            this.ctx.rotate(spinner.angle);
            
            this.ctx.strokeStyle = '#ffff00';
            this.ctx.lineWidth = 6;
            this.ctx.lineCap = 'round';
            this.ctx.shadowColor = '#ffff00';
            this.ctx.shadowBlur = 10;
            
            this.ctx.beginPath();
            this.ctx.moveTo(-20, 0);
            this.ctx.lineTo(20, 0);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, -20);
            this.ctx.lineTo(0, 20);
            this.ctx.stroke();
            
            this.ctx.restore();
        });
    }
    
    drawFlippers(flippers) {
        this.ctx.strokeStyle = COLORS.PRIMARY;
        this.ctx.lineWidth = 10;
        this.ctx.lineCap = 'round';
        this.ctx.shadowColor = COLORS.PRIMARY;
        this.ctx.shadowBlur = 15;
        
        // Left flipper
        const leftEnd = flippers.left.getEndPoint();
        this.ctx.beginPath();
        this.ctx.moveTo(flippers.left.x, flippers.left.y);
        this.ctx.lineTo(leftEnd.x, leftEnd.y);
        this.ctx.stroke();
        
        // Right flipper
        const rightEnd = flippers.right.getEndPoint();
        this.ctx.beginPath();
        this.ctx.moveTo(flippers.right.x, flippers.right.y);
        this.ctx.lineTo(rightEnd.x, rightEnd.y);
        this.ctx.stroke();
        
        this.ctx.shadowBlur = 0;
    }
    
    drawBall(ball, charging) {
        // Draw trail
        ball.trail.forEach((point, index) => {
            const alpha = index / ball.trail.length * 0.5;
            this.ctx.fillStyle = `rgba(0, 255, 255, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Draw ball
        if (ball.launched || !charging) {
            this.ctx.fillStyle = COLORS.PRIMARY;
            this.ctx.shadowColor = COLORS.PRIMARY;
            this.ctx.shadowBlur = 20;
            this.ctx.beginPath();
            this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
        }
    }
    
    drawGameOver(score) {
        this.ctx.fillStyle = '#ff0000';
        this.ctx.font = 'bold 48px Courier New';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('GAME OVER', 200, 400);
        
        this.ctx.font = '24px Courier New';
        this.ctx.fillStyle = COLORS.PRIMARY;
        this.ctx.fillText('Score: ' + score, 200, 450);
    }
}