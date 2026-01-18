// Thursday Detector - "The Clearing Ahead"
(function() {
    const confettiContainer = document.getElementById('confetti-container');
    // Greenery palette for falling leaves
    const confettiColors = ['#2d6a4f', '#3d8b66', '#b8d4c4', '#b8863a', '#8a4030'];

    function createConfetti() {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti', 'leaf');
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = confettiColors[Math.floor(Math.random() * confettiColors.length)];
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
        confettiContainer.appendChild(confetti);

        setTimeout(() => confetti.remove(), 4000);
    }

    function launchConfetti() {
        // Respect reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        // Burst of falling leaves
        for (let i = 0; i < 35; i++) {
            setTimeout(createConfetti, i * 40);
        }
    }

    document.getElementById('checkButton').addEventListener('click', () => {
        const today = new Date();
        const isThursday = today.getDay() === 4;
        const resultDiv = document.getElementById('result');
        resultDiv.classList.remove('hidden', 'positive');

        if (isThursday) {
            resultDiv.textContent = "Yes! It's Thursday - the clearing ahead!";
            resultDiv.classList.add('positive');
            launchConfetti();
        } else {
            const daysUntilThursday = (4 - today.getDay() + 7) % 7;
            if (daysUntilThursday === 0) {
                resultDiv.textContent = "It's Friday! You've passed the clearing.";
                resultDiv.classList.add('positive');
            } else {
                resultDiv.textContent = `Not yet... ${daysUntilThursday} day${daysUntilThursday === 1 ? '' : 's'} until Thursday.`;
            }
        }
    });
})();
