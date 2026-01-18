// script.js
(function() {
    const confettiContainer = document.getElementById('confetti-container');
    const confettiColors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#f093fb', '#00f2fe', '#48D1CC'];

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
        // Respect reduced motion preference
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        // Burst of confetti
        for (let i = 0; i < 40; i++) {
            setTimeout(createConfetti, i * 30);
        }
    }

    document.getElementById('checkButton').addEventListener('click', () => {
        const today = new Date();
        const isThursday = today.getDay() === 4;
        const resultDiv = document.getElementById('result');
        resultDiv.classList.remove('hidden');

        if (isThursday) {
            resultDiv.innerHTML = "Yes, it's Thursday! Friday's almost here! 🥳";
            launchConfetti();
        } else {
            const daysUntilThursday = (4 - today.getDay() + 7) % 7;
            resultDiv.innerHTML = daysUntilThursday === 0 ? "It's not Thursday, but that means it's Friday! 🎉" : `Nope, but only ${daysUntilThursday} day(s) until Thursday!`;
        }
    });
})();
