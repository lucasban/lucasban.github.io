// Saturday Detector - "Garden Party"
document.addEventListener('DOMContentLoaded', function() {
    const answerElement = document.getElementById('answer');
    const meterFill = document.getElementById('meter-fill');
    const body = document.body;
    const confettiContainer = document.getElementById('confetti-container');
    const soundToggle = document.getElementById('sound-toggle');
    const soundIcon = document.querySelector('.sound-icon');

    const today = new Date();
    const currentDay = today.getDay();
    const isSaturday = currentDay === 6;

    // Track interval for cleanup
    let confettiInterval = null;

    // Sound effects state
    const SOUND_PREF_KEY = 'saturday-sound-enabled';
    let soundEnabled = localStorage.getItem(SOUND_PREF_KEY) === 'true';
    let audioContext = null;

    // Initialize sound toggle state
    soundToggle.checked = soundEnabled;
    updateSoundIcon();

    function updateSoundIcon() {
        soundIcon.textContent = soundEnabled ? '🔊' : '🔇';
    }

    soundToggle.addEventListener('change', function() {
        soundEnabled = soundToggle.checked;
        localStorage.setItem(SOUND_PREF_KEY, soundEnabled);
        updateSoundIcon();

        // Play a test sound when enabling
        if (soundEnabled) {
            playPopSound();
        }
    });

    // Initialize audio context on user interaction
    function initAudio() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioContext;
    }

    function playPopSound() {
        if (!soundEnabled) return;
        try {
            const ctx = initAudio();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.frequency.setValueAtTime(600, ctx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);

            gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.1);
        } catch (e) {
            // Audio not supported
        }
    }

    function playPartyHorn() {
        if (!soundEnabled) return;
        try {
            const ctx = initAudio();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(300, ctx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.2);
            oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.5);

            gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.5);
        } catch (e) {
            // Audio not supported
        }
    }

    const partyReadiness = {
        0: 16,  // Sunday - party hangover
        1: 0,   // Monday - no party energy
        2: 20,  // Tuesday
        3: 40,  // Wednesday - hump day
        4: 60,  // Thursday - almost there
        5: 85,  // Friday - pre-game
        6: 100  // Saturday - PARTY
    };

    // Greenery palette for confetti
    const confettiColors = ['#2d6a4f', '#3d8b66', '#b8d4c4', '#b8863a', '#8a4030'];

    function createConfetti() {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = confettiColors[Math.floor(Math.random() * confettiColors.length)];
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
        confettiContainer.appendChild(confetti);

        setTimeout(() => confetti.remove(), 4000);
    }

    if (isSaturday) {
        body.classList.add('saturday-mode');
        answerElement.innerHTML = "YES! IT'S SATURDAY! 🌻🌿🎊";

        // Play party horn on load if sound is enabled
        setTimeout(() => {
            playPartyHorn();
        }, 500);

        // Continuous confetti with occasional pop sounds
        let confettiCount = 0;
        confettiInterval = setInterval(() => {
            createConfetti();
            confettiCount++;
            if (confettiCount % 10 === 0) {
                playPopSound();
            }
        }, 100);

        // Initial burst
        for (let i = 0; i < 50; i++) {
            setTimeout(createConfetti, i * 30);
        }
    } else {
        body.classList.add('weekday-mode');
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const daysUntilSaturday = (6 - currentDay + 7) % 7 || 7;

        answerElement.textContent = `No, it's ${daysOfWeek[currentDay]}`;

        if (currentDay === 5) {
            answerElement.textContent += " (SO CLOSE!)";
            body.classList.remove('weekday-mode');
        }
    }

    // Animate party meter
    const meterPercent = document.getElementById('meter-percent');
    const partyMeter = document.getElementById('party-meter');
    const targetPercent = partyReadiness[currentDay];

    setTimeout(() => {
        meterFill.style.width = targetPercent + '%';
        // Animate the percentage number
        let current = 0;
        const step = targetPercent / 30;
        const interval = setInterval(() => {
            current += step;
            if (current >= targetPercent) {
                current = targetPercent;
                clearInterval(interval);
            }
            const roundedValue = Math.round(current);
            meterPercent.textContent = roundedValue + '%';
            partyMeter.setAttribute('aria-valuenow', roundedValue);
        }, 20);
    }, 300);

    // Pause confetti when tab is hidden to save resources
    document.addEventListener('visibilitychange', function() {
        if (document.hidden && confettiInterval) {
            clearInterval(confettiInterval);
            confettiInterval = null;
        } else if (!document.hidden && isSaturday && !confettiInterval) {
            confettiInterval = setInterval(createConfetti, 100);
        }
    });
});
