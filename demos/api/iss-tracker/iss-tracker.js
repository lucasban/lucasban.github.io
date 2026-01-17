// ISS Tracker
(function() {
    // DOM elements
    const latEl = document.getElementById('lat');
    const lonEl = document.getElementById('lon');
    const timestampEl = document.getElementById('timestamp');
    const astronautCountEl = document.getElementById('astronaut-count');
    const astronautListEl = document.getElementById('astronaut-list');

    // Initialize map
    const map = L.map('map').setView([0, 0], 2);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19
    }).addTo(map);

    // ISS marker
    const issIcon = L.divIcon({
        html: '<div style="font-size: 24px;">🛰️</div>',
        iconSize: [30, 30],
        iconAnchor: [15, 15],
        className: 'iss-icon'
    });

    const issMarker = L.marker([0, 0], { icon: issIcon }).addTo(map);

    // Track path
    const pathCoords = [];
    const pathLine = L.polyline([], {
        color: '#0000ee',
        weight: 2,
        opacity: 0.6
    }).addTo(map);

    // Fetch ISS position
    async function fetchISSPosition() {
        try {
            const response = await fetch('http://api.open-notify.org/iss-now.json');
            const data = await response.json();

            if (data.message === 'success') {
                const lat = parseFloat(data.iss_position.latitude);
                const lon = parseFloat(data.iss_position.longitude);
                const timestamp = new Date(data.timestamp * 1000);

                // Update display
                latEl.textContent = lat.toFixed(4) + '°';
                latEl.classList.remove('loading');
                lonEl.textContent = lon.toFixed(4) + '°';
                lonEl.classList.remove('loading');
                timestampEl.textContent = timestamp.toLocaleTimeString();
                timestampEl.classList.remove('loading');

                // Update marker
                issMarker.setLatLng([lat, lon]);

                // Update path (keep last 100 points)
                pathCoords.push([lat, lon]);
                if (pathCoords.length > 100) {
                    pathCoords.shift();
                }
                pathLine.setLatLngs(pathCoords);

                // Center map on first load
                if (pathCoords.length === 1) {
                    map.setView([lat, lon], 3);
                }
            }
        } catch (error) {
            console.error('Error fetching ISS position:', error);
            latEl.textContent = 'Error loading data';
            lonEl.textContent = 'Error loading data';
            timestampEl.textContent = 'Error loading data';
        }
    }

    // Fetch astronauts in space
    async function fetchAstronauts() {
        try {
            const response = await fetch('http://api.open-notify.org/astros.json');
            const data = await response.json();

            if (data.message === 'success') {
                astronautCountEl.textContent = `There are currently ${data.number} people in space:`;
                astronautCountEl.classList.remove('loading');

                astronautListEl.innerHTML = '';

                // Group by craft
                const byCraft = {};
                for (const person of data.people) {
                    if (!byCraft[person.craft]) {
                        byCraft[person.craft] = [];
                    }
                    byCraft[person.craft].push(person.name);
                }

                for (const [craft, people] of Object.entries(byCraft)) {
                    const li = document.createElement('li');
                    li.innerHTML = `<strong>${craft}:</strong> ${people.join(', ')}`;
                    astronautListEl.appendChild(li);
                }
            }
        } catch (error) {
            console.error('Error fetching astronauts:', error);
            astronautCountEl.textContent = 'Error loading astronaut data';
            astronautCountEl.classList.remove('loading');
        }
    }

    // Initialize
    fetchISSPosition();
    fetchAstronauts();

    // Update position every 5 seconds
    setInterval(fetchISSPosition, 5000);
})();
