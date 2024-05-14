document.addEventListener('DOMContentLoaded', function() {
    const answerElement = document.getElementById('answer');
    const otterImage = document.getElementById('otter-image');

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const today = new Date();
    const dayName = daysOfWeek[today.getDay()];

    if (dayName === "Tuesday") {
        answerElement.textContent = "Yes, it's Tuesday!";
        otterImage.querySelector('img').src = "happy_otter.png";
    } else {
        answerElement.textContent = `No, it's ${dayName}.`;
        otterImage.querySelector('img').src = "sad_otter.png";
    }
});
