DetectorUtils.init({
    dayIndex: 1,
    targetDayName: "Monday",
    onDay: (today, answerElement) => {
        const body = document.body;
        const dreadElement = document.getElementById('existential-dread');
        
        const mondayQuotes = [
            "The void stares back. It's wearing a tie.",
            "Coffee is just bean juice copium.",
            "Only 4 more days until the weekend...",
            "Whoever invented Mondays should be held accountable.",
            "Error 404: Motivation not found."
        ];

        body.classList.add('monday-mode');
        answerElement.textContent = "YES. It's Monday.";
        dreadElement.textContent = DetectorUtils.getRandom(mondayQuotes);

        // Intensify glitching over time
        let intensity = 1;
        setInterval(() => {
            if (intensity < 5) {
                intensity += 0.5;
                document.documentElement.style.setProperty('--glitch-intensity', intensity);
            }
        }, 3000);
    },
    notDay: (today, answerElement, currentDayName) => {
        const body = document.body;
        const dreadElement = document.getElementById('existential-dread');
        
        const notMondayQuotes = [
            "Breathe easy. The week isn't starting.",
            "Life is beautiful (on days that aren't Monday).",
            "You made it past Monday. Or it hasn't come yet.",
            "Enjoy this Monday-free moment."
        ];

        body.classList.add('peaceful-mode');
        answerElement.textContent = `No, it's ${currentDayName}.`;
        dreadElement.textContent = DetectorUtils.getRandom(notMondayQuotes);
    }
});