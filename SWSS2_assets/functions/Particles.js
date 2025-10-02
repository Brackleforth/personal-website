export function createParticles(x, y, cellWidth, cellHeight, statusBarHeight, particles) {
    const particleCount = 12;
    const tileLeft = x * cellWidth;
    const tileRight = (x + 1) * cellWidth;
    const tileTop = statusBarHeight + y * cellHeight;
    const tileBottom = statusBarHeight + (y + 1) * cellHeight;
    const inset = 0.1;

    const spawnPoints = [
        { px: tileLeft + inset * cellWidth, py: tileTop + inset * cellHeight, vx: -50, vy: -50 },
        { px: tileRight - inset * cellWidth, py: tileTop + inset * cellHeight, vx: 50, vy: -50 },
        { px: tileLeft + inset * cellWidth, py: tileBottom - inset * cellHeight, vx: -50, vy: 50 },
        { px: tileRight - inset * cellWidth, py: tileBottom - inset * cellHeight, vx: 50, vy: 50 },
        { px: tileLeft + cellWidth / 2, py: tileTop + inset * cellHeight, vx: 0, vy: -75 },
        { px: tileRight - inset * cellWidth, py: tileTop + cellHeight / 2, vx: 75, vy: 0 },
        { px: tileLeft + cellWidth / 2, py: tileBottom - inset * cellHeight, vx: 0, vy: 75 },
        { px: tileLeft + inset * cellWidth, py: tileTop + cellHeight / 2, vx: -75, vy: 0 },
        { px: tileLeft + inset * cellWidth, py: tileTop + cellHeight / 3, vx: -60, vy: -30 },
        { px: tileRight - inset * cellWidth, py: tileTop + 2 * cellHeight / 3, vx: 60, vy: 30 },
        { px: tileLeft + cellWidth / 3, py: tileTop + inset * cellHeight, vx: -30, vy: -60 },
        { px: tileRight - cellWidth / 3, py: tileBottom - inset * cellHeight, vx: 30, vy: 60 }
    ];

    for (let i = 0; i < particleCount; i++) {
        const sp = spawnPoints[i % spawnPoints.length];
        particles.push({
            x: sp.px,
            y: sp.py,
            vx: sp.vx + (Math.random() - 0.5) * 20,
            vy: sp.vy + (Math.random() - 0.5) * 20,
            size: 20,
            moveTime: 0.5,
            isStatic: false,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 180
        });
    }

    for (let i = 0; i < (particleCount * 2); i++) {
        const sp = spawnPoints[i % spawnPoints.length];
        particles.push({
            x: sp.px,
            y: sp.py,
            vx: sp.vx + (Math.random() - 0.5) * 200,
            vy: sp.vy + (Math.random() - 0.5) * 200,
            size: 10,
            moveTime: 0.25,
            isStatic: false,
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 360
        });
    }
}

export function spawnBgParticle(virtualHeight, virtualWidth, bgParticles) {
    const size = 50 + Math.random() * 250;
    const y = Math.random() * virtualHeight;
    const vx = -100 - Math.random() * 100;
    const opacity = 0.0125 + Math.random() * 0.025;
    const rotation = Math.random() * 360;
    const rotationSpeed = 0;
    const offScreenOffset = size / 2 + Math.random() * 50;
    const color = Math.random() < 0.5 ? `rgba(0, 0, 255, ${opacity})` : `rgba(0, 0, 0, ${opacity})`;
    bgParticles.push({
        x: virtualWidth + offScreenOffset,
        y: y,
        size: size,
        vx: vx,
        opacity: opacity,
        rotation: rotation,
        rotationSpeed: rotationSpeed,
        color: color
    });
}

export function updateParticles(deltaTime) {
    particles.forEach(p => {
        if (!p.isStatic) {
            p.x += p.vx * deltaTime;
            p.y += p.vy * deltaTime;
            p.rotation += p.rotationSpeed * deltaTime;
            p.moveTime -= deltaTime;

            const gridX = Math.floor(p.x / cellWidth);
            const gridY = Math.floor((p.y - statusBarHeight) / cellHeight);

            if (gridX >= 0 && gridX < gridWidth && gridY >= 0 && gridY < gridHeight) {
                const cell = grid.find(c => c.x === gridX && c.y === gridY);
                if (cell && (cell.state === 'wall' || cell.state === 'pit' || cell.state === 'brick')) {
                    p.isStatic = true;
                }
            } else {
                p.isStatic = true;
            }

            if (p.moveTime <= 0) {
                p.isStatic = true;
            }
        }
    });

    bgParticles = bgParticles.filter(p => p.x + p.size / 2 > 0);
    bgParticles.forEach(p => {
        p.x += p.vx * deltaTime;
        p.rotation += p.rotationSpeed * deltaTime;
    });
}

