// Game element definitions
export const ELEMENTS = {
    // Curved corners for smooth ball flow
    corners: [
        {
            // Top left corner
            x: 15,
            y: 50,
            radius: 35,
            type: 'outer' // Ball bounces off the outside of the curve
        },
        {
            // Top right corner
            x: 385,
            y: 50,
            radius: 35,
            type: 'outer'
        }
    ],
    
    bumpers: [
        { x: 150, y: 250, radius: 30, power: 10, color: '#ff6600' },
        { x: 250, y: 230, radius: 30, power: 10, color: '#ff6600' },
        { x: 200, y: 170, radius: 30, power: 10, color: '#ff6600' },
        { x: 100, y: 350, radius: 25, power: 8, color: '#ff9900' },
        { x: 300, y: 370, radius: 25, power: 8, color: '#ff9900' }
    ],
    
    angledBumpers: [
        {
            x1: 55, y1: 610,
            x2: 95, y2: 675,
            width: 8,
            power: 6,
            color: '#ff00ff',
            hit: 0
        },
        {
            x1: 345, y1: 610,
            x2: 305, y2: 675,
            width: 8,
            power: 6,
            color: '#ff00ff',
            hit: 0
        }
    ],
    
    targets: [
        { x: 50, y: 450, width: 20, height: 50, hit: false, points: 500 },
        { x: 90, y: 430, width: 20, height: 50, hit: false, points: 500 },
        { x: 290, y: 430, width: 20, height: 50, hit: false, points: 500 },
        { x: 330, y: 450, width: 20, height: 50, hit: false, points: 500 }
    ],
    
    // New: Drop targets that can be knocked down and reset
    dropTargets: [
        { x: 160, y: 200, width: 20, height: 40, dropped: false, points: 250 },
        { x: 190, y: 200, width: 20, height: 40, dropped: false, points: 250 },
        { x: 220, y: 200, width: 20, height: 40, dropped: false, points: 250 }
    ],
    
    // New: Skill lanes at the top
    skillLanes: [
        { x: 110, y: 80, width: 30, height: 40, letter: 'C', lit: false, points: 100 },
        { x: 160, y: 80, width: 30, height: 40, letter: 'Y', lit: false, points: 100 },
        { x: 210, y: 80, width: 30, height: 40, letter: 'B', lit: false, points: 100 },
        { x: 260, y: 80, width: 30, height: 40, letter: 'R', lit: false, points: 100 }
    ],
    
    // New: Lane dividers for skill lanes
    laneDividers: [
        { x1: 140, y1: 80, x2: 140, y2: 120 },
        { x1: 190, y1: 80, x2: 190, y2: 120 },
        { x1: 240, y1: 80, x2: 240, y2: 120 },
        { x1: 290, y1: 80, x2: 290, y2: 120 }
    ],
    
    spinners: [
        { x: 200, y: 320, angle: 0, spinning: false, spinSpeed: 0 },
        { x: 100, y: 400, angle: 0, spinning: false, spinSpeed: 0 }  // New left spinner
    ],
    
    // New: Outlanes and inlanes for proper ball flow
    outlanes: [
        // Left outlane
        { x1: 20, y1: 550, x2: 50, y2: 650, danger: true },
        // Right outlane - moved up to avoid launcher path
        { x1: 380, y1: 480, x2: 350, y2: 600, danger: true }
    ],
    
    inlanes: [
        // Left inlane
        { x1: 60, y1: 580, x2: 85, y2: 650 },
        // Right inlane
        { x1: 340, y1: 580, x2: 315, y2: 650 }
    ],
    
    ramps: [
        { x1: 50, y1: 550, x2: 150, y2: 480, width: 12 },
        { x1: 350, y1: 550, x2: 250, y2: 480, width: 12 }
    ],
    
    // New: Upper loop system
    upperLoop: {
        segments: [
            // Left entrance
            { x1: 50, y1: 150, x2: 50, y2: 120, width: 15, type: 'entrance' },
            // Top curve segments (approximated with lines)
            { x1: 50, y1: 120, x2: 80, y2: 100, width: 15, type: 'curve' },
            { x1: 80, y1: 100, x2: 120, y2: 90, width: 15, type: 'curve' },
            { x1: 120, y1: 90, x2: 200, y2: 85, width: 15, type: 'straight' },
            { x1: 200, y1: 85, x2: 280, y2: 90, width: 15, type: 'straight' },
            { x1: 280, y1: 90, x2: 320, y2: 100, width: 15, type: 'curve' },
            { x1: 320, y1: 100, x2: 350, y2: 120, width: 15, type: 'curve' },
            // Right exit
            { x1: 350, y1: 120, x2: 350, y2: 150, width: 15, type: 'exit' }
        ],
        active: false,
        completions: 0
    },
    
    // New: Ball lock mechanism
    ballLock: {
        x: 200,
        y: 350,
        width: 40,
        height: 60,
        capacity: 3,
        locked: [],
        active: false
    },
    
    // New: Captive ball
    captiveBall: {
        x: 320,
        y: 380,
        radius: 8,
        laneTop: 360,
        laneBottom: 400,
        laneLeft: 310,
        laneRight: 330,
        hits: 0,
        currentY: 380
    },
    
    // New: Mini flipper
    miniFlipper: {
        x: 280,
        y: 350,
        angle: Math.PI - 0.7,
        length: 40,
        targetAngle: Math.PI - 0.7,
        activeAngle: Math.PI + 0.2,
        isActive: false
    },
    
    // New: Magnets under playfield
    magnets: [
        { x: 150, y: 300, radius: 40, strength: 0.5, active: false, type: 'attract' },
        { x: 250, y: 400, radius: 40, strength: 0.5, active: false, type: 'repel' }
    ],
    
    // New: Moving targets
    movingTargets: [
        { 
            x: 100, 
            y: 200, 
            width: 30, 
            height: 20, 
            baseX: 100,
            baseY: 200,
            moveRadius: 30,
            moveSpeed: 0.02,
            moveAngle: 0,
            hit: false,
            points: 750
        },
        {
            x: 300,
            y: 250,
            width: 30,
            height: 20,
            baseX: 300,
            baseY: 250,
            moveRadius: 20,
            moveSpeed: 0.03,
            moveAngle: Math.PI,
            hit: false,
            points: 750
        }
    ],
    
    // New: Complex ramp system
    complexRamps: {
        leftRamp: {
            entrance: { x1: 70, y1: 500, x2: 120, y2: 450, width: 15 },
            segments: [
                { x1: 120, y1: 450, x2: 150, y2: 350, width: 15 },
                { x1: 150, y1: 350, x2: 200, y2: 300, width: 15 },
                { x1: 200, y1: 300, x2: 280, y2: 280, width: 15 }
            ],
            exit: { x: 280, y: 280, vx: 5, vy: 5 },
            active: false
        },
        rightRamp: {
            entrance: { x1: 330, y1: 500, x2: 280, y2: 450, width: 15 },
            segments: [
                { x1: 280, y1: 450, x2: 250, y2: 350, width: 15 },
                { x1: 250, y1: 350, x2: 200, y2: 300, width: 15 },
                { x1: 200, y1: 300, x2: 120, y2: 280, width: 15 }
            ],
            exit: { x: 120, y: 280, vx: -5, vy: 5 },
            active: false
        }
    },
    
    // New: Special modes
    specialModes: {
        magnetMadness: { active: false, duration: 0, maxDuration: 10000 },
        targetFrenzy: { active: false, duration: 0, maxDuration: 15000 },
        superJackpot: { active: false, multiplier: 1 }
    },
    
    flippers: {
        left: {
            x: 100,
            y: 680,
            angle: 0.5,
            length: 70,
            targetAngle: 0.5,
            activeAngle: -0.3
        },
        right: {
            x: 300,
            y: 680,
            angle: Math.PI - 0.5,
            length: 70,
            targetAngle: Math.PI - 0.5,
            activeAngle: Math.PI + 0.3
        }
    }
};