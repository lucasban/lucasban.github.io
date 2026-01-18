// Gravity Simulator
(function() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const clearBtn = document.getElementById('clear-btn');
    const presetBtn = document.getElementById('preset-btn');
    const massSlider = document.getElementById('mass-slider');
    const massPreview = document.getElementById('mass-preview');
    const trailsToggle = document.getElementById('trails-toggle');

    // Detect dark mode
    function isDarkMode() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    // Colors that adapt to theme
    function getColors() {
        const dark = isDarkMode();
        return {
            bg: dark ? '#002b36' : '#fdf6e3',
            text: dark ? '#839496' : '#657b83',
            bodies: [
                '#dc322f', // red
                '#268bd2', // blue
                '#859900', // green
                '#d33682', // magenta
                '#2aa198', // cyan
                '#cb4b16', // orange
                '#6c71c4', // violet
                '#b58900', // yellow
            ],
            sun: '#b58900',
            line: dark ? 'rgba(131, 148, 150, 0.5)' : 'rgba(101, 123, 131, 0.5)'
        };
    }

    let colors = getColors();
    let bodies = [];
    let dragStart = null;
    let dragCurrent = null;
    let showTrails = true;
    let colorIndex = 0;

    const G = 0.5; // Gravitational constant (tweaked for fun)
    const MIN_DIST = 5; // Prevent extreme forces at close range

    class Body {
        constructor(x, y, vx, vy, mass, color, isSun = false) {
            this.x = x;
            this.y = y;
            this.vx = vx;
            this.vy = vy;
            this.mass = mass;
            // Sun gets smaller visual radius relative to mass, planets are small too
            this.radius = isSun ? Math.sqrt(mass) * 1.5 : Math.sqrt(mass) * 2;
            this.color = color;
            this.isSun = isSun;
            this.trail = [];
            this.maxTrail = 100;
        }

        update(bodies) {
            if (this.isSun) return; // Sun doesn't move

            // Calculate gravitational forces from all other bodies
            for (const other of bodies) {
                if (other === this) continue;

                const dx = other.x - this.x;
                const dy = other.y - this.y;
                const dist = Math.max(Math.sqrt(dx * dx + dy * dy), MIN_DIST);

                // F = G * m1 * m2 / r^2
                const force = (G * this.mass * other.mass) / (dist * dist);
                const ax = (force * dx) / (dist * this.mass);
                const ay = (force * dy) / (dist * this.mass);

                this.vx += ax;
                this.vy += ay;
            }

            // Update position
            this.x += this.vx;
            this.y += this.vy;

            // Store trail (reduce length when many bodies for performance)
            if (showTrails) {
                this.trail.push({ x: this.x, y: this.y });
                const dynamicMaxTrail = bodies.length > 10 ? 30 : bodies.length > 5 ? 60 : this.maxTrail;
                if (this.trail.length > dynamicMaxTrail) {
                    this.trail.shift();
                }
            }
        }

        draw() {
            // Draw trail - optimized with batched strokes
            if (showTrails && this.trail.length > 1) {
                // Batch trail drawing with fewer segments when many bodies exist
                const step = bodies.length > 10 ? 3 : bodies.length > 5 ? 2 : 1;

                ctx.strokeStyle = this.color;
                ctx.lineWidth = this.radius * 0.5;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';

                // Draw trail in batches with progressively increasing alpha
                const batchSize = Math.ceil(this.trail.length / 4);
                for (let batch = 0; batch < 4; batch++) {
                    const startIdx = batch * batchSize;
                    const endIdx = Math.min((batch + 1) * batchSize, this.trail.length);
                    if (startIdx >= this.trail.length) break;

                    ctx.globalAlpha = ((batch + 1) / 4) * 0.4;
                    ctx.beginPath();
                    ctx.moveTo(this.trail[startIdx].x, this.trail[startIdx].y);
                    for (let i = startIdx + step; i < endIdx; i += step) {
                        ctx.lineTo(this.trail[i].x, this.trail[i].y);
                    }
                    ctx.stroke();
                }
                ctx.globalAlpha = 1;
            }

            // Draw body
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();

            // Glow effect for sun
            if (this.isSun) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius * 1.5, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.globalAlpha = 0.2;
                ctx.fill();
                ctx.globalAlpha = 1;
            }
        }

        isOffscreen() {
            const margin = 100;
            return (
                this.x < -margin ||
                this.x > canvas.width + margin ||
                this.y < -margin ||
                this.y > canvas.height + margin
            );
        }
    }

    function getMousePos(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    function getCurrentMass() {
        return parseInt(massSlider.value) * 20;
    }

    function updateMassPreview() {
        const mass = getCurrentMass();
        const size = Math.sqrt(mass) * 2 * 2;
        massPreview.style.width = size + 'px';
        massPreview.style.height = size + 'px';
    }

    function addBody(x, y, vx, vy, mass, isSun = false) {
        const color = isSun ? colors.sun : colors.bodies[colorIndex % colors.bodies.length];
        if (!isSun) colorIndex++;
        bodies.push(new Body(x, y, vx, vy, mass, color, isSun));
    }

    function addSun() {
        // Remove existing suns
        bodies = bodies.filter(b => !b.isSun);
        // Add sun at center (high mass for strong gravity)
        addBody(canvas.width / 2, canvas.height / 2, 0, 0, 800, true);
    }

    function clear() {
        bodies = [];
        colorIndex = 0;
        ctx.fillStyle = colors.bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function animate() {
        // Clear canvas each frame
        ctx.fillStyle = colors.bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Update and draw bodies
        for (const body of bodies) {
            body.update(bodies);
        }

        // Remove offscreen bodies (except sun)
        bodies = bodies.filter(b => b.isSun || !b.isOffscreen());

        // Draw bodies
        for (const body of bodies) {
            body.draw();
        }

        // Draw drag line
        if (dragStart && dragCurrent) {
            ctx.beginPath();
            ctx.moveTo(dragStart.x, dragStart.y);
            ctx.lineTo(dragCurrent.x, dragCurrent.y);
            ctx.strokeStyle = colors.line;
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.setLineDash([]);

            // Preview body
            const mass = getCurrentMass();
            const radius = Math.sqrt(mass) * 2;
            ctx.beginPath();
            ctx.arc(dragStart.x, dragStart.y, radius, 0, Math.PI * 2);
            ctx.fillStyle = colors.bodies[colorIndex % colors.bodies.length];
            ctx.globalAlpha = 0.5;
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        requestAnimationFrame(animate);
    }

    // Event listeners
    canvas.addEventListener('mousedown', (e) => {
        dragStart = getMousePos(e);
        dragCurrent = dragStart;
    });

    canvas.addEventListener('mousemove', (e) => {
        if (dragStart) {
            dragCurrent = getMousePos(e);
        }
    });

    canvas.addEventListener('mouseup', (e) => {
        if (dragStart) {
            const end = getMousePos(e);
            // Velocity is opposite of drag direction (like pulling back a slingshot)
            const vx = (dragStart.x - end.x) * 0.02;
            const vy = (dragStart.y - end.y) * 0.02;
            addBody(dragStart.x, dragStart.y, vx, vy, getCurrentMass());
            dragStart = null;
            dragCurrent = null;
        }
    });

    canvas.addEventListener('mouseleave', () => {
        dragStart = null;
        dragCurrent = null;
    });

    // Touch support
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        dragStart = getMousePos(touch);
        dragCurrent = dragStart;
    });

    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (dragStart) {
            const touch = e.touches[0];
            dragCurrent = getMousePos(touch);
        }
    });

    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        if (dragStart && dragCurrent) {
            const vx = (dragStart.x - dragCurrent.x) * 0.02;
            const vy = (dragStart.y - dragCurrent.y) * 0.02;
            addBody(dragStart.x, dragStart.y, vx, vy, getCurrentMass());
            dragStart = null;
            dragCurrent = null;
        }
    });

    clearBtn.addEventListener('click', clear);
    presetBtn.addEventListener('click', addSun);
    massSlider.addEventListener('input', updateMassPreview);
    trailsToggle.addEventListener('change', (e) => {
        showTrails = e.target.checked;
        // Clear trails from existing bodies
        if (!showTrails) {
            for (const body of bodies) {
                body.trail = [];
            }
        }
    });

    // Update colors when theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        colors = getColors();
    });

    // Responsive canvas sizing
    function resizeCanvas() {
        const container = canvas.parentElement;
        const maxWidth = container.clientWidth;
        const aspectRatio = 700 / 500;
        const newWidth = Math.min(700, maxWidth);
        const newHeight = newWidth / aspectRatio;

        canvas.width = newWidth;
        canvas.height = newHeight;

        // Redraw background
        ctx.fillStyle = colors.bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    window.addEventListener('resize', resizeCanvas);

    // Initialize
    resizeCanvas();
    updateMassPreview();
    animate();
})();
