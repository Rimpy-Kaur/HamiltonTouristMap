let map;
let markers = [];
let userMarker = null;

const locations = [
    {name: "Bayfront Park", type: "park",  position: {lat: 43.270956, lng: -79.871727}},
    { name: "Gage Park", type: "park", position: { lat: 43.246178, lng: -79.829041 } },
    { name: "Albion Falls", type: "waterfall", position: { lat: 43.201275, lng: -79.820215 } },
    { name: "Webster's Falls", type: "waterfall", position: { lat: 43.289455, lng: -79.976230 } },
    { name: "Royal Botanical Gardens", type: "park", position: { lat: 43.290480, lng: -79.901143} },
    { name: "Hamilton Museum of Steam", type: "museum", position: { lat: 43.265133, lng: -79.774428 } },
    { name: "Art Gallery of Hamilton", type: "museum", position: { lat: 43.261205, lng: -79.872171 } },
    { name: "Tiffany Falls", type: "waterfall", position: { lat: 43.247750, lng: -79.959896 } },
    { name: "Battlefield Park", type: "park", position: { lat: 43.219972, lng: -79.766620 } },
    { name: "Dundurn Castle", type: "museum", position: { lat: 43.273875, lng: -79.884906 } },
];

function addMarkers(data){
    data.forEach(loc => {
        const marker = new google.maps.Marker({
            position: loc.position,
            map,
            title: loc.name,
        });
        const infoWindow = new google.maps.InfoWindow({
            content: `<b>${loc.name}</b><br>Type: ${loc.type}<br>
            <a href="https://www.google.com/maps/dir/?api=1&destination=${loc.position.lat},${loc.position.lng}" target="_blank">Get Directions</a>`,
        });
        marker.addListener("click", () => infoWindow.open(map, marker));
        marker.type = loc.type;
        markers.push(marker);
    });
}

// call addMarkers inside initMap to ensure markers are added after the map is initialized

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 43.2557, lng: -79.8711 },
        zoom: 12,
    });
    addMarkers(locations);
    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const type = btn.dataset.type;
            markers.forEach(marker => {
                marker.setVisible(type === "all" || marker.type === type);
            });
        });
    });
    
    // Add dropdowns and a button for directions
    const directionsContainer = document.createElement("div");
    directionsContainer.className = "container my-3 text-center";
    directionsContainer.innerHTML = `
        <h5>Get Directions from Your Location</h5>
        <select id="destinationSelect" class="form-select d-inline-block w-auto">
        <option value="">Select a Destination</option>
        ${markers.map(marker => `<option value="${marker.getPosition().lat()},${marker.getPosition().lng()}">${marker.getTitle()}</option>`).join("")}
        </select>
        <button id="getDirectionBtn" class="btn btn-primary m-2">Get Directions</button>
    `;
    document.body.appendChild(directionsContainer);

    document.getElementById("getDirectionBtn").addEventListener("click", () => {
        if(!userMarker){
            alert("Please locate your position first.");
            return;
        }
        const destCoords = document.getElementById("destinationSelect").value;
        if(!destCoords){
            alert("Please select a destination.");
            return;
        }
        const [lat, lng] = destCoords.split(",");
        window.open(`https://www.google.com/maps/dir/?api=1&origin=${userMarker.getPosition().lat()},${userMarker.getPosition().lng()}&destination=${lat},${lng}`, "_blank");
    });
}

function locateUser() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
            const position = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            if (userMarker) {
                userMarker.setMap(null);
            }
            userMarker = new google.maps.Marker({
                position,
                map,
                title: "You are here",
                icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
            });
            map.panTo(position);
        });
    } else{
        alert("Geolocation is not supported by this browser.");
    }
}

document.getElementById("locateMeBtn").addEventListener("click", locateUser);

document.getElementById("addPlaceBtn").addEventListener("click", () => {
    const name = document.getElementById("placeName").value;
    const address = document.getElementById("placeAddress").value;
    const type = document.getElementById("placeType").value;

    if( !name || !address ){
        alert("Please provide both name and address.");
        return;
    }

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
        if (status === "OK"){
            const marker = new google.maps.Marker({
                map,
                position: results[0].geometry.location,
                title: name,
            });
            const infoWindow = new google.maps.InfoWindow({
                content: `<b>${name}</b><br>Type: ${type}<br>
                 <a href="https://www.google.com/maps/dir/?api=1&destination=${results[0].geometry.location.lat()},${results[0].geometry.location.lng()}" 
         target="_blank">Get Directions</a></br>`
            });
            marker.addListener("click", () => infoWindow.open(map, marker));
            marker.type = type;
            markers.push(marker);

            map.panTo(results[0].geometry.location);

            // Add a new marker to dropdown
            const destinationSelect = document.getElementById("destinationSelect");
            const option = document.createElement("option");
            option.value = `${results[0].geometry.location.lat()},${results[0].geometry.location.lng()}`;
            option.text = name;
            destinationSelect.appendChild(option);

        // Clear input fields
        document.getElementById("placeName").value = "";
        document.getElementById("placeAddress").value = "";
        document.getElementById("placeType").value = "park";
        } else{
            alert("Geocode was not successful for the following reason: " + status);
        }
    });
});
