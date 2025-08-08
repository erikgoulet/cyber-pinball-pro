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
        // Right outlane  
        { x1: 380, y1: 550, x2: 350, y2: 650, danger: true }
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