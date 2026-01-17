// Madison Explorer Map
// Uses sample data representing real Madison, WI locations
(function() {
    const layerBikesCheckbox = document.getElementById('layer-bikes');
    const layerBusesCheckbox = document.getElementById('layer-buses');
    const layerParksCheckbox = document.getElementById('layer-parks');

    // Hide loading indicator - we're using embedded data
    document.getElementById('loading').style.display = 'none';

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

    // Style definitions
    const styles = {
        bikes: {
            color: '#2ecc71',
            weight: 3,
            opacity: 0.8
        },
        buses: {
            radius: 6,
            fillColor: '#3498db',
            color: '#2980b9',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        },
        parks: {
            fillColor: '#27ae60',
            color: '#1e8449',
            weight: 2,
            opacity: 0.8,
            fillOpacity: 0.35
        }
    };

    // Sample bike paths (approximating real Madison bike infrastructure)
    const bikePathData = [
        {
            name: 'Capital City Trail (East)',
            coords: [[43.0891, -89.3508], [43.0831, -89.3608], [43.0771, -89.3708], [43.0731, -89.3808]]
        },
        {
            name: 'Capital City Trail (South)',
            coords: [[43.0731, -89.3808], [43.0651, -89.3858], [43.0571, -89.3908], [43.0491, -89.4008]]
        },
        {
            name: 'Southwest Commuter Path',
            coords: [[43.0731, -89.4012], [43.0651, -89.4112], [43.0571, -89.4212], [43.0491, -89.4312], [43.0411, -89.4412]]
        },
        {
            name: 'Lakeshore Path',
            coords: [[43.0781, -89.3958], [43.0801, -89.4058], [43.0791, -89.4158], [43.0761, -89.4258]]
        },
        {
            name: 'Campus Drive Path',
            coords: [[43.0761, -89.4258], [43.0711, -89.4308], [43.0661, -89.4358], [43.0611, -89.4408]]
        },
        {
            name: 'East Campus Mall',
            coords: [[43.0761, -89.3958], [43.0731, -89.3958], [43.0701, -89.3958]]
        },
        {
            name: 'State Street (Pedestrian/Bike)',
            coords: [[43.0746, -89.3840], [43.0746, -89.3920], [43.0746, -89.4000]]
        },
        {
            name: 'John Nolen Path',
            coords: [[43.0631, -89.3808], [43.0551, -89.3858], [43.0471, -89.3908], [43.0391, -89.3958]]
        }
    ];

    // Sample bus stops (major Metro Transit locations)
    const busStopData = [
        { name: 'Capitol Square North', lat: 43.0752, lng: -89.3840 },
        { name: 'Capitol Square South', lat: 43.0720, lng: -89.3840 },
        { name: 'State St & Lake St', lat: 43.0746, lng: -89.3920 },
        { name: 'Library Mall', lat: 43.0746, lng: -89.4000 },
        { name: 'Memorial Union', lat: 43.0766, lng: -89.4000 },
        { name: 'Camp Randall Stadium', lat: 43.0700, lng: -89.4130 },
        { name: 'University Hospital', lat: 43.0770, lng: -89.4290 },
        { name: 'West Transfer Point', lat: 43.0630, lng: -89.4700 },
        { name: 'East Transfer Point', lat: 43.0890, lng: -89.3190 },
        { name: 'North Transfer Point', lat: 43.1130, lng: -89.3630 },
        { name: 'South Transfer Point', lat: 43.0280, lng: -89.3970 },
        { name: 'Hilldale Mall', lat: 43.0730, lng: -89.4500 },
        { name: 'East Towne Mall', lat: 43.0940, lng: -89.2940 },
        { name: 'West Towne Mall', lat: 43.0540, lng: -89.4950 },
        { name: 'Monona Terrace', lat: 43.0710, lng: -89.3780 },
        { name: 'Overture Center', lat: 43.0740, lng: -89.3880 },
        { name: 'Union South', lat: 43.0710, lng: -89.4080 },
        { name: 'Engineering Hall', lat: 43.0720, lng: -89.4120 },
        { name: 'Bascom Hall', lat: 43.0755, lng: -89.4050 },
        { name: 'Willy St Co-op', lat: 43.0820, lng: -89.3680 }
    ];

    // Sample parks (real Madison parks with approximate boundaries)
    const parkData = [
        {
            name: 'James Madison Park',
            coords: [[43.0803, -89.3818], [43.0823, -89.3778], [43.0793, -89.3758], [43.0773, -89.3798]]
        },
        {
            name: 'Tenney Park',
            coords: [[43.0883, -89.3668], [43.0913, -89.3608], [43.0873, -89.3568], [43.0843, -89.3628]]
        },
        {
            name: 'Olin Park',
            coords: [[43.0541, -89.3798], [43.0581, -89.3738], [43.0541, -89.3678], [43.0501, -89.3738]]
        },
        {
            name: 'Vilas Park',
            coords: [[43.0541, -89.4108], [43.0591, -89.4028], [43.0541, -89.3948], [43.0491, -89.4028]]
        },
        {
            name: 'Henry Vilas Zoo',
            coords: [[43.0571, -89.4198], [43.0601, -89.4148], [43.0571, -89.4098], [43.0541, -89.4148]]
        },
        {
            name: 'Hoyt Park',
            coords: [[43.0671, -89.4498], [43.0711, -89.4438], [43.0671, -89.4378], [43.0631, -89.4438]]
        },
        {
            name: 'Owen Conservation Park',
            coords: [[43.0831, -89.4598], [43.0891, -89.4518], [43.0831, -89.4438], [43.0771, -89.4518]]
        },
        {
            name: 'Warner Park',
            coords: [[43.1181, -89.3498], [43.1231, -89.3418], [43.1181, -89.3338], [43.1131, -89.3418]]
        },
        {
            name: 'Olbrich Park',
            coords: [[43.0891, -89.3298], [43.0931, -89.3238], [43.0891, -89.3178], [43.0851, -89.3238]]
        },
        {
            name: 'Brittingham Park',
            coords: [[43.0611, -89.3938], [43.0641, -89.3898], [43.0611, -89.3858], [43.0581, -89.3898]]
        },
        {
            name: 'Law Park',
            coords: [[43.0711, -89.3818], [43.0731, -89.3788], [43.0711, -89.3758], [43.0691, -89.3788]]
        }
    ];

    // Add bike paths
    bikePathData.forEach(path => {
        L.polyline(path.coords, styles.bikes)
            .bindPopup(`<strong>${path.name}</strong>`)
            .addTo(bikePaths);
    });

    // Add bus stops
    busStopData.forEach(stop => {
        L.circleMarker([stop.lat, stop.lng], styles.buses)
            .bindPopup(`<strong>${stop.name}</strong><br>Metro Transit`)
            .addTo(busStops);
    });

    // Add parks
    parkData.forEach(park => {
        L.polygon(park.coords, styles.parks)
            .bindPopup(`<strong>${park.name}</strong>`)
            .addTo(parks);
    });

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
})();
