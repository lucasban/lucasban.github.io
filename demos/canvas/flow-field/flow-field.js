// Flow Field with Perlin Noise
(function() {
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');

    // Controls
    const particleCountSlider = document.getElementById('particle-count');
    const particleCountValue = document.getElementById('particle-count-value');
    const noiseScaleSlider = document.getElementById('noise-scale');
    const noiseScaleValue = document.getElementById('noise-scale-value');
    const speedSlider = document.getElementById('speed');
    const speedValue = document.getElementById('speed-value');
    const resetBtn = document.getElementById('reset-btn');

    // State
    let particles = [];
    let attractors = [];
    let noiseScale = 200;
    let speed = 3;
    let particleCount = 800;
    let time = 0;

    // Perlin noise implementation (simplified)
    const permutation = [];
    for (let i = 0; i < 256; i++) permutation[i] = i;
    for (let i = 255; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [permutation[i], permutation[j]] = [permutation[j], permutation[i]];
    }
    const p = [...permutation, ...permutation];

    function fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    function lerp(a, b, t) {
        return a + t * (b - a);
    }

    function grad(hash, x, y) {
        const h = hash & 3;
        const u = h < 2 ? x : y;
        const v = h < 2 ? y : x;
        return ((h & 1) ? -u : u) + ((h & 2) ? -v : v);
    }

    function noise(x, y) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        x -= Math.floor(x);
        y -= Math.floor(y);
        const u = fade(x);
        const v = fade(y);
        const A = p[X] + Y;
        const B = p[X + 1] + Y;
        return lerp(
            lerp(grad(p[A], x, y), grad(p[B], x - 1, y), u),
            lerp(grad(p[A + 1], x, y - 1), grad(p[B + 1], x - 1, y - 1), u),
            v
        );
    }

    // Particle class
    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.prevX = this.x;
            this.prevY = this.y;
            this.life = Math.random() * 100 + 50;
        }

        update() {
            this.prevX = this.x;
            this.prevY = this.y;

            // Get flow direction from noise
            const angle = noise(this.x / noiseScale, this.y / noiseScale + time * 0.01) * Math.PI * 4;
            let vx = Math.cos(angle) * speed;
            let vy = Math.sin(angle) * speed;

            // Apply attractor influence
            for (const attractor of attractors) {
                const dx = attractor.x - this.x;
                const dy = attractor.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist > 10) {
                    const force = Math.min(50 / dist, 2);
                    vx += (dx / dist) * force;
                    vy += (dy / dist) * force;
                }
            }

            this.x += vx;
            this.y += vy;
            this.life--;

            // Wrap around edges
            if (this.x < 0) this.x = canvas.width;
            if (this.x > canvas.width) this.x = 0;
            if (this.y < 0) this.y = canvas.height;
            if (this.y > canvas.height) this.y = 0;

            if (this.life <= 0) {
                this.reset();
            }
        }

        draw() {
            const alpha = Math.min(this.life / 50, 1) * 0.5;
            ctx.strokeStyle = `rgba(26, 26, 26, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(this.prevX, this.prevY);
            ctx.lineTo(this.x, this.y);
            ctx.stroke();
        }
    }

    function initParticles() {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        // Semi-transparent background for trails
        ctx.fillStyle = 'rgba(255, 255, 248, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.lineWidth = 1;

        for (const particle of particles) {
            particle.update();
            particle.draw();
        }

        // Draw attractors
        ctx.fillStyle = '#0000ee';
        for (const attractor of attractors) {
            ctx.beginPath();
            ctx.arc(attractor.x, attractor.y, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        time++;
        requestAnimationFrame(animate);
    }

    function clearCanvas() {
        ctx.fillStyle = '#fffff8';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Event listeners
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        attractors.push({ x, y });
    });

    canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        attractors = [];
    });

    particleCountSlider.addEventListener('input', (e) => {
        particleCount = parseInt(e.target.value);
        particleCountValue.textContent = particleCount;
        initParticles();
    });

    noiseScaleSlider.addEventListener('input', (e) => {
        noiseScale = parseInt(e.target.value);
        noiseScaleValue.textContent = noiseScale;
    });

    speedSlider.addEventListener('input', (e) => {
        speed = parseInt(e.target.value);
        speedValue.textContent = speed;
    });

    resetBtn.addEventListener('click', () => {
        attractors = [];
        clearCanvas();
        initParticles();
        time = 0;
    });

    // Initialize
    clearCanvas();
    initParticles();
    animate();
})();
