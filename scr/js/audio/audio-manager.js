export class AudioManager {
    constructor() {
        this.context = null;
        this.sounds = new Map();
        this.pools = new Map();
        this.settings = {
            masterVolume: 0.7,
            sfxVolume: 1.0,
            musicVolume: 0.6,
            enabled: true
        };
        this.initialized = false;
        this.unlockPromise = null;
        this.loadedSounds = new Set();
        
        // Sound definitions with fallback to generated audio
        this.soundLibrary = {
            // Ball sounds
            'ball-launch': { 
                url: 'scr/audio/sfx/ball/launch.ogg',
                fallback: () => this.generateLaunchSound(),
                volume: 0.8,
                poolSize: 2
            },
            'ball-bounce': { 
                url: 'scr/audio/sfx/ball/bounce.ogg',
                fallback: () => this.generateBounceSound(),
                volume: 0.6,
                poolSize: 5
            },
            'ball-lost': { 
                url: 'scr/audio/sfx/ball/lost.ogg',
                fallback: () => this.generateLostSound(),
                volume: 0.9,
                poolSize: 1
            },
            
            // Flipper sounds
            'flipper-up': { 
                url: 'scr/audio/sfx/flippers/flip-up.ogg',
                fallback: () => this.generateFlipperSound(true),
                volume: 0.7,
                poolSize: 2
            },
            'flipper-down': { 
                url: 'scr/audio/sfx/flippers/flip-down.ogg',
                fallback: () => this.generateFlipperSound(false),
                volume: 0.5,
                poolSize: 2
            },
            
            // Collision sounds
            'bumper-hit': { 
                url: 'scr/audio/sfx/collisions/bumper.ogg',
                fallback: () => this.generateBumperSound(),
                volume: 0.5,
                poolSize: 4
            },
            'angledBumper-hit': { 
                url: 'scr/audio/sfx/collisions/angled-bumper.ogg',
                fallback: () => this.generateAngledBumperSound(),
                volume: 0.5,
                poolSize: 3
            },
            'target-hit': { 
                url: 'scr/audio/sfx/collisions/target.ogg',
                fallback: () => this.generateTargetSound(),
                volume: 0.6,
                poolSize: 3
            },
            'spinner-hit': { 
                url: 'scr/audio/sfx/collisions/spinner.ogg',
                fallback: () => this.generateSpinnerSound(),
                volume: 0.4,
                poolSize: 2
            },
            'ramp-hit': { 
                url: 'scr/audio/sfx/collisions/ramp.ogg',
                fallback: () => this.generateRampSound(),
                volume: 0.6,
                poolSize: 2
            },
            'wall-hit': { 
                url: 'scr/audio/sfx/collisions/wall.ogg',
                fallback: () => this.generateWallSound(),
                volume: 0.4,
                poolSize: 3
            },
            
            // UI and game sounds
            'extra-ball': { 
                url: 'scr/audio/sfx/scoring/extra-ball.ogg',
                fallback: () => this.generateExtraBallSound(),
                volume: 1.0,
                poolSize: 1
            },
            'score-bonus': { 
                url: 'scr/audio/sfx/scoring/bonus.ogg',
                fallback: () => this.generateScoreBonusSound(),
                volume: 0.8,
                poolSize: 2
            },
            'game-over': { 
                url: 'scr/audio/sfx/ui/game-over.ogg',
                fallback: () => this.generateGameOverSound(),
                volume: 0.9,
                poolSize: 1
            },
            
            // Background music
            'ambient-music': { 
                url: 'scr/audio/music/ambient-cyberpunk.ogg',
                fallback: () => this.generateAmbientMusic(),
                volume: 0.3,
                loop: true,
                poolSize: 1
            }
        };
    }

    async initialize() {
        if (this.initialized) return true;
        
        try {
            // Create audio context if not exists
            if (!this.context) {
                this.context = new (window.AudioContext || window.webkitAudioContext)();
                console.log('Audio context created, state:', this.context.state);
            }
            
            // Resume if suspended (critical for mobile)
            if (this.context.state === 'suspended') {
                console.log('Audio context suspended, attempting to resume...');
                await this.context.resume();
                console.log('Audio context resumed, new state:', this.context.state);
            }
            
            this.initialized = this.context.state === 'running';
            
            if (this.initialized) {
                console.log('AudioManager initialized successfully');
                // Preload critical sounds after successful initialization
                setTimeout(() => this.preloadCriticalSounds(), 100);
            } else {
                console.warn('Audio context not running, state:', this.context.state);
            }
            
            return this.initialized;
            
        } catch (error) {
            console.error('AudioManager initialization failed:', error);
            this.settings.enabled = false;
            return false;
        }
    }

    async preloadCriticalSounds() {
        const criticalSounds = [
            'ball-launch', 'ball-bounce', 'flipper-up', 'flipper-down',
            'bumper-hit', 'angledBumper-hit', 'target-hit', 'spinner-hit',
            'ramp-hit', 'wall-hit', 'extra-ball', 'ball-lost'
        ];
        
        for (const soundId of criticalSounds) {
            await this.loadSound(soundId);
        }
    }

    async loadSound(soundId) {
        if (!this.initialized || this.loadedSounds.has(soundId)) return;
        
        const soundDef = this.soundLibrary[soundId];
        if (!soundDef) return;
        
        try {
            // Try to load from file first
            const response = await fetch(soundDef.url);
            if (response.ok) {
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
                this.sounds.set(soundId, audioBuffer);
            } else {
                throw new Error('File not found');
            }
        } catch (error) {
            // Fallback to generated sound
            console.log(`Loading fallback sound for ${soundId}`);
            const generatedBuffer = soundDef.fallback();
            this.sounds.set(soundId, generatedBuffer);
            console.log(`Generated fallback sound for ${soundId}`);
        }
        
        // Create sound pool
        this.createSoundPool(soundId, soundDef.poolSize || 2);
        this.loadedSounds.add(soundId);
    }

    createSoundPool(soundId, poolSize) {
        const pool = [];
        for (let i = 0; i < poolSize; i++) {
            pool.push({ inUse: false, source: null });
        }
        this.pools.set(soundId, pool);
    }

    play(soundId, options = {}) {
        if (!this.initialized || !this.settings.enabled) {
            return;
        }
        
        // Auto-load sound if not loaded yet
        if (!this.sounds.has(soundId)) {
            this.loadSound(soundId).then(() => {
                // Try playing again after loading
                if (this.sounds.has(soundId)) {
                    this.play(soundId, options);
                }
            });
            return;
        }
        
        const soundBuffer = this.sounds.get(soundId);
        const soundDef = this.soundLibrary[soundId];
        const pool = this.pools.get(soundId);
        
        // Find available sound instance
        let instance = pool?.find(inst => !inst.inUse);
        if (!instance) {
            // All instances busy, use the oldest one
            instance = pool?.[0];
            if (instance?.source) {
                instance.source.stop();
            }
        }
        
        if (!instance) return;
        
        try {
            // Create and configure audio source
            const source = this.context.createBufferSource();
            source.buffer = soundBuffer;
            
            // Create gain node for volume control
            const gainNode = this.context.createGain();
            
            // Calculate final volume
            const baseVolume = soundDef.volume || 1.0;
            const optionsVolume = options.volume || 1.0;
            const finalVolume = baseVolume * optionsVolume * this.settings.sfxVolume * this.settings.masterVolume;
            gainNode.gain.setValueAtTime(finalVolume, this.context.currentTime);
            
            // Apply pitch variation if specified
            if (options.pitch) {
                source.playbackRate.setValueAtTime(options.pitch, this.context.currentTime);
            }
            
            // Connect audio graph
            source.connect(gainNode);
            gainNode.connect(this.context.destination);
            
            // Handle sound completion
            instance.source = source;
            instance.inUse = true;
            
            source.onended = () => {
                instance.inUse = false;
                instance.source = null;
            };
            
            // Start playback
            source.start(0);
            
        } catch (error) {
            console.error(`Error playing sound ${soundId}:`, error);
            instance.inUse = false;
        }
    }

    setVolume(type, volume) {
        volume = Math.max(0, Math.min(1, volume));
        this.settings[type + 'Volume'] = volume;
        localStorage.setItem('pinball-audio-settings', JSON.stringify(this.settings));
    }

    setEnabled(enabled) {
        this.settings.enabled = enabled;
        localStorage.setItem('pinball-audio-settings', JSON.stringify(this.settings));
        
        if (!enabled) {
            this.stopAllSounds();
        }
    }

    stopAllSounds() {
        for (const pool of this.pools.values()) {
            for (const instance of pool) {
                if (instance.source && instance.inUse) {
                    instance.source.stop();
                    instance.inUse = false;
                    instance.source = null;
                }
            }
        }
    }

    loadSettings() {
        const saved = localStorage.getItem('pinball-audio-settings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                Object.assign(this.settings, settings);
            } catch (e) {
                console.warn('Failed to load audio settings');
            }
        }
    }

    // Procedural sound generation fallbacks
    generateLaunchSound() {
        return this.createTone(800, 0.3, 0.1, 'sawtooth');
    }

    generateBounceSound() {
        // Quick metallic bounce
        return this.createTone(400 + Math.random() * 200, 0.08, 0.01, 'triangle');
    }

    generateLostSound() {
        return this.createTone(200, 1.0, 0.5, 'triangle', true);
    }

    generateFlipperSound(isUp) {
        const freq = isUp ? 400 : 200;
        return this.createTone(freq, 0.15, 0.05, 'square');
    }

    generateBumperSound() {
        // Classic pinball bumper "boing" sound
        return this.createTone(150 + Math.random() * 100, 0.15, 0.01, 'sine');
    }

    generateAngledBumperSound() {
        // Slightly higher pitched bumper sound
        return this.createTone(200 + Math.random() * 150, 0.15, 0.01, 'sine');
    }

    generateTargetSound() {
        // Satisfying "ding" sound
        return this.createTone(800, 0.2, 0.01, 'sine', true);
    }

    generateSpinnerSound() {
        // Quick spinning tick sound
        return this.createTone(2000, 0.05, 0.001, 'square');
    }

    generateRampSound() {
        return this.createTone(500, 0.5, 0.25, 'sine');
    }

    generateWallSound() {
        // Soft thud
        return this.createTone(100, 0.05, 0.01, 'sine');
    }

    generateExtraBallSound() {
        return this.createTone(1500, 0.8, 0.4, 'sine', false, true);
    }

    generateScoreBonusSound() {
        return this.createTone(800, 0.4, 0.2, 'triangle');
    }

    generateGameOverSound() {
        return this.createTone(150, 2.0, 1.0, 'triangle', true);
    }

    generateAmbientMusic() {
        // Simple ambient drone
        return this.createTone(80, 30.0, 5.0, 'sine');
    }

    createTone(frequency, duration, attack, waveType = 'sine', fadeOut = false, chord = false) {
        const sampleRate = this.context.sampleRate;
        const length = sampleRate * duration;
        const buffer = this.context.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < length; i++) {
            const t = i / sampleRate;
            let value = 0;

            if (chord) {
                // Create chord effect
                value += Math.sin(2 * Math.PI * frequency * t) * 0.5;
                value += Math.sin(2 * Math.PI * frequency * 1.25 * t) * 0.3;
                value += Math.sin(2 * Math.PI * frequency * 1.5 * t) * 0.2;
            } else {
                // Single tone
                switch (waveType) {
                    case 'sine':
                        value = Math.sin(2 * Math.PI * frequency * t);
                        break;
                    case 'square':
                        value = Math.sign(Math.sin(2 * Math.PI * frequency * t));
                        break;
                    case 'sawtooth':
                        value = 2 * (t * frequency - Math.floor(t * frequency + 0.5));
                        break;
                    case 'triangle':
                        value = 2 * Math.abs(2 * (t * frequency - Math.floor(t * frequency + 0.5))) - 1;
                        break;
                }
            }

            // Apply envelope
            let envelope = 1;
            const attackSamples = sampleRate * attack;
            
            if (i < attackSamples) {
                envelope = i / attackSamples;
            } else if (fadeOut && i > length - attackSamples) {
                envelope = (length - i) / attackSamples;
            }

            data[i] = value * envelope * 0.3; // Reduce overall volume
        }

        return buffer;
    }

    // Spatial audio calculation
    calculateSpatialVolume(x, y, tableWidth = 400, tableHeight = 800) {
        // Simple distance-based volume (can be enhanced with proper 3D positioning)
        const centerX = tableWidth / 2;
        const centerY = tableHeight / 2;
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);
        return Math.max(0.3, 1 - (distance / maxDistance) * 0.5);
    }

    // Pitch variation for more interesting collisions
    calculatePitchVariation(element) {
        return 0.8 + Math.random() * 0.4; // Random pitch between 0.8x and 1.2x
    }
}