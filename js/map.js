const NAMEFIELD = "name";
const YEARFIELD = "year";
const COMPOSITIONFIELD = "composition";
const MASSFIELD = "mass";
const COUNTRYFIELD = "country_name";
const DEFAULTFIELD = NAMEFIELD;
const DEFAULTVALUE = "";
const COUNTRYNAME = "country_name";
const SUMMARY_TABLE_ID = "summary-table";
const DETAILED_TABLE_ID = "detailed-table";

const summaryTableStructure = {
  headers: ["Total strikes", "Average mass"],
  headerDefinitions: [
    "Total number of meteorite landings that are within the search criteria",
    "The calculated average mass of the meteorite landings within the search criteria",
  ],
};

const detailedTableStructure = {
  headers: ["Name", "Year", "Mass (g)", "Composition", "Found", "Country"],
  headerFields: ["name", "year", "mass (g)", "class", "fall", "country_name"],
  headerDefinitions: [
    "The name given to the identified meteorite",
    "The year that the meteorite was observed",
    "The recorded mass in grams of the meteorite",
    "The known classification / composition of the meteorite",
    "Whether the physical meteorite has been found or observed to have fallen somewhere",
    "The country where the meteorite was found or observed to have fallen",
  ],
};

const countries = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Angola",
  "Antarctica",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bangladesh",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bermuda",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Central African Republic",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czech Republic",
  "Democratic Republic of the Congo",
  "Denmark",
  "Djibouti",
  "Dominican Republic",
  "East Timor",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Equatorial Guinea",
  "Eritrea",
  "Estonia",
  "Ethiopia",
  "Falkland Islands",
  "Fiji",
  "Finland",
  "France",
  "French Guiana",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Greenland",
  "Guatemala",
  "Guinea",
  "Guinea Bissau",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Ivory Coast",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kosovo",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Lithuania",
  "Luxembourg",
  "Macedonia",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Mali",
  "Malta",
  "Mauritania",
  "Mexico",
  "Moldova",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nepal",
  "Netherlands",
  "New Caledonia",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "Northern Cyprus",
  "Norway",
  "Oman",
  "Pakistan",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Puerto Rico",
  "Qatar",
  "Republic of Serbia",
  "Republic of the Congo",
  "Romania",
  "Russia",
  "Rwanda",
  "Saudi Arabia",
  "Senegal",
  "Sierra Leone",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "Somaliland",
  "South Africa",
  "South Korea",
  "South Sudan",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Swaziland",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Thailand",
  "The Bahamas",
  "Togo",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United Republic of Tanzania",
  "United States of America",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Venezuela",
  "Vietnam",
  "West Bank",
  "Western Sahara",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];

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
  center: [41.14, -100.98],
  zoom: 4,
  minZoom: 3,
  maxZoom: 15,
  maxBounds: bounds,
  maxBoundsViscosity: 0.5,
});

// Add OSM basemap tiles
let layer = new L.TileLayer(
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  {
    maxZoom: 20,
    attribution:
      '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
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

let myRenderer = L.canvas({ padding: 0.5 });
let dataLayer;
let defaultState = true;

//Added GeoLocation
const geolocationOptions = {
  strings: {
    title: "Click here to zoom into my location",
  },
  showPopup: false,
  drawCircle: false,
};
let locateControl = L.control.locate(geolocationOptions).addTo(map);

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
  if (targetValue === "") {
    return true;
  } else if (feature.properties.country_name) {
    return (
      feature.properties.country_name.toLowerCase() ===
      targetValue.toLowerCase()
    );
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

  let geojson = dataLayer.toGeoJSON();

  if (!geojson.features.length) {
    warningElement.innerHTML =
      "Search filter yielded zero results. Please update the filter and try again.";
  } else {
    warningElement.innerHTML = "";
  }

  generateSummaryTable(
    SUMMARY_TABLE_ID,
    summaryTableStructure,
    geojson.features
  );
  generateTable(DETAILED_TABLE_ID, detailedTableStructure, geojson.features);

  return dataLayer;
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
    let layer = generateMap();
    map.fitBounds(layer.getBounds());

    searchbox.clear();
    searchbox.hide();
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
  warningElement.innerHTML = "";

  if (!defaultState) {
    dataLayer.clearLayers();
    generateMap();
    defaultState = true;
  }
}

function updateSearchField(e) {
  currentFilter = getMatchingFilter(selector.value);
  resetSettings();
  searchbox.clear();
  searchbox.hide();
}

function resetSearch(e) {
  currentFilter = DEFAULTFILTER;
  selector.value = DEFAULTFIELD;
  resetSettings();
}

generateMap();
let data0 = document
  .getElementById("search-btn")
  .addEventListener("click", updateSearch);
let data1 = searchInputElement
  .addEventListener("keyup", (e) => {
    if (e.key === 'Enter') {
      updateSearch(e);
    }
  });
let data2 = document
  .getElementById("reset-btn")
  .addEventListener("click", (e) => {
    resetSearch(e);
    searchbox.clear();
    searchbox.hide();
  });
let data3 = document
  .getElementById("nav__fieldSelect")
  .addEventListener("change", updateSearchField);

//In map search bar with search glass
var searchbox = L.control
  .searchbox({
    id: "country-searchbox",
    position: "topright",
    expand: "left",
  })
  .addTo(map);
document.getElementById("country-searchbox").setAttribute("title", "Filter dataset by country name");

function generateSummaryTable(tableId, tableStructure, inputData) {
  let table = document.getElementById(tableId);

  // Clear existing table
  while (table.firstChild) {
    table.removeChild(table.firstChild);
  }

  // Create table header
  let headerRow = document.createElement("tr");
  for (let i = 0; i < tableStructure.headers.length; i++) {
    let th = document.createElement("th");
    headerRow.appendChild(th);
    th.innerHTML =
      tableStructure.headers[i] +
      `<button class="info-button" id="info${i}" title="${tableStructure.headerDefinitions[i]}">i</button>`;

  }
  table.appendChild(headerRow);

  // Create summary statistics rows
  let row = document.createElement("tr");

  // Total number of strikes
  let cell = document.createElement("td");
  cell.innerHTML = inputData.length;
  row.appendChild(cell);

  // Total number of strikes
  cell = document.createElement("td");
  const averageMass =
    inputData.reduce(function (accrual, object) {
      return accrual + object["properties"]["mass (g)"];
    }, 0) / inputData.length;
  cell.innerHTML = averageMass.toFixed(2);
  row.appendChild(cell);

  table.appendChild(row);

  // Histogram of strikes by year
  let yearArray = inputData.map((data) => data.properties.year);

  let traceYear = {
    x: yearArray,
    type: "histogram",
    marker: {
      color: "#002d71",
    },
    nbinsx: 404,
  };
  let dataYear = [traceYear];
  let layoutYear = {
    title: "Meteorite landings by year (histogram)",
    font: {
      family: "Montserrat",
      size: 10,
    },
    width: document.getElementById("histogram-year").clientWidth * 0.98,
    height: document.getElementById("histogram-year").clientHeigth,
    xaxis: {
      title: "Year",
      titlefont: {
        family: "Arial, sans-serif",
        color: "grey",
      },
      range: [1800, 2020],
    },
    yaxis: {
      title: "# Meteorites",
      titlefont: {
        family: "Arial, sans-serif",
        color: "grey",
      },
    },
  };
  let config = { responsive: true };
  Plotly.newPlot("histogram-year", dataYear, layoutYear, config);

  // Histogram of strikes by composition
  let classArray = inputData.map((data) => data.properties.class);

  let traceClass = {
    x: classArray,
    type: "histogram",
    marker: {
      color: "#002d71",
    },
  };
  let dataClass = [traceClass];
  let layoutClass = {
    title: "Meteorite landings by class / composition (histogram)",
    font: {
      family: "Montserrat",
      size: 10,
    },
    width: document.getElementById("histogram-composition").clientWidth * 0.98,
    height: document.getElementById("histogram-composition").clientHeigth,
    xaxis: {
      title: "Class (composition)",
      titlefont: {
        family: "Arial, sans-serif",
        color: "grey",
      },
    },
    yaxis: {
      title: "# Meteorites",
      titlefont: {
        family: "Arial, sans-serif",
        color: "grey",
      },
    },
  };

  Plotly.newPlot("histogram-composition", dataClass, layoutClass, config);
}

function generateTable(tableId, tableStructure, inputData) {
  let table = document.getElementById(tableId);

  // Clear existing table
  while (table.firstChild) {
    table.removeChild(table.firstChild);
  }

  // Create table header
  let headerRow = document.createElement("tr");
  for (let i = 0; i < tableStructure.headers.length; i++) {
    let th = document.createElement("th");
    headerRow.appendChild(th);
    th.innerHTML = 
      tableStructure.headers[i] +
      `<button class="info-button" id="info${i}" title="${tableStructure.headerDefinitions[i]}">i</button>`;
  }
  table.appendChild(headerRow);

  // Create table rows
  for (let i = 0; i < inputData.length; i++) {
    let row = document.createElement("tr");
    for (let j = 0; j < tableStructure.headerFields.length; j++) {
      let cell = document.createElement("td");
      cell.innerHTML = inputData[i].properties[tableStructure.headerFields[j]];
      row.appendChild(cell);
    }
    table.appendChild(row);
  }
}

let collapsible = document.getElementsByClassName("main__collapsible");

for (let i = 0; i < collapsible.length; i++) {
  collapsible[i].addEventListener("click", function () {
    this.classList.toggle("active-info");
    let content = this.nextElementSibling;
    if (content.style.display === "block") {
      content.style.display = "none";
      content.style.overflow = "hidden";
    } else {
      content.style.display = "block";
      content.style.overflow = "auto";
    }
  });
}

searchbox.onInput("keyup", function (e) {
  if (e.keyCode == 13) {
    let value = searchbox.getValue().toLowerCase();
    if (value != "") {
      let results = countries.filter((country) =>
        country.toLowerCase().includes(value)
      );
      searchbox.setValue(results[0]);
    }

    search();
  } else {
    let value = searchbox.getValue().toLowerCase();
    if (value != "") {
      let results = countries.filter((country) =>
        country.toLowerCase().includes(value)
      );
      searchbox.setItems(results.slice(0, 5));
    } else {
      searchbox.clearItems();
    }
  }
});

searchbox.onButton("click", search);
searchbox.onAutocomplete("click", search);

function search() {
  defaultState = true;
  resetSearch();
  
  currentFilter = countryFilter;
  searchInput = searchbox.getValue();
  selector.value = COUNTRYFIELD;
  searchInputElement.value = searchInput;
  dataLayer.clearLayers();
  let layer = generateMap();
  map.fitBounds(layer.getBounds());

  defaultState = false;

  setTimeout(function () {
    searchbox.hide();
    searchbox.clearItems();
    // searchbox.clear();
  }, 600);
}