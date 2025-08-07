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
                // Pre-generate critical sounds to avoid timing issues
                await this.generateCriticalSounds();
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

    async generateCriticalSounds() {
        console.log('Pre-generating critical sounds...');
        const criticalSounds = [
            'flipper-up', 'flipper-down', 'ball-launch', 'ball-bounce',
            'bumper-hit', 'angledBumper-hit', 'target-hit', 'spinner-hit',
            'ramp-hit', 'wall-hit', 'extra-ball', 'ball-lost'
        ];
        
        for (const soundId of criticalSounds) {
            await this.loadSound(soundId);
        }
        console.log('Critical sounds generated');
    }

    async loadSound(soundId) {
        if (!this.initialized || this.loadedSounds.has(soundId)) return;
        
        const soundDef = this.soundLibrary[soundId];
        if (!soundDef) return;
        
        // Skip file loading entirely to avoid 404 errors
        // Always use generated sounds since audio files don't exist
        try {
            const generatedBuffer = soundDef.fallback();
            this.sounds.set(soundId, generatedBuffer);
            
            // Create sound pool
            this.createSoundPool(soundId, soundDef.poolSize || 2);
            this.loadedSounds.add(soundId);
        } catch (error) {
            console.error(`Failed to generate sound for ${soundId}:`, error);
            // Mark as loaded even on error to prevent repeated attempts
            this.loadedSounds.add(soundId);
        }
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
            console.warn(`Sound blocked - initialized: ${this.initialized}, enabled: ${this.settings.enabled}`);
            return;
        }
        
        // Check if audio context is still running (mobile browsers can suspend it)
        if (this.context && this.context.state === 'suspended') {
            console.log('Audio context suspended, attempting to resume...');
            this.context.resume().catch(error => {
                console.warn('Failed to resume audio context:', error);
            });
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
                console.log('Loaded audio settings from localStorage:', this.settings);
            } catch (e) {
                console.warn('Failed to load audio settings');
            }
        }
        
        // Force enable audio since mute button was removed
        // This fixes the issue where audio might have been muted before
        this.settings.enabled = true;
        console.log('Audio settings after load:', this.settings);
    }

    // Procedural sound generation fallbacks
    generateLaunchSound() {
        return this.createTone(800, 0.3, 0.1, 'sawtooth');
    }

    generateBounceSound() {
        // Metal-on-metal contact
        return this.createVintageMetalHit();
    }

    generateLostSound() {
        return this.createTone(200, 1.0, 0.5, 'triangle', true);
    }

    generateFlipperSound(isUp) {
        // Solenoid clack
        return this.createVintageSolenoid(isUp);
    }

    generateBumperSound() {
        // Vintage bumper: metallic thump with bell overtones
        return this.createVintageBumper();
    }

    generateAngledBumperSound() {
        // Slingshot sound: sharp crack
        return this.createVintageSlingshot();
    }

    generateTargetSound() {
        // Drop target: metallic clack
        return this.createVintageTarget();
    }

    generateSpinnerSound() {
        // Spinner: rapid clicking
        return this.createVintageSpinner();
    }

    generateRampSound() {
        // Ball rolling on wire
        return this.createVintageRoll();
    }

    generateWallSound() {
        // Rubber wall: dull thud
        return this.createVintageRubber();
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
    
    // Vintage pinball machine sound creators
    createVintageBumper() {
        const sampleRate = this.context.sampleRate;
        const duration = 0.12;
        const buffer = this.context.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            // Low frequency thump (60Hz) with bell harmonics
            let value = Math.sin(2 * Math.PI * 60 * t) * Math.exp(-t * 15);
            // Add metallic ring (800Hz, 1200Hz)
            value += Math.sin(2 * Math.PI * 800 * t) * 0.3 * Math.exp(-t * 8);
            value += Math.sin(2 * Math.PI * 1200 * t) * 0.2 * Math.exp(-t * 10);
            // Add click transient
            if (t < 0.002) value += (Math.random() - 0.5) * (1 - t / 0.002);
            
            data[i] = value * 0.4;
        }
        return buffer;
    }
    
    createVintageSlingshot() {
        const sampleRate = this.context.sampleRate;
        const duration = 0.08;
        const buffer = this.context.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            // Sharp crack with wood/metal character
            let value = (Math.random() - 0.5) * Math.exp(-t * 50);
            // Add tonal component (250Hz)
            value += Math.sin(2 * Math.PI * 250 * t) * 0.5 * Math.exp(-t * 30);
            // High frequency snap (2500Hz)
            value += Math.sin(2 * Math.PI * 2500 * t) * 0.2 * Math.exp(-t * 100);
            
            data[i] = value * 0.5;
        }
        return buffer;
    }
    
    createVintageTarget() {
        const sampleRate = this.context.sampleRate;
        const duration = 0.15;
        const buffer = this.context.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            // Plastic/metal clack
            let value = (Math.random() - 0.5) * Math.exp(-t * 80);
            // Add resonant frequencies (400Hz, 1600Hz)
            value += Math.sin(2 * Math.PI * 400 * t) * Math.exp(-t * 12);
            value += Math.sin(2 * Math.PI * 1600 * t) * 0.3 * Math.exp(-t * 20);
            
            data[i] = value * 0.4;
        }
        return buffer;
    }
    
    createVintageSpinner() {
        const sampleRate = this.context.sampleRate;
        const duration = 0.03;
        const buffer = this.context.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            // Quick metallic tick
            let value = (Math.random() - 0.5) * Math.exp(-t * 200);
            // High metallic ring (3000Hz)
            value += Math.sin(2 * Math.PI * 3000 * t) * 0.5 * Math.exp(-t * 150);
            
            data[i] = value * 0.3;
        }
        return buffer;
    }
    
    createVintageRubber() {
        const sampleRate = this.context.sampleRate;
        const duration = 0.06;
        const buffer = this.context.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            // Dull thud with no high frequencies
            let value = Math.sin(2 * Math.PI * 80 * t) * Math.exp(-t * 40);
            value += Math.sin(2 * Math.PI * 120 * t) * 0.5 * Math.exp(-t * 35);
            
            data[i] = value * 0.3;
        }
        return buffer;
    }
    
    createVintageMetalHit() {
        const sampleRate = this.context.sampleRate;
        const duration = 0.1;
        const buffer = this.context.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            // Metal ping with multiple harmonics
            let value = 0;
            const freqs = [523, 784, 1046, 1568]; // C, G, C, G harmonics
            freqs.forEach((freq, idx) => {
                value += Math.sin(2 * Math.PI * freq * t) * (1 / (idx + 1)) * Math.exp(-t * (10 + idx * 5));
            });
            // Add impact
            if (t < 0.001) value += (Math.random() - 0.5) * 2;
            
            data[i] = value * 0.25;
        }
        return buffer;
    }
    
    createVintageSolenoid(isUp) {
        const sampleRate = this.context.sampleRate;
        const duration = isUp ? 0.04 : 0.03;
        const buffer = this.context.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            // Mechanical clack
            let value = (Math.random() - 0.5) * Math.exp(-t * 100);
            // Add wood/plastic tone
            const freq = isUp ? 600 : 400;
            value += Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * 50);
            
            data[i] = value * (isUp ? 0.5 : 0.3);
        }
        return buffer;
    }
    
    createVintageRoll() {
        const sampleRate = this.context.sampleRate;
        const duration = 0.2;
        const buffer = this.context.createBuffer(1, sampleRate * duration, sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < data.length; i++) {
            const t = i / sampleRate;
            // Rolling sound with varying pitch
            let value = 0;
            // Multiple metallic frequencies
            value += Math.sin(2 * Math.PI * (300 + Math.sin(t * 10) * 50) * t) * 0.3;
            value += Math.sin(2 * Math.PI * (450 + Math.sin(t * 15) * 75) * t) * 0.2;
            // Envelope
            value *= Math.exp(-t * 3);
            
            data[i] = value * 0.4;
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