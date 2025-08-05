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
        
        // Draw inactive segments with better visibility
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 4;
        segments.forEach(segment => {
            ctx.beginPath();
            ctx.moveTo(segment[0][0], segment[0][1]);
            ctx.lineTo(segment[1][0], segment[1][1]);
            ctx.stroke();
        });
        
        // Draw active segments with thicker lines
        ctx.strokeStyle = color;
        ctx.lineWidth = 5;
        
        if (glow) {
            ctx.shadowColor = color;
            ctx.shadowBlur = 15;
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
        // Background panel with darker background for better contrast
        ctx.fillStyle = 'rgba(0, 10, 20, 0.95)';
        ctx.fillRect(10, 10, 380, 90);
        
        // Double border for better visibility
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 3;
        ctx.strokeRect(10, 10, 380, 90);
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(8, 8, 384, 94);
        
        // Title with enhanced glow and larger font
        ctx.save();
        ctx.font = 'bold 28px "Courier New"';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#00ffff';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 20;
        ctx.fillText('CYBER PINBALL PRO', 200, 38);
        // Add inner glow
        ctx.shadowBlur = 8;
        ctx.fillText('CYBER PINBALL PRO', 200, 38);
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
        // Label with shadow
        ctx.save();
        ctx.font = 'bold 14px "Courier New"';
        ctx.fillStyle = '#00ff00';
        ctx.shadowColor = '#00ff00';
        ctx.shadowBlur = 8;
        ctx.textAlign = 'left';
        ctx.fillText('SCORE', 30, 62);
        ctx.restore();
        
        // Score with animation and larger size
        const displayScore = this.game.score;
        const isAnimating = this.scoreAnimationTime > 0;
        const scoreColor = isAnimating ? '#00ff00' : '#00ff00';
        
        this.drawLCDText(ctx, displayScore.toString().padStart(7, '0'), 30, 67, 10, scoreColor, isAnimating);
        
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
        // Label with shadow
        ctx.save();
        ctx.font = 'bold 14px "Courier New"';
        ctx.fillStyle = '#ffff00';
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 8;
        ctx.textAlign = 'center';
        ctx.fillText('BALLS', 200, 62);
        ctx.restore();
        
        // Draw ball indicators - larger and more visible
        const ballRadius = 8;
        const startX = 173;
        const y = 77;
        
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(startX + i * 20, y, ballRadius, 0, Math.PI * 2);
            
            if (i < this.game.ballsLeft) {
                ctx.fillStyle = '#00ffff';
                ctx.shadowColor = '#00ffff';
                ctx.shadowBlur = 15;
                ctx.fill();
                ctx.shadowBlur = 0;
            } else {
                ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
                ctx.lineWidth = 2;
                ctx.stroke();
            }
        }
    }
    
    drawHighScoreSection(ctx) {
        // Label with shadow
        ctx.save();
        ctx.font = 'bold 14px "Courier New"';
        ctx.fillStyle = '#ff00ff';
        ctx.shadowColor = '#ff00ff';
        ctx.shadowBlur = 8;
        ctx.textAlign = 'right';
        ctx.fillText('HIGH', 370, 62);
        ctx.restore();
        
        // High score with larger size
        const highScore = this.game.highScore;
        const xPos = 270;
        this.drawLCDText(ctx, highScore.toString().padStart(6, '0'), xPos, 67, 9, '#ff00ff', false);
    }
    
    drawExtraBallProgress(ctx) {
        if (this.game.nextExtraBallIndex < this.game.extraBallThresholds.length) {
            const nextThreshold = this.game.extraBallThresholds[this.game.nextExtraBallIndex];
            const progress = Math.min(this.game.score / nextThreshold, 1);
            
            // Progress bar background
            ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
            ctx.fillRect(30, 93, 340, 4);
            
            // Progress bar fill
            ctx.fillStyle = '#00ffff';
            ctx.fillRect(30, 93, 340 * progress, 4);
            
            // Glow effect at the end
            if (progress < 1) {
                ctx.shadowColor = '#00ffff';
                ctx.shadowBlur = 5;
                ctx.fillRect(30 + 340 * progress - 2, 92, 4, 6);
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