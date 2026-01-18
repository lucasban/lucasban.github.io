// Theme toggle functionality
(function() {
    // Apply saved theme immediately to prevent flash
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    document.addEventListener('DOMContentLoaded', function() {
        const toggle = document.getElementById('theme-toggle');
        if (!toggle) return;

        function getEffectiveTheme() {
            const saved = localStorage.getItem('theme');
            if (saved) return saved;
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }

        function updateToggleIcon() {
            const theme = getEffectiveTheme();
            toggle.textContent = theme === 'dark' ? '☀️' : '🌙';
            toggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
        }

        toggle.addEventListener('click', function() {
            const current = getEffectiveTheme();
            const next = current === 'dark' ? 'light' : 'dark';
            localStorage.setItem('theme', next);
            document.documentElement.setAttribute('data-theme', next);
            updateToggleIcon();
        });

        // Update icon when OS preference changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateToggleIcon);

        updateToggleIcon();
    });
})();
