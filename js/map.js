const NAMEFIELD = "name";
const YEARFIELD = "year";
const COMPOSITIONFIELD = "composition";
const MASSFIELD = "mass";
const DEFAULTFIELD = NAMEFIELD;
const DEFAULTVALUE = "";
const COUNTRYNAME = "country_name"

const regex = new RegExp("^[0-9]+$");
const CURRENTYEAR = new Date().getFullYear();

const selector = document.getElementById("nav__fieldSelect");
const searchInputElement = document.getElementById("search-value");
const warningElement = document.getElementById("warning-display");

// Allow scroll
const corner1 = L.latLng(-90, -200);
const corner2 = L.latLng(90, 200);
const bounds = L.latLngBounds(corner1, corner2);

// Set use-canvas, zoom and map center options
const map = new L.map("map", {
  preferCanvas: true,
  center: [39.75, -104.98],
  zoom: 7,
  minZoom: 3,
  maxZoom: 16,
  maxBounds: bounds,
  maxBoundsViscosity: 0.5,
});

// Add OSM basemap tiles
let layer = new L.TileLayer(
  "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    maxZoom: 20,
    attribution:
      '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
  }
);
layer.addTo(map);

let legend = L.control({ position: "bottomleft" });

legend.onAdd = function (map) {
  let div = L.DomUtil.create("div", "legend");
  div.innerHTML += "<p>Mass of meteorite (g)</p>";
  div.innerHTML += '<div class="legend__row">';
  div.innerHTML += '<div class="legend__inline">< 1g</div>';
  div.innerHTML +=
    '<div class="legend__inline"><div class="legend__circle --size1"></div></div>';
  div.innerHTML +=
    '<div class="legend__inline"><div class="legend__circle --size2"></div></div>';
  div.innerHTML +=
    '<div class="legend__inline"><div class="legend__circle --size3"></div></div>';
  div.innerHTML +=
    '<div class="legend__inline"><div class="legend__circle --size4"></div></div>';
  div.innerHTML += '<div class="legend__inline">100000g ></div>';
  div.innerHTML += "</div>";

  return div;
};
legend.addTo(map);

legend.addTo(map);

let myRenderer = L.canvas({ padding: 0.5 });
let dataLayer;
let defaultState = true;

//Added GeoLocation
L.control.locate().addTo(map);

// Draw markers onto canvas and style with red based on mass of meteorite -- needs size legend
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

function nameFilter(feature, targetValue) {
  if (targetValue === "") {
    return true;
  } else {
    return feature.properties.name.toLowerCase().includes(targetValue);
  }
}

function yearFilter(feature, targetValue) {
  if (targetValue === "") {
    return true;
  } else {
    return feature.properties.year === Number(targetValue);
  }
}

function compositionFilter(feature, targetValue) {
  if (targetValue === "") {
    return true;
  } else {
    return feature.properties.class.toLowerCase().includes(targetValue);
  }
}

function massFilter(feature, targetValue) {
  if (targetValue === "") {
    return true;
  } else {
    return feature.properties["mass (g)"] > Number(targetValue);
  }
}

function countryFilter(feature, targetValue) {
  console.log("Feature Country Name:", feature.properties.country_name);
  console.log("Target Value:", targetValue);

  if (targetValue === "") {
    return true;
  } else if (feature.properties.country_name) {
    return feature.properties.country_name.toLowerCase() === targetValue.toLowerCase();
  } else {
    // Handle the case where feature.properties.country_name is null or undefined
    return false;
  }
}




const DEFAULTFILTER = nameFilter;
let currentFilter = DEFAULTFILTER;
let searchInput = DEFAULTVALUE;

// Draw data points onto canvas tiles and bind pop-up info
function generateMap() {
  dataLayer = L.geoJson(meteoriteData, {
    filter: coordinateFilter,
    onEachFeature: function (feature, layer) {
      if (currentFilter(feature, searchInput)) {
        layer.bindPopup(
          `
                    <div class="map__popup--active">
                        <div class="map__popupRow">
                            <div class="map__popupItem map__popupTitle">Name</div>
                            <div class="map__popupValue">${feature.properties.name}</div>
                        </div>
                        <div class="map__popupRow">
                            <div class="map__popupItem map__popupField">Class</div>
                            <div class="map__popupValue">${feature.properties.class}</div>
                        </div>
                        <div class="map__popupRow">
                            <div class="map__popupItem map__popupField">Mass (g)</div>
                            <div class="map__popupValue">${feature.properties["mass (g)"]}</div>
                        </div>
                        <div class="map__popupRow">
                            <div class="map__popupItem map__popupField">Year</div>
                            <div class="map__popupValue">${feature.properties.year}</div>
                        </div>
                        <div class="map__popupRow">
                            <div class="map__popupItem map__popupField">Country</div>
                            <div class="map__popupValue">${feature.properties.country_name}</div>
                        </div>
                    </div>
                `,
          {}
        );

        layer.bindTooltip(`${feature.properties.name}`, {
          direction: "top",
        });
      }
    },
    pointToLayer: function (feature, latlng) {
      if (currentFilter(feature, searchInput)) {
        return L.circleMarker(latlng, {
          renderer: myRenderer,
          radius: calculateRadius(feature.properties["mass (g)"]),
          fillColor: "#294baf",
          color: "#0f52ba",
        });
      }
    },
  }).addTo(map);
}

function updateSearch(e) {
  if (searchInput != searchInputElement.value.toLowerCase()) {
    searchInput = searchInputElement.value.toLowerCase();
    if (searchInput !== "") {
      if (
        (selector.value == YEARFIELD || selector.value == MASSFIELD) &&
        !regex.test(searchInput)
      ) {
        warningElement.innerHTML =
          "Please enter a number for the Year or Mass filters. Try again";
        return;
      } else if (
        selector.value == YEARFIELD &&
        Number(searchInput) > CURRENTYEAR
      ) {
        warningElement.innerHTML =
          "Please use input a year value that is current or in the past. Try again";
        return;
      } else if (warningElement.innerHTML !== "") {
        warningElement.innerHTML = "";
      }
    }

    defaultState = searchInput === "";

    dataLayer.clearLayers();
    generateMap();
  }
}

function getMatchingFilter(text) {
  switch (text) {
    case NAMEFIELD:
      return nameFilter;
    case YEARFIELD:
      return yearFilter;
    case COMPOSITIONFIELD:
      return compositionFilter;
    case COUNTRYNAME:
      return countryFilter;
    default:
      return massFilter;
  }
}

function resetSettings() {
  searchInput = DEFAULTVALUE;
  searchInputElement.value = DEFAULTVALUE;

  if (!defaultState) {
    dataLayer.clearLayers();
    generateMap();
    defaultState = true;
  }
}

function updateSearchField(e) {
  currentFilter = getMatchingFilter(selector.value);
  resetSettings();
}

function resetSearch(e) {
  currentFilter = DEFAULTFILTER;
  selector.value = DEFAULTFIELD;
  resetSettings();
}

generateMap(currentFilter);
let data0 = document
  .getElementById("search-btn")
  .addEventListener("click", updateSearch);
let data1 = document
  .getElementById("reset-btn")
  .addEventListener("click", resetSearch);
let data2 = document
  .getElementById("nav__fieldSelect")
  .addEventListener("change", updateSearchField);


//In map search bar with search glass
var searchbox = L.control
  .searchbox({
    position: "topright",
    expand: "left",
  })
  .addTo(map);
