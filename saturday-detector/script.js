document.addEventListener('DOMContentLoaded', function() {
    const answerElement = document.getElementById('answer');
    const meterFill = document.getElementById('meter-fill');
    const body = document.body;
    const confettiContainer = document.getElementById('confetti-container');

    const today = new Date();
    const currentDay = today.getDay();
    const isSaturday = currentDay === 6;

    const partyReadiness = {
        0: 16,  // Sunday - party hangover
        1: 0,   // Monday - no party energy
        2: 20,  // Tuesday
        3: 40,  // Wednesday - hump day
        4: 60,  // Thursday - almost there
        5: 85,  // Friday - pre-game
        6: 100  // Saturday - PARTY
    };

    function createConfetti() {
        const colors = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#f093fb', '#00f2fe'];
        const confetti = document.createElement('div');
        confetti.classList.add('confetti');
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
        confettiContainer.appendChild(confetti);

        setTimeout(() => confetti.remove(), 4000);
    }

    if (isSaturday) {
        body.classList.add('saturday-mode');
        answerElement.innerHTML = "YES! IT'S SATURDAY! 🎉🪩🎊";

        // Continuous confetti
        setInterval(createConfetti, 100);

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
    setTimeout(() => {
        meterFill.style.width = partyReadiness[currentDay] + '%';
    }, 300);
});
