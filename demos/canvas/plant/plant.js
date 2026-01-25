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
    
    // Journal Elements
    const journalBtn = document.getElementById('journal-btn');
    const journalModal = document.getElementById('journal-modal');
    const closeJournalBtn = document.getElementById('close-journal');
    const journalEntriesEl = document.getElementById('journal-entries');

    // Constants
    const MAX_HEALTH = 100;
    const THIRST_RATE_PER_HOUR = 2; // Lost per hour
    const GROWTH_RATE_PER_DAY = 1; // Stage increase per day
    const MAX_STAGE = 12; // Max recursion depth
    const CRITTER_EVENT_MIN_MS = 120000; // 2 minutes
    const CRITTER_EVENT_MAX_MS = 180000; // 3 minutes

    // Plant Wisdom
    const WISDOM_QUOTES = [
        "Grow at your own pace.",
        "Even tall trees started as seeds.",
        "Drink plenty of water.",
        "Turn your face toward the sun.",
        "It's okay to lose a few leaves.",
        "Roots run deep before branches climb high.",
        "Storms make trees take deeper roots.",
        "Rest is part of growth.",
        "Bloom where you are planted.",
        "Patience is the secret of nature.",
        "Every season has its purpose.",
        "Breathe in, breathe out.",
        "Stand tall and proud.",
        "Bending in the wind prevents breaking.",
        "Your potential is infinite."
    ];

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
        celebratedMilestones: [], // Track which milestones have been celebrated
        journal: [], // Array of {date: timestamp, text: string}
        lastWisdomDate: null, // Timestamp of last unlocked wisdom
        affection: 0, // Cumulative pet/comfort stat
        lastPetTime: 0, // Timestamp of last pet (for cooldown)
        critterClicks: 0, // Track critter interactions for achievements
        fruitsCaught: 0, // Track autumn fruits caught
        achievements: [] // Unlocked achievement IDs
    };

    // Face Reaction System
    let faceReaction = {
        type: null, // 'surprised', 'excited', 'sleepy', 'sparkle', 'pleased', 'thinking'
        timer: 0,
        intensity: 1
    };

    // Speech Bubble System
    let speechBubble = {
        text: null,
        life: 0,
        fadeIn: 0,
        maxLife: 180
    };

    // Bounce/Wiggle Animation (Spring Physics)
    let plantBounce = {
        scale: 1,
        target: 1,
        velocity: 0,
        rotation: 0,
        rotationTarget: 0,
        rotationVelocity: 0
    };

    // Idle timer for thought bubbles
    let idleTimer = 0;
    const IDLE_THRESHOLD = 1800; // 30 seconds at 60fps

    // Speech messages
    const SPEECH_IDLE = [
        "It's so sunny today~",
        "I'm a bit thirsty...",
        "What a nice breeze!",
        "*stretches leaves*",
        "Growing is hard work...",
        "Hmm hmm hmm~",
        "I wonder what's up there?",
        "*rustle rustle*"
    ];

    const SPEECH_WATER = [
        "Thank you for the water! 💕",
        "Ahhh, refreshing!",
        "Glug glug glug~",
        "I feel so hydrated!",
        "You're the best! 💚",
        "*happy wiggle*"
    ];

    const SPEECH_CRITTER = [
        "Ooh, a ladybug!",
        "Hello little friend~",
        "What a cute visitor!",
        "Come back anytime!",
        "A butterfly! So pretty~"
    ];

    const SPEECH_NIGHT = [
        "*yawn* Good night...",
        "Time to rest...",
        "Sweet dreams~",
        "See you tomorrow...",
        "*sleepy*"
    ];

    const SPEECH_PET = [
        "That tickles! 💕",
        "Hehe~",
        "*happy rustling*",
        "I love you too!",
        "So cozy~"
    ];

    const SPEECH_ACHIEVEMENT = [
        "I did it! 🎉",
        "Woohoo!",
        "Achievement unlocked!",
        "I'm so proud!",
        "Look what I earned!"
    ];

    // Achievement definitions
    const ACHIEVEMENTS = [
        { id: 'first_sprout', icon: '🌱', name: 'First Sprout', desc: 'Plant your first seed' },
        { id: 'hydration_hero', icon: '💧', name: 'Hydration Hero', desc: '7-day watering streak' },
        { id: 'critter_friend', icon: '🦋', name: 'Critter Friend', desc: 'Click 10 critters' },
        { id: 'full_bloom', icon: '🌸', name: 'Full Bloom', desc: 'Reach 100% health with flowers' },
        { id: 'wise_one', icon: '📖', name: 'Wise One', desc: 'Collect 10 wisdom quotes' },
        { id: 'harvest_master', icon: '🍂', name: 'Harvest Master', desc: 'Catch 20 autumn fruits' },
        { id: 'affection_ace', icon: '💕', name: 'Affection Ace', desc: 'Pet your plant 50 times' },
        { id: 'mature_tree', icon: '🌳', name: 'Mature Tree', desc: 'Reach maximum growth stage' }
    ];

    let animationFrame;
    let time = 0;
    let fireflies = []; // Particle system for night
    let snowflakes = []; // Particle system for winter
    let sparkles = []; // Sparkles for healthy plants
    let hearts = []; // Hearts when watering
    let fallingFruits = []; // Autumn harvest mini-game
    let critterEventTimeout = null;
    let activeCritterEvent = null;
    let celebrationParticles = [];
    let milestoneMessage = null;
    let blinkTimer = 0;
    
    // Weather System
    let weather = {
        type: 'clear', // clear, rain, cloudy, storm
        intensity: 0, // 0 to 1
        windSpeed: 1, // Multiplier for sway
        cloudOffset: 0,
        rainDrops: []
    };

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

    /**
     * Get seasonal gameplay modifiers
     * Spring: Growth spurt (+50% growth rate)
     * Summer: Heat wave (1.5x thirst rate)
     * Autumn: Harvest time (falling fruits mini-game)
     * Winter: Hibernation (0.5x thirst rate, plant rests)
     */
    function getSeasonalModifier() {
        const season = getSeason();
        switch (season) {
            case 'spring':
                return { thirstMultiplier: 1.0, growthMultiplier: 1.5, label: '🌱 Growth Spurt' };
            case 'summer':
                return { thirstMultiplier: 1.5, growthMultiplier: 1.0, label: '☀️ Heat Wave' };
            case 'autumn':
                return { thirstMultiplier: 1.0, growthMultiplier: 1.0, label: '🍂 Harvest Time' };
            case 'winter':
                return { thirstMultiplier: 0.5, growthMultiplier: 0.75, label: '❄️ Hibernation' };
            default:
                return { thirstMultiplier: 1.0, growthMultiplier: 1.0, label: '' };
        }
    }

    function getSeasonalTooltip() {
        const season = getSeason();
        switch (season) {
            case 'spring': return 'Spring: +50% growth rate!';
            case 'summer': return 'Summer: Water more often (1.5x thirst)';
            case 'autumn': return 'Autumn: Tap falling fruits for bonuses!';
            case 'winter': return 'Winter: Plant rests (slower thirst & growth)';
            default: return '';
        }
    }

    // --- State Management ---

    function loadState() {
        const saved = localStorage.getItem('digital_plant_state');
        if (saved) {
            state = { ...state, ...JSON.parse(saved) }; // Merge defaults
        } else {
            saveState(); // Init new
        }

        // Ensure new state properties exist (for existing saves)
        if (!state.achievements) state.achievements = [];
        if (!state.affection) state.affection = 0;
        if (!state.lastPetTime) state.lastPetTime = 0;
        if (!state.critterClicks) state.critterClicks = 0;
        if (!state.fruitsCaught) state.fruitsCaught = 0;

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

        // Initialize weather
        changeWeather();
        setInterval(changeWeather, 300000); // Change weather every 5 minutes

        // Initialize achievements display and check first_sprout
        renderAchievements();
        checkAchievements();
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
            celebratedMilestones: [],
            journal: [],
            lastWisdomDate: null,
            affection: 0,
            lastPetTime: 0,
            critterClicks: 0,
            fruitsCaught: 0,
            achievements: []
        };
        saveState();
        renderAchievements();
        checkAchievements(); // Will unlock first_sprout
        updateUI();
    }

    function getLocalDateString(date = new Date()) {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    function waterPlant() {
        if (getHealth() <= 0) return; // Can't water a dead plant

        const today = getLocalDateString();

        // Update streak
        if (state.lastWaterDate && state.lastWaterDate !== today) {
            // Check if yesterday
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = getLocalDateString(yesterday);

            if (state.lastWaterDate === yesterdayStr) {
                // Consecutive day - increment streak
                state.waterStreakDays++;
            } else {
                // Missed days - reset streak
                state.waterStreakDays = 1;
            }
        } else if (!state.lastWaterDate) {
            // First watering ever
            state.waterStreakDays = 1;
        }
        // If lastWaterDate === today, keep streak unchanged

        state.lastWaterDate = today;
        state.lastWatered = Date.now();
        saveState();

        // Spawn hearts
        for (let i = 0; i < 8; i++) {
            hearts.push({
                x: canvas.width / 2 + (Math.random() - 0.5) * 60,
                y: canvas.height - 100,
                vx: (Math.random() - 0.5) * 2,
                vy: -2 - Math.random() * 2,
                size: 10 + Math.random() * 10,
                life: 60 + Math.random() * 30,
                rotation: (Math.random() - 0.5) * 0.5
            });
        }

        // Cute reactions
        setFaceReaction('excited', 120);
        triggerBounce(0.12);
        showRandomSpeech(SPEECH_WATER);
        idleTimer = 0;

        // Visual feedback
        waterBtn.textContent = "💧 Watered!";
        waterBtn.disabled = true;

        // Check streak milestones
        const streakMilestones = [3, 7, 14, 30];
        if (streakMilestones.includes(state.waterStreakDays)) {
            showMilestoneMessage(`🔥 ${state.waterStreakDays}-day streak!`);
        }

        // Check achievements (hydration hero, etc.)
        checkAchievements();

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

    function changeWeather() {
        const season = getSeason();
        const rand = Math.random();

        // Winter: no rain/storms (snow handles precipitation)
        if (season === 'winter') {
            if (rand < 0.6) weather.type = 'clear';
            else weather.type = 'cloudy';
            weather.windSpeed = 0.3 + Math.random() * 0.5; // Calmer winter winds
        } else {
            // Spring/Summer/Autumn: normal weather patterns
            if (rand < 0.5) weather.type = 'clear';
            else if (rand < 0.7) weather.type = 'cloudy';
            else if (rand < 0.9) weather.type = 'rain';
            else weather.type = 'storm';
            weather.windSpeed = (weather.type === 'storm') ? 2 + Math.random() * 2 : 0.5 + Math.random();
        }

        weather.intensity = Math.random();

        // Reset rain particles if raining (non-winter only)
        if (weather.type === 'rain' || weather.type === 'storm') {
            weather.rainDrops = [];
            for (let i = 0; i < 100; i++) {
                weather.rainDrops.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    speed: 5 + Math.random() * 5,
                    length: 10 + Math.random() * 10
                });
            }
        }
    }

    function updateWeather() {
        // Rain logic (not in winter - snow doesn't water plants the same way)
        if ((weather.type === 'rain' || weather.type === 'storm') && getSeason() !== 'winter') {
            // Natural watering from rain
            if (getHealth() < 100 && Math.random() < 0.01) {
                state.lastWatered = Math.min(Date.now(), state.lastWatered + 1000 * 60); // +1 min worth of water
            }

            weather.rainDrops.forEach(drop => {
                drop.y += drop.speed;
                drop.x += (weather.windSpeed - 1); // Wind blows rain
                if (drop.y > canvas.height) {
                    drop.y = -drop.length;
                    drop.x = Math.random() * canvas.width;
                }
                if (drop.x > canvas.width) drop.x = 0;
                else if (drop.x < 0) drop.x = canvas.width;
            });
        }
        
        // Cloud movement
        weather.cloudOffset += 0.2 * weather.windSpeed;
    }

    // --- Face Reaction System ---

    function setFaceReaction(type, duration = 120) {
        faceReaction.type = type;
        faceReaction.timer = duration;
        faceReaction.intensity = 1;
    }

    function updateFaceReaction() {
        if (faceReaction.timer > 0) {
            faceReaction.timer--;
            // Fade out in last 30 frames
            if (faceReaction.timer < 30) {
                faceReaction.intensity = faceReaction.timer / 30;
            }
        } else {
            faceReaction.type = null;
            faceReaction.intensity = 1;
        }

        // Auto-set sleepy at night
        const hour = new Date().getHours();
        if ((hour < 6 || hour >= 22) && !faceReaction.type) {
            faceReaction.type = 'sleepy';
            faceReaction.intensity = 0.8;
        }
    }

    // --- Speech Bubble System ---

    function showSpeechBubble(text, duration = 180) {
        speechBubble.text = text;
        speechBubble.life = duration;
        speechBubble.maxLife = duration;
        speechBubble.fadeIn = 0;
    }

    function showRandomSpeech(messages) {
        const msg = messages[Math.floor(Math.random() * messages.length)];
        showSpeechBubble(msg);
    }

    function updateSpeechBubble() {
        if (speechBubble.life > 0) {
            speechBubble.life--;
            if (speechBubble.fadeIn < 15) {
                speechBubble.fadeIn++;
            }
        }

        // Idle chatter
        if (!speechBubble.life && getHealth() > 20) {
            idleTimer++;
            if (idleTimer > IDLE_THRESHOLD && Math.random() < 0.002) {
                const hour = new Date().getHours();
                if (hour < 6 || hour >= 22) {
                    showRandomSpeech(SPEECH_NIGHT);
                } else if (getHealth() < 50) {
                    showSpeechBubble("I'm a bit thirsty...");
                } else {
                    showRandomSpeech(SPEECH_IDLE);
                }
                idleTimer = 0;
            }
        }
    }

    function renderSpeechBubble(x, y) {
        if (!speechBubble.text || speechBubble.life <= 0) return;

        ctx.save();

        // Calculate alpha for fade in/out
        let alpha = 1;
        if (speechBubble.fadeIn < 15) {
            alpha = speechBubble.fadeIn / 15;
        } else if (speechBubble.life < 30) {
            alpha = speechBubble.life / 30;
        }
        ctx.globalAlpha = alpha;

        // Measure text
        ctx.font = '14px "DM Sans", sans-serif';
        const metrics = ctx.measureText(speechBubble.text);
        const padding = 10;
        const bubbleWidth = metrics.width + padding * 2;
        const bubbleHeight = 28;
        const bubbleX = x - bubbleWidth / 2;
        const bubbleY = y - 70;

        // Bubble background (compatible rounded rect)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.beginPath();
        const r = 8;
        ctx.moveTo(bubbleX + r, bubbleY);
        ctx.lineTo(bubbleX + bubbleWidth - r, bubbleY);
        ctx.quadraticCurveTo(bubbleX + bubbleWidth, bubbleY, bubbleX + bubbleWidth, bubbleY + r);
        ctx.lineTo(bubbleX + bubbleWidth, bubbleY + bubbleHeight - r);
        ctx.quadraticCurveTo(bubbleX + bubbleWidth, bubbleY + bubbleHeight, bubbleX + bubbleWidth - r, bubbleY + bubbleHeight);
        ctx.lineTo(bubbleX + r, bubbleY + bubbleHeight);
        ctx.quadraticCurveTo(bubbleX, bubbleY + bubbleHeight, bubbleX, bubbleY + bubbleHeight - r);
        ctx.lineTo(bubbleX, bubbleY + r);
        ctx.quadraticCurveTo(bubbleX, bubbleY, bubbleX + r, bubbleY);
        ctx.closePath();
        ctx.fill();

        // Bubble border
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Tail pointing down
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        ctx.beginPath();
        ctx.moveTo(x - 6, bubbleY + bubbleHeight);
        ctx.lineTo(x, bubbleY + bubbleHeight + 8);
        ctx.lineTo(x + 6, bubbleY + bubbleHeight);
        ctx.fill();

        // Text
        ctx.fillStyle = '#3d3632';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(speechBubble.text, x, bubbleY + bubbleHeight / 2);

        ctx.restore();
    }

    // --- Bounce/Wiggle Animation ---

    function triggerBounce(intensity = 0.08) {
        plantBounce.velocity = intensity;
    }

    function triggerWiggle(intensity = 0.05) {
        plantBounce.rotationVelocity = intensity;
    }

    function updateBounce() {
        // Spring physics for scale
        const scaleForce = (plantBounce.target - plantBounce.scale) * 0.15;
        plantBounce.velocity += scaleForce;
        plantBounce.velocity *= 0.85; // Damping
        plantBounce.scale += plantBounce.velocity;

        // Spring physics for rotation
        const rotForce = (plantBounce.rotationTarget - plantBounce.rotation) * 0.1;
        plantBounce.rotationVelocity += rotForce;
        plantBounce.rotationVelocity *= 0.9; // Damping
        plantBounce.rotation += plantBounce.rotationVelocity;
    }

    // --- Pet/Comfort Mechanic ---

    const PET_COOLDOWN = 30000; // 30 seconds
    const PET_HEALTH_BONUS = 0.5;

    function petPlant(mouseX, mouseY, startX, startY, stage) {
        const now = Date.now();

        // Check if click is on the tree trunk/branches area (matches new tree structure)
        const trunkLength = 50 + stage * 12;
        const treeWidth = 40 + stage * 15;  // Canopy spreads wider
        const treeHeight = trunkLength * 2;  // Tree extends above trunk

        if (mouseX > startX - treeWidth && mouseX < startX + treeWidth &&
            mouseY > startY - treeHeight && mouseY < startY + 30) {  // +30 to include pot

            // Reset idle timer on any tree interaction
            idleTimer = 0;

            // Check cooldown for health bonus
            const canGetBonus = (now - state.lastPetTime) > PET_COOLDOWN;

            // Always show affection
            state.affection++;
            saveState();

            // Spawn heart particles
            for (let i = 0; i < 5; i++) {
                hearts.push({
                    x: mouseX + (Math.random() - 0.5) * 30,
                    y: mouseY,
                    vx: (Math.random() - 0.5) * 2,
                    vy: -2 - Math.random() * 2,
                    size: 8 + Math.random() * 6,
                    life: 40 + Math.random() * 20,
                    rotation: (Math.random() - 0.5) * 0.5
                });
            }

            // Set pleased face
            setFaceReaction('pleased', 90);

            // Small wiggle
            triggerWiggle(0.03);

            if (canGetBonus) {
                // Give health bonus
                const bonusMs = (PET_HEALTH_BONUS / THIRST_RATE_PER_HOUR) * (1000 * 60 * 60);
                state.lastWatered = Math.min(Date.now(), state.lastWatered + bonusMs);
                state.lastPetTime = now;
                saveState();

                showRandomSpeech(SPEECH_PET);
            }

            // Check affection achievement
            checkAchievements();

            return true;
        }
        return false;
    }

    // --- Achievement System ---

    function unlockAchievement(id) {
        if (state.achievements.includes(id)) return false;

        const achievement = ACHIEVEMENTS.find(a => a.id === id);
        if (!achievement) return false;

        state.achievements.push(id);
        saveState();

        // Celebration
        showSpeechBubble(`${achievement.icon} ${achievement.name}!`, 240);
        triggerCelebration('golden', `Achievement: ${achievement.name}`);
        triggerBounce(0.1);
        setFaceReaction('excited', 120);

        // Update achievement panel
        renderAchievements();

        return true;
    }

    function checkAchievements() {
        const health = getHealth();
        const stage = getGrowthStage();

        // First Sprout - always unlocked on load if not already
        if (!state.achievements.includes('first_sprout')) {
            unlockAchievement('first_sprout');
        }

        // Hydration Hero - 7-day streak
        if (state.waterStreakDays >= 7) {
            unlockAchievement('hydration_hero');
        }

        // Critter Friend - click 10 critters
        if (state.critterClicks >= 10) {
            unlockAchievement('critter_friend');
        }

        // Full Bloom - 100% health with flowers
        if (health >= 100 && stage >= 8) {
            unlockAchievement('full_bloom');
        }

        // Wise One - 10 wisdom quotes
        if (state.journal && state.journal.length >= 10) {
            unlockAchievement('wise_one');
        }

        // Harvest Master - catch 20 fruits
        if (state.fruitsCaught >= 20) {
            unlockAchievement('harvest_master');
        }

        // Affection Ace - pet 50 times
        if (state.affection >= 50) {
            unlockAchievement('affection_ace');
        }

        // Mature Tree - max growth
        if (stage >= MAX_STAGE) {
            unlockAchievement('mature_tree');
        }
    }

    function renderAchievements() {
        const container = document.getElementById('achievement-badges');
        if (!container) return;

        container.innerHTML = ACHIEVEMENTS.map(a => {
            const unlocked = state.achievements.includes(a.id);
            return `<span class="badge ${unlocked ? 'unlocked' : 'locked'}" title="${a.name}: ${a.desc}">
                ${a.icon}
            </span>`;
        }).join('');
    }

    function unlockWisdom() {
        const now = new Date();
        const today = now.toDateString();
        const lastUnlock = state.lastWisdomDate ? new Date(state.lastWisdomDate).toDateString() : null;

        if (today !== lastUnlock) {
            // Unlock new wisdom
            const quote = WISDOM_QUOTES[Math.floor(Math.random() * WISDOM_QUOTES.length)];
            state.journal.unshift({ date: Date.now(), text: quote });
            state.lastWisdomDate = Date.now();
            saveState();

            showMilestoneMessage("New Wisdom Unlocked! 📖");
            triggerCelebration('golden', "Leaf Journal Updated");
            setFaceReaction('sparkle', 120);
            triggerBounce(0.08);

            // Pulse the journal button
            journalBtn.style.animation = 'pulse 1s infinite';
            setTimeout(() => journalBtn.style.animation = '', 3000);

            // Check for wise_one achievement
            checkAchievements();
        } else {
            showMilestoneMessage("Come back tomorrow for more wisdom.");
        }
    }

    function renderJournal() {
        if (!state.journal || state.journal.length === 0) {
            journalEntriesEl.innerHTML = '<div class="empty-journal">No wisdom collected yet.<br>Click your plant daily to unlock thoughts.</div>';
            return;
        }

        journalEntriesEl.innerHTML = state.journal.map(entry => `
            <div class="journal-entry">
                <div class="journal-date">${new Date(entry.date).toLocaleDateString()}</div>
                <div class="journal-text">"${entry.text}"</div>
            </div>
        `).join('');
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
        const modifier = getSeasonalModifier();
        const effectiveThirstRate = THIRST_RATE_PER_HOUR * modifier.thirstMultiplier;
        const healthLost = hoursSinceWater * effectiveThirstRate;
        return Math.max(0, Math.min(MAX_HEALTH, MAX_HEALTH - healthLost));
    }

    function getGrowthStage() {
        const days = getAgeInDays();
        const modifier = getSeasonalModifier();
        const effectiveGrowthRate = GROWTH_RATE_PER_DAY * modifier.growthMultiplier;
        // Start at stage 4, grow at seasonal rate per day, max out
        return Math.min(MAX_STAGE, Math.floor(4 + (days * effectiveGrowthRate)));
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
                triggerBounce(0.15);
                setFaceReaction('excited', 150);
                break; // Only one celebration at a time
            }
        }

        state.lastStage = currentStage;

        // Check achievements (full_bloom, mature_tree, etc.)
        checkAchievements();
    }

    function updateUI() {
        const days = Math.floor(getAgeInDays());
        const health = Math.floor(getHealth());
        const modifier = getSeasonalModifier();

        plantNameEl.textContent = state.name;
        ageDisplay.textContent = `${days} Day${days !== 1 ? 's' : ''}`;
        healthDisplay.textContent = `${health}%`;

        // Update seasonal indicator
        const seasonDisplay = document.getElementById('season-display');
        if (seasonDisplay) {
            seasonDisplay.textContent = modifier.label;
            seasonDisplay.title = getSeasonalTooltip();
        }

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

        // Update Mood Message (cuter!)
        let mood = "";
        if (health <= 0) mood = `${state.name} has gone to plant heaven... 🥀`;
        else if (health < 20) mood = `${state.name} is SO thirsty!! 😵`;
        else if (health < 40) mood = `*${state.name} looks at you with big eyes* 🥺💧`;
        else if (health < 60) mood = `${state.name} could use a little drink~ 💭`;
        else if (health < 80) mood = `${state.name} is doing great! ✨`;
        else if (health < 95) mood = `${state.name} is vibing~ 🌸`;
        else mood = `${state.name} loves you so much!! 💕`;
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

        // Plant notices the critter
        setFaceReaction('surprised', 60);
    }

    function handleCritterClick(mouseX, mouseY) {
        if (!activeCritterEvent || activeCritterEvent.clicked) return false;

        const dx = mouseX - activeCritterEvent.x;
        const dy = mouseY - activeCritterEvent.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < activeCritterEvent.size) {
            activeCritterEvent.clicked = true;

            // Track critter clicks for achievement
            state.critterClicks = (state.critterClicks || 0) + 1;
            saveState();

            // Cute reactions
            setFaceReaction('surprised', 60);
            triggerWiggle(0.04);
            showRandomSpeech(SPEECH_CRITTER);
            idleTimer = 0;

            if (activeCritterEvent.healthBonus > 0) {
                // Add health bonus by adjusting lastWatered
                const bonusMs = (activeCritterEvent.healthBonus / THIRST_RATE_PER_HOUR) * (1000 * 60 * 60);
                state.lastWatered = Math.min(Date.now(), state.lastWatered + bonusMs);
                saveState();
                showMilestoneMessage(`+${activeCritterEvent.healthBonus}% health!`);
            } else {
                showMilestoneMessage('✨ Beautiful!');
            }

            // Check achievements
            checkAchievements();

            setTimeout(() => {
                activeCritterEvent = null;
            }, 500);

            return true;
        }
        return false;
    }

    function handleFaceClick(mouseX, mouseY, startX, faceY) {
        // Simple bounding box for face
        const dx = mouseX - startX;
        const dy = mouseY - faceY;
        if (Math.sqrt(dx*dx + dy*dy) < 30) {
            if (getHealth() > 0) {
                unlockWisdom();
                return true;
            }
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

    // --- Rendering (Natural Tree) ---

    // Seeded random number generator for consistent tree shape
    function seededRandom(seed) {
        const x = Math.sin(seed * 9999) * 10000;
        return x - Math.floor(x);
    }

    function drawTreeShadow(startX, startY, stage) {
        ctx.save();
        const shadowWidth = 40 + (stage * 10);
        const shadowHeight = 10 + (stage * 2);
        const shadowGrad = ctx.createRadialGradient(startX, startY + 5, 0, startX, startY + 5, shadowWidth);
        shadowGrad.addColorStop(0, 'rgba(0,0,0,0.25)');
        shadowGrad.addColorStop(0.5, 'rgba(0,0,0,0.1)');
        shadowGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = shadowGrad;
        ctx.beginPath();
        ctx.ellipse(startX, startY + 5, shadowWidth, shadowHeight, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    function getLeafColor(health) {
        if (health <= 0) return '#5c524a';
        if (health < 30) return '#d4a012';
        return getSeasonalColors().leafBase;
    }

    function lightenColor(hex, percent) {
        // Handle rgb() format
        if (hex.startsWith('rgb')) {
            const match = hex.match(/\d+/g);
            if (match) {
                const r = Math.min(255, parseInt(match[0]) + Math.round(255 * percent / 100));
                const g = Math.min(255, parseInt(match[1]) + Math.round(255 * percent / 100));
                const b = Math.min(255, parseInt(match[2]) + Math.round(255 * percent / 100));
                return `rgb(${r},${g},${b})`;
            }
        }
        const num = parseInt(hex.slice(1), 16);
        const r = Math.min(255, Math.max(0, (num >> 16) + Math.round(255 * percent / 100)));
        const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + Math.round(255 * percent / 100)));
        const b = Math.min(255, Math.max(0, (num & 0x0000FF) + Math.round(255 * percent / 100)));
        return `rgb(${r},${g},${b})`;
    }

    function getBranchColor(health) {
        if (health <= 0) return { main: '#5c524a', dark: '#4a3e38' };
        if (health < 30) return { main: '#8a6a4b', dark: '#6a4a2b' };
        return { main: '#6b5344', dark: '#4a3628' };
    }

    // Draw a natural curved branch segment
    function drawBranchSegment(x1, y1, x2, y2, width1, width2, health, seed) {
        const colors = getBranchColor(health);

        // Calculate control point for curve
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const len = Math.sqrt((x2-x1)**2 + (y2-y1)**2);
        const perpX = -(y2 - y1) / len;
        const perpY = (x2 - x1) / len;
        const curve = seededRandom(seed * 7.3) * len * 0.15 - len * 0.075;
        const ctrlX = midX + perpX * curve;
        const ctrlY = midY + perpY * curve;

        // Draw branch as filled shape for proper tapering
        ctx.save();
        ctx.fillStyle = colors.main;
        ctx.beginPath();

        // Calculate perpendicular offsets for width
        const angle1 = Math.atan2(ctrlY - y1, ctrlX - x1);
        const angle2 = Math.atan2(y2 - ctrlY, x2 - ctrlX);

        // Left side of branch
        ctx.moveTo(x1 + Math.cos(angle1 + Math.PI/2) * width1/2,
                   y1 + Math.sin(angle1 + Math.PI/2) * width1/2);
        ctx.quadraticCurveTo(
            ctrlX + Math.cos((angle1+angle2)/2 + Math.PI/2) * (width1+width2)/4,
            ctrlY + Math.sin((angle1+angle2)/2 + Math.PI/2) * (width1+width2)/4,
            x2 + Math.cos(angle2 + Math.PI/2) * width2/2,
            y2 + Math.sin(angle2 + Math.PI/2) * width2/2
        );

        // Right side of branch (reverse)
        ctx.lineTo(x2 + Math.cos(angle2 - Math.PI/2) * width2/2,
                   y2 + Math.sin(angle2 - Math.PI/2) * width2/2);
        ctx.quadraticCurveTo(
            ctrlX + Math.cos((angle1+angle2)/2 - Math.PI/2) * (width1+width2)/4,
            ctrlY + Math.sin((angle1+angle2)/2 - Math.PI/2) * (width1+width2)/4,
            x1 + Math.cos(angle1 - Math.PI/2) * width1/2,
            y1 + Math.sin(angle1 - Math.PI/2) * width1/2
        );
        ctx.closePath();
        ctx.fill();

        // Add bark texture for thicker branches
        if (width1 > 6 && health > 0) {
            ctx.strokeStyle = 'rgba(0,0,0,0.1)';
            ctx.lineWidth = 0.8;
            const segments = Math.floor(width1 / 3);
            for (let i = 0; i < segments; i++) {
                const t = (i + 0.5) / segments;
                const offsetX = (t - 0.5) * width1 * 0.6;
                ctx.beginPath();
                ctx.moveTo(x1 + offsetX + seededRandom(seed + i) * 2, y1);
                ctx.quadraticCurveTo(ctrlX + offsetX, ctrlY, x2 + offsetX * (width2/width1), y2);
                ctx.stroke();
            }
        }
        ctx.restore();
    }

    // Main tree drawing function - organic recursive structure
    function drawTree(x, y, length, angle, width, depth, seed) {
        if (depth <= 0 || width < 1 || length < 5) return;

        const health = getHealth();
        const sway = Math.sin(time * 0.002 + depth * 0.5 + seed) * (depth * 0.3) * weather.windSpeed;
        const droop = health < 50 ? (50 - health) * 0.01 : 0;

        const actualAngle = angle + sway + droop * Math.sign(angle || 0.1);
        const rad = (actualAngle - 90) * Math.PI / 180;

        const endX = x + Math.cos(rad) * length;
        const endY = y + Math.sin(rad) * length;

        // Taper width naturally
        const endWidth = width * (0.65 + seededRandom(seed * 3.7) * 0.15);

        // Draw this branch segment
        drawBranchSegment(x, y, endX, endY, width, endWidth, health, seed);

        // Determine branching
        const stage = getGrowthStage();
        const branchProb = 0.85 - depth * 0.05;

        if (depth <= 2) {
            // Terminal - draw foliage
            drawFoliageCluster(endX, endY, width * 2 + stage, seed, health);
        } else {
            // Branch out
            const numBranches = depth > stage - 2 ? 2 : (seededRandom(seed * 2.1) > 0.6 ? 3 : 2);
            const angleSpread = 25 + seededRandom(seed * 4.4) * 20;

            for (let i = 0; i < numBranches; i++) {
                const branchSeed = seed * 1000 + i * 137;
                const t = numBranches === 1 ? 0 : (i / (numBranches - 1)) - 0.5;
                const branchAngle = actualAngle + t * angleSpread * 2 + (seededRandom(branchSeed) - 0.5) * 15;
                const branchLen = length * (0.7 + seededRandom(branchSeed * 1.3) * 0.2);
                const branchWidth = endWidth * (0.7 + seededRandom(branchSeed * 1.7) * 0.2);

                drawTree(endX, endY, branchLen, branchAngle, branchWidth, depth - 1, branchSeed);
            }

            // Occasional extra small branch
            if (seededRandom(seed * 5.5) > 0.7 && depth > 3) {
                const sideSeed = seed * 2000;
                const sideAngle = actualAngle + (seededRandom(sideSeed) > 0.5 ? 1 : -1) * (40 + seededRandom(sideSeed) * 30);
                drawTree(
                    x + (endX - x) * 0.4,
                    y + (endY - y) * 0.4,
                    length * 0.5,
                    sideAngle,
                    width * 0.4,
                    Math.min(depth - 2, 3),
                    sideSeed
                );
            }
        }
    }

    // Draw a cluster of leaves/foliage at branch ends
    function drawFoliageCluster(x, y, size, seed, health) {
        const colors = getSeasonalColors();
        const baseColor = getLeafColor(health);
        const age = getAgeInDays();
        const stage = getGrowthStage();

        ctx.save();
        ctx.translate(x, y);

        // Number of leaves in cluster
        const leafCount = Math.floor(4 + seededRandom(seed) * 4);

        for (let i = 0; i < leafCount; i++) {
            const leafSeed = seed * 100 + i;
            const angle = seededRandom(leafSeed) * Math.PI * 2;
            const dist = seededRandom(leafSeed * 1.5) * size * 0.6;
            const leafX = Math.cos(angle) * dist;
            const leafY = Math.sin(angle) * dist;
            const leafSize = (size * 0.4 + seededRandom(leafSeed * 2) * size * 0.3);
            const leafAngle = angle + (seededRandom(leafSeed * 3) - 0.5) * 0.8;

            // Decide if this is a flower or fruit
            const isFlower = health > 90 && stage >= 8 && seededRandom(leafSeed * 4) > 0.85;
            const isFruit = !isFlower && health > 70 && age > 3 && stage >= 10 && seededRandom(leafSeed * 5) > 0.9;

            ctx.save();
            ctx.translate(leafX, leafY);
            ctx.rotate(leafAngle);

            if (isFlower) {
                drawFlower(leafSize * 0.7);
            } else if (isFruit) {
                drawFruit(leafSize * 0.5);
            } else {
                drawNaturalLeaf(leafSize, baseColor, health, leafSeed);
            }

            ctx.restore();
        }

        ctx.restore();
    }

    // Draw a natural-looking leaf (oval/elliptical)
    function drawNaturalLeaf(size, baseColor, health, seed) {
        ctx.save();

        // Slight random rotation for variety
        ctx.rotate((seededRandom(seed * 6) - 0.5) * 0.3);

        // Wind sway on leaves
        const leafSway = Math.sin(time * 0.004 + seed) * 0.1 * weather.windSpeed;
        ctx.rotate(leafSway);

        const leafWidth = size * (0.35 + seededRandom(seed * 7) * 0.15);
        const leafLength = size;

        // Leaf gradient
        const grad = ctx.createLinearGradient(0, 0, 0, -leafLength);
        grad.addColorStop(0, lightenColor(baseColor, -10));
        grad.addColorStop(0.5, baseColor);
        grad.addColorStop(1, lightenColor(baseColor, 15));

        // Draw oval leaf shape
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.bezierCurveTo(
            -leafWidth, -leafLength * 0.3,
            -leafWidth * 0.8, -leafLength * 0.8,
            0, -leafLength
        );
        ctx.bezierCurveTo(
            leafWidth * 0.8, -leafLength * 0.8,
            leafWidth, -leafLength * 0.3,
            0, 0
        );
        ctx.fill();

        // Center vein
        if (size > 8 && health > 20) {
            ctx.strokeStyle = 'rgba(0,0,0,0.12)';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(0, -2);
            ctx.lineTo(0, -leafLength * 0.85);
            ctx.stroke();

            // Side veins
            ctx.lineWidth = 0.4;
            const veins = Math.floor(size / 6);
            for (let i = 1; i <= veins; i++) {
                const vy = -leafLength * (0.2 + i * 0.2);
                const vw = leafWidth * (0.6 - i * 0.1);
                ctx.beginPath();
                ctx.moveTo(0, vy);
                ctx.lineTo(-vw, vy - leafLength * 0.1);
                ctx.moveTo(0, vy);
                ctx.lineTo(vw, vy - leafLength * 0.1);
                ctx.stroke();
            }
        }

        ctx.restore();
    }

    function drawFlower(size) {
        const colors = getSeasonalColors();
        const petalCount = 5;
        const petalSize = size || 8;

        ctx.save();

        // Petals
        for (let i = 0; i < petalCount; i++) {
            ctx.save();
            ctx.rotate((i / petalCount) * Math.PI * 2);

            const grad = ctx.createRadialGradient(0, petalSize * 0.6, 0, 0, petalSize * 0.6, petalSize);
            grad.addColorStop(0, lightenColor(colors.flower, 25));
            grad.addColorStop(0.6, colors.flower);
            grad.addColorStop(1, lightenColor(colors.flower, -15));

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.ellipse(0, petalSize * 0.6, petalSize * 0.35, petalSize * 0.7, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }

        // Center
        const centerGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, petalSize * 0.3);
        centerGrad.addColorStop(0, '#fff8dc');
        centerGrad.addColorStop(0.5, '#ffd700');
        centerGrad.addColorStop(1, '#daa520');
        ctx.fillStyle = centerGrad;
        ctx.beginPath();
        ctx.arc(0, 0, petalSize * 0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    function drawFruit(size) {
        const colors = getSeasonalColors();
        const fruitSize = size || 5;

        ctx.save();

        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath();
        ctx.ellipse(1, 2, fruitSize * 0.8, fruitSize * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Fruit body
        const grad = ctx.createRadialGradient(-fruitSize * 0.3, -fruitSize * 0.3, 0, 0, 0, fruitSize);
        grad.addColorStop(0, lightenColor(colors.fruit, 35));
        grad.addColorStop(0.4, colors.fruit);
        grad.addColorStop(1, lightenColor(colors.fruit, -25));

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, fruitSize, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.fillStyle = 'rgba(255,255,255,0.5)';
        ctx.beginPath();
        ctx.ellipse(-fruitSize * 0.3, -fruitSize * 0.3, fruitSize * 0.35, fruitSize * 0.25, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        // Stem
        ctx.strokeStyle = '#5a4a3a';
        ctx.lineWidth = fruitSize * 0.2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, -fruitSize);
        ctx.lineTo(fruitSize * 0.2, -fruitSize * 1.4);
        ctx.stroke();

        ctx.restore();
    }

    // Draw pot/planter for the tree
    function drawPot(x, y, width, height) {
        ctx.save();

        // Pot body - terracotta style
        const potGrad = ctx.createLinearGradient(x - width/2, 0, x + width/2, 0);
        potGrad.addColorStop(0, '#a0522d');
        potGrad.addColorStop(0.3, '#cd853f');
        potGrad.addColorStop(0.7, '#cd853f');
        potGrad.addColorStop(1, '#8b4513');

        ctx.fillStyle = potGrad;
        ctx.beginPath();
        // Tapered pot shape
        const topWidth = width;
        const bottomWidth = width * 0.75;
        ctx.moveTo(x - topWidth/2, y);
        ctx.lineTo(x - bottomWidth/2, y + height);
        ctx.lineTo(x + bottomWidth/2, y + height);
        ctx.lineTo(x + topWidth/2, y);
        ctx.closePath();
        ctx.fill();

        // Rim
        ctx.fillStyle = '#b8643a';
        ctx.beginPath();
        ctx.ellipse(x, y, topWidth/2, topWidth * 0.12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Rim highlight
        ctx.fillStyle = '#d4956a';
        ctx.beginPath();
        ctx.ellipse(x, y - 2, topWidth/2 - 2, topWidth * 0.08, 0, Math.PI, Math.PI * 2);
        ctx.fill();

        // Soil
        ctx.fillStyle = '#3d2817';
        ctx.beginPath();
        ctx.ellipse(x, y + 2, topWidth/2 - 3, topWidth * 0.1, 0, 0, Math.PI);
        ctx.fill();

        ctx.restore();
    }

    function drawPlantFace(x, y, health) {
        ctx.save();
        ctx.translate(x, y);

        const isBlinking = blinkTimer > 0 && blinkTimer < 8;
        const isSad = health < 40;
        const isDead = health <= 0;
        const reaction = faceReaction.type;
        const reactionIntensity = faceReaction.intensity;

        // Face background (slightly lighter wood)
        ctx.fillStyle = isDead ? '#5c524a' : '#4a4038';
        ctx.beginPath();
        ctx.ellipse(0, 0, 18, 15, 0, 0, Math.PI * 2);
        ctx.fill();

        // Blush - intensity varies with health and affection
        if (!isDead) {
            const blushBase = health > 70 ? 0.3 : health > 40 ? 0.15 : 0;
            const affectionBonus = Math.min(0.3, (state.affection || 0) * 0.005);
            const reactionBonus = (reaction === 'excited' || reaction === 'pleased') ? 0.2 * reactionIntensity : 0;
            const blushAlpha = Math.min(0.6, blushBase + affectionBonus + reactionBonus);

            if (blushAlpha > 0) {
                ctx.fillStyle = `rgba(255, 150, 150, ${blushAlpha})`;
                ctx.beginPath();
                ctx.ellipse(-12, 4, 5, 3, 0, 0, Math.PI * 2);
                ctx.ellipse(12, 4, 5, 3, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Sweat drop when health is low
        if (health < 25 && health > 0) {
            ctx.fillStyle = 'rgba(100, 180, 255, 0.7)';
            ctx.beginPath();
            ctx.moveTo(14, -8);
            ctx.quadraticCurveTo(18, -4, 16, 0);
            ctx.quadraticCurveTo(12, -2, 14, -8);
            ctx.fill();
        }

        // Eyes
        ctx.fillStyle = isDead ? '#888' : '#fff';

        // Sleepy eyes (half-closed)
        if (reaction === 'sleepy' && !isDead) {
            ctx.strokeStyle = '#2a2520';
            ctx.lineWidth = 2;
            ctx.beginPath();
            // Draw curved half-closed lines
            ctx.arc(-6, -1, 4, 0, Math.PI);
            ctx.moveTo(10, -1);
            ctx.arc(6, -1, 4, 0, Math.PI);
            ctx.stroke();
        } else if (isBlinking && !isDead && reaction !== 'surprised') {
            // Blinking - draw lines
            ctx.strokeStyle = '#2a2520';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-8, -2);
            ctx.lineTo(-4, -2);
            ctx.moveTo(4, -2);
            ctx.lineTo(8, -2);
            ctx.stroke();
        } else if (isDead) {
            // X eyes
            ctx.strokeStyle = '#666';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-8, -5); ctx.lineTo(-4, 1);
            ctx.moveTo(-4, -5); ctx.lineTo(-8, 1);
            ctx.moveTo(4, -5); ctx.lineTo(8, 1);
            ctx.moveTo(8, -5); ctx.lineTo(4, 1);
            ctx.stroke();
        } else {
            // Eye size based on reaction
            let eyeWidth = 4;
            let eyeHeight = isSad ? 3 : 4;

            if (reaction === 'surprised') {
                eyeWidth = 5 * reactionIntensity + 4 * (1 - reactionIntensity);
                eyeHeight = 6 * reactionIntensity + 4 * (1 - reactionIntensity);
            } else if (reaction === 'excited') {
                // Bouncy eyes effect
                const bounce = Math.sin(time * 0.02) * 0.5 * reactionIntensity;
                eyeHeight = 4 + bounce;
            }

            // Normal eyes
            ctx.beginPath();
            ctx.ellipse(-6, -2, eyeWidth, eyeHeight, 0, 0, Math.PI * 2);
            ctx.ellipse(6, -2, eyeWidth, eyeHeight, 0, 0, Math.PI * 2);
            ctx.fill();

            // Pupils
            ctx.fillStyle = '#2a2520';
            const pupilOffset = Math.sin(time * 0.001) * 1; // Gentle looking around
            const pupilSize = reaction === 'surprised' ? 1.5 : 2;
            ctx.beginPath();
            ctx.arc(-6 + pupilOffset, -2, pupilSize, 0, Math.PI * 2);
            ctx.arc(6 + pupilOffset, -2, pupilSize, 0, Math.PI * 2);
            ctx.fill();

            // Eye shine
            ctx.fillStyle = '#fff';
            ctx.beginPath();
            ctx.arc(-7, -3, 1, 0, Math.PI * 2);
            ctx.arc(5, -3, 1, 0, Math.PI * 2);
            ctx.fill();

            // Sparkle eyes when health > 95%
            if (health > 95 || reaction === 'sparkle') {
                const sparkleIntensity = reaction === 'sparkle' ? reactionIntensity : 1;
                ctx.fillStyle = `rgba(255, 255, 200, ${0.8 * sparkleIntensity})`;
                // Draw small stars in eyes
                const drawStar = (cx, cy, size) => {
                    ctx.beginPath();
                    for (let i = 0; i < 4; i++) {
                        const angle = (i / 4) * Math.PI * 2 + time * 0.003;
                        const r = i % 2 === 0 ? size : size * 0.4;
                        const px = cx + Math.cos(angle) * r;
                        const py = cy + Math.sin(angle) * r;
                        if (i === 0) ctx.moveTo(px, py);
                        else ctx.lineTo(px, py);
                    }
                    ctx.closePath();
                    ctx.fill();
                };
                drawStar(-5, -3, 2);
                drawStar(7, -3, 2);
            }
        }

        // Mouth
        ctx.strokeStyle = isDead ? '#666' : '#2a2520';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();

        if (isDead) {
            // Wavy dead mouth
            ctx.moveTo(-5, 6);
            ctx.lineTo(-2, 4);
            ctx.lineTo(2, 6);
            ctx.lineTo(5, 4);
        } else if (reaction === 'surprised') {
            // Small 'o' mouth
            ctx.arc(0, 5, 3 * reactionIntensity + 2 * (1 - reactionIntensity), 0, Math.PI * 2);
        } else if (reaction === 'excited') {
            // Big open smile
            ctx.arc(0, 2, 8, 0.05 * Math.PI, 0.95 * Math.PI);
            // Add teeth line
            ctx.moveTo(-5, 5);
            ctx.lineTo(5, 5);
        } else if (reaction === 'pleased') {
            // Curved happy mouth with closed eyes vibe
            ctx.arc(0, 1, 6, 0.1 * Math.PI, 0.9 * Math.PI);
        } else if (reaction === 'sleepy') {
            // Small sleepy mouth
            ctx.ellipse(0, 5, 3, 2, 0, 0, Math.PI * 2);
        } else if (isSad) {
            // Sad mouth
            ctx.arc(0, 10, 5, Math.PI * 1.2, Math.PI * 1.8);
        } else if (health > 90) {
            // Big happy smile
            ctx.arc(0, 2, 7, 0.1 * Math.PI, 0.9 * Math.PI);
        } else {
            // Small smile
            ctx.arc(0, 3, 5, 0.15 * Math.PI, 0.85 * Math.PI);
        }
        ctx.stroke();

        // Thought bubble when idle too long
        if (idleTimer > IDLE_THRESHOLD * 0.8 && !speechBubble.life && health > 20) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            const bobble = Math.sin(time * 0.005) * 2;
            // Three dots
            ctx.beginPath();
            ctx.arc(-20, -25 + bobble, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(-25, -35 + bobble, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(-32, -47 + bobble, 5, 0, Math.PI * 2);
            ctx.fill();
            // "..." text
            ctx.font = '12px sans-serif';
            ctx.fillStyle = '#666';
            ctx.fillText('...', -37, -44 + bobble);
        }

        ctx.restore();
    }

    function drawSunOrMoon(hour) {
        const isDay = hour >= 6 && hour < 18;
        const x = 50;
        const y = 50;

        ctx.save();
        ctx.translate(x, y);

        if (isDay) {
            // Sun rays
            ctx.strokeStyle = 'rgba(255, 220, 100, 0.5)';
            ctx.lineWidth = 2;
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2 + time * 0.0005;
                const innerR = 22;
                const outerR = 30 + Math.sin(time * 0.003 + i) * 3;
                ctx.beginPath();
                ctx.moveTo(Math.cos(angle) * innerR, Math.sin(angle) * innerR);
                ctx.lineTo(Math.cos(angle) * outerR, Math.sin(angle) * outerR);
                ctx.stroke();
            }

            // Sun body
            ctx.fillStyle = '#ffd93d';
            ctx.beginPath();
            ctx.arc(0, 0, 20, 0, Math.PI * 2);
            ctx.fill();

            // Happy face
            ctx.fillStyle = '#d4a012';
            ctx.beginPath();
            ctx.arc(-6, -3, 2, 0, Math.PI * 2);
            ctx.arc(6, -3, 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#d4a012';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 2, 8, 0.1 * Math.PI, 0.9 * Math.PI);
            ctx.stroke();
        } else {
            // Moon
            ctx.fillStyle = '#f5f5dc';
            ctx.beginPath();
            ctx.arc(0, 0, 18, 0, Math.PI * 2);
            ctx.fill();

            // Moon shadow (crescent effect)
            ctx.fillStyle = getSeason() === 'winter' ? '#d8dce0' : '#242a26';
            ctx.beginPath();
            ctx.arc(6, -2, 14, 0, Math.PI * 2);
            ctx.fill();

            // Sleepy face
            ctx.fillStyle = '#c0c0a0';
            // Closed eyes (sleeping)
            ctx.strokeStyle = '#a0a080';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(-5, -2, 3, 0, Math.PI);
            ctx.stroke();

            // Sleepy mouth
            ctx.beginPath();
            ctx.arc(0, 5, 3, 0, Math.PI);
            ctx.stroke();

            // Zzz
            ctx.font = '10px sans-serif';
            ctx.fillStyle = 'rgba(255,255,255,0.6)';
            const zzOffset = Math.sin(time * 0.002) * 3;
            ctx.fillText('z', 20, -5 + zzOffset);
            ctx.fillText('z', 26, -12 + zzOffset);
            ctx.fillText('Z', 33, -20 + zzOffset);
        }

        ctx.restore();
    }

    function updateAndRenderHearts() {
        for (let i = hearts.length - 1; i >= 0; i--) {
            const h = hearts[i];
            h.x += h.vx;
            h.y += h.vy;
            h.vy += 0.05; // Slight gravity
            h.life--;
            h.rotation += 0.02;

            if (h.life <= 0) {
                hearts.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.translate(h.x, h.y);
            ctx.rotate(h.rotation);
            ctx.globalAlpha = Math.min(1, h.life / 20);

            // Draw heart
            ctx.fillStyle = '#ff6b8a';
            ctx.beginPath();
            const s = h.size / 10;
            ctx.moveTo(0, s * 3);
            ctx.bezierCurveTo(-s * 5, -s * 2, -s * 3, -s * 5, 0, -s * 2);
            ctx.bezierCurveTo(s * 3, -s * 5, s * 5, -s * 2, 0, s * 3);
            ctx.fill();

            ctx.restore();
        }
    }

    // --- Autumn Harvest Mini-Game ---

    function spawnFallingFruit() {
        if (getSeason() !== 'autumn') return;
        if (getHealth() <= 50) return; // Only healthy plants produce fruit
        if (fallingFruits.length >= 5) return; // Limit active fruits

        const stage = getGrowthStage();
        if (stage < 6) return; // Need some growth for fruits

        // Random spawn near the tree canopy
        fallingFruits.push({
            x: canvas.width / 2 + (Math.random() - 0.5) * (stage * 20),
            y: canvas.height - 100 - (stage * 15) + Math.random() * 30,
            vx: (Math.random() - 0.5) * 0.5,
            vy: 0,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.1,
            size: 6 + Math.random() * 3,
            caught: false,
            life: 300 // 5 seconds to catch
        });
    }

    function updateFallingFruits() {
        for (let i = fallingFruits.length - 1; i >= 0; i--) {
            const fruit = fallingFruits[i];

            if (fruit.caught) {
                // Float up and fade when caught
                fruit.y -= 2;
                fruit.life -= 5;
            } else {
                // Fall with slight sway
                fruit.vy += 0.08; // Gravity
                fruit.y += fruit.vy;
                fruit.x += fruit.vx + Math.sin(time * 0.01 + i) * 0.3;
                fruit.rotation += fruit.rotationSpeed;
                fruit.life--;
            }

            // Remove if off screen, expired, or caught and faded
            if (fruit.y > canvas.height || fruit.life <= 0) {
                fallingFruits.splice(i, 1);
            }
        }
    }

    function renderFallingFruits() {
        const colors = getSeasonalColors();

        for (const fruit of fallingFruits) {
            ctx.save();
            ctx.translate(fruit.x, fruit.y);
            ctx.rotate(fruit.rotation);

            const alpha = fruit.caught ? Math.min(1, fruit.life / 30) : 1;
            ctx.globalAlpha = alpha;

            // Fruit glow when active
            if (!fruit.caught) {
                ctx.fillStyle = 'rgba(255, 200, 100, 0.3)';
                ctx.beginPath();
                ctx.arc(0, 0, fruit.size + 5 + Math.sin(time * 0.1) * 2, 0, Math.PI * 2);
                ctx.fill();
            }

            // Fruit body with gradient
            const fruitGrad = ctx.createRadialGradient(-1, -1, 0, 0, 0, fruit.size);
            fruitGrad.addColorStop(0, lightenColor(colors.fruit, 30));
            fruitGrad.addColorStop(0.5, colors.fruit);
            fruitGrad.addColorStop(1, lightenColor(colors.fruit, -15));

            ctx.beginPath();
            ctx.arc(0, 0, fruit.size, 0, Math.PI * 2);
            ctx.fillStyle = fruitGrad;
            ctx.fill();

            // Highlight
            ctx.fillStyle = 'rgba(255,255,255,0.4)';
            ctx.beginPath();
            ctx.ellipse(-fruit.size * 0.3, -fruit.size * 0.3, fruit.size * 0.35, fruit.size * 0.25, Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();

            // Caught effect - show bonus
            if (fruit.caught && fruit.life > 20) {
                ctx.font = 'bold 14px "DM Sans", sans-serif';
                ctx.fillStyle = '#ffd700';
                ctx.textAlign = 'center';
                ctx.shadowColor = 'rgba(0,0,0,0.5)';
                ctx.shadowBlur = 3;
                ctx.fillText('+1%', 0, -fruit.size - 8);
            }

            ctx.restore();
        }
    }

    function handleFruitClick(mouseX, mouseY) {
        for (const fruit of fallingFruits) {
            if (fruit.caught) continue;

            const dx = mouseX - fruit.x;
            const dy = mouseY - fruit.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < fruit.size + 10) {
                fruit.caught = true;
                fruit.vy = -3; // Pop up effect

                // Add health bonus
                const bonusMs = (1 / THIRST_RATE_PER_HOUR) * (1000 * 60 * 60);
                state.lastWatered = Math.min(Date.now(), state.lastWatered + bonusMs);

                // Track fruits caught for achievement
                state.fruitsCaught = (state.fruitsCaught || 0) + 1;
                saveState();

                // Cute reactions
                setFaceReaction('pleased', 60);
                triggerBounce(0.05);
                idleTimer = 0;

                // Check achievements
                checkAchievements();

                return true;
            }
        }
        return false;
    }

    function updateAndRenderSparkles() {
        const health = getHealth();

        // Spawn sparkles occasionally for healthy plants
        if (health > 80 && Math.random() < 0.03) {
            const stage = getGrowthStage();
            const trunkLength = 50 + stage * 12;
            const treeHeight = trunkLength * 1.8;
            sparkles.push({
                x: canvas.width / 2 + (Math.random() - 0.5) * (40 + stage * 18),
                y: canvas.height - 30 - Math.random() * treeHeight,
                size: 3 + Math.random() * 4,
                life: 30 + Math.random() * 20,
                twinkle: Math.random() * Math.PI * 2
            });
        }

        for (let i = sparkles.length - 1; i >= 0; i--) {
            const s = sparkles[i];
            s.life--;
            s.twinkle += 0.3;

            if (s.life <= 0) {
                sparkles.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.translate(s.x, s.y);
            ctx.globalAlpha = Math.min(1, s.life / 15) * (0.5 + Math.sin(s.twinkle) * 0.5);

            // Draw 4-point star
            ctx.fillStyle = '#fff8b8';
            ctx.beginPath();
            for (let j = 0; j < 4; j++) {
                const angle = (j / 4) * Math.PI * 2 - Math.PI / 4;
                const r = j % 2 === 0 ? s.size : s.size * 0.3;
                if (j === 0) ctx.moveTo(Math.cos(angle) * r, Math.sin(angle) * r);
                else ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
            }
            ctx.closePath();
            ctx.fill();

            ctx.restore();
        }
    }

    function renderClouds() {
        if (weather.type !== 'clear') {
            ctx.save();
            ctx.fillStyle = weather.type === 'storm' ? 'rgba(80, 80, 90, 0.4)' : 'rgba(255, 255, 255, 0.4)';
            const cloudCount = (weather.type === 'cloudy' || weather.type === 'storm') ? 8 : 3;
            
            for(let i=0; i<cloudCount; i++) {
                const x = ((i * 150) + weather.cloudOffset) % (canvas.width + 200) - 100;
                const y = 50 + Math.sin(i * 132) * 30;
                const size = 40 + Math.cos(i * 23) * 10;
                
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.arc(x + size*0.8, y - size*0.2, size*0.9, 0, Math.PI * 2);
                ctx.arc(x + size*1.5, y + size*0.1, size*0.8, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
    }

    function renderFireflies(hour) {
        // Only visible at night
        if (hour >= 6 && hour < 18) return;

        ctx.save();
        ctx.fillStyle = '#ffffe0';
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 4;

        fireflies.forEach(fly => {
            // Gentle hovering movement
            const hoverY = Math.sin(time * 0.002 + fly.offset) * 5;
            const hoverX = Math.cos(time * 0.0015 + fly.offset) * 5;
            
            // Blink effect
            const opacity = 0.3 + (Math.sin(time * 0.003 + fly.offset) + 1) / 2 * 0.7;
            
            ctx.globalAlpha = opacity;
            ctx.beginPath();
            ctx.arc(fly.x + hoverX, fly.y + hoverY, fly.s, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
    }

    function renderSnowflakes() {
        if (getSeason() !== 'winter') return;

        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';

        snowflakes.forEach(flake => {
            flake.y += flake.speed;
            flake.x += Math.sin(time * 0.001 + flake.offset) * 0.5;

            // Loop
            if (flake.y > canvas.height) {
                flake.y = -5;
                flake.x = Math.random() * canvas.width;
            }

            ctx.beginPath();
            ctx.arc(flake.x, flake.y, flake.s, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.restore();
    }

    function renderRain() {
        // No rain in winter (snow only)
        if (getSeason() === 'winter') return;
        if (weather.type === 'rain' || weather.type === 'storm') {
            ctx.save();
            ctx.strokeStyle = 'rgba(174, 194, 224, 0.6)';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            weather.rainDrops.forEach(drop => {
                ctx.moveTo(drop.x, drop.y);
                ctx.lineTo(drop.x + (weather.windSpeed - 1) * 2, drop.y + drop.length);
            });
            ctx.stroke();
            ctx.restore();
        }
    }

    function render() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        time += 16;

        // Update physics
        updateWeather();
        updateFaceReaction();
        updateSpeechBubble();
        updateBounce();

        // Blink timer (random blinks)
        if (blinkTimer > 0) {
            blinkTimer--;
        } else if (Math.random() < 0.005) {
            blinkTimer = 15; // Start a blink
        }

        // Sky Gradient (Day/Night cycle with seasonal colors)
        const hour = new Date().getHours();
        const colors = getSeasonalColors();
        let skyGradient;

        // Darker sky for storms
        if (weather.type === 'storm') {
            skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            skyGradient.addColorStop(0, '#2c3e50');
            skyGradient.addColorStop(1, '#4b6cb7');
        } else if (hour >= 6 && hour < 18) {
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

        // Background Elements
        drawSunOrMoon(hour);
        renderClouds(); // Clouds behind tree
        renderFireflies(hour);
        renderSnowflakes();

        // Check for zoom effect
        const zoomEffect = celebrationParticles.find(p => p.type === 'zoom');

        const startX = canvas.width / 2;
        const startY = canvas.height - 20;
        const baseLen = 100 + (getGrowthStage() * 5);
        const stage = getGrowthStage();
        const health = getHealth();

        // Draw soft shadow under tree (not affected by bounce)
        // Draw pot first (behind tree)
        const potWidth = 60 + stage * 3;
        const potHeight = 35 + stage * 1.5;
        const potY = startY - 5;
        drawPot(startX, potY, potWidth, potHeight);

        drawTreeShadow(startX, startY - 10, stage);

        // Apply bounce/wiggle transform to tree
        ctx.save();
        ctx.translate(startX, startY - 10);

        // Apply zoom effect if active
        if (zoomEffect) {
            ctx.scale(zoomEffect.scale, zoomEffect.scale);
        }

        // Apply bounce scale (grows from bottom)
        ctx.scale(1 + (plantBounce.scale - 1) * 0.5, plantBounce.scale);

        // Apply wiggle rotation
        ctx.rotate(plantBounce.rotation);

        ctx.translate(-startX, -(startY - 10));

        // Natural tree parameters based on growth stage
        const trunkWidth = 8 + stage * 1.2;
        const trunkLength = 50 + stage * 12;

        drawTree(startX, startY - 10, trunkLength, 0, trunkWidth, stage, state.seed);

        // Cute face on trunk - position based on trunk length
        const faceY = startY - 10 - trunkLength * 0.35;
        drawPlantFace(startX, faceY, health);

        ctx.restore();

        // Speech bubble (rendered outside transform so it stays stable)
        renderSpeechBubble(startX, faceY);

        // Sparkles around healthy plants
        updateAndRenderSparkles();

        // Ground (seasonal) with gradient
        const season = getSeason();
        let groundColorTop = '#8a6a4b';
        let groundColorBottom = '#6a4a2b';
        if (season === 'winter') {
            groundColorTop = '#e8eef4';
            groundColorBottom = '#c8d4dc';
        } else if (season === 'autumn') {
            groundColorTop = '#7a5a3b';
            groundColorBottom = '#5a3a1b';
        } else if (season === 'spring') {
            groundColorTop = '#7a6a4b';
            groundColorBottom = '#5a4a3b';
        }

        // Ground gradient
        const groundGrad = ctx.createLinearGradient(0, canvas.height - 20, 0, canvas.height);
        groundGrad.addColorStop(0, groundColorTop);
        groundGrad.addColorStop(1, groundColorBottom);
        ctx.fillStyle = groundGrad;
        ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

        // Small rocks/pebbles (deterministic based on seed)
        ctx.fillStyle = season === 'winter' ? 'rgba(180, 185, 195, 0.6)' : 'rgba(90, 70, 50, 0.5)';
        for (let i = 0; i < 8; i++) {
            const rockX = (state.seed * 1000 + i * 73) % canvas.width;
            const rockY = canvas.height - 15 + Math.sin(state.seed * i * 5) * 4;
            const rockSize = 2 + Math.abs(Math.sin(state.seed * i * 12)) * 3;
            ctx.beginPath();
            ctx.ellipse(rockX, rockY, rockSize, rockSize * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Dirt patches/texture
        ctx.fillStyle = season === 'winter' ? 'rgba(160, 165, 175, 0.3)' : 'rgba(60, 40, 20, 0.2)';
        for (let i = 0; i < 5; i++) {
            const patchX = (state.seed * 500 + i * 120) % canvas.width;
            const patchY = canvas.height - 12 + Math.cos(state.seed * i * 8) * 3;
            const patchW = 15 + Math.abs(Math.cos(state.seed * i * 3)) * 20;
            ctx.beginPath();
            ctx.ellipse(patchX, patchY, patchW, 3, 0, 0, Math.PI * 2);
            ctx.fill();
        }

        // Grass tufts (sparser in winter)
        const grassColor = season === 'autumn' ? '#8a7a4b' : colors.leafBase;
        const grassSpacing = season === 'winter' ? 30 : 15; // Fewer tufts in winter
        ctx.strokeStyle = grassColor;
        ctx.lineWidth = 2;
        for (let i = 0; i < canvas.width; i += grassSpacing) {
            ctx.beginPath();
            ctx.moveTo(i, canvas.height - 20);
            ctx.lineTo(i + 5, canvas.height - 25 - Math.sin(i) * 5);
            ctx.stroke();
        }

        // Foreground Elements
        renderRain(); // Rain in front of everything
        updateCritterEvent();
        renderCritterEvent();
        updateAndRenderHearts();
        updateCelebrationParticles();
        renderCelebrationParticles();

        // Autumn harvest mini-game
        if (getSeason() === 'autumn' && Math.random() < 0.008) {
            spawnFallingFruit();
        }
        updateFallingFruits();
        renderFallingFruits();

        animationFrame = requestAnimationFrame(render);
    }

    // Initialize
    loadState();
    updateUI();
    render();

    // Event Listeners
    waterBtn.addEventListener('click', waterPlant);
    resetBtn.addEventListener('click', resetPlant);

    // Canvas click for critter events, face click, pet mechanic, AND autumn fruits
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;

        // Check falling fruits first (autumn mini-game)
        if (handleFruitClick(mouseX, mouseY)) return;

        if (handleCritterClick(mouseX, mouseY)) return;

        // Calculate positions (must match render calculations)
        const stage = getGrowthStage();
        const startX = canvas.width / 2;
        const startY = canvas.height - 20;
        const treeBaseY = startY - 10;
        const trunkLength = 50 + stage * 12;
        const faceY = treeBaseY - trunkLength * 0.35;

        // Face click for wisdom
        if (handleFaceClick(mouseX, mouseY, startX, faceY)) return;

        // Pet mechanic - click anywhere on tree
        if (getHealth() > 0) {
            petPlant(mouseX, mouseY, startX, treeBaseY, stage);
        }
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

    // Journal Modal
    journalBtn.addEventListener('click', () => {
        renderJournal();
        journalModal.style.display = 'flex';
    });

    closeJournalBtn.addEventListener('click', () => {
        journalModal.style.display = 'none';
    });

    journalModal.addEventListener('click', (e) => {
        if (e.target === journalModal) journalModal.style.display = 'none';
    });

})();