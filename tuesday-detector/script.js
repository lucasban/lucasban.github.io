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
});
