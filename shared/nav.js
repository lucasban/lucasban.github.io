/**
 * nav.js
 * Shared navigation and layout logic.
 * Injects the theme toggle, header, breadcrumbs, and footer.
 */

(function() {
    const LAYOUT_CONFIG = {
        name: "Lucas Bannister",
        homePath: "/",
        bskyUrl: "https://bsky.app/profile/lucasban.com",
    };

    /**
     * Initialize the layout
     * @param {Object} options
     * @param {string} [options.title] - Page title for header
     * @param {string} [options.subtitle] - Page subtitle
     * @param {Array<{label: string, url: string}>} [options.breadcrumbs] - Breadcrumb links
     * @param {boolean} [options.hideThemeToggle] - If true, skips theme toggle injection (if manually placed)
     */
    function initLayout({ title, subtitle, breadcrumbs = [], hideThemeToggle = false } = {}) {
        document.addEventListener('DOMContentLoaded', () => {
            const container = document.querySelector('.container');
            if (!container) return;

            // 1. Theme Toggle
            if (!hideThemeToggle && !document.querySelector('.theme-toggle')) {
                injectThemeToggle();
            }

            // 2. Breadcrumbs / Nav
            if (breadcrumbs.length > 0) {
                const nav = document.createElement('nav');
                breadcrumbs.forEach((crumb, index) => {
                    const link = document.createElement('a');
                    link.href = crumb.url;
                    link.textContent = crumb.label;
                    nav.appendChild(link);

                    if (index < breadcrumbs.length - 1) {
                        const separator = document.createElement('span');
                        separator.className = 'separator';
                        separator.textContent = '/';
                        nav.appendChild(separator);
                    }
                });
                
                // If container has content, insert before it (or just prepend)
                if (container.firstChild) {
                    container.insertBefore(nav, container.firstChild);
                } else {
                    container.appendChild(nav);
                }
            }

            // 3. Header (if title provided and no header exists)
            // Note: Users might manually write the header text but want the styling/structure. 
            // We'll only inject if explicitly requested to avoid overwriting existing manual headers.
            // For now, we will leave the header handling to the specific pages to avoid being too invasive,
            // unless we want to standardize that too. Let's stick to Footer and Date for now mostly.
            
            // 4. Footer
            // Check if footer exists, if not, create it
            let footer = document.querySelector('footer');
            if (!footer) {
                footer = document.createElement('footer');
                container.appendChild(footer);
            }
            
            // Ensure footer content is consistent if empty or we want to append common links
            if (!footer.innerHTML.includes('Built with plain HTML')) {
                // If it's a simple back link footer, we append the credits
                const credit = document.createElement('p');
                credit.style.fontSize = '0.8rem';
                credit.style.opacity = '0.7';
                credit.style.marginTop = '1em';
                credit.innerHTML = `Built with plain HTML, CSS, and JS.`;
                footer.appendChild(credit);
            }
        });
    }

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
        
        // Re-run theme toggle script initialization if script is loaded
        // This relies on theme-toggle.js being loaded
    }

    // Expose
    window.Layout = {
        init: initLayout
    };

})();
