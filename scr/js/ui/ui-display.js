export class UIDisplay {
    constructor(game) {
        this.game = game;
        this.scoreAnimationTime = 0;
        this.lastScore = 0;
        this.scoreChangeAmount = 0;
        
        // For extra ball progress
        this.extraBallProgress = 0;
        this.targetExtraBallScore = 10000;
    }
    
    drawDigit(ctx, digit, x, y, size, color, glow = false) {
        const segments = [
            // Top
            [[0, 0], [size, 0]],
            // Top right
            [[size, 0], [size, size]],
            // Bottom right
            [[size, size], [size, size * 2]],
            // Bottom
            [[0, size * 2], [size, size * 2]],
            // Bottom left
            [[0, size], [0, size * 2]],
            // Top left
            [[0, 0], [0, size]],
            // Middle
            [[0, size], [size, size]]
        ];
        
        const digitSegments = {
            '0': [0, 1, 2, 3, 4, 5],
            '1': [1, 2],
            '2': [0, 1, 3, 4, 6],
            '3': [0, 1, 2, 3, 6],
            '4': [1, 2, 5, 6],
            '5': [0, 2, 3, 5, 6],
            '6': [0, 2, 3, 4, 5, 6],
            '7': [0, 1, 2],
            '8': [0, 1, 2, 3, 4, 5, 6],
            '9': [0, 1, 2, 3, 5, 6]
        };
        
        ctx.save();
        ctx.translate(x, y);
        
        // Draw inactive segments
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 3;
        segments.forEach(segment => {
            ctx.beginPath();
            ctx.moveTo(segment[0][0], segment[0][1]);
            ctx.lineTo(segment[1][0], segment[1][1]);
            ctx.stroke();
        });
        
        // Draw active segments
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        
        if (glow) {
            ctx.shadowColor = color;
            ctx.shadowBlur = 10;
        }
        
        const activeSegments = digitSegments[digit] || [];
        activeSegments.forEach(index => {
            const segment = segments[index];
            ctx.beginPath();
            ctx.moveTo(segment[0][0], segment[0][1]);
            ctx.lineTo(segment[1][0], segment[1][1]);
            ctx.stroke();
        });
        
        ctx.restore();
    }
    
    drawLCDText(ctx, text, x, y, size, color, glow = false) {
        const digitWidth = size * 1.2;
        const chars = text.toString().split('');
        
        chars.forEach((char, index) => {
            if (char >= '0' && char <= '9') {
                this.drawDigit(ctx, char, x + index * digitWidth, y, size, color, glow);
            }
        });
    }
    
    draw(ctx) {
        // Background panel
        ctx.fillStyle = 'rgba(0, 20, 40, 0.8)';
        ctx.fillRect(10, 10, 380, 80);
        
        // Border
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(10, 10, 380, 80);
        
        // Title with glow
        ctx.save();
        ctx.font = 'bold 24px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#00ffff';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 15;
        ctx.fillText('CYBER PINBALL PRO', 200, 35);
        ctx.restore();
        
        // Score section
        this.drawScoreSection(ctx);
        
        // Balls section
        this.drawBallsSection(ctx);
        
        // High score section
        this.drawHighScoreSection(ctx);
        
        // Extra ball progress
        this.drawExtraBallProgress(ctx);
    }
    
    drawScoreSection(ctx) {
        // Label
        ctx.font = '12px "Courier New"';
        ctx.fillStyle = '#00ff00';
        ctx.textAlign = 'left';
        ctx.fillText('SCORE', 30, 60);
        
        // Score with animation
        const displayScore = this.game.score;
        const isAnimating = this.scoreAnimationTime > 0;
        const scoreColor = isAnimating ? '#00ff00' : '#00ff00';
        
        this.drawLCDText(ctx, displayScore.toString().padStart(7, '0'), 30, 65, 8, scoreColor, isAnimating);
        
        // Score change indicator
        if (this.scoreChangeAmount > 0 && this.scoreAnimationTime > 0) {
            ctx.save();
            ctx.font = 'bold 14px "Courier New"';
            ctx.fillStyle = '#ffff00';
            ctx.globalAlpha = this.scoreAnimationTime;
            ctx.fillText('+' + this.scoreChangeAmount, 120, 55);
            ctx.restore();
        }
    }
    
    drawBallsSection(ctx) {
        // Label
        ctx.font = '12px "Courier New"';
        ctx.fillStyle = '#ffff00';
        ctx.textAlign = 'center';
        ctx.fillText('BALLS', 200, 60);
        
        // Draw ball indicators
        const ballRadius = 6;
        const startX = 175;
        const y = 75;
        
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(startX + i * 20, y, ballRadius, 0, Math.PI * 2);
            
            if (i < this.game.ballsLeft) {
                ctx.fillStyle = '#00ffff';
                ctx.shadowColor = '#00ffff';
                ctx.shadowBlur = 10;
                ctx.fill();
                ctx.shadowBlur = 0;
            } else {
                ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }
    
    drawHighScoreSection(ctx) {
        // Label
        ctx.font = '12px "Courier New"';
        ctx.fillStyle = '#ff00ff';
        ctx.textAlign = 'right';
        ctx.fillText('HIGH', 370, 60);
        
        // High score
        const highScore = this.game.highScore;
        const xPos = 280;
        this.drawLCDText(ctx, highScore.toString().padStart(6, '0'), xPos, 65, 7, '#ff00ff', false);
    }
    
    drawExtraBallProgress(ctx) {
        if (this.game.nextExtraBallIndex < this.game.extraBallThresholds.length) {
            const nextThreshold = this.game.extraBallThresholds[this.game.nextExtraBallIndex];
            const progress = Math.min(this.game.score / nextThreshold, 1);
            
            // Progress bar background
            ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
            ctx.fillRect(30, 85, 340, 3);
            
            // Progress bar fill
            ctx.fillStyle = '#00ffff';
            ctx.fillRect(30, 85, 340 * progress, 3);
            
            // Glow effect at the end
            if (progress < 1) {
                ctx.shadowColor = '#00ffff';
                ctx.shadowBlur = 5;
                ctx.fillRect(30 + 340 * progress - 2, 84, 4, 5);
                ctx.shadowBlur = 0;
            }
        }
    }
    
    update() {
        // Update score animation
        if (this.game.score !== this.lastScore) {
            this.scoreChangeAmount = this.game.score - this.lastScore;
            this.scoreAnimationTime = 1;
            this.lastScore = this.game.score;
        }
        
        if (this.scoreAnimationTime > 0) {
            this.scoreAnimationTime -= 0.05;
        }
    }
}