document.addEventListener('DOMContentLoaded', function() {
    const answerElement = document.getElementById('answer');
    const vibeElement = document.getElementById('vibe');
    const countdownElement = document.getElementById('countdown');
    const shadowElement = document.getElementById('shadow');
    const body = document.body;

    const today = new Date();
    const currentDay = today.getDay();
    const currentHour = today.getHours();
    const isSunday = currentDay === 0;

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

    function getTimeUntilMonday() {
        const now = new Date();
        const monday = new Date(now);
        monday.setDate(monday.getDate() + (1 - monday.getDay() + 7) % 7 || 7);
        monday.setHours(0, 0, 0, 0);

        if (now.getDay() === 0) {
            monday.setDate(monday.getDate() - 7 + 1);
        }

        const diff = monday - now;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        return { hours, minutes };
    }

    if (isSunday) {
        answerElement.textContent = "Yes, it's Sunday";

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

        vibeElement.textContent = vibes[Math.floor(Math.random() * vibes.length)];

        // Countdown to Monday
        function updateCountdown() {
            const { hours, minutes } = getTimeUntilMonday();
            if (hours < 0) {
                countdownElement.textContent = "Monday has arrived. Godspeed.";
            } else {
                countdownElement.textContent = `${hours}h ${minutes}m until Monday`;
            }
        }

        updateCountdown();
        setInterval(updateCountdown, 60000);

        // Evening gets progressively darker
        if (timeOfDay === "evening") {
            let darkness = 0;
            setInterval(() => {
                darkness = Math.min(darkness + 0.01, 0.3);
                document.body.style.filter = `brightness(${1 - darkness})`;
            }, 5000);
        }

    } else {
        body.classList.add('not-sunday');
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        answerElement.textContent = `No, it's ${daysOfWeek[currentDay]}`;

        const daysUntilSunday = (7 - currentDay) % 7 || 7;

        if (currentDay === 6) {
            vibeElement.textContent = "Tomorrow is Sunday. The promised land awaits.";
        } else if (currentDay === 1) {
            vibeElement.textContent = "You survived. Sunday will return.";
        } else {
            vibeElement.textContent = `${daysUntilSunday} days until the sweet embrace of Sunday.`;
        }

        countdownElement.style.display = 'none';
    }
});
