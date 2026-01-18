document.addEventListener('DOMContentLoaded', function() {
    const answerElement = document.getElementById('answer');
    const subtitleElement = document.getElementById('subtitle');
    const extraFrogsContainer = document.getElementById('extra-frogs');
    const body = document.body;
    const mainFrog = document.getElementById('frog');

    const today = new Date();
    const isWednesday = today.getDay() === 3;

    // Clear any existing extra frogs
    extraFrogsContainer.innerHTML = '';

    if (isWednesday) {
        body.classList.add('wednesday-mode');
        answerElement.textContent = "IT IS WEDNESDAY";
        subtitleElement.textContent = "my dudes";

        // Add extra frogs for celebration
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
    } else {
        body.classList.add('waiting-mode');
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const currentDay = today.getDay();
        const daysUntilWednesday = (3 - currentDay + 7) % 7 || 7;

        answerElement.textContent = `No, it's ${daysOfWeek[currentDay]}`;
        subtitleElement.textContent = daysUntilWednesday === 1
            ? "Almost Wednesday, my dude..."
            : `${daysUntilWednesday} days until Wednesday, my dudes`;
    }

    // Frog hop interaction
    if (mainFrog) {
        mainFrog.addEventListener('click', function() {
            // Don't re-trigger if already hopping
            if (mainFrog.classList.contains('hopping')) return;

            mainFrog.classList.add('hopping');

            // Remove class after animation completes
            setTimeout(() => {
                mainFrog.classList.remove('hopping');
            }, 500);
        });
    }
});
