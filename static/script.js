let map;
let marker;
let circle;

function initMap() {
    // Create map with default center (India)
    map = L.map('map').setView([20.5937, 78.9629], 12);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    // Start getting location immediately
    getLocation();
    showGuidelines('flood'); // Show flood guidelines by default
}

function getLocation() {
    document.getElementById('location-info').innerHTML = 
        `<div class="alert info">Detecting your location...</div>`;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            handlePosition,
            handleError,
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    } else {
        handleError({ message: "Location services not available" });
    }
}

async function handlePosition(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    updateMapMarker(latitude, longitude);
    await checkSafetyStatus(latitude, longitude);
}

function updateMapMarker(latitude, longitude) {
    if (marker) map.removeLayer(marker);
    if (circle) map.removeLayer(circle);

    const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="
            background-color: var(--primary-color);
            border: 2px solid white;
            border-radius: 50%;
            width: 16px;
            height: 16px;
            box-shadow: 0 0 3px rgba(0,0,0,0.3);
        "></div>`
    });

    marker = L.marker([latitude, longitude], { icon: customIcon }).addTo(map);
    map.setView([latitude, longitude], 13);
}

async function checkSafetyStatus(latitude, longitude) {
    try {
        const response = await fetch(`/check-safety/${latitude}/${longitude}`);
        const data = await response.json();
        
        if (data.alerts && data.alerts.length > 0) {
            showMultipleAlerts(data.alerts);
            markAllSafeZones(data.alerts);
            showEvacuationRoutes(data.alerts);
        } else {
            document.getElementById('status-box').innerHTML = 
                `<div class="alert success">Your area is currently safe. Stay prepared!</div>`;
        }
    } catch (error) {
        console.error('Error checking safety status:', error);
    }
}

function showMultipleAlerts(alerts) {
    const statusBox = document.getElementById('status-box');
    let alertHtml = `
        <div class="multi-alert severe">
            <h2>⚠️ MULTIPLE DISASTERS DETECTED ⚠️</h2>
            <div class="alert-scroll">
    `;

    alerts.forEach(alert => {
        const alertColor = getAlertColor(alert.risk_level);
        alertHtml += `
            <div class="alert-item" style="border-left: 4px solid ${alertColor}">
                <h3>${alert.type.toUpperCase()} - ${alert.risk_level.toUpperCase()}</h3>
                <p>${alert.description}</p>
                <div class="safe-zones-list">
                    <strong>Nearest Safe Zones:</strong>
                    <ul>
                        ${alert.safe_zones.map(zone => 
                            `<li>📍 ${zone.name} (${zone.distance})</li>`
                        ).join('')}
                    </ul>
                </div>
            </div>
        `;
    });

    alertHtml += `
            </div>
            <div class="emergency-actions">
                <button onclick="showEvacuationMap()" class="action-button">
                    Show Evacuation Routes
                </button>
                <button onclick="showAllSafeZones()" class="action-button">
                    View All Safe Zones
                </button>
            </div>
        </div>
    `;

    statusBox.innerHTML = alertHtml;
}

function getAlertColor(riskLevel) {
    switch(riskLevel.toLowerCase()) {
        case 'severe': return '#dc3545';
        case 'high': return '#fd7e14';
        case 'moderate': return '#ffc107';
        default: return '#28a745';
    }
}

function markAllSafeZones(alerts) {
    // Clear existing markers
    if (window.safeZoneMarkers) {
        window.safeZoneMarkers.forEach(marker => map.removeLayer(marker));
    }
    window.safeZoneMarkers = [];

    alerts.forEach(alert => {
        alert.safe_zones.forEach(zone => {
            const marker = L.marker([zone.lat, zone.lon], {
                icon: L.divIcon({
                    className: 'safe-zone-marker',
                    html: `<div style="
                        background-color: #28a745;
                        border: 2px solid white;
                        border-radius: 50%;
                        width: 16px;
                        height: 16px;
                        box-shadow: 0 0 3px rgba(0,0,0,0.3);
                    "></div>`
                })
            })
            .bindPopup(`
                <b>Safe Zone: ${zone.name}</b><br>
                Distance: ${zone.distance}<br>
                Type: ${alert.type} shelter<br>
                <button onclick="navigateToSafeZone(${zone.lat}, ${zone.lon})" 
                    style="margin-top: 5px; padding: 5px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    Navigate Here
                </button>
            `)
            .addTo(map);
            
            window.safeZoneMarkers.push(marker);
        });
    });
}

function navigateToSafeZone(lat, lon) {
    // Open in Google Maps
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`, '_blank');
}

function showGuidelines(disasterType) {
    // Update active tab
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
        if (button.textContent.toLowerCase() === disasterType) {
            button.classList.add('active');
        }
    });

    // Fetch and display guidelines
    fetch(`/safety-guidelines/${disasterType}`)
        .then(response => response.json())
        .then(data => {
            const content = document.getElementById('guidelines-content');
            content.innerHTML = `
                <h3>Immediate Actions</h3>
                <ul>
                    ${data.immediate.map(item => `<li>${item}</li>`).join('')}
                </ul>
                <h3>Preparation</h3>
                <ul>
                    ${data.preparation.map(item => `<li>${item}</li>`).join('')}
                </ul>
            `;
        })
        .catch(error => {
            console.error('Error loading guidelines:', error);
        });
}

function handleError(error) {
    document.getElementById('location-info').innerHTML = 
        `<div class="alert error">
            Unable to get location. Please enable location services and refresh the page.
        </div>`;
}

// Initialize map when page loads
window.onload = initMap;