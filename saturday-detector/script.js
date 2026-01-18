// Saturday Detector - "Garden Party"
DetectorUtils.init({
    dayIndex: 6,
    targetDayName: "Saturday",
    onDay: (today, answerElement) => {
        const body = document.body;
        answerElement.innerHTML = "YES! IT'S SATURDAY! 🌻🌿🎊";
        body.classList.add('saturday-mode');
        
        setupParty(true);
        animateMeter(6);
    },
    notDay: (today, answerElement, currentDayName) => {
        const body = document.body;
        const currentDay = today.getDay();
        
        answerElement.textContent = `No, it's ${currentDayName}`;
        if (currentDay === 5) {
            answerElement.textContent += " (SO CLOSE!)";
        } else {
            body.classList.add('weekday-mode');
        }
        
        setupParty(false);
        animateMeter(currentDay);
    }
});

function setupParty(isSaturday) {
    const confettiContainer = document.getElementById('confetti-container');
    const soundToggle = document.getElementById('sound-toggle');
    const soundIcon = document.querySelector('.sound-icon');
    if (!confettiContainer || !soundToggle || !soundIcon) return;

    const confettiColors = ['#2d6a4f', '#3d8b66', '#b8d4c4', '#b8863a', '#8a4030'];

    let confettiInterval = null;
    const SOUND_PREF_KEY = 'saturday-sound-enabled';
    let soundEnabled = localStorage.getItem(SOUND_PREF_KEY) === 'true';
    let audioContext = null;

    soundToggle.checked = soundEnabled;
    updateSoundIcon();

    function updateSoundIcon() {
        soundIcon.textContent = soundEnabled ? '🔊' : '🔇';
    }

    soundToggle.addEventListener('change', function() {
        soundEnabled = soundToggle.checked;
        localStorage.setItem(SOUND_PREF_KEY, soundEnabled);
        updateSoundIcon();
        if (soundEnabled) playPopSound();
    });

    function initAudio() {
        if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
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
            // AudioContext may fail on browsers without Web Audio API support
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
            // AudioContext may fail on browsers without Web Audio API support
        }
    }

    function createConfetti() {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = DetectorUtils.getRandom(confettiColors);
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
        confettiContainer.appendChild(confetti);
        setTimeout(() => confetti.remove(), 4000);
    }

    if (isSaturday) {
        setTimeout(() => playPartyHorn(), 500);
        let confettiCount = 0;
        confettiInterval = setInterval(() => {
            createConfetti();
            confettiCount++;
            if (confettiCount % 10 === 0) playPopSound();
        }, 100);
        for (let i = 0; i < 50; i++) setTimeout(createConfetti, i * 30);
    }

    document.addEventListener('visibilitychange', function() {
        if (document.hidden && confettiInterval) {
            clearInterval(confettiInterval);
            confettiInterval = null;
        } else if (!document.hidden && isSaturday && !confettiInterval) {
            confettiInterval = setInterval(createConfetti, 100);
        }
    });
}

function animateMeter(currentDay) {
    const partyReadiness = { 0: 16, 1: 0, 2: 20, 3: 40, 4: 60, 5: 85, 6: 100 };
    const meterFill = document.getElementById('meter-fill');
    const meterPercent = document.getElementById('meter-percent');
    const partyMeter = document.getElementById('party-meter');
    const targetPercent = partyReadiness[currentDay];

    setTimeout(() => {
        meterFill.style.width = targetPercent + '%';
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
}