document.addEventListener('DOMContentLoaded', function() {
    const answerElement = document.getElementById('answer');
    const otterImage = document.getElementById('otter-image');
    const container = document.querySelector('.container');

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = new Date();
    const currentDay = today.getDay();
    const isTuesday = currentDay === 2;

    if (isTuesday) {
        answerElement.textContent = "Yes, it's Tuesday!";
        otterImage.querySelector('img').src = "happy_otter.svg";
        otterImage.querySelector('img').alt = "Happy Otter";
        container.classList.add('is-tuesday');
    } else {
        answerElement.textContent = `No, it's ${daysOfWeek[currentDay]}.`;
        otterImage.querySelector('img').src = "sad_otter.svg";
        otterImage.querySelector('img').alt = "Sad Otter";
        container.classList.add('not-tuesday');
    }

    // High five interaction
    let highFiveCount = 0;
    const highFiveMessages = [
        "High five!",
        "Nice one!",
        "Woohoo!",
        "You're awesome!",
        "Best friends!",
        "Otter-ly amazing!",
        "Tuesday buddy!"
    ];

    otterImage.addEventListener('click', function() {
        const img = otterImage.querySelector('img');

        // Trigger animation
        img.classList.remove('high-five');
        void img.offsetWidth; // Force reflow
        img.classList.add('high-five');

        // Show floating text
        const text = document.createElement('span');
        text.className = 'high-five-text';
        text.textContent = highFiveMessages[highFiveCount % highFiveMessages.length];
        otterImage.appendChild(text);

        // Clean up after animation
        setTimeout(() => {
            text.remove();
            img.classList.remove('high-five');
        }, 1000);

        highFiveCount++;
    });
});
