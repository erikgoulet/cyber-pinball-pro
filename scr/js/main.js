import { Game } from './core/game.js';

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    // Get canvas element
    const canvas = document.getElementById('gameCanvas');
    
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }
    
    // Create game instance
    const game = new Game(canvas);
    
    // Game loop
    function gameLoop() {
        game.update();
        game.draw();
        requestAnimationFrame(gameLoop);
    }
    
    // Start the game loop
    gameLoop();
    
    console.log('Cyber Pinball Pro initialized!');
});