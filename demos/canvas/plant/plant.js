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
    const plantNameEl = document.getElementById('plant-name');
    const plantNameInput = document.getElementById('plant-name-input');
    const moodMessageEl = document.getElementById('mood-message');

    // Constants
    const MAX_HEALTH = 100;
    const THIRST_RATE_PER_HOUR = 2; // Lost per hour
    const GROWTH_RATE_PER_DAY = 1; // Stage increase per day
    const MAX_STAGE = 12; // Max recursion depth
    const WIND_SPEED = 0.002;

    // State
    let state = {
        name: "Sprout",
        birthDate: Date.now(),
        lastWatered: Date.now(),
        seed: Math.random()
    };

    let animationFrame;
    let time = 0;
    let fireflies = []; // Particle system for night

    // --- State Management ---

    function loadState() {
        const saved = localStorage.getItem('digital_plant_state');
        if (saved) {
            state = { ...state, ...JSON.parse(saved) }; // Merge defaults
        } else {
            saveState(); // Init new
        }

        // Initialize fireflies
        for (let i = 0; i < 15; i++) {
            fireflies.push({
                x: Math.random() * canvas.width,
                y: Math.random() * (canvas.height - 100),
                s: Math.random() * 2 + 1,
                offset: Math.random() * 100
            });
        }
    }

    function saveState() {
        localStorage.setItem('digital_plant_state', JSON.stringify(state));
    }

    function resetPlant() {
        if (!confirm("Are you sure you want to plant a new seed? The current plant will be lost.")) return;
        state = {
            name: "Sprout",
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

    function updateName(newName) {
        if (newName && newName.trim() !== "") {
            state.name = newName.trim();
            saveState();
            updateUI();
        }
        plantNameInput.style.display = 'none';
        plantNameEl.style.display = 'inline-block';
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

        plantNameEl.textContent = state.name;
        ageDisplay.textContent = `${days} Day${days !== 1 ? 's' : ''}`;
        healthDisplay.textContent = `${health}%`;

        // Update Mood Message
        let mood = "";
        if (health <= 0) mood = `${state.name} has withered...`;
        else if (health < 30) mood = `${state.name} is looking very thirsty.`;
        else if (health < 60) mood = `${state.name} needs some water.`;
        else if (health < 90) mood = `${state.name} is doing okay.`;
        else mood = `${state.name} is feeling sunny and happy!`;
        moodMessageEl.textContent = mood;

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
        
        // Branch Style (Softer round caps)
        ctx.lineCap = 'round';
        const health = getHealth();
        const age = getAgeInDays();
        
        if (health <= 0) ctx.strokeStyle = '#5c524a'; // Dead wood
        else if (health < 30) ctx.strokeStyle = '#8a6a4b'; // Dry wood
        else ctx.strokeStyle = '#3d3632'; // Healthy wood
        
        ctx.lineWidth = branchWidth;
        ctx.stroke();

        // Draw Ladybug on trunk
        if (depth === getGrowthStage() && health > 0) {
            drawLadybug(len);
        }

        if (!len || depth <= 0) {
            // Draw Leaf, Flower, or Fruit
            if (depth <= 0) {
                // Seeded randomness for decorations
                const hasFlower = Math.abs(Math.sin(state.seed * depth * 789)) > 0.85;
                const hasFruit = age > 3 && Math.abs(Math.cos(state.seed * depth * 456)) > 0.9;

                if (health > 90 && hasFlower) { 
                    drawFlower();
                } else if (health > 70 && hasFruit) {
                    drawFruit();
                } else {
                    drawLeaf(health);
                }
            }
            ctx.restore();
            return;
        }

        // Randomness seeded by the plant's unique seed + depth
        const r1 = Math.sin(state.seed * depth * 123); 
        const r2 = Math.cos(state.seed * depth * 456);

        // Wind sway
        const sway = Math.sin(time * 0.003 + depth) * (depth * 0.5);
        
        // Droop factor
        const droop = Math.max(0, (100 - health) * 0.5);

        const subBranch = len * 0.75;
        
        // Recursive calls
        drawTree(0, -len, subBranch, -20 + (r1 * 15) + sway + (droop * 0.1), branchWidth * 0.7, depth - 1);
        drawTree(0, -len, subBranch, 20 + (r2 * 15) + sway + (droop * 0.1), branchWidth * 0.7, depth - 1);

        ctx.restore();
    }

    function drawLadybug(len) {
        const bugY = -len * (0.5 + Math.sin(time * 0.002) * 0.4);
        ctx.save();
        ctx.translate(0, bugY);
        if (Math.cos(time * 0.002) > 0) ctx.scale(-1, 1);
        
        ctx.fillStyle = '#d44';
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(3, 0, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(-1, -1, 1, 0, Math.PI * 2);
        ctx.arc(-1, 1, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    function drawLeaf(health) {
        ctx.beginPath();
        // Heart-shaped leaf
        ctx.moveTo(0,0);
        ctx.bezierCurveTo(-5, -5, -10, -15, 0, -20);
        ctx.bezierCurveTo(10, -15, 5, -5, 0, 0);
        ctx.fillStyle = getLeafColor(health);
        ctx.fill();
    }

    function drawFlower() {
        ctx.beginPath();
        ctx.fillStyle = '#ffb7b2'; // Pinkish
        for(let i=0; i<5; i++) {
            ctx.rotate((Math.PI * 2) / 5);
            ctx.ellipse(0, 5, 3, 6, 0, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = '#fff';
        ctx.arc(0,0,2,0, Math.PI*2);
        ctx.fill();
    }

    function drawFruit() {
        ctx.beginPath();
        ctx.fillStyle = '#e07a5f'; // Terracotta orange
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        // Shine
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.arc(-1, -1, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }

    function getLeafColor(health) {
        if (health <= 0) return '#8a4030'; // Dead brown
        if (health < 30) return '#e0ac3e'; // Yellowing
        if (health < 60) return '#8a9a5b'; // Dull green
        return '#2d6a4f'; // Vibrant green
    }

    function renderFireflies(hour) {
        if (hour < 6 || hour >= 18) {
            fireflies.forEach(f => {
                const x = f.x + Math.sin(time * 0.001 + f.offset) * 20;
                const y = f.y + Math.cos(time * 0.001 + f.offset) * 20;
                const opacity = (Math.sin(time * 0.005 + f.offset) + 1) / 2;
                
                ctx.fillStyle = `rgba(255, 255, 150, ${opacity * 0.6})`;
                ctx.beginPath();
                ctx.arc(x, y, f.s, 0, Math.PI * 2);
                ctx.fill();
            });
        }
    }

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        time += 16; 

        // Sky Gradient (Day/Night cycle)
        const hour = new Date().getHours();
        let skyGradient;
        if (hour >= 6 && hour < 18) {
            skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            skyGradient.addColorStop(0, '#f0e9df'); 
            skyGradient.addColorStop(1, '#e8dfd3');
        } else {
            skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            skyGradient.addColorStop(0, '#1a1f1c'); 
            skyGradient.addColorStop(1, '#242a26');
        }
        
        ctx.fillStyle = skyGradient;
        ctx.fillRect(0,0, canvas.width, canvas.height);

        renderFireflies(hour);

        const startX = canvas.width / 2;
        const startY = canvas.height - 20;
        const baseLen = 100 + (getGrowthStage() * 5); 
        const stage = getGrowthStage();

        drawTree(startX, startY, baseLen, 0, 12, stage);

        // Ground
        ctx.fillStyle = '#8a6a4b'; // Dirt color
        ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
        
        // Grass tufts
        ctx.strokeStyle = '#2d6a4f';
        ctx.lineWidth = 2;
        for(let i=0; i<canvas.width; i+=15) {
            ctx.beginPath();
            ctx.moveTo(i, canvas.height-20);
            ctx.lineTo(i+5, canvas.height-25 - Math.sin(i)*5);
            ctx.stroke();
        }

        animationFrame = requestAnimationFrame(render);
    }

    // Initialize
    loadState();
    updateUI();
    render();

    // Event Listeners
    waterBtn.addEventListener('click', waterPlant);
    resetBtn.addEventListener('click', resetPlant);
    
    // Naming interaction
    plantNameEl.addEventListener('click', () => {
        plantNameEl.style.display = 'none';
        plantNameInput.style.display = 'inline-block';
        plantNameInput.value = state.name;
        plantNameInput.focus();
    });

    plantNameInput.addEventListener('blur', () => {
        updateName(plantNameInput.value);
    });

    plantNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            updateName(plantNameInput.value);
        }
    });

    setInterval(updateUI, 60000);

})();
