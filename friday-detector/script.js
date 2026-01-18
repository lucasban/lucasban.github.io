// Friday Detector - "Premium Greenhouse Experience"
DetectorUtils.init({
    dayIndex: 5,
    targetDayName: "Friday",
    onDay: (today, answerElement) => {
        const message = document.getElementById('message');
        if (!message) return;

        // Simulate uncertainty for non-premium users
        const isFridayForSure = (Math.random() < 0.5);

        if (isFridayForSure) {
            message.textContent = "Yes, it's Friday (but confirm with Agatha).";
        } else {
            message.textContent = "It might be Friday... Subscribe to Premium (or ask Agatha) to be sure!";
        }
        setupEasterEgg();
    },
    notDay: (today, answerElement, currentDayName) => {
        const message = document.getElementById('message');
        if (!message) return;

        message.textContent = "No, it's not Friday.";
        setupEasterEgg();
    }
});

function setupEasterEgg() {
    const subscribeButton = document.getElementById('subscribe-button');
    const confettiContainer = document.getElementById('confetti-container');
    const message = document.getElementById('message');
    if (!subscribeButton || !confettiContainer || !message) return;

    const confettiColors = ['#2d6a4f', '#3d8b66', '#b8d4c4', '#b8863a', '#8a4030'];
    let clickCount = 0;

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

    function launchConfetti() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        for (let i = 0; i < 50; i++) {
            setTimeout(createConfetti, i * 30);
        }
    }

    function shakeButton() {
        subscribeButton.classList.remove('shake');
        void subscribeButton.offsetWidth;
        subscribeButton.classList.add('shake');
    }

    subscribeButton.addEventListener('click', function() {
        clickCount++;

        if (clickCount <= 2) {
            subscribeButton.textContent = 'Processing...';
            subscribeButton.disabled = true;
            setTimeout(() => {
                subscribeButton.textContent = 'Subscribe Now';
                subscribeButton.disabled = false;
                message.textContent = 'Error: Friday status uncertain. Please try again.';
            }, 1500);
        } else if (clickCount <= 5) {
            shakeButton();
            message.textContent = clickCount === 3
                ? 'Payment failed. Try again?'
                : clickCount === 4
                    ? 'Server timeout. One more time?'
                    : 'Almost there! Just one more click...';
        } else {
            subscribeButton.classList.add('success');
            subscribeButton.textContent = '🌿 Unlocked!';
            subscribeButton.disabled = true;
            const today = new Date();
            message.textContent = `Fine, it's free: Today is ${DetectorUtils.DAYS[today.getDay()]}!`;
            launchConfetti();
        }
    });
}