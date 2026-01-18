DetectorUtils.init({
    dayIndex: 3,
    targetDayName: "Wednesday",
    onDay: (today, answerElement) => {
        const body = document.body;
        const subtitleElement = document.getElementById('subtitle');
        const extraFrogsContainer = document.getElementById('extra-frogs');
        const mainFrog = document.getElementById('frog');

        body.classList.add('wednesday-mode');
        answerElement.textContent = "IT IS WEDNESDAY";
        subtitleElement.textContent = "my dudes";

        // Clear and add extra frogs
        extraFrogsContainer.innerHTML = '';
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const extraFrog = document.createElement('span');
                extraFrog.textContent = '🐸';
                extraFrog.style.fontSize = '3rem';
                extraFrog.style.position = 'fixed';
                extraFrog.style.left = Math.random() * 80 + 10 + '%';
                extraFrog.style.top = Math.random() * 80 + 10 + '%';
                extraFrog.style.animation = 'frogDance 0.5s infinite alternate';
                extraFrog.style.animationDelay = Math.random() * 0.5 + 's';
                extraFrog.setAttribute('aria-hidden', 'true');
                extraFrogsContainer.appendChild(extraFrog);
            }, i * 500);
        }

        setupFrogHop(mainFrog);
    },
    notDay: (today, answerElement, currentDayName) => {
        const body = document.body;
        const subtitleElement = document.getElementById('subtitle');
        const mainFrog = document.getElementById('frog');
        const currentDay = today.getDay();
        const daysUntilWednesday = (3 - currentDay + 7) % 7 || 7;

        body.classList.add('waiting-mode');
        answerElement.textContent = `No, it's ${currentDayName}`;
        subtitleElement.textContent = daysUntilWednesday === 1
            ? "Almost Wednesday, my dude..."
            : `${daysUntilWednesday} days until Wednesday, my dudes`;

        setupFrogHop(mainFrog);
    }
});

function setupFrogHop(mainFrog) {
    if (mainFrog) {
        mainFrog.addEventListener('click', function() {
            if (mainFrog.classList.contains('hopping')) return;
            mainFrog.classList.add('hopping');
            setTimeout(() => {
                mainFrog.classList.remove('hopping');
            }, 500);
        });
    }
}