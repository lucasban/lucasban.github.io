// Cost Per Wear Calculator
(function() {
    const itemNameInput = document.getElementById('item-name');
    const priceInput = document.getElementById('price');
    const wearsInput = document.getElementById('wears');
    const calculateBtn = document.getElementById('calculate-btn');
    const saveBtn = document.getElementById('save-btn');
    const resultDiv = document.getElementById('result');
    const cpwValue = document.getElementById('cpw-value');
    const cpwVerdict = document.getElementById('cpw-verdict');
    const projectionTable = document.getElementById('projection-table');
    const projectionDiv = document.getElementById('projection');
    const itemsContainer = document.getElementById('items-container');

    // Estimator elements
    const frequencySelect = document.getElementById('frequency');
    const seasonSelect = document.getElementById('season');
    const lifespanSelect = document.getElementById('lifespan');
    const estimatorResult = document.getElementById('estimator-result');
    const estimatedWearsDisplay = document.getElementById('estimated-wears');
    const useEstimateBtn = document.getElementById('use-estimate-btn');

    // Tab elements
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    // Chart elements
    const chartSection = document.getElementById('chart-section');
    const chartCanvas = document.getElementById('cpw-chart');
    const chartCtx = chartCanvas.getContext('2d');

    const STORAGE_KEY = 'cpw-items';
    const toast = document.getElementById('toast');
    let currentTab = 'actual';

    function showToast(message) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    }

    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            currentTab = tabName;

            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            tabContents.forEach(content => {
                content.classList.toggle('active', content.id === `tab-${tabName}`);
            });

            // Update estimate when switching to estimate tab
            if (tabName === 'estimate') {
                updateEstimate();
            }
        });
    });

    // Load saved items from localStorage
    function loadItems() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    }

    // Save items to localStorage
    function saveItems(items) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch (e) {
            // localStorage might be unavailable
        }
    }

    // Calculate cost per wear
    function calculateCPW(price, wears) {
        if (wears <= 0) return Infinity;
        return price / wears;
    }

    // Estimate total wears based on frequency, season, and lifespan
    function estimateWears() {
        const frequency = parseFloat(frequencySelect.value); // wears per week
        const seasonMultiplier = parseFloat(seasonSelect.value); // fraction of year
        const lifespan = parseFloat(lifespanSelect.value); // years

        // Weeks in a year * frequency * season availability * years
        const wearsPerYear = 52 * frequency * seasonMultiplier;
        const totalWears = Math.round(wearsPerYear * lifespan);

        return Math.max(1, totalWears);
    }

    // Update the estimate display
    function updateEstimate() {
        const wears = estimateWears();
        estimatedWearsDisplay.textContent = wears;
        estimatorResult.classList.remove('hidden');

        // Auto-calculate if price is entered
        const price = parseFloat(priceInput.value);
        if (price > 0) {
            displayResult(price, wears);
        }
    }

    // Get verdict based on CPW
    function getVerdict(cpw) {
        if (cpw < 1) {
            return { text: 'Excellent value!', class: 'verdict-great' };
        } else if (cpw < 3) {
            return { text: 'Great deal', class: 'verdict-good' };
        } else if (cpw < 5) {
            return { text: 'Good value', class: 'verdict-good' };
        } else if (cpw < 10) {
            return { text: 'Fair', class: 'verdict-ok' };
        } else if (cpw < 20) {
            return { text: 'Pricey per wear', class: 'verdict-pricey' };
        } else {
            return { text: 'Wear it more!', class: 'verdict-yikes' };
        }
    }

    // Get bar color based on CPW (for chart)
    function getBarColor(cpw) {
        if (cpw < 1) return '#859900'; // green - excellent
        if (cpw < 3) return '#2aa198'; // teal - great
        if (cpw < 5) return '#2aa198'; // teal - good
        if (cpw < 10) return '#b58900'; // yellow - fair
        if (cpw < 20) return '#cb4b16'; // orange - pricey
        return '#dc322f'; // red - yikes
    }

    // Render the chart
    function renderChart() {
        const items = loadItems();

        // Hide chart if no items
        if (items.length === 0) {
            chartSection.classList.add('hidden');
            return;
        }

        chartSection.classList.remove('hidden');

        // Sort by CPW (best first)
        items.sort((a, b) => calculateCPW(a.price, a.wears) - calculateCPW(b.price, b.wears));

        // Limit to top 10 items for readability
        const displayItems = items.slice(0, 10);

        // Get theme colors
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const bgColor = isDark ? '#002b36' : '#fdf6e3';
        const textColor = isDark ? '#839496' : '#657b83';
        const gridColor = isDark ? '#073642' : '#eee8d5';

        // Responsive canvas sizing
        const container = chartCanvas.parentElement;
        const maxWidth = Math.min(600, container.clientWidth - 32);
        const rowHeight = 35;
        const chartHeight = Math.max(150, displayItems.length * rowHeight + 40);

        chartCanvas.width = maxWidth;
        chartCanvas.height = chartHeight;

        // Clear canvas
        chartCtx.fillStyle = bgColor;
        chartCtx.fillRect(0, 0, chartCanvas.width, chartCanvas.height);

        // Chart dimensions
        const padding = { left: 120, right: 70, top: 20, bottom: 20 };
        const chartWidth = chartCanvas.width - padding.left - padding.right;

        // Find max CPW for scaling
        const maxCPW = Math.max(...displayItems.map(item => calculateCPW(item.price, item.wears)));

        // Draw bars
        displayItems.forEach((item, index) => {
            const cpw = calculateCPW(item.price, item.wears);
            const barWidth = (cpw / maxCPW) * chartWidth;
            const y = padding.top + index * rowHeight;
            const barHeight = rowHeight - 8;

            // Draw bar
            chartCtx.fillStyle = getBarColor(cpw);
            chartCtx.fillRect(padding.left, y, barWidth, barHeight);

            // Draw item name (truncate if too long)
            chartCtx.fillStyle = textColor;
            chartCtx.font = '12px -apple-system, BlinkMacSystemFont, sans-serif';
            chartCtx.textAlign = 'right';
            chartCtx.textBaseline = 'middle';
            let name = item.name;
            if (name.length > 14) {
                name = name.substring(0, 12) + '...';
            }
            chartCtx.fillText(name, padding.left - 8, y + barHeight / 2);

            // Draw CPW value at end of bar
            chartCtx.textAlign = 'left';
            chartCtx.fillText(formatCurrency(cpw), padding.left + barWidth + 5, y + barHeight / 2);
        });

        // Draw vertical axis line
        chartCtx.strokeStyle = gridColor;
        chartCtx.lineWidth = 1;
        chartCtx.beginPath();
        chartCtx.moveTo(padding.left, padding.top);
        chartCtx.lineTo(padding.left, chartCanvas.height - padding.bottom);
        chartCtx.stroke();
    }

    // Format currency
    function formatCurrency(amount) {
        if (amount >= 1000) {
            return '$' + amount.toFixed(0);
        }
        return '$' + amount.toFixed(2);
    }

    // Display the result
    function displayResult(price, wears) {
        const cpw = calculateCPW(price, wears);
        const verdict = getVerdict(cpw);

        cpwValue.textContent = formatCurrency(cpw);
        cpwVerdict.textContent = verdict.text;
        cpwVerdict.className = 'cpw-verdict ' + verdict.class;

        // Calculate projections (only show if they'd improve CPW meaningfully)
        const projections = [];
        const targets = [
            { wears: wears + 10, label: '+10 wears' },
            { wears: wears + 25, label: '+25 wears' },
            { wears: wears + 50, label: '+50 wears' },
            { wears: 100, label: '100 total' },
            { wears: 200, label: '200 total' },
        ];

        for (const target of targets) {
            if (target.wears > wears) {
                const futureCPW = price / target.wears;
                if (futureCPW < cpw * 0.8) { // Only show if it's a meaningful improvement
                    projections.push({
                        label: target.label,
                        cpw: futureCPW
                    });
                }
            }
            if (projections.length >= 3) break;
        }

        if (projections.length > 0) {
            projectionTable.innerHTML = projections.map(p => `
                <tr>
                    <td>${p.label}:</td>
                    <td>${formatCurrency(p.cpw)}</td>
                </tr>
            `).join('');
            projectionDiv.style.display = 'block';
        } else {
            projectionDiv.style.display = 'none';
        }

        resultDiv.classList.remove('hidden');
    }

    // Calculate and display result
    function calculate() {
        const price = parseFloat(priceInput.value) || 0;
        let wears;

        if (currentTab === 'estimate') {
            wears = estimateWears();
        } else {
            wears = parseInt(wearsInput.value) || 0;
        }

        if (price <= 0 || wears <= 0) {
            resultDiv.classList.add('hidden');
            return;
        }

        displayResult(price, wears);
    }

    // Use the estimate in the actual wears field
    function useEstimate() {
        const wears = estimateWears();
        wearsInput.value = wears;

        // Switch to actual tab
        tabs.forEach(t => t.classList.remove('active'));
        tabs[0].classList.add('active');
        tabContents.forEach(c => c.classList.remove('active'));
        document.getElementById('tab-actual').classList.add('active');
        currentTab = 'actual';

        calculate();
    }

    // Save current item
    function saveItem() {
        const name = itemNameInput.value.trim() || 'Unnamed item';
        const price = parseFloat(priceInput.value) || 0;
        let wears;

        if (currentTab === 'estimate') {
            wears = estimateWears();
        } else {
            wears = parseInt(wearsInput.value) || 0;
        }

        if (price <= 0 || wears <= 0) {
            alert('Please enter a valid price and number of wears.');
            return;
        }

        const items = loadItems();
        items.push({
            id: Date.now(),
            name,
            price,
            wears,
            createdAt: new Date().toISOString()
        });
        saveItems(items);
        renderItems();
        showToast(`"${name}" saved!`);

        // Clear form
        itemNameInput.value = '';
        priceInput.value = '';
        wearsInput.value = '';
        resultDiv.classList.add('hidden');
        estimatorResult.classList.add('hidden');
    }

    // Delete an item
    function deleteItem(id) {
        const items = loadItems().filter(item => item.id !== id);
        saveItems(items);
        renderItems();
    }

    // Render saved items list
    function renderItems() {
        const items = loadItems();

        if (items.length === 0) {
            itemsContainer.innerHTML = '<p class="no-items">No items saved yet.</p>';
            return;
        }

        // Sort by CPW (best value first)
        items.sort((a, b) => calculateCPW(a.price, a.wears) - calculateCPW(b.price, b.wears));

        itemsContainer.innerHTML = items.map(item => {
            const cpw = calculateCPW(item.price, item.wears);
            return `
                <div class="item-row">
                    <div>
                        <div class="item-name">${escapeHtml(item.name)}</div>
                        <div class="item-details">${formatCurrency(item.price)} · ${item.wears} wears</div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 1em;">
                        <span class="item-cpw">${formatCurrency(cpw)}/wear</span>
                        <button class="item-remove" data-id="${item.id}" title="Remove">&times;</button>
                    </div>
                </div>
            `;
        }).join('');

        // Add delete handlers
        itemsContainer.querySelectorAll('.item-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                deleteItem(id);
            });
        });

        // Update chart
        renderChart();
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Event listeners
    calculateBtn.addEventListener('click', calculate);
    saveBtn.addEventListener('click', saveItem);
    useEstimateBtn.addEventListener('click', useEstimate);

    // Calculate on Enter key
    [priceInput, wearsInput].forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                calculate();
            }
        });
    });

    // Auto-calculate as user types in actual wears
    [priceInput, wearsInput].forEach(input => {
        input.addEventListener('input', () => {
            if (currentTab === 'actual') {
                const price = parseFloat(priceInput.value);
                const wears = parseInt(wearsInput.value);
                if (price > 0 && wears > 0) {
                    calculate();
                }
            } else if (currentTab === 'estimate') {
                const price = parseFloat(priceInput.value);
                if (price > 0) {
                    updateEstimate();
                }
            }
        });
    });

    // Auto-update estimate when changing dropdowns
    [frequencySelect, seasonSelect, lifespanSelect].forEach(select => {
        select.addEventListener('change', () => {
            updateEstimate();
        });
    });

    // Redraw chart when theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', renderChart);

    // Redraw chart on window resize
    window.addEventListener('resize', renderChart);

    // Initialize
    renderItems();
})();
