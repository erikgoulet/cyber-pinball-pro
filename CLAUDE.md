# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Run the game locally:**
```bash
# Using Python (recommended)
npm run start
# OR
python -m http.server 8000

# Using npx
npm run serve
# OR
npx http-server -p 8000
```

Then visit http://localhost:8000

**Note:** This is a vanilla JavaScript project with no build process, linting, or tests. The game runs directly in the browser without compilation.

## Architecture Overview

This is a browser-based pinball game built with vanilla JavaScript and HTML5 Canvas. The codebase follows a modular ES6 architecture:

### Core Game Loop
- **Entry Point**: `scr/js/main.js` - Initializes the game and starts the requestAnimationFrame loop
- **Game Controller**: `scr/js/core/game.js` - Manages game state, score, balls remaining, and coordinates all subsystems
- **Update/Draw Pattern**: Each frame calls `game.update()` then `game.draw()`

### Key Systems

1. **Physics Engine** (`scr/js/physics/physics.js`)
   - Custom 2D physics with gravity and damping
   - Collision detection between ball and all game elements
   - Momentum transfer calculations

2. **Input System** (`scr/js/core/input-manager.js`)
   - Event-driven architecture using custom event emitters
   - Supports keyboard, mouse, and touch controls
   - Maps user inputs to game actions (flipper control, ball launch)

3. **Rendering System** (`scr/js/ui/renderer.js`)
   - Canvas-based rendering with cyberpunk visual effects
   - Neon glow effects and ball trail animations
   - Responsible for all visual output

4. **Entity System**
   - `scr/js/entities/ball.js` - Ball physics and state
   - `scr/js/entities/flipper.js` - Flipper mechanics and collision

5. **Configuration**
   - `scr/js/config/constants.js` - Physics values, scoring rules, visual settings
   - `scr/js/config/elements.js` - Table layout and element positions

### Game Flow
1. Ball starts in launcher, player charges power with space/touch
2. Physics engine applies gravity and handles collisions each frame
3. Collisions with elements trigger score updates and visual effects
4. Game ends when all balls are lost, high score saved to localStorage

### Key Implementation Details
- All positions use absolute coordinates on 400x800 canvas
- Physics runs at 60 FPS using requestAnimationFrame
- No external dependencies - pure vanilla JavaScript
- Collision detection uses circle-circle and circle-line algorithms
- State persistence through localStorage for high scores