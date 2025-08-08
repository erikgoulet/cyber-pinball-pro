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
        
        // Draw curved corners and walls as one continuous path
        const cornerRadius = 35;
        const topY = GAME.TOP_WALL_Y;
        
        this.ctx.beginPath();
        
        // Start at bottom left of left flipper area
        this.ctx.moveTo(100, 730);
        
        // Left wall up to where curve starts
        this.ctx.lineTo(15, 650);
        this.ctx.lineTo(15, topY + cornerRadius);
        
        // Top left curved corner
        this.ctx.arc(15 + cornerRadius, topY + cornerRadius, cornerRadius, Math.PI, Math.PI * 1.5, false);
        
        // Top wall
        this.ctx.lineTo(385 - cornerRadius, topY);
        
        // Top right curved corner
        this.ctx.arc(385 - cornerRadius, topY + cornerRadius, cornerRadius, Math.PI * 1.5, 0, false);
        
        // Right wall down to flipper area
        this.ctx.lineTo(385, 650);
        this.ctx.lineTo(300, 730);
        
        this.ctx.stroke();
        
        // Debug: Draw corner collision zones
        if (false) { // Change to true to see debug visualization
            this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
            this.ctx.lineWidth = 1;
            
            // Show the actual corner centers used in physics
            const leftCornerX = 15 + cornerRadius;
            const leftCornerY = topY + cornerRadius;
            const rightCornerX = 385 - cornerRadius;
            const rightCornerY = topY + cornerRadius;
            
            // Left corner center
            this.ctx.fillStyle = 'red';
            this.ctx.fillRect(leftCornerX - 2, leftCornerY - 2, 4, 4);
            
            // Right corner center
            this.ctx.fillRect(rightCornerX - 2, rightCornerY - 2, 4, 4);
            
            // Show collision radius
            this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
            this.ctx.beginPath();
            this.ctx.arc(leftCornerX, leftCornerY, cornerRadius - 8, 0, Math.PI * 2);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.arc(rightCornerX, rightCornerY, cornerRadius - 8, 0, Math.PI * 2);
            this.ctx.stroke();
            
            // Show the corner detection regions
            this.ctx.fillStyle = 'rgba(255, 255, 0, 0.2)';
            this.ctx.fillRect(rightCornerX - 5, 0, 100, rightCornerY + 5);
        }
    }
    
    drawLauncherChute(ball, charging, chargePower) {
        this.ctx.strokeStyle = COLORS.SECONDARY;
        this.ctx.lineWidth = 2;
        
        // Vertical launch channel - full height
        this.ctx.beginPath();
        this.ctx.moveTo(358, 750);  // Extended to bottom
        this.ctx.lineTo(358, 480);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(382, 750);  // Extended to bottom
        this.ctx.lineTo(382, 480);
        this.ctx.stroke();
        
        // Plunger mechanism at bottom
        if (!ball.launched) {
            // Plunger spring visualization
            this.ctx.strokeStyle = '#ffff00';
            this.ctx.lineWidth = 3;
            const pullDistance = chargePower * 30; // How far plunger pulls down
            const springY = 740 + pullDistance;
            
            // Draw spring coils
            for (let i = 0; i < 5; i++) {
                this.ctx.beginPath();
                this.ctx.moveTo(365, 740 - i * 8);
                this.ctx.lineTo(375, 735 - i * 8);
                this.ctx.moveTo(375, 735 - i * 8);
                this.ctx.lineTo(365, 730 - i * 8);
                this.ctx.stroke();
            }
            
            // Plunger handle
            this.ctx.fillStyle = '#888888';
            this.ctx.fillRect(360, springY - 5, 20, 10);
            
            // Launch indicator
            this.ctx.setLineDash([5, 5]);
            this.ctx.strokeStyle = COLORS.SECONDARY;
            this.ctx.beginPath();
            this.ctx.arc(370, ball.y, 20, 0, Math.PI * 2);
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
    
    drawDropTargets(targets) {
        targets.forEach(target => {
            if (!target.dropped) {
                // Draw standing target
                this.ctx.fillStyle = 'rgba(0, 255, 0, 0.8)';
                this.ctx.fillRect(target.x, target.y, target.width, target.height);
                
                this.ctx.strokeStyle = '#00ff00';
                this.ctx.lineWidth = 2;
                this.ctx.shadowColor = '#00ff00';
                this.ctx.shadowBlur = 10;
                this.ctx.strokeRect(target.x, target.y, target.width, target.height);
            } else {
                // Draw dropped target (flat line)
                this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(target.x, target.y + target.height);
                this.ctx.lineTo(target.x + target.width, target.y + target.height);
                this.ctx.stroke();
            }
            this.ctx.shadowBlur = 0;
        });
    }
    
    drawSkillLanes(lanes) {
        lanes.forEach(lane => {
            // Draw lane background
            this.ctx.fillStyle = lane.lit ? 'rgba(255, 255, 0, 0.6)' : 'rgba(255, 255, 0, 0.1)';
            this.ctx.fillRect(lane.x, lane.y, lane.width, lane.height);
            
            // Draw lane border
            this.ctx.strokeStyle = lane.lit ? '#ffff00' : '#888800';
            this.ctx.lineWidth = 2;
            if (lane.lit) {
                this.ctx.shadowColor = '#ffff00';
                this.ctx.shadowBlur = 15;
            }
            this.ctx.strokeRect(lane.x, lane.y, lane.width, lane.height);
            this.ctx.shadowBlur = 0;
            
            // Draw letter
            this.ctx.fillStyle = lane.lit ? '#000000' : '#ffff00';
            this.ctx.font = 'bold 20px Courier New';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            this.ctx.fillText(lane.letter, lane.x + lane.width/2, lane.y + lane.height/2);
        });
    }
    
    drawLaneDividers(dividers) {
        this.ctx.strokeStyle = '#666666';
        this.ctx.lineWidth = 2;
        
        dividers.forEach(divider => {
            this.ctx.beginPath();
            this.ctx.moveTo(divider.x1, divider.y1);
            this.ctx.lineTo(divider.x2, divider.y2);
            this.ctx.stroke();
        });
    }
    
    drawOutlanes(lanes) {
        this.ctx.strokeStyle = '#ff0000';
        this.ctx.lineWidth = 4;
        this.ctx.shadowColor = '#ff0000';
        this.ctx.shadowBlur = 10;
        
        lanes.forEach(lane => {
            this.ctx.beginPath();
            this.ctx.moveTo(lane.x1, lane.y1);
            this.ctx.lineTo(lane.x2, lane.y2);
            this.ctx.stroke();
            
            // Draw danger indicator
            this.ctx.fillStyle = '#ff0000';
            this.ctx.font = '12px Courier New';
            this.ctx.textAlign = 'center';
            const midX = (lane.x1 + lane.x2) / 2;
            const midY = (lane.y1 + lane.y2) / 2;
            this.ctx.fillText('!', midX, midY);
        });
        this.ctx.shadowBlur = 0;
    }
    
    drawInlanes(lanes) {
        this.ctx.strokeStyle = '#00ff00';
        this.ctx.lineWidth = 4;
        this.ctx.shadowColor = '#00ff00';
        this.ctx.shadowBlur = 5;
        
        lanes.forEach(lane => {
            this.ctx.beginPath();
            this.ctx.moveTo(lane.x1, lane.y1);
            this.ctx.lineTo(lane.x2, lane.y2);
            this.ctx.stroke();
        });
        this.ctx.shadowBlur = 0;
    }
}