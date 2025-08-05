export class Particle {
    constructor(x, y, velocityX, velocityY, color, size, lifetime) {
        this.x = x;
        this.y = y;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.color = color;
        this.size = size;
        this.lifetime = lifetime;
        this.maxLifetime = lifetime;
        this.opacity = 1;
    }

    update(deltaTime) {
        this.x += this.velocityX * deltaTime;
        this.y += this.velocityY * deltaTime;
        
        this.velocityY += 200 * deltaTime;
        
        this.velocityX *= 0.98;
        this.velocityY *= 0.98;
        
        this.lifetime -= deltaTime;
        this.opacity = Math.max(0, this.lifetime / this.maxLifetime);
        
        return this.lifetime > 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = this.size * 2;
        ctx.shadowColor = this.color;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

export class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    update(deltaTime) {
        this.particles = this.particles.filter(particle => particle.update(deltaTime));
    }

    draw(ctx) {
        this.particles.forEach(particle => particle.draw(ctx));
    }

    createCollisionEffect(x, y, color, intensity = 1) {
        const particleCount = Math.floor(8 * intensity);
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount + Math.random() * 0.5;
            const speed = 100 + Math.random() * 100 * intensity;
            const velocityX = Math.cos(angle) * speed;
            const velocityY = Math.sin(angle) * speed;
            const size = 2 + Math.random() * 3 * intensity;
            const lifetime = 0.3 + Math.random() * 0.3;
            
            this.particles.push(new Particle(x, y, velocityX, velocityY, color, size, lifetime));
        }
    }

    createSparkEffect(x, y, color, direction = null) {
        const sparkCount = 12;
        
        for (let i = 0; i < sparkCount; i++) {
            let angle;
            if (direction !== null) {
                angle = direction + (Math.random() - 0.5) * Math.PI * 0.5;
            } else {
                angle = Math.random() * Math.PI * 2;
            }
            
            const speed = 150 + Math.random() * 150;
            const velocityX = Math.cos(angle) * speed;
            const velocityY = Math.sin(angle) * speed;
            
            const sparkLength = Math.random() * 0.5 + 0.5;
            for (let j = 0; j < 3; j++) {
                const size = (3 - j) * 0.5 + Math.random() * 0.5;
                const lifetime = 0.4 + Math.random() * 0.2 - j * 0.1;
                const offsetX = x - velocityX * j * 0.01;
                const offsetY = y - velocityY * j * 0.01;
                
                this.particles.push(new Particle(offsetX, offsetY, velocityX, velocityY, color, size, lifetime));
            }
        }
        
        for (let i = 0; i < 5; i++) {
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 10;
            const sparkX = x + Math.cos(angle) * distance;
            const sparkY = y + Math.sin(angle) * distance;
            const size = 4 + Math.random() * 2;
            const lifetime = 0.1 + Math.random() * 0.1;
            
            this.particles.push(new Particle(sparkX, sparkY, 0, 0, color, size, lifetime));
        }
    }

    clear() {
        this.particles = [];
    }
}