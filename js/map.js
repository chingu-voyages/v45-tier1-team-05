// Allow scroll
const corner1 = L.latLng(-90, -200)
const corner2 = L.latLng(90, 200)
const bounds = L.latLngBounds(corner1, corner2)

// Set use-canvas, zoom and map center options
const map = new L.map('map', {
    preferCanvas: true,
    center: [39.75, -104.98],
    zoom: 7,
    minZoom: 3,
    maxZoom: 16,
    maxBounds: bounds,
    maxBoundsViscosity: 0.5
});

// Add OSM basemap tiles
let layer = new L.TileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 20,
	attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
});
layer.addTo(map);

var myRenderer = L.canvas({ padding: 0.5 });

// Draw markers onto canvas and style with red
function calculateRadius(mass) {
    if (mass > 100000) {
        return 20;
    } else if (mass > 10000) {
        return 15;
    } else if (mass > 1000) {
        return 10;
    } else if (mass > 100) {
        return 5;
    } else if (mass > 10) {
        return 3;
    } else if (mass > 1) {
        return 2;
    } else {
        return 1;
    }
}

// Filter out data points without valid lat/lng coordinates
function coordinateFilter(feature) {
    if (Array.isArray(feature.geometry.coordinates)) return true;
}

// Draw data points onto canvas tiles and bind pop-up info
let dataLayer = L.geoJson(meteoriteData, {
    filter: coordinateFilter,
    onEachFeature: function (feature, layer) {
        layer.bindPopup(`
            <ul id="info" style="list-style: none;>
                <li id="info-row"><strong>Name:</strong> ${feature.properties.name}</li>
                <li id="info-row"><strong>Class:</strong> ${feature.properties.class}</li>
                <li id="info-row"><strong>Mass (g):</strong> ${feature.properties["mass (g)"]}</li>
                <li id="info-row"><strong>Year:</strong> ${feature.properties.year}</li>
            </ul>
        `);
    },
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, {
            renderer: myRenderer,
            radius: calculateRadius(feature.properties["mass (g)"]),
            fillColor:"#ff0000",
            color: "#ff0000",
        });
    }
}).addTo(map);

// functionalize rendering
// trigger update of render at beginning
// re-render after search button is clicked // adjust zoom/center point
// 