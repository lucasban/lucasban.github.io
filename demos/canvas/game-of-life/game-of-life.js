// Conway's Game of Life
(function() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    // Controls
    const playBtn = document.getElementById('play-btn');
    const stepBtn = document.getElementById('step-btn');
    const clearBtn = document.getElementById('clear-btn');
    const randomBtn = document.getElementById('random-btn');
    const speedSlider = document.getElementById('speed');
    const speedValue = document.getElementById('speed-value');
    const generationDisplay = document.getElementById('generation');

    // Preset buttons
    const presetGlider = document.getElementById('preset-glider');
    const presetBlinker = document.getElementById('preset-blinker');
    const presetPulsar = document.getElementById('preset-pulsar');
    const presetGosper = document.getElementById('preset-gosper');

    // Grid settings
    const cellSize = 10;
    const cols = Math.floor(canvas.width / cellSize);
    const rows = Math.floor(canvas.height / cellSize);

    // State
    let grid = createGrid();
    let isRunning = false;
    let generation = 0;
    let fps = 10;
    let lastFrame = 0;

    function createGrid() {
        return Array(rows).fill(null).map(() => Array(cols).fill(0));
    }

    function countNeighbors(grid, x, y) {
        let count = 0;
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = (x + dx + cols) % cols;
                const ny = (y + dy + rows) % rows;
                count += grid[ny][nx];
            }
        }
        return count;
    }

    function nextGeneration() {
        const newGrid = createGrid();
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const neighbors = countNeighbors(grid, x, y);
                if (grid[y][x] === 1) {
                    newGrid[y][x] = (neighbors === 2 || neighbors === 3) ? 1 : 0;
                } else {
                    newGrid[y][x] = (neighbors === 3) ? 1 : 0;
                }
            }
        }
        grid = newGrid;
        generation++;
        generationDisplay.textContent = generation;
    }

    function draw() {
        ctx.fillStyle = '#fffff8';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw grid lines
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 0.5;
        for (let x = 0; x <= cols; x++) {
            ctx.beginPath();
            ctx.moveTo(x * cellSize, 0);
            ctx.lineTo(x * cellSize, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y <= rows; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * cellSize);
            ctx.lineTo(canvas.width, y * cellSize);
            ctx.stroke();
        }

        // Draw cells
        ctx.fillStyle = '#1a1a1a';
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                if (grid[y][x] === 1) {
                    ctx.fillRect(x * cellSize + 1, y * cellSize + 1, cellSize - 2, cellSize - 2);
                }
            }
        }
    }

    function animate(timestamp) {
        if (isRunning) {
            const elapsed = timestamp - lastFrame;
            if (elapsed > 1000 / fps) {
                nextGeneration();
                draw();
                lastFrame = timestamp;
            }
            requestAnimationFrame(animate);
        }
    }

    function toggleCell(x, y) {
        if (x >= 0 && x < cols && y >= 0 && y < rows) {
            grid[y][x] = grid[y][x] ? 0 : 1;
            draw();
        }
    }

    function setPattern(pattern, offsetX = 0, offsetY = 0) {
        const centerX = Math.floor(cols / 2) + offsetX;
        const centerY = Math.floor(rows / 2) + offsetY;
        for (const [dx, dy] of pattern) {
            const x = centerX + dx;
            const y = centerY + dy;
            if (x >= 0 && x < cols && y >= 0 && y < rows) {
                grid[y][x] = 1;
            }
        }
    }

    // Patterns
    const patterns = {
        glider: [
            [0, -1], [1, 0], [-1, 1], [0, 1], [1, 1]
        ],
        blinker: [
            [-1, 0], [0, 0], [1, 0]
        ],
        pulsar: (function() {
            const pts = [];
            const coords = [2, 3, 4, 8, 9, 10];
            for (const x of [2, 7]) {
                for (const y of coords) {
                    pts.push([x - 6, y - 6]);
                    pts.push([y - 6, x - 6]);
                }
            }
            for (const x of [4, 5, 6, 10, 11, 12]) {
                for (const y of [2, 7]) {
                    pts.push([x - 7, y - 4]);
                }
            }
            for (const x of [2, 7]) {
                for (const y of [4, 5, 6, 10, 11, 12]) {
                    pts.push([x - 4, y - 7]);
                }
            }
            return pts;
        })(),
        gosper: [
            // Left square
            [0, 4], [0, 5], [1, 4], [1, 5],
            // Left part
            [10, 4], [10, 5], [10, 6], [11, 3], [11, 7], [12, 2], [12, 8], [13, 2], [13, 8],
            [14, 5], [15, 3], [15, 7], [16, 4], [16, 5], [16, 6], [17, 5],
            // Right part
            [20, 2], [20, 3], [20, 4], [21, 2], [21, 3], [21, 4], [22, 1], [22, 5],
            [24, 0], [24, 1], [24, 5], [24, 6],
            // Right square
            [34, 2], [34, 3], [35, 2], [35, 3]
        ].map(([x, y]) => [x - 17, y - 4])
    };

    // Event listeners
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / cellSize);
        const y = Math.floor((e.clientY - rect.top) / cellSize);
        toggleCell(x, y);
    });

    playBtn.addEventListener('click', () => {
        isRunning = !isRunning;
        playBtn.textContent = isRunning ? 'Pause' : 'Play';
        if (isRunning) {
            lastFrame = performance.now();
            requestAnimationFrame(animate);
        }
    });

    stepBtn.addEventListener('click', () => {
        nextGeneration();
        draw();
    });

    clearBtn.addEventListener('click', () => {
        grid = createGrid();
        generation = 0;
        generationDisplay.textContent = generation;
        draw();
    });

    randomBtn.addEventListener('click', () => {
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                grid[y][x] = Math.random() < 0.3 ? 1 : 0;
            }
        }
        generation = 0;
        generationDisplay.textContent = generation;
        draw();
    });

    speedSlider.addEventListener('input', (e) => {
        fps = parseInt(e.target.value);
        speedValue.textContent = fps;
    });

    presetGlider.addEventListener('click', () => {
        grid = createGrid();
        generation = 0;
        generationDisplay.textContent = generation;
        setPattern(patterns.glider, -10, -10);
        draw();
    });

    presetBlinker.addEventListener('click', () => {
        grid = createGrid();
        generation = 0;
        generationDisplay.textContent = generation;
        setPattern(patterns.blinker);
        draw();
    });

    presetPulsar.addEventListener('click', () => {
        grid = createGrid();
        generation = 0;
        generationDisplay.textContent = generation;
        setPattern(patterns.pulsar);
        draw();
    });

    presetGosper.addEventListener('click', () => {
        grid = createGrid();
        generation = 0;
        generationDisplay.textContent = generation;
        setPattern(patterns.gosper);
        draw();
    });

    // Initialize
    draw();
})();
