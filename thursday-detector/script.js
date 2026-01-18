// Thursday Detector - "The Clearing Ahead"
(function() {
    const confettiContainer = document.getElementById('confetti-container');
    const checkButton = document.getElementById('checkButton');
    if (!confettiContainer || !checkButton) return;

    const confettiColors = ['#2d6a4f', '#3d8b66', '#b8d4c4', '#b8863a', '#8a4030'];

    function createConfetti() {
        const confetti = document.createElement('div');
        confetti.classList.add('confetti', 'leaf');
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = DetectorUtils.getRandom(confettiColors);
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
        confettiContainer.appendChild(confetti);

        setTimeout(() => confetti.remove(), 4000);
    }

    function launchConfetti() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        for (let i = 0; i < 35; i++) {
            setTimeout(createConfetti, i * 40);
        }
    }

    checkButton.addEventListener('click', () => {
        const today = new Date();
        const currentDay = today.getDay();
        const isThursday = currentDay === 4;
        const resultDiv = document.getElementById('result');
        resultDiv.classList.remove('hidden', 'positive');

        if (isThursday) {
            resultDiv.textContent = "Yes! It's Thursday - the clearing ahead!";
            resultDiv.classList.add('positive');
            launchConfetti();
        } else {
            const daysUntilThursday = (4 - currentDay + 7) % 7;
            if (daysUntilThursday === 0) {
                resultDiv.textContent = "It's Friday! You've passed the clearing.";
                resultDiv.classList.add('positive');
            } else {
                resultDiv.textContent = `Not yet... ${daysUntilThursday} day${daysUntilThursday === 1 ? '' : 's'} until Thursday.`;
            }
        }
    });
})();