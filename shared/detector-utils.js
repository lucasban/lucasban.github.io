/**
 * detector-utils.js
 * Shared logic for day detector mini-apps.
 */

(function() {
    const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    /**
     * Common detector initialization
     * @param {Object} options - Configuration options
     * @param {number} options.dayIndex - 0-6 (0=Sunday, 1=Monday, etc.)
     * @param {string} options.targetDayName - Display name of the day (e.g., "Monday")
     * @param {Function} options.onDay - Callback for when it IS the target day
     * @param {Function} options.notDay - Callback for when it IS NOT the target day
     */
    function initDetector({ dayIndex, targetDayName, onDay, notDay }) {
        document.addEventListener('DOMContentLoaded', () => {
            const today = new Date();
            const currentDay = today.getDay();
            const isTargetDay = currentDay === dayIndex;
            const answerElement = document.getElementById('answer');
            const container = document.querySelector('.container');

            // Handle History
            handleHistory(dayIndex, container);

            // Initialize decoration easter egg
            initDecoration(container);

            if (isTargetDay) {
                if (answerElement && !answerElement.textContent) {
                    answerElement.textContent = `Yes, it's ${targetDayName}!`;
                }
                if (onDay) onDay(today, answerElement);
            } else {
                if (answerElement && !answerElement.textContent) {
                    answerElement.textContent = `No, it's ${DAYS[currentDay]}.`;
                }
                if (notDay) {
                    notDay(today, answerElement, DAYS[currentDay]);
                }
            }
        });
    }

    /**
     * Manage local storage history for visits
     */
    function handleHistory(dayIndex, container) {
        if (!container) return;

        const STORAGE_KEY = `detector_last_visit_${dayIndex}`;
        const lastVisit = localStorage.getItem(STORAGE_KEY);
        const now = new Date();
        
        // Save current visit
        localStorage.setItem(STORAGE_KEY, now.toISOString());

        // Display previous visit if exists
        if (lastVisit) {
            const lastDate = new Date(lastVisit);
            const timeDiff = now - lastDate;
            const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            
            let message = "You last checked earlier today.";
            if (daysDiff === 1) message = "You last checked yesterday.";
            else if (daysDiff > 1) message = `You last checked ${daysDiff} days ago.`;

            const historyEl = document.createElement('div');
            historyEl.style.marginTop = '2em';
            historyEl.style.fontSize = '0.85rem';
            historyEl.style.color = 'var(--text-subtle)';
            historyEl.style.fontStyle = 'italic';
            historyEl.textContent = message;
            
            container.appendChild(historyEl);
        }
    }

    /**
     * Helper to get a random item from an array
     * @param {Array} array
     * @returns {*} Random item
     */
    function getRandom(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    /**
     * Initialize interactive decoration easter egg
     * @param {HTMLElement} container - The container element
     */
    function initDecoration(container) {
        const decoration = container.querySelector('.decoration');
        if (!decoration) return;

        const PUNS = [
            "I'm rooting for you!",
            "You're unbeleafable!",
            "Aloe you vera much",
            "Thanks for helping me grow!",
            "Bloom where you're planted!",
            "Have a plantastic day!"
        ];

        const EVOLUTION_STAGES = ['🌱', '🌿', '🪴', '🌳', '🌻'];
        const FLOAT_EMOJIS = ['🌸', '🍃', '✨', '🌺', '🌼', '💚'];

        let clickCount = 0;
        let currentStage = 0;

        // Create tooltip element
        const tooltip = document.createElement('span');
        tooltip.className = 'decoration-tooltip';
        decoration.appendChild(tooltip);

        decoration.addEventListener('click', function(e) {
            clickCount++;

            // Always bounce
            decoration.classList.remove('bounce');
            void decoration.offsetWidth; // Force reflow
            decoration.classList.add('bounce');

            // Show random pun tooltip (clicks 1-4)
            if (clickCount <= 4) {
                tooltip.textContent = getRandom(PUNS);
                tooltip.classList.add('show');
                setTimeout(() => tooltip.classList.remove('show'), 1500);
            }

            // Evolution stages (clicks 5-9)
            if (clickCount >= 5 && clickCount <= 9) {
                currentStage = Math.min(clickCount - 4, EVOLUTION_STAGES.length - 1);
                decoration.childNodes[0].textContent = EVOLUTION_STAGES[currentStage];
                tooltip.textContent = getRandom(PUNS);
                tooltip.classList.add('show');
                setTimeout(() => tooltip.classList.remove('show'), 1500);
            }

            // Floating emojis (clicks 10+)
            if (clickCount >= 10) {
                spawnFloatingEmoji(decoration);
                tooltip.textContent = getRandom(PUNS);
                tooltip.classList.add('show');
                setTimeout(() => tooltip.classList.remove('show'), 1500);
            }
        });

        function spawnFloatingEmoji(parent) {
            const emoji = document.createElement('span');
            emoji.className = 'floating-emoji';
            emoji.textContent = getRandom(FLOAT_EMOJIS);
            emoji.style.left = `${Math.random() * 20 - 10}px`;
            emoji.style.bottom = '100%';
            parent.appendChild(emoji);
            setTimeout(() => emoji.remove(), 2000);
        }
    }

    // Expose to global scope
    window.DetectorUtils = {
        init: initDetector,
        getRandom: getRandom,
        initDecoration: initDecoration,
        DAYS: DAYS
    };
})();