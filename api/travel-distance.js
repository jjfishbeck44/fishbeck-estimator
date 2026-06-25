// api/travel-distance.js
// POST /api/travel-distance  { address }  ->  { miles, displayName }
// Geocodes via OpenStreetMap and returns road-adjusted distance from St. Paul.

const { checkRateLimit } = require('../lib/ratelimit');
const { getDistanceMiles } = require('../lib/geocode');

const MAX_ADDRESS_LENGTH = 200;

module.exports = async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'method_not_allowed' });

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ?? 'unknown';
  const { allowed } = await checkRateLimit(ip);
  if (!allowed) {
    return res.status(429).json({ error: 'rate_limited', message: 'Too many requests. Please try again in a minute.' });
  }

  const address = req.body?.address;
  if (!address || typeof address !== 'string' || address.trim().length === 0) {
    return res.status(400).json({ error: 'missing_address', message: 'Please enter a property address.' });
  }
  if (address.length > MAX_ADDRESS_LENGTH) {
    return res.status(400).json({ error: 'address_too_long', message: 'That address is too long.' });
  }

  try {
    const { miles, displayName } = await getDistanceMiles(address.trim());
    return res.status(200).json({ miles, displayName });
  } catch (err) {
    if (err.message === 'not_found') {
      return res.status(404).json({ error: 'not_found', message: 'We couldn’t find that address. Try adding city and state.' });
    }
    return res.status(502).json({ error: 'geocode_failed', message: 'Address lookup is unavailable right now. Please try again.' });
  }
};
