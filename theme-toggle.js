// Theme toggle functionality
(function() {
    // Apply saved theme immediately to prevent flash
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme && savedTheme !== 'auto') {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    document.addEventListener('DOMContentLoaded', function() {
        const toggle = document.getElementById('theme-toggle');
        if (!toggle) return;

        function getEffectiveTheme() {
            const saved = localStorage.getItem('theme');
            if (saved && saved !== 'auto') return saved;
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }

        function updateToggleIcon() {
            const saved = localStorage.getItem('theme');
            if (!saved || saved === 'auto') {
                // Auto/system mode
                toggle.textContent = '💻';
                toggle.setAttribute('aria-label', 'Following system theme. Click for light mode');
            } else if (saved === 'light') {
                toggle.textContent = '☀️';
                toggle.setAttribute('aria-label', 'Light mode. Click for dark mode');
            } else {
                toggle.textContent = '🌙';
                toggle.setAttribute('aria-label', 'Dark mode. Click for auto mode');
            }
        }

        toggle.addEventListener('click', function() {
            const saved = localStorage.getItem('theme');
            let next;
            if (saved === 'light') next = 'dark';
            else if (saved === 'dark') next = 'auto';
            else next = 'light'; // auto or null → light

            if (next === 'auto') {
                localStorage.removeItem('theme');
                document.documentElement.removeAttribute('data-theme');
            } else {
                localStorage.setItem('theme', next);
                document.documentElement.setAttribute('data-theme', next);
            }
            updateToggleIcon();
        });

        // Update icon when OS preference changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateToggleIcon);

        updateToggleIcon();
    });
})();
