// Madison Explorer Map
(function() {
    const loadingEl = document.getElementById('loading');
    const layerBikesCheckbox = document.getElementById('layer-bikes');
    const layerBusesCheckbox = document.getElementById('layer-buses');
    const layerParksCheckbox = document.getElementById('layer-parks');

    // Initialize map centered on Madison, WI
    const map = L.map('map').setView([43.0731, -89.4012], 13);

    // Add CartoDB grayscale tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxZoom: 19
    }).addTo(map);

    // Layer groups
    const bikePaths = L.layerGroup().addTo(map);
    const busStops = L.layerGroup().addTo(map);
    const parks = L.layerGroup().addTo(map);

    // City of Madison Open Data API endpoints (ArcGIS Feature Service)
    const endpoints = {
        bikes: 'https://maps.cityofmadison.com/arcgis/rest/services/Public/PDCP_BikeMap/MapServer/0/query?where=1%3D1&outFields=*&f=geojson',
        buses: 'https://maps.cityofmadison.com/arcgis/rest/services/Public/Metro_GTFS/MapServer/0/query?where=1%3D1&outFields=*&f=geojson&resultRecordCount=500',
        parks: 'https://maps.cityofmadison.com/arcgis/rest/services/Public/Parks/MapServer/0/query?where=1%3D1&outFields=*&f=geojson'
    };

    // Style definitions
    const styles = {
        bikes: {
            color: '#2ecc71',
            weight: 3,
            opacity: 0.8
        },
        buses: {
            radius: 5,
            fillColor: '#3498db',
            color: '#2980b9',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        },
        parks: {
            fillColor: '#27ae60',
            color: '#1e8449',
            weight: 1,
            opacity: 0.8,
            fillOpacity: 0.4
        }
    };

    let loadingCount = 0;

    function showLoading() {
        loadingCount++;
        loadingEl.style.display = 'block';
    }

    function hideLoading() {
        loadingCount--;
        if (loadingCount <= 0) {
            loadingCount = 0;
            loadingEl.style.display = 'none';
        }
    }

    // Fetch and display bike paths
    async function loadBikePaths() {
        showLoading();
        try {
            const response = await fetch(endpoints.bikes);
            const data = await response.json();

            L.geoJSON(data, {
                style: styles.bikes,
                onEachFeature: (feature, layer) => {
                    const name = feature.properties.STREET || feature.properties.Name || 'Bike Path';
                    layer.bindPopup(`<strong>${name}</strong>`);
                }
            }).addTo(bikePaths);
        } catch (error) {
            console.error('Error loading bike paths:', error);
            // Add fallback sample data for demonstration
            addSampleBikePaths();
        }
        hideLoading();
    }

    // Fetch and display bus stops
    async function loadBusStops() {
        showLoading();
        try {
            const response = await fetch(endpoints.buses);
            const data = await response.json();

            L.geoJSON(data, {
                pointToLayer: (feature, latlng) => {
                    return L.circleMarker(latlng, styles.buses);
                },
                onEachFeature: (feature, layer) => {
                    const name = feature.properties.stop_name || feature.properties.Name || 'Bus Stop';
                    layer.bindPopup(`<strong>${name}</strong>`);
                }
            }).addTo(busStops);
        } catch (error) {
            console.error('Error loading bus stops:', error);
            // Add fallback sample data for demonstration
            addSampleBusStops();
        }
        hideLoading();
    }

    // Fetch and display parks
    async function loadParks() {
        showLoading();
        try {
            const response = await fetch(endpoints.parks);
            const data = await response.json();

            L.geoJSON(data, {
                style: styles.parks,
                onEachFeature: (feature, layer) => {
                    const name = feature.properties.Park_Name || feature.properties.NAME || feature.properties.Name || 'Park';
                    layer.bindPopup(`<strong>${name}</strong>`);
                }
            }).addTo(parks);
        } catch (error) {
            console.error('Error loading parks:', error);
            // Add fallback sample data for demonstration
            addSampleParks();
        }
        hideLoading();
    }

    // Fallback sample data if API fails
    function addSampleBikePaths() {
        // Sample bike path along State Street
        const samplePaths = [
            [[43.0731, -89.3958], [43.0731, -89.4012], [43.0731, -89.4066]],
            [[43.0781, -89.4012], [43.0731, -89.4012], [43.0681, -89.4012]]
        ];
        samplePaths.forEach(coords => {
            L.polyline(coords, styles.bikes)
                .bindPopup('<strong>Sample Bike Path</strong><br>(Demo data)')
                .addTo(bikePaths);
        });
    }

    function addSampleBusStops() {
        const sampleStops = [
            { lat: 43.0731, lng: -89.3958, name: 'State & Lake' },
            { lat: 43.0751, lng: -89.4012, name: 'Library Mall' },
            { lat: 43.0711, lng: -89.4066, name: 'Camp Randall' },
            { lat: 43.0781, lng: -89.3958, name: 'Memorial Union' },
            { lat: 43.0681, lng: -89.3908, name: 'Capitol Square' }
        ];
        sampleStops.forEach(stop => {
            L.circleMarker([stop.lat, stop.lng], styles.buses)
                .bindPopup(`<strong>${stop.name}</strong><br>(Demo data)`)
                .addTo(busStops);
        });
    }

    function addSampleParks() {
        // Sample park polygons
        const sampleParks = [
            {
                name: 'James Madison Park',
                coords: [[43.0781, -89.3858], [43.0791, -89.3838], [43.0771, -89.3828], [43.0761, -89.3848]]
            },
            {
                name: 'Olin Park',
                coords: [[43.0611, -89.3858], [43.0621, -89.3838], [43.0601, -89.3828], [43.0591, -89.3848]]
            }
        ];
        sampleParks.forEach(park => {
            L.polygon(park.coords, styles.parks)
                .bindPopup(`<strong>${park.name}</strong><br>(Demo data)`)
                .addTo(parks);
        });
    }

    // Layer toggle handlers
    layerBikesCheckbox.addEventListener('change', (e) => {
        if (e.target.checked) {
            map.addLayer(bikePaths);
        } else {
            map.removeLayer(bikePaths);
        }
    });

    layerBusesCheckbox.addEventListener('change', (e) => {
        if (e.target.checked) {
            map.addLayer(busStops);
        } else {
            map.removeLayer(busStops);
        }
    });

    layerParksCheckbox.addEventListener('change', (e) => {
        if (e.target.checked) {
            map.addLayer(parks);
        } else {
            map.removeLayer(parks);
        }
    });

    // Load all data
    loadBikePaths();
    loadBusStops();
    loadParks();
})();
