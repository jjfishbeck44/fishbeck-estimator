const geocode = require('../lib/geocode');

describe('haversineMiles', () => {
  test('zero distance for identical points', () => {
    expect(geocode.haversineMiles(44.95, -93.09, 44.95, -93.09)).toBe(0);
  });
  test('St. Paul to Minneapolis is roughly 9–11 miles straight line', () => {
    const d = geocode.haversineMiles(44.9537, -93.0900, 44.9778, -93.2650);
    expect(d).toBeGreaterThan(7);
    expect(d).toBeLessThan(13);
  });
});

describe('getDistanceMiles (mocked Nominatim)', () => {
  afterEach(() => { delete global.fetch; });

  test('returns road-adjusted miles and display name', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ([{ lat: '44.8408', lon: '-93.2983', display_name: 'Bloomington, MN' }])
    });
    const r = await geocode.getDistanceMiles('Bloomington, MN');
    expect(r.displayName).toBe('Bloomington, MN');
    expect(typeof r.miles).toBe('number');
    expect(r.miles).toBeGreaterThan(0);
  });

  test('empty result throws not_found', async () => {
    global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ([]) });
    await expect(geocode.getDistanceMiles('nowhere xyz')).rejects.toThrow('not_found');
  });

  test('network failure throws geocode_failed', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('boom'));
    await expect(geocode.getDistanceMiles('123 Main St')).rejects.toThrow('geocode_failed');
  });
});
