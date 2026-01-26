/**
 * detector-utils.js
 * Shared logic for day detector mini-apps.
 */

(function () {
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

            // Inject Week Navigation
            injectWeekNav(dayIndex, container);

            // Inject Theme Toggle
            injectThemeToggle();

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
            container.appendChild(historyEl);
        }
    }

    /**
     * Inject links to previous and next days
     */
    function injectWeekNav(currentDayIndex, container) {
        if (!container) return;

        const prevIndex = (currentDayIndex - 1 + 7) % 7;
        const nextIndex = (currentDayIndex + 1) % 7;
        const prevDayName = DAYS[prevIndex];
        const nextDayName = DAYS[nextIndex];
        const getPath = (name) => `/${name.toLowerCase()}-detector/`;

        const nav = document.createElement('div');
        nav.className = 'week-nav';
        nav.style.marginTop = '1.5em';
        nav.style.display = 'flex';
        nav.style.justifyContent = 'space-between';
        nav.style.fontSize = '0.9rem';
        nav.style.borderTop = '1px solid var(--border-color)';
        nav.style.paddingTop = '1em';

        nav.innerHTML = `
            <a href="${getPath(prevDayName)}" style="text-decoration: none;">&larr; ${prevDayName}</a>
            <span style="color: var(--text-subtle);">Week Cycle</span>
            <a href="${getPath(nextDayName)}" style="text-decoration: none;">${nextDayName} &rarr;</a>
        `;

        container.appendChild(nav);
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

        decoration.addEventListener('click', function (e) {
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

    /**
     * Inject theme toggle button (Sun/Moon/Auto)
     */
    function injectThemeToggle() {
        // Only inject if not already present
        if (document.querySelector('.theme-toggle')) return;

        const toggleHtml = `
            <div class="theme-toggle" role="radiogroup" aria-label="Color theme">
                <button data-theme="light" aria-pressed="false">☀️</button>
                <button data-theme="dark" aria-pressed="false">🌙</button>
                <button data-theme="auto" aria-pressed="true">💻</button>
            </div>
        `;
        document.body.insertAdjacentHTML('afterbegin', toggleHtml);

        // Dispatch event or re-run toggle script if needed, although theme-toggle.js 
        // usually runs on DOMContentLoaded. If this script runs after DOMContentLoaded, 
        // we might need to manually trigger the toggle initialization if it's not event-delegated.
        // However, looking at theme-toggle.js, it waits for DOMContentLoaded. 
        // Since this initDetector also runs on DOMContentLoaded, we need to make sure 
        // the toggle is in the DOM before theme-toggle.js looks for it, OR 
        // theme-toggle.js needs to be robust. 
        // 
        // Current theme-toggle.js:
        // document.addEventListener('DOMContentLoaded', function() {
        //    const toggle = document.querySelector('.theme-toggle');
        //    if (!toggle) return;
        //    ...
        // });
        //
        // If detector-utils.js runs its DOMContentLoaded listener AFTER theme-toggle.js, 
        // theme-toggle.js will miss the button. 
        // To be safe, we should check if we can re-initialize the toggle logic or 
        // if we should insert this immediately if the script is loaded defer/async.
        //
        // Given both use `document.addEventListener('DOMContentLoaded', ...)` the order 
        // depends on script order. The HTML has:
        // <script src="../theme-toggle.js?v=3"></script>
        // <script src="../shared/detector-utils.js?v=3"></script>
        //
        // theme-toggle.js comes FIRST. So its listener is registered FIRST. 
        // It will fire, find nothing, and return.
        // THEN detector-utils.js fires, injects the toggle. But the listeners are gone.
        //
        // Fix: We need to manually re-init the theme toggle logic.
        // Or we can simple emit an event that theme-toggle.js listens to?
        // Or simpler: Include the toggle logic here for now, or make theme-toggle.js expose an init function.
        //
        // Let's modify theme-toggle.js to expose an init function first? 
        // But I am in the middle of modifying detector-utils.js.
        // 
        // Actually, let's just dispatch the 'themechange' event or similar? No, that won't attach listeners.
        //
        // Let's look at theme-toggle.js again.
        // It's an IIFE. It doesn't expose anything.
        // 
        // I should probably modify theme-toggle.js to be reusable first, OR 
        // since I can't easily switch tasks without tool calls, I can put the logic inline here 
        // OR better, I can assume I will fix theme-toggle.js in a subsequent step if needed.
        // 
        // actually, I can just copy the attach logic here for now? No duplicate code.
        // 
        // Let's assume for now I will rely on the fact that I can move the script tag in HTML? 
        // No, `shared/nav.js` works because it does `document.body.insertAdjacentHTML`... 
        // Wait, `shared/nav.js` injects it. Does `index.html` work?
        // `index.html` has:
        // <script src="shared/nav.js"></script>
        // <script>Layout.init();</script>
        // ...
        // <script src="theme-toggle.js?v=3"></script>
        //
        // It loads `theme-toggle.js` at the END of body. `nav.js` is in body too.
        //
        // In detectors:
        // <script src="../theme-toggle.js?v=3"></script>
        // <script src="../shared/detector-utils.js?v=3"></script>
        //
        // If I keep this order, theme-toggle.js runs. 
        // `detector-utils.js` runs.
        // 
        // If I allow `detector-utils.js` to inject it, I should maybe move `theme-toggle.js` 
        // to be included AFTER `detector-utils.js` or `Layout.init`?
        //
        // Actually, `nav.js` injects it inside `document.addEventListener('DOMContentLoaded'...)`.
        // If `theme-toggle.js` is also `DOMContentLoaded`, it's a race.
        //
        // `nav.js`:
        // document.addEventListener('DOMContentLoaded', () => { ... injectThemeToggle() ... });
        //
        // `theme-toggle.js`:
        // document.addEventListener('DOMContentLoaded', function() { ... const toggle = ... });
        //
        // If `nav.js` comes before `theme-toggle.js` in specific execution order...
        //
        // Let's look at `index.html` again.
        // `nav.js` is a script src.
        // `theme-toggle.js` is at the very bottom.
        // So `nav.js` listener is registered BEFORE `theme-toggle.js` listener?
        // Yes. So `nav.js` runs first, inserts HTML.
        // Then `theme-toggle.js` runs, finds HTML, attaches listeners.
        //
        // In detectors:
        // <script src="../theme-toggle.js?v=3"></script>
        // <script src="../shared/detector-utils.js?v=3"></script>
        //
        // `theme-toggle.js` is BEFORE. So its listener registers FIRST.
        // It will fail to find elements.
        //
        // I MUST swap the script order in the HTML files OR modify `theme-toggle.js` to handle dynamic injection.
        //
        // Swapping script order is easy while I am removing the HTML.
        // I will plan to move `<script src="../theme-toggle.js?v=3"></script>` to the END, after `detector-utils.js`.
        //
        // Okay, proceeding with adding the function to `detector-utils.js`.
    }

    // Expose to global scope
    window.DetectorUtils = {
        init: initDetector,
        getRandom: getRandom,
        initDecoration: initDecoration,
        DAYS: DAYS
    };
})();