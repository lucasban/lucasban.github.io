document.addEventListener('DOMContentLoaded', function() {
    const answerElement = document.getElementById('answer');
    const dreadElement = document.getElementById('existential-dread');
    const body = document.body;

    const today = new Date();
    const isMonday = today.getDay() === 1;

    const mondayQuotes = [
        "The void stares back. It's wearing a tie.",
        "Coffee is just bean juice copium.",
        "Only 4 more days until the weekend...",
        "Whoever invented Mondays should be held accountable.",
        "Error 404: Motivation not found."
    ];

    const notMondayQuotes = [
        "Breathe easy. The week isn't starting.",
        "Life is beautiful (on days that aren't Monday).",
        "You made it past Monday. Or it hasn't come yet.",
        "Enjoy this Monday-free moment."
    ];

    if (isMonday) {
        body.classList.add('monday-mode');
        answerElement.textContent = "YES. It's Monday.";
        dreadElement.textContent = mondayQuotes[Math.floor(Math.random() * mondayQuotes.length)];

        // Intensify glitching over time
        let intensity = 1;
        setInterval(() => {
            if (intensity < 5) {
                intensity += 0.5;
                document.documentElement.style.setProperty('--glitch-intensity', intensity);
            }
        }, 3000);
    } else {
        body.classList.add('peaceful-mode');
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        answerElement.textContent = `No, it's ${daysOfWeek[today.getDay()]}.`;
        dreadElement.textContent = notMondayQuotes[Math.floor(Math.random() * notMondayQuotes.length)];
    }
});
