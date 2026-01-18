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
    const streakDisplay = document.getElementById('streak-display');

    // Constants
    const MAX_HEALTH = 100;
    const THIRST_RATE_PER_HOUR = 2; // Lost per hour
    const GROWTH_RATE_PER_DAY = 1; // Stage increase per day
    const MAX_STAGE = 12; // Max recursion depth
    const CRITTER_EVENT_MIN_MS = 120000; // 2 minutes
    const CRITTER_EVENT_MAX_MS = 180000; // 3 minutes

    // Seasonal color palettes
    const SEASONS = {
        spring: {
            leafBase: '#3da35d',
            leafBright: '#52b788',
            flower: '#ffb7c5', // Cherry blossom pink
            fruit: '#e07a5f',
            skyDay: ['#e8f4ec', '#d4e8dc'],
            skyNight: ['#1a2420', '#242e28']
        },
        summer: {
            leafBase: '#2d6a4f',
            leafBright: '#40916c',
            flower: '#ffb7b2',
            fruit: '#e07a5f',
            skyDay: ['#f0e9df', '#e8dfd3'],
            skyNight: ['#1a1f1c', '#242a26']
        },
        autumn: {
            leafBase: '#8a6a4b',
            leafBright: '#c9a227',
            flower: '#e8a87c',
            fruit: '#c85a30', // Deep orange
            skyDay: ['#f5e6d3', '#ead4bc'],
            skyNight: ['#1f1a18', '#2a2320']
        },
        winter: {
            leafBase: '#5a7a6a',
            leafBright: '#7a9a8a',
            flower: '#e8e8f0',
            fruit: '#c04040',
            skyDay: ['#e8eaed', '#d8dce0'],
            skyNight: ['#181a1f', '#20242a']
        }
    };

    // State
    let state = {
        name: "Sprout",
        birthDate: Date.now(),
        lastWatered: Date.now(),
        seed: Math.random(),
        waterStreakDays: 0,
        lastWaterDate: null, // ISO date string (YYYY-MM-DD)
        lastStage: 4, // Track for milestone detection
        celebratedMilestones: [] // Track which milestones have been celebrated
    };

    let animationFrame;
    let time = 0;
    let fireflies = []; // Particle system for night
    let snowflakes = []; // Particle system for winter
    let critterEventTimeout = null;
    let activeCritterEvent = null;
    let celebrationParticles = [];
    let milestoneMessage = null;

    // --- Seasonal Logic ---

    function getSeason() {
        const month = new Date().getMonth();
        if (month >= 2 && month <= 4) return 'spring'; // Mar-May
        if (month >= 5 && month <= 7) return 'summer'; // Jun-Aug
        if (month >= 8 && month <= 10) return 'autumn'; // Sep-Nov
        return 'winter'; // Dec-Feb
    }

    function getSeasonalColors() {
        return SEASONS[getSeason()];
    }

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

        // Initialize snowflakes for winter
        for (let i = 0; i < 30; i++) {
            snowflakes.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                s: Math.random() * 3 + 1,
                speed: Math.random() * 0.5 + 0.2,
                offset: Math.random() * 100
            });
        }

        // Start critter event timer
        scheduleCritterEvent();
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
            seed: Math.random(),
            waterStreakDays: 0,
            lastWaterDate: null,
            lastStage: 4,
            celebratedMilestones: []
        };
        saveState();
        updateUI();
    }

    function waterPlant() {
        if (getHealth() <= 0) return; // Can't water a dead plant

        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        // Update streak
        if (state.lastWaterDate) {
            const lastDate = new Date(state.lastWaterDate);
            const todayDate = new Date(today);
            const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

            if (diffDays === 1) {
                // Consecutive day - increment streak
                state.waterStreakDays++;
            } else if (diffDays > 1) {
                // Missed days - reset streak
                state.waterStreakDays = 1;
            }
            // diffDays === 0 means already watered today, keep streak
        } else {
            // First watering ever
            state.waterStreakDays = 1;
        }

        state.lastWaterDate = today;
        state.lastWatered = Date.now();
        saveState();

        // Visual feedback
        waterBtn.textContent = "💧 Watered!";
        waterBtn.disabled = true;

        // Check streak milestones
        const streakMilestones = [3, 7, 14, 30];
        if (streakMilestones.includes(state.waterStreakDays)) {
            showMilestoneMessage(`🔥 ${state.waterStreakDays}-day streak!`);
        }

        setTimeout(() => {
            waterBtn.textContent = "💧 Water";
            waterBtn.disabled = false;
            updateUI();
        }, 1000);
    }

    function updateName(newName) {
        const trimmed = newName ? newName.trim() : "";
        if (trimmed !== "" && plantNameInput.checkValidity()) {
            state.name = trimmed;
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

    function checkMilestones() {
        const currentStage = getGrowthStage();
        const health = getHealth();

        // Only check milestones for healthy plants
        if (health <= 0) return;

        // Define milestones: [stage, message, particleType]
        const milestones = [
            [5, "First branch split!", "burst"],
            [8, "First flower blooms!", "zoom"],
            [10, "First fruit appears!", "golden"],
            [12, "Full maturity! 🎉", "confetti"]
        ];

        for (const [stage, message, type] of milestones) {
            if (currentStage >= stage && state.lastStage < stage && !state.celebratedMilestones.includes(stage)) {
                state.celebratedMilestones.push(stage);
                saveState();
                triggerCelebration(type, message);
                break; // Only one celebration at a time
            }
        }

        state.lastStage = currentStage;
    }

    function updateUI() {
        const days = Math.floor(getAgeInDays());
        const health = Math.floor(getHealth());

        plantNameEl.textContent = state.name;
        ageDisplay.textContent = `${days} Day${days !== 1 ? 's' : ''}`;
        healthDisplay.textContent = `${health}%`;

        // Update streak display
        if (streakDisplay) {
            if (state.waterStreakDays >= 3) {
                streakDisplay.textContent = `🔥 ${state.waterStreakDays}`;
                streakDisplay.title = `${state.waterStreakDays}-day watering streak!`;
            } else if (state.waterStreakDays > 0) {
                streakDisplay.textContent = `${state.waterStreakDays} day${state.waterStreakDays > 1 ? 's' : ''}`;
                streakDisplay.title = 'Water daily to build a streak!';
            } else {
                streakDisplay.textContent = '—';
                streakDisplay.title = 'Start watering to build a streak!';
            }
        }

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

        // Check for milestone celebrations
        checkMilestones();
    }

    // --- Celebration System ---

    function triggerCelebration(type, message) {
        showMilestoneMessage(message);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        switch (type) {
            case 'burst':
                // Particle burst from trunk
                for (let i = 0; i < 20; i++) {
                    const angle = (Math.PI * 2 * i) / 20;
                    celebrationParticles.push({
                        x: centerX,
                        y: canvas.height - 100,
                        vx: Math.cos(angle) * (3 + Math.random() * 2),
                        vy: Math.sin(angle) * (3 + Math.random() * 2) - 2,
                        life: 60,
                        color: getSeasonalColors().leafBright,
                        size: 4 + Math.random() * 3
                    });
                }
                break;
            case 'zoom':
                // Brief zoom effect is handled in render
                celebrationParticles.push({
                    type: 'zoom',
                    life: 30,
                    scale: 1
                });
                break;
            case 'golden':
                // Golden pulse particles
                for (let i = 0; i < 30; i++) {
                    celebrationParticles.push({
                        x: centerX + (Math.random() - 0.5) * 200,
                        y: centerY + (Math.random() - 0.5) * 200,
                        vx: 0,
                        vy: -0.5,
                        life: 90,
                        color: '#ffd700',
                        size: 3 + Math.random() * 4,
                        glow: true
                    });
                }
                break;
            case 'confetti':
                // Full confetti celebration
                const colors = ['#2d6a4f', '#3d8b66', '#b8d4c4', '#b8863a', '#ffd700'];
                for (let i = 0; i < 50; i++) {
                    celebrationParticles.push({
                        x: Math.random() * canvas.width,
                        y: -10,
                        vx: (Math.random() - 0.5) * 3,
                        vy: Math.random() * 2 + 1,
                        life: 120,
                        color: colors[Math.floor(Math.random() * colors.length)],
                        size: 6 + Math.random() * 4,
                        rotation: Math.random() * Math.PI * 2
                    });
                }
                break;
        }
    }

    function showMilestoneMessage(message) {
        milestoneMessage = {
            text: message,
            life: 120,
            y: canvas.height / 3
        };
    }

    function updateCelebrationParticles() {
        for (let i = celebrationParticles.length - 1; i >= 0; i--) {
            const p = celebrationParticles[i];
            p.life--;

            if (p.type === 'zoom') {
                p.scale = 1 + Math.sin((30 - p.life) / 30 * Math.PI) * 0.1;
            } else {
                p.x += p.vx || 0;
                p.y += p.vy || 0;
                p.vy = (p.vy || 0) + 0.05; // Gravity
                if (p.rotation !== undefined) p.rotation += 0.1;
            }

            if (p.life <= 0) {
                celebrationParticles.splice(i, 1);
            }
        }
    }

    function renderCelebrationParticles() {
        for (const p of celebrationParticles) {
            if (p.type === 'zoom') continue; // Handled separately

            ctx.save();
            ctx.globalAlpha = Math.min(1, p.life / 30);

            if (p.glow) {
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 10;
            }

            ctx.fillStyle = p.color;
            ctx.translate(p.x, p.y);
            if (p.rotation !== undefined) ctx.rotate(p.rotation);
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
            ctx.restore();
        }

        // Render milestone message
        if (milestoneMessage) {
            milestoneMessage.life--;
            milestoneMessage.y -= 0.3;

            ctx.save();
            ctx.globalAlpha = Math.min(1, milestoneMessage.life / 30);
            ctx.font = 'bold 24px "Playfair Display", serif';
            ctx.fillStyle = '#ffd700';
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 4;
            ctx.fillText(milestoneMessage.text, canvas.width / 2, milestoneMessage.y);
            ctx.restore();

            if (milestoneMessage.life <= 0) {
                milestoneMessage = null;
            }
        }
    }

    // --- Interactive Critter Events ---

    function scheduleCritterEvent() {
        if (critterEventTimeout) clearTimeout(critterEventTimeout);

        const delay = CRITTER_EVENT_MIN_MS + Math.random() * (CRITTER_EVENT_MAX_MS - CRITTER_EVENT_MIN_MS);
        critterEventTimeout = setTimeout(() => {
            if (getHealth() > 0 && !activeCritterEvent) {
                spawnCritterEvent();
            }
            scheduleCritterEvent();
        }, delay);
    }

    function spawnCritterEvent() {
        const events = [
            { type: 'ladybug', message: '🐞 Pet the ladybug!', healthBonus: 1 },
            { type: 'butterfly', message: '🦋 A butterfly visits!', healthBonus: 0 },
            { type: 'bee', message: '🐝 Help the bee pollinate!', healthBonus: 2 },
            { type: 'aphid', message: '🐛 Tap to remove aphids!', healthBonus: 2 }
        ];

        const event = events[Math.floor(Math.random() * events.length)];

        activeCritterEvent = {
            ...event,
            x: 100 + Math.random() * (canvas.width - 200),
            y: 100 + Math.random() * (canvas.height - 250),
            life: 300, // 5 seconds at 60fps
            clicked: false,
            size: 30
        };
    }

    function handleCritterClick(mouseX, mouseY) {
        if (!activeCritterEvent || activeCritterEvent.clicked) return false;

        const dx = mouseX - activeCritterEvent.x;
        const dy = mouseY - activeCritterEvent.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < activeCritterEvent.size) {
            activeCritterEvent.clicked = true;

            if (activeCritterEvent.healthBonus > 0) {
                // Add health bonus by adjusting lastWatered
                const bonusMs = (activeCritterEvent.healthBonus / THIRST_RATE_PER_HOUR) * (1000 * 60 * 60);
                state.lastWatered = Math.min(Date.now(), state.lastWatered + bonusMs);
                saveState();
                showMilestoneMessage(`+${activeCritterEvent.healthBonus}% health!`);
            } else {
                showMilestoneMessage('✨ Beautiful!');
            }

            setTimeout(() => {
                activeCritterEvent = null;
            }, 500);

            return true;
        }
        return false;
    }

    function updateCritterEvent() {
        if (!activeCritterEvent) return;

        activeCritterEvent.life--;

        // Animate based on type
        if (activeCritterEvent.type === 'butterfly') {
            activeCritterEvent.x += Math.sin(time * 0.02) * 1;
            activeCritterEvent.y += Math.cos(time * 0.015) * 0.5;
        } else if (activeCritterEvent.type === 'bee') {
            activeCritterEvent.x += Math.sin(time * 0.03) * 0.8;
            activeCritterEvent.y += Math.sin(time * 0.02) * 0.3;
        }

        if (activeCritterEvent.life <= 0 && !activeCritterEvent.clicked) {
            activeCritterEvent = null;
        }
    }

    function renderCritterEvent() {
        if (!activeCritterEvent) return;

        ctx.save();
        const alpha = activeCritterEvent.clicked ?
            Math.max(0, activeCritterEvent.life / 30) :
            Math.min(1, (300 - activeCritterEvent.life) / 30);
        ctx.globalAlpha = alpha;

        // Draw glow/highlight
        ctx.fillStyle = 'rgba(255, 255, 200, 0.3)';
        ctx.beginPath();
        ctx.arc(activeCritterEvent.x, activeCritterEvent.y, activeCritterEvent.size + 10 + Math.sin(time * 0.1) * 3, 0, Math.PI * 2);
        ctx.fill();

        // Draw critter emoji
        ctx.font = `${activeCritterEvent.size}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        let emoji = '';
        switch (activeCritterEvent.type) {
            case 'ladybug': emoji = '🐞'; break;
            case 'butterfly': emoji = '🦋'; break;
            case 'bee': emoji = '🐝'; break;
            case 'aphid': emoji = '🐛'; break;
        }

        ctx.fillText(emoji, activeCritterEvent.x, activeCritterEvent.y);

        // Draw message
        if (!activeCritterEvent.clicked) {
            ctx.font = '14px "DM Sans", sans-serif';
            ctx.fillStyle = '#fff';
            ctx.shadowColor = 'rgba(0,0,0,0.7)';
            ctx.shadowBlur = 3;
            ctx.fillText(activeCritterEvent.message, activeCritterEvent.x, activeCritterEvent.y - 35);
        }

        ctx.restore();
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
        const colors = getSeasonalColors();
        ctx.beginPath();
        ctx.fillStyle = colors.flower;
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
        const colors = getSeasonalColors();
        ctx.beginPath();
        ctx.fillStyle = colors.fruit;
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();
        // Shine
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.beginPath();
        ctx.arc(-1, -1, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }

    function getLeafColor(health) {
        const colors = getSeasonalColors();
        if (health <= 0) return '#8a4030'; // Dead brown
        if (health < 30) return '#e0ac3e'; // Yellowing
        if (health < 60) return '#8a9a5b'; // Dull green
        return colors.leafBase; // Vibrant green (seasonal)
    }

    function renderFireflies(hour) {
        if (hour < 6 || hour >= 18) {
            const season = getSeason();
            // More fireflies in summer, fewer in winter
            const multiplier = season === 'summer' ? 1.5 : season === 'winter' ? 0.5 : 1;

            fireflies.forEach((f, i) => {
                if (i >= fireflies.length * multiplier) return;

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

    function renderSnowflakes() {
        if (getSeason() !== 'winter') return;

        snowflakes.forEach(f => {
            // Update position
            f.y += f.speed;
            f.x += Math.sin(time * 0.002 + f.offset) * 0.5;

            // Wrap around
            if (f.y > canvas.height) {
                f.y = -10;
                f.x = Math.random() * canvas.width;
            }

            // Draw
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.beginPath();
            ctx.arc(f.x, f.y, f.s, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        time += 16;

        // Sky Gradient (Day/Night cycle with seasonal colors)
        const hour = new Date().getHours();
        const colors = getSeasonalColors();
        let skyGradient;

        if (hour >= 6 && hour < 18) {
            skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            skyGradient.addColorStop(0, colors.skyDay[0]);
            skyGradient.addColorStop(1, colors.skyDay[1]);
        } else {
            skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            skyGradient.addColorStop(0, colors.skyNight[0]);
            skyGradient.addColorStop(1, colors.skyNight[1]);
        }

        ctx.fillStyle = skyGradient;
        ctx.fillRect(0,0, canvas.width, canvas.height);

        renderFireflies(hour);
        renderSnowflakes();

        // Check for zoom effect
        const zoomEffect = celebrationParticles.find(p => p.type === 'zoom');
        if (zoomEffect) {
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height - 20);
            ctx.scale(zoomEffect.scale, zoomEffect.scale);
            ctx.translate(-canvas.width / 2, -(canvas.height - 20));
        }

        const startX = canvas.width / 2;
        const startY = canvas.height - 20;
        const baseLen = 100 + (getGrowthStage() * 5);
        const stage = getGrowthStage();

        drawTree(startX, startY, baseLen, 0, 12, stage);

        if (zoomEffect) {
            ctx.restore();
        }

        // Ground (seasonal)
        const season = getSeason();
        let groundColor = '#8a6a4b'; // Default dirt
        if (season === 'winter') groundColor = '#a0a8b0'; // Frosty
        else if (season === 'autumn') groundColor = '#7a5a3b'; // Rich brown

        ctx.fillStyle = groundColor;
        ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

        // Grass tufts (sparser in winter)
        const grassColor = season === 'autumn' ? '#8a7a4b' : colors.leafBase;
        const grassSpacing = season === 'winter' ? 30 : 15; // Fewer tufts in winter
        ctx.strokeStyle = grassColor;
        ctx.lineWidth = 2;
        for(let i=0; i<canvas.width; i+=grassSpacing) {
            ctx.beginPath();
            ctx.moveTo(i, canvas.height-20);
            ctx.lineTo(i+5, canvas.height-25 - Math.sin(i)*5);
            ctx.stroke();
        }

        // Update and render interactive elements
        updateCritterEvent();
        renderCritterEvent();

        updateCelebrationParticles();
        renderCelebrationParticles();

        animationFrame = requestAnimationFrame(render);
    }

    // Initialize
    loadState();
    updateUI();
    render();

    // Event Listeners
    waterBtn.addEventListener('click', waterPlant);
    resetBtn.addEventListener('click', resetPlant);

    // Canvas click for critter events
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;

        handleCritterClick(mouseX, mouseY);
    });

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

    // Clean up on visibility change
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (critterEventTimeout) {
                clearTimeout(critterEventTimeout);
                critterEventTimeout = null;
            }
        } else {
            scheduleCritterEvent();
        }
    });

    setInterval(updateUI, 60000);

})();
