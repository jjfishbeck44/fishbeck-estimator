// lib/geocode.js
// Address → coordinates (OpenStreetMap Nominatim, no API key) and straight-line
// distance from St. Paul, MN scaled by a road factor. Fails with typed errors.

// St. Paul, MN — origin for travel distance.
const ORIGIN = { lat: 44.9537, lon: -93.0900 };
// Straight-line miles underestimate driving distance; ~1.3 is a common road factor.
const ROAD_FACTOR = 1.3;
const EARTH_RADIUS_MI = 3958.8;

function toRad(deg) { return (deg * Math.PI) / 180; }

// Great-circle distance between two lat/lon points, in miles.
function haversineMiles(lat1, lon1, lat2, lon2) {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_MI * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Geocode a free-text address via Nominatim. Throws 'not_found' / 'geocode_failed'.
async function geocode(address) {
  const url = 'https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=us&q='
    + encodeURIComponent(address);
  let resp;
  try {
    resp = await fetch(url, {
      headers: {
        // Nominatim usage policy requires an identifying User-Agent.
        'User-Agent': 'FishbeckEstimator/1.0 (jimmy@fishbeckinnovations.com)',
        'Accept': 'application/json'
      }
    });
  } catch {
    throw new Error('geocode_failed');
  }
  if (!resp.ok) throw new Error('geocode_failed');

  let data;
  try { data = await resp.json(); } catch { throw new Error('geocode_failed'); }
  if (!Array.isArray(data) || data.length === 0) throw new Error('not_found');

  const hit = data[0];
  const lat = parseFloat(hit.lat);
  const lon = parseFloat(hit.lon);
  if (!isFinite(lat) || !isFinite(lon)) throw new Error('not_found');
  return { lat, lon, displayName: hit.display_name || address };
}

// Geocode an address and return road-adjusted distance (miles) from St. Paul.
async function getDistanceMiles(address) {
  const { lat, lon, displayName } = await geocode(address);
  const straight = haversineMiles(ORIGIN.lat, ORIGIN.lon, lat, lon);
  const miles = Math.round(straight * ROAD_FACTOR * 10) / 10;
  return { miles, displayName, lat, lon };
}

module.exports = { ORIGIN, ROAD_FACTOR, haversineMiles, geocode, getDistanceMiles };
