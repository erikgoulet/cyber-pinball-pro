# Audio Assets

This directory contains audio assets for the Cyber Pinball Pro game.

## Directory Structure

```
scr/audio/
├── sfx/                    # Sound effects
│   ├── ball/              # Ball-related sounds
│   │   ├── launch.ogg     # Ball launch sound
│   │   ├── bounce.ogg     # Ball bounce sound
│   │   └── lost.ogg       # Ball lost sound
│   ├── flippers/          # Flipper sounds
│   │   ├── flip-up.ogg    # Flipper activation
│   │   └── flip-down.ogg  # Flipper deactivation
│   ├── collisions/        # Collision sounds
│   │   ├── bumper.ogg     # Round bumper hits
│   │   ├── angled-bumper.ogg # Angled bumper hits
│   │   ├── target.ogg     # Target hits
│   │   ├── spinner.ogg    # Spinner hits
│   │   ├── ramp.ogg       # Ramp collisions
│   │   └── wall.ogg       # Wall bounces
│   ├── scoring/           # Scoring sounds
│   │   ├── extra-ball.ogg # Extra ball earned
│   │   └── bonus.ogg      # Score bonus
│   └── ui/                # UI sounds
│       └── game-over.ogg  # Game over sound
└── music/                 # Background music
    └── ambient-cyberpunk.ogg # Ambient background track
```

## Audio Format Guidelines

- **Format**: OGG Vorbis (preferred) or MP3
- **Sample Rate**: 44.1kHz
- **Bitrate**: 96-128 kbps for SFX, 128-160 kbps for music
- **Channels**: Mono for SFX, Stereo for music
- **Duration**: 
  - SFX: 0.1-2 seconds
  - Music: Loop-friendly (3-5 minutes)

## Fallback System

The AudioManager includes procedural sound generation as fallbacks when audio files are not available. This ensures the game works even without external audio assets.

## Adding New Sounds

1. Place audio files in the appropriate subdirectory
2. Update the `soundLibrary` object in `AudioManager.js`
3. Ensure the filename matches the expected name in the sound definition