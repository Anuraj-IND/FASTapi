let map;
let marker;
let circle;
let watchId;

function initMap() {
    // Create map with default center (India)
    map = L.map('map').setView([20.5937, 78.9629], 12);

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);

    // Get user's location with high accuracy
    if (navigator.geolocation) {
        // Show loading message
        document.getElementById('location-info').innerHTML = 
            "Getting your precise location... Please wait.";

        // Watch position instead of getting it once
        watchId = navigator.geolocation.watchPosition(
            (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;
                const accuracy = position.coords.accuracy;

                // Only update if accuracy is good (less than 100 meters)
                if (accuracy <= 100) {
                    // Stop watching once we get accurate position
                    navigator.geolocation.clearWatch(watchId);
                    
                    // Update location info with accuracy
                    document.getElementById('location-info').innerHTML = 
                        `Your location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}<br>
                         Accuracy: ±${Math.round(accuracy)} meters`;

                    // Remove existing marker and circle if they exist
                    if (marker) map.removeLayer(marker);
                    if (circle) map.removeLayer(circle);

                    // Create a custom icon
                    const customIcon = L.divIcon({
                        className: 'custom-marker',
                        html: `<div style="
                            background-color: #4285F4;
                            border: 2px solid white;
                            border-radius: 50%;
                            width: 16px;
                            height: 16px;
                            box-shadow: 0 0 3px rgba(0,0,0,0.3);
                        "></div>`
                    });

                    // Add marker
                    marker = L.marker([latitude, longitude], {
                        icon: customIcon
                    }).addTo(map);

                    // Add popup with detailed info
                    marker.bindPopup(
                        `<b>Your Location</b><br>
                         Latitude: ${latitude.toFixed(6)}<br>
                         Longitude: ${longitude.toFixed(6)}<br>
                         Accuracy: ±${Math.round(accuracy)}m`
                    ).openPopup();

                    // Add accuracy circle
                    circle = L.circle([latitude, longitude], {
                        radius: accuracy,
                        color: '#4285F4',
                        fillColor: '#4285F4',
                        fillOpacity: 0.1,
                        weight: 1
                    }).addTo(map);

                    // Center map on user's location with appropriate zoom
                    map.setView([latitude, longitude], 18);
                } else {
                    document.getElementById('location-info').innerHTML = 
                        `Improving location accuracy... Current accuracy: ±${Math.round(accuracy)}m`;
                }
            },
            (error) => {
                handleLocationError(error);
                navigator.geolocation.clearWatch(watchId);
            },
            {
                enableHighAccuracy: true,  // Force high accuracy (GPS)
                timeout: 30000,           // Wait up to 30 seconds
                maximumAge: 0             // Force fresh location
            }
        );

        // Timeout after 30 seconds if high accuracy location not found
        setTimeout(() => {
            if (watchId) {
                navigator.geolocation.clearWatch(watchId);
                document.getElementById('location-info').innerHTML += 
                    "<br>Could not get high-accuracy location. Please ensure GPS is enabled.";
            }
        }, 30000);

    } else {
        handleLocationError("Geolocation is not supported by this browser.");
    }
}

function handleLocationError(error) {
    const locationInfo = document.getElementById('location-info');
    
    if (error.code) {
        switch(error.code) {
            case error.PERMISSION_DENIED:
                locationInfo.innerHTML = "Location access was denied. Please enable location services in your browser and device settings.";
                break;
            case error.POSITION_UNAVAILABLE:
                locationInfo.innerHTML = "Location information is unavailable. Please ensure GPS is enabled on your device.";
                break;
            case error.TIMEOUT:
                locationInfo.innerHTML = "Location request timed out. Please try again and ensure GPS is enabled.";
                break;
            default:
                locationInfo.innerHTML = "An unknown error occurred. Please ensure GPS is enabled and you're outdoors.";
        }
    } else {
        locationInfo.innerHTML = error;
    }
}

// Initialize map when page loads
window.onload = initMap;