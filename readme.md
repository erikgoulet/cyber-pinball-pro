# Cyber Pinball Pro 🎮

A retro-futuristic pinball game built with vanilla JavaScript and HTML5 Canvas. Features realistic physics, neon cyberpunk aesthetics, and smooth gameplay.

![Cyber Pinball Pro Screenshot](screenshot.png)

## 🎯 Features

- **Realistic Physics Engine**: Custom 2D physics with gravity, collision detection, and momentum transfer
- **Multiple Game Elements**: 
  - 5 Bumpers with different power levels
  - 2 Slingshot bumpers
  - 4 Targets worth 500 points each
  - 1 Spinner with rotation mechanics
  - 2 Speed ramps
  - 2 Responsive flippers
- **Multi-Platform Controls**:
  - Touch controls for mobile
  - Keyboard support (Arrow keys + Space)
  - Mouse controls for desktop
- **Visual Effects**:
  - Neon glow effects
  - Ball trail animation
  - Dynamic power meter
  - Cyberpunk color scheme
- **Persistent High Score**: Saves your best score locally

## 🎮 How to Play

1. **Launch**: Hold the ⚡ button (or Space key) to charge power, release to launch
2. **Flippers**: Use L/R buttons (or Arrow keys) to control flippers
3. **Score**: Hit targets, bumpers, and ramps to score points
4. **Goal**: Keep the ball in play and beat your high score!

## 🚀 Quick Start

### Play Online
Visit: [https://yourusername.github.io/cyber-pinball-pro/](https://yourusername.github.io/cyber-pinball-pro/)

### Run Locally
```bash
# Clone the repository
git clone https://github.com/yourusername/cyber-pinball-pro.git
cd cyber-pinball-pro

# Open in browser
# Option 1: Direct file
open index.html

# Option 2: Local server (recommended)
python -m http.server 8000
# Then visit http://localhost:8000
```

## 📁 Project Structure

```
cyber-pinball-pro/
├── index.html              # Main HTML file
├── src/
│   ├── css/
│   │   └── styles.css      # Game styling
│   └── js/
│       ├── main.js         # Entry point
│       ├── core/
│       │   ├── Game.js     # Main game logic
│       │   └── InputManager.js
│       ├── entities/
│       │   ├── Ball.js     # Ball physics
│       │   └── Flipper.js  # Flipper mechanics
│       ├── physics/
│       │   └── Physics.js  # Collision detection
│       ├── ui/
│       │   └── Renderer.js # Canvas rendering
│       └── config/
│           ├── constants.js # Game settings
│           └── elements.js  # Table layout
```

## 🛠️ Technical Details

- **No Dependencies**: Pure vanilla JavaScript
- **ES6 Modules**: Modern JavaScript architecture
- **Canvas API**: Hardware-accelerated rendering
- **60 FPS**: Smooth gameplay using requestAnimationFrame
- **Responsive**: Adapts to different screen sizes

## 📝 Development

### Adding New Features
1. Add new element types in `src/js/config/elements.js`
2. Create entity class in `src/js/entities/`
3. Add collision logic in `src/js/physics/Physics.js`
4. Add rendering in `src/js/ui/Renderer.js`

### Modifying Physics
- Adjust gravity and damping in `src/js/config/constants.js`
- Modify collision responses in `src/js/physics/Physics.js`

### Changing Visuals
- Update colors in `src/js/config/constants.js`
- Modify CSS in `src/css/styles.css`
- Adjust rendering effects in `src/js/ui/Renderer.js`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by classic pinball machines
- Built with love for retro gaming
- Cyberpunk aesthetic influenced by synthwave culture

---

Made with ⚡ by [Your Name]