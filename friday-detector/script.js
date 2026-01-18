// Friday Detector - "Premium Greenhouse Experience"
document.addEventListener('DOMContentLoaded', function() {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const message = document.getElementById('message');
    const subscribeButton = document.getElementById('subscribe-button');
    const confettiContainer = document.getElementById('confetti-container');

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    // Simulate uncertainty for non-premium users
    const isFridayForSure = (dayOfWeek === 5) || (Math.random() < 0.5);

    if (dayOfWeek === 5 && isFridayForSure) {
        message.textContent = "Yes, it's Friday (but confirm with Agatha).";
    } else if (dayOfWeek === 5) {
        message.textContent = "It might be Friday... Subscribe to Premium (or ask Agatha) to be sure!";
    } else {
        message.textContent = "No, it's not Friday.";
    }

    // Easter egg: Subscribe button interactions
    let clickCount = 0;
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
            // Clicks 1-2: Processing error
            subscribeButton.textContent = 'Processing...';
            subscribeButton.disabled = true;
            setTimeout(() => {
                subscribeButton.textContent = 'Subscribe Now';
                subscribeButton.disabled = false;
                message.textContent = 'Error: Friday status uncertain. Please try again.';
            }, 1500);
        } else if (clickCount <= 5) {
            // Clicks 3-5: Try again with shake
            shakeButton();
            message.textContent = clickCount === 3
                ? 'Payment failed. Try again?'
                : clickCount === 4
                    ? 'Server timeout. One more time?'
                    : 'Almost there! Just one more click...';
        } else {
            // Click 6+: Easter egg reveal
            subscribeButton.classList.add('success');
            subscribeButton.textContent = '🌿 Unlocked!';
            subscribeButton.disabled = true;
            message.textContent = `Fine, it's free: Today is ${daysOfWeek[dayOfWeek]}!`;
            launchConfetti();
        }
    });
});
