DetectorUtils.init({
    dayIndex: 2,
    targetDayName: "Tuesday",
    onDay: (today, answerElement) => {
        const otterImage = document.getElementById('otter-image');
        const container = document.querySelector('.container');
        
        answerElement.textContent = "Yes, it's Tuesday!";
        otterImage.querySelector('img').src = "happy_otter.svg";
        otterImage.querySelector('img').alt = "Happy Otter";
        container.classList.add('is-tuesday');
        
        setupHighFives(otterImage);
    },
    notDay: (today, answerElement, currentDayName) => {
        const otterImage = document.getElementById('otter-image');
        const container = document.querySelector('.container');
        
        answerElement.textContent = `No, it's ${currentDayName}.`;
        otterImage.querySelector('img').src = "sad_otter.svg";
        otterImage.querySelector('img').alt = "Sad Otter";
        container.classList.add('not-tuesday');
        
        setupHighFives(otterImage);
    }
});

function setupHighFives(otterImage) {
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
        text.textContent = DetectorUtils.getRandom(highFiveMessages);
        otterImage.appendChild(text);

        // Clean up after animation
        setTimeout(() => {
            text.remove();
            img.classList.remove('high-five');
        }, 1000);

        highFiveCount++;
    });
}