const LANDMARKS = [
  { name: "New York City, USA", lon: -74.006, lat: 40.7128, altitude: 1600 },
  { name: "London, UK", lon: -0.1278, lat: 51.5072, altitude: 1500 },
  { name: "Tokyo, Japan", lon: 139.6917, lat: 35.6895, altitude: 1500 },
  { name: "Paris, France", lon: 2.3522, lat: 48.8566, altitude: 1500 },
  { name: "Sydney, Australia", lon: 151.2093, lat: -33.8688, altitude: 1800 },
  { name: "Cape Town, South Africa", lon: 18.4241, lat: -33.9249, altitude: 1800 },
  { name: "Rio de Janeiro, Brazil", lon: -43.1729, lat: -22.9068, altitude: 1800 },
  { name: "Dubai, UAE", lon: 55.2708, lat: 25.2048, altitude: 1500 }
];

const statusEl = document.getElementById("status");
const citySelectEl = document.getElementById("city-select");
const buildingsToggleEl = document.getElementById("buildings-toggle");
const outerSpaceBtn = document.getElementById("outer-space-btn");
const streetLevelBtn = document.getElementById("street-level-btn");

function setStatus(message) {
  statusEl.textContent = message;
}

function populateCities() {
  LANDMARKS.forEach((city, idx) => {
    const option = document.createElement("option");
    option.value = String(idx);
    option.textContent = city.name;
    citySelectEl.append(option);
  });
}

if (!window.Cesium) {
  setStatus("Cesium failed to load. Please check network/CDN access.");
  throw new Error("Cesium is unavailable.");
}

const viewer = new Cesium.Viewer("viewer", {
  animation: false,
  baseLayerPicker: false,
  geocoder: false,
  timeline: false,
  navigationHelpButton: false,
  homeButton: true,
  sceneModePicker: false,
  infoBox: false,
  fullscreenButton: false,
  terrainProvider: new Cesium.EllipsoidTerrainProvider(),
  imageryProvider: new Cesium.OpenStreetMapImageryProvider({
    url: "https://tile.openstreetmap.org/",
    credit: "© OpenStreetMap contributors"
  }),
  requestRenderMode: true,
  maximumRenderTimeChange: Infinity,
  msaaSamples: 1
});

viewer.scene.globe.enableLighting = false;
viewer.scene.globe.depthTestAgainstTerrain = true;
viewer.scene.fog.enabled = false;
viewer.scene.skyAtmosphere.show = true;
viewer.scene.globe.tileCacheSize = 96;
viewer.scene.postProcessStages.fxaa.enabled = true;
viewer.scene.screenSpaceCameraController.inertiaSpin = 0.75;
viewer.scene.screenSpaceCameraController.inertiaTranslate = 0.75;
viewer.resolutionScale = 0.75;

let buildingsTileset = null;
function applyLiteMode() {
  viewer.scene.globe.enableLighting = false;
  viewer.scene.fog.enabled = false;
  viewer.scene.globe.tileCacheSize = 96;
  viewer.resolutionScale = 0.75;
  if (buildingsTileset) {
    buildingsTileset.show = false;
  }
  buildingsToggleEl.checked = false;
  buildingsToggleEl.disabled = true;
  buildingsToggleEl.title = "Lite mode is always on, so 3D buildings are disabled.";
  viewer.scene.requestRender();
}

async function enableTerrainIfAvailable() {
  try {
    const terrainProvider = await Cesium.createWorldTerrainAsync({
      requestVertexNormals: false,
      requestWaterMask: false
    });
    viewer.terrainProvider = terrainProvider;
    setStatus("Global terrain enabled. Lite mode is always on for performance.");
  } catch (error) {
    setStatus("Using lightweight terrain fallback. Lite mode is always on for performance.");
    console.warn(error);
  }
}

async function loadBuildingsLayer() {
  try {
    buildingsTileset = await Cesium.createOsmBuildingsAsync({
      enableShowOutline: false
    });
    viewer.scene.primitives.add(buildingsTileset);
    applyLiteMode();
    setStatus("Lite mode is active. 3D buildings are disabled for smoother performance.");
  } catch (error) {
    buildingsToggleEl.checked = false;
    buildingsToggleEl.disabled = true;
    setStatus("3D buildings unavailable in this environment; globe remains interactive.");
    console.error(error);
  }
}

function flyToLandmark(landmark, duration = 2.6) {
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(landmark.lon, landmark.lat, landmark.altitude),
    orientation: {
      heading: Cesium.Math.toRadians(20),
      pitch: Cesium.Math.toRadians(-35),
      roll: 0
    },
    duration
  });
  setStatus(`Flying to ${landmark.name}...`);
}

function flyToOuterSpace() {
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(8, 20, 22_000_000),
    orientation: {
      heading: 0,
      pitch: Cesium.Math.toRadians(-90),
      roll: 0
    },
    duration: 3
  });
  setStatus("Outer-space view.");
}

populateCities();
applyLiteMode();
enableTerrainIfAvailable();
loadBuildingsLayer();
flyToOuterSpace();

citySelectEl.addEventListener("change", (event) => {
  const idx = Number(event.target.value);
  if (!Number.isNaN(idx) && LANDMARKS[idx]) {
    flyToLandmark(LANDMARKS[idx]);
  }
});

outerSpaceBtn.addEventListener("click", () => {
  flyToOuterSpace();
});

streetLevelBtn.addEventListener("click", () => {
  const idx = Number(citySelectEl.value);
  const city = LANDMARKS[idx] || LANDMARKS[0];
  citySelectEl.value = String(LANDMARKS.indexOf(city));
  flyToLandmark({ ...city, altitude: 260 });
  setStatus(`Street-level view near ${city.name}.`);
});
