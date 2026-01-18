/**
 * Digital Plant - "Plantagotchi"
 * A persistent fractal tree that requires care.
 */
(function() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const ageDisplay = document.getElementById('age-display');
    const healthDisplay = document.getElementById('health-display');
    const waterBtn = document.getElementById('water-btn');
    const resetBtn = document.getElementById('reset-btn');

    // Constants
    const MAX_HEALTH = 100;
    const THIRST_RATE_PER_HOUR = 2; // Lost per hour
    const GROWTH_RATE_PER_DAY = 1; // Stage increase per day
    const MAX_STAGE = 12; // Max recursion depth
    const WIND_SPEED = 0.002;

    // State
    let state = {
        birthDate: Date.now(),
        lastWatered: Date.now(),
        seed: Math.random()
    };

    let animationFrame;
    let time = 0;

    // --- State Management ---

    function loadState() {
        const saved = localStorage.getItem('digital_plant_state');
        if (saved) {
            state = JSON.parse(saved);
        } else {
            saveState(); // Init new
        }
    }

    function saveState() {
        localStorage.setItem('digital_plant_state', JSON.stringify(state));
    }

    function resetPlant() {
        if (!confirm("Are you sure you want to plant a new seed? The current plant will be lost.")) return;
        state = {
            birthDate: Date.now(),
            lastWatered: Date.now(),
            seed: Math.random()
        };
        saveState();
        updateUI();
    }

    function waterPlant() {
        if (getHealth() <= 0) return; // Can't water a dead plant
        
        state.lastWatered = Date.now();
        saveState();
        
        // Visual feedback
        waterBtn.textContent = "💧 Watered!";
        waterBtn.disabled = true;
        setTimeout(() => {
            waterBtn.textContent = "💧 Water";
            waterBtn.disabled = false;
            updateUI();
        }, 1000);
    }

    // --- Logic ---

    function getAgeInDays() {
        const now = Date.now();
        const diff = now - state.birthDate;
        return Math.max(0, diff / (1000 * 60 * 60 * 24));
    }

    function getHealth() {
        const now = Date.now();
        const hoursSinceWater = (now - state.lastWatered) / (1000 * 60 * 60);
        const healthLost = hoursSinceWater * THIRST_RATE_PER_HOUR;
        return Math.max(0, Math.min(MAX_HEALTH, MAX_HEALTH - healthLost));
    }

    function getGrowthStage() {
        const days = getAgeInDays();
        // Start at stage 4, grow 1 stage per day, max out
        return Math.min(MAX_STAGE, Math.floor(4 + (days * GROWTH_RATE_PER_DAY)));
    }

    function updateUI() {
        const days = Math.floor(getAgeInDays());
        const health = Math.floor(getHealth());

        ageDisplay.textContent = `${days} Day${days !== 1 ? 's' : ''}`;
        healthDisplay.textContent = `${health}%`;

        // Color code health
        if (health > 70) healthDisplay.style.color = 'var(--leaf-deep)';
        else if (health > 30) healthDisplay.style.color = '#e0ac3e'; // Warning
        else healthDisplay.style.color = '#8a4030'; // Danger

        if (health <= 0) {
            waterBtn.disabled = true;
            waterBtn.textContent = "💀 Withered";
        } else {
            waterBtn.disabled = false;
        }
    }

    // --- Rendering (Fractal Tree) ---

    function drawTree(startX, startY, len, angle, branchWidth, depth) {
        ctx.beginPath();
        ctx.save();
        
        ctx.translate(startX, startY);
        ctx.rotate(angle * Math.PI/180);
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -len);
        
        // Branch Style
        const health = getHealth();
        if (health <= 0) ctx.strokeStyle = '#5c524a'; // Dead wood
        else if (health < 30) ctx.strokeStyle = '#8a6a4b'; // Dry wood
        else ctx.strokeStyle = '#3d3632'; // Healthy wood
        
        ctx.lineWidth = branchWidth;
        ctx.stroke();

        if (!len || depth <= 0) {
            // Draw Leaf
            if (depth <= 0) {
                ctx.beginPath();
                ctx.arc(0, -len, 5, 0, Math.PI/2);
                ctx.fillStyle = getLeafColor(health);
                ctx.fill();
            }
            ctx.restore();
            return;
        }

        // Randomness seeded by the plant's unique seed + depth for consistency
        // pseudo-random but deterministic based on state.seed
        const r1 = Math.sin(state.seed * depth * 123); 
        const r2 = Math.cos(state.seed * depth * 456);

        // Wind sway
        const sway = Math.sin(time * 0.003 + depth) * (depth * 0.5);
        
        // Droop factor (if thirsty, branches sag)
        const droop = Math.max(0, (100 - health) * 0.5);

        const subBranch = len * 0.75;
        
        // Recursive calls
        drawTree(0, -len, subBranch, -15 + (r1 * 10) + sway + (droop * 0.1), branchWidth * 0.7, depth - 1);
        drawTree(0, -len, subBranch, 15 + (r2 * 10) + sway + (droop * 0.1), branchWidth * 0.7, depth - 1);

        ctx.restore();
    }

    function getLeafColor(health) {
        if (health <= 0) return '#8a4030'; // Dead brown
        if (health < 30) return '#e0ac3e'; // Yellowing
        if (health < 60) return '#8a9a5b'; // Dull green
        return '#2d6a4f'; // Vibrant green
    }

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        time += 16; // Approx ms per frame

        const startX = canvas.width / 2;
        const startY = canvas.height - 20;
        const baseLen = 100 + (getGrowthStage() * 5); // Grow taller with age
        const stage = getGrowthStage();

        drawTree(startX, startY, baseLen, 0, 10, stage);

        // Ground
        ctx.fillStyle = '#e8dfd3';
        ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

        animationFrame = requestAnimationFrame(render);
    }

    // Initialize
    loadState();
    updateUI();
    render();

    // Event Listeners
    waterBtn.addEventListener('click', waterPlant);
    resetBtn.addEventListener('click', resetPlant);

    // Update UI occasionally (every min) without interaction
    setInterval(updateUI, 60000);

})();
