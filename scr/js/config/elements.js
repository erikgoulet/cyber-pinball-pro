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
            x2: 75, y2: 635,
            width: 8,
            power: 6,
            color: '#ff00ff',
            hit: 0
        },
        {
            x1: 345, y1: 610,
            x2: 325, y2: 635,
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
    
    spinners: [
        { x: 200, y: 320, angle: 0, spinning: false, spinSpeed: 0 }
    ],
    
    ramps: [
        { x1: 50, y1: 550, x2: 150, y2: 480, width: 12 },
        { x1: 350, y1: 550, x2: 250, y2: 480, width: 12 }
    ],
    
    flippers: {
        left: {
            x: 100,
            y: 680,
            angle: -0.2,
            length: 70,
            targetAngle: -0.2,
            activeAngle: -0.8
        },
        right: {
            x: 300,
            y: 680,
            angle: Math.PI + 0.2,
            length: 70,
            targetAngle: Math.PI + 0.2,
            activeAngle: Math.PI + 0.8
        }
    }
};