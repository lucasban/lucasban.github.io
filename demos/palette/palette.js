// Color Palette Generator
(function() {
    const paletteEl = document.getElementById('palette');
    const generateBtn = document.getElementById('generate-btn');
    const harmonySelect = document.getElementById('harmony-select');
    const historyEl = document.getElementById('history');
    const historySection = document.getElementById('history-section');

    const STORAGE_KEY = 'paletteHistory';
    let history = loadHistory();
    const MAX_HISTORY = 5;

    function loadHistory() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    }

    function saveHistory() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
        } catch {
            // Ignore storage errors
        }
    }

    // Convert HSL to RGB to Hex
    function hslToHex(h, s, l) {
        s /= 100;
        l /= 100;
        const a = s * Math.min(l, 1 - l);
        const f = n => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    }

    // Generate colors based on harmony type
    function generatePalette(harmonyType) {
        const colors = [];
        const baseHue = Math.random() * 360;

        switch (harmonyType) {
            case 'analogous':
                for (let i = 0; i < 5; i++) {
                    const hue = (baseHue + (i - 2) * 25 + 360) % 360;
                    const sat = 50 + Math.random() * 30;
                    const light = 45 + Math.random() * 25;
                    colors.push(hslToHex(hue, sat, light));
                }
                break;

            case 'complementary':
                const compHue = (baseHue + 180) % 360;
                colors.push(hslToHex(baseHue, 60 + Math.random() * 20, 40 + Math.random() * 20));
                colors.push(hslToHex(baseHue, 40 + Math.random() * 20, 60 + Math.random() * 20));
                colors.push(hslToHex((baseHue + compHue) / 2, 30, 85));
                colors.push(hslToHex(compHue, 40 + Math.random() * 20, 60 + Math.random() * 20));
                colors.push(hslToHex(compHue, 60 + Math.random() * 20, 40 + Math.random() * 20));
                break;

            case 'triadic':
                for (let i = 0; i < 5; i++) {
                    const hue = (baseHue + (Math.floor(i / 2) + (i % 2) * 0.5) * 120) % 360;
                    const sat = 50 + Math.random() * 30;
                    const light = 40 + Math.random() * 30;
                    colors.push(hslToHex(hue, sat, light));
                }
                break;

            case 'monochromatic':
                for (let i = 0; i < 5; i++) {
                    const sat = 30 + Math.random() * 40;
                    const light = 20 + i * 15 + Math.random() * 10;
                    colors.push(hslToHex(baseHue, sat, light));
                }
                break;

            case 'warm':
                for (let i = 0; i < 5; i++) {
                    const hue = Math.random() * 60; // 0-60 (reds, oranges, yellows)
                    const sat = 50 + Math.random() * 40;
                    const light = 40 + Math.random() * 35;
                    colors.push(hslToHex(hue, sat, light));
                }
                break;

            case 'cool':
                for (let i = 0; i < 5; i++) {
                    const hue = 180 + Math.random() * 100; // 180-280 (blues, purples)
                    const sat = 40 + Math.random() * 40;
                    const light = 40 + Math.random() * 35;
                    colors.push(hslToHex(hue, sat, light));
                }
                break;

            case 'pastel':
                for (let i = 0; i < 5; i++) {
                    const hue = Math.random() * 360;
                    const sat = 40 + Math.random() * 30;
                    const light = 75 + Math.random() * 15;
                    colors.push(hslToHex(hue, sat, light));
                }
                break;

            default: // random
                for (let i = 0; i < 5; i++) {
                    const hue = Math.random() * 360;
                    const sat = 40 + Math.random() * 50;
                    const light = 35 + Math.random() * 40;
                    colors.push(hslToHex(hue, sat, light));
                }
        }

        return colors;
    }

    // Calculate perceived brightness for text color
    function getBrightness(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return (r * 299 + g * 587 + b * 114) / 1000;
    }

    // Render palette
    function renderPalette(colors) {
        paletteEl.innerHTML = colors.map(color => {
            const textColor = getBrightness(color) > 128 ? '#1a1a1a' : '#ffffff';
            return `
                <div class="color-swatch" style="background: ${color};" data-color="${color}">
                    <span class="hex" style="color: ${textColor}; background: rgba(${getBrightness(color) > 128 ? '255,255,255' : '0,0,0'},0.2)">${color.toUpperCase()}</span>
                    <span class="copied">Copied!</span>
                </div>
            `;
        }).join('');

        // Add click handlers
        paletteEl.querySelectorAll('.color-swatch').forEach(swatch => {
            swatch.addEventListener('click', () => {
                const color = swatch.dataset.color;
                navigator.clipboard.writeText(color).then(() => {
                    const copied = swatch.querySelector('.copied');
                    copied.classList.add('show');
                    setTimeout(() => copied.classList.remove('show'), 1000);
                });
            });
        });
    }

    // Render history
    function renderHistory() {
        if (history.length === 0) {
            historySection.style.display = 'none';
            return;
        }

        historySection.style.display = 'block';
        historyEl.innerHTML = history.map((colors, index) => `
            <div class="history-row" data-index="${index}">
                ${colors.map(color => `<div class="mini-swatch" style="background: ${color};"></div>`).join('')}
            </div>
        `).join('');

        // Add click handlers to restore palette
        historyEl.querySelectorAll('.history-row').forEach(row => {
            row.addEventListener('click', () => {
                const index = parseInt(row.dataset.index);
                renderPalette(history[index]);
            });
        });
    }

    // Generate and display new palette
    function generate() {
        const harmonyType = harmonySelect.value;
        const colors = generatePalette(harmonyType);

        // Add current to history (if not first)
        const currentColors = Array.from(paletteEl.querySelectorAll('.color-swatch'))
            .map(s => s.dataset.color);
        if (currentColors.length > 0 && currentColors[0]) {
            history.unshift(currentColors);
            if (history.length > MAX_HISTORY) {
                history.pop();
            }
        }

        renderPalette(colors);
        renderHistory();
        saveHistory();
    }

    // Event listeners
    generateBtn.addEventListener('click', generate);

    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' && e.target === document.body) {
            e.preventDefault();
            generate();
        }
    });

    // Initialize
    if (history.length > 0) {
        // Restore last palette from history
        renderPalette(history[0]);
        renderHistory();
    } else {
        generate();
    }
})();
