// Theme toggle functionality
(function() {
    // Apply saved theme immediately to prevent flash
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && savedTheme !== 'auto') {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    document.addEventListener('DOMContentLoaded', function() {
        const toggle = document.querySelector('.theme-toggle');
        if (!toggle) return;

        const buttons = toggle.querySelectorAll('button[data-theme]');
        if (buttons.length === 0) return;

        function getActiveTheme() {
            const saved = localStorage.getItem('theme');
            if (saved === 'light' || saved === 'dark') return saved;
            return 'auto';
        }

        function updateButtons() {
            const active = getActiveTheme();
            buttons.forEach(btn => {
                const isActive = btn.dataset.theme === active;
                btn.setAttribute('aria-pressed', isActive);
            });
        }

        function setTheme(theme) {
            if (theme === 'auto') {
                localStorage.removeItem('theme');
                document.documentElement.removeAttribute('data-theme');
            } else {
                localStorage.setItem('theme', theme);
                document.documentElement.setAttribute('data-theme', theme);
            }
            updateButtons();
            // Dispatch custom event for theme change
            window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
        }

        // Add click handlers to each button
        buttons.forEach(btn => {
            btn.addEventListener('click', function() {
                setTheme(btn.dataset.theme);
            });
        });

        // Update buttons when OS preference changes (for visual feedback in auto mode)
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateButtons);

        // Initialize button states
        updateButtons();
    });
})();
