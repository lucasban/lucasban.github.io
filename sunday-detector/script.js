// Sunday Detector - "Sunday Scaries"
DetectorUtils.init({
    dayIndex: 0,
    targetDayName: "Sunday",
    onDay: (today, answerElement) => {
        const body = document.body;
        const vibeElement = document.getElementById('vibe');
        const shadowElement = document.getElementById('shadow');
        if (!vibeElement || !shadowElement) return;

        const currentHour = today.getHours();

        answerElement.textContent = "Yes, it's Sunday";

        const morningVibes = [
            "Pancakes. Coffee. Infinite possibility.",
            "The world is quiet. Savor it.",
            "No alarms. No meetings. Just vibes.",
            "Sunday morning, rain is falling..."
        ];

        const afternoonVibes = [
            "Peak relaxation achieved.",
            "Naps are not laziness, they're self-care.",
            "Time moves slower on Sunday afternoons.",
            "The couch has claimed you. Resistance is futile."
        ];

        const eveningVibes = [
            "The Sunday Scaries have entered the chat.",
            "Tomorrow's problems can wait... but they won't.",
            "Did you do that thing you were supposed to do?",
            "Monday's shadow grows longer..."
        ];

        let vibes, timeOfDay;
        if (currentHour < 12) {
            body.classList.add('sunday-morning');
            vibes = morningVibes;
            timeOfDay = "morning";
        } else if (currentHour < 17) {
            body.classList.add('sunday-afternoon');
            vibes = afternoonVibes;
            timeOfDay = "afternoon";
        } else {
            body.classList.add('sunday-evening');
            vibes = eveningVibes;
            timeOfDay = "evening";
            shadowElement.classList.remove('hidden');
            setTimeout(() => shadowElement.classList.add('visible'), 2000);
        }

        vibeElement.textContent = DetectorUtils.getRandom(vibes);
        setupSundayLogic(true, timeOfDay);
    },
    notDay: (today, answerElement, currentDayName) => {
        const body = document.body;
        const vibeElement = document.getElementById('vibe');
        const countdownElement = document.getElementById('countdown');
        if (!vibeElement || !countdownElement) return;

        const currentDay = today.getDay();

        body.classList.add('not-sunday');
        answerElement.textContent = `No, it's ${currentDayName}`;

        const daysUntilSunday = (7 - currentDay) % 7 || 7;

        if (currentDay === 6) {
            vibeElement.textContent = "Tomorrow is Sunday. The promised land awaits.";
        } else if (currentDay === 1) {
            vibeElement.textContent = "You survived. Sunday will return.";
        } else {
            vibeElement.textContent = `${daysUntilSunday} days until the sweet embrace of Sunday.`;
        }

        countdownElement.style.display = 'none';
        setupSundayLogic(false);
    }
});

function setupSundayLogic(isSunday, timeOfDay) {
    const countdownElement = document.getElementById('countdown');
    const activeIntervals = [];

    function getTimeUntilMonday() {
        const now = new Date();
        const monday = new Date(now);
        monday.setDate(monday.getDate() + (1 - monday.getDay() + 7) % 7 || 7);
        monday.setHours(0, 0, 0, 0);
        
        const diff = monday - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        return { hours, minutes };
    }

    if (isSunday) {
        function updateCountdown() {
            const { hours, minutes } = getTimeUntilMonday();
            countdownElement.textContent = hours < 0 ? "Monday has arrived. Godspeed." : `${hours}h ${minutes}m until Monday`;
        }
        updateCountdown();
        activeIntervals.push(setInterval(updateCountdown, 60000));

        if (timeOfDay === "evening") {
            let darkness = 0;
            activeIntervals.push(setInterval(() => {
                darkness = Math.min(darkness + 0.01, 0.3);
                document.body.style.filter = `brightness(${1 - darkness})`;
            }, 5000));
        }
    }

    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            activeIntervals.forEach(id => clearInterval(id));
            activeIntervals.length = 0;
        }
    });
}