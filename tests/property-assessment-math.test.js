const pa = require('../public/js/calculators/property-assessment-math');
const pricing = require('../public/js/calculators/pricing');

describe('property assessment math', () => {
  test('no travel charge inside the free radius', () => {
    expect(pa.travelCost(10)).toBe(0);
    expect(pa.travelCost(pricing.propertyAssessment.freeRadiusMiles)).toBe(0);
  });

  test('travel charge is round-trip beyond the free radius', () => {
    // 30 mi -> 15 billable x2 x $1.25 = $37.5 -> 38
    expect(pa.travelCost(30)).toBe(38);
  });

  test('total = base + travel + selected options', () => {
    const r = pa.calculate({ distanceMiles: 30, options: ['roof', 'report'] });
    expect(r.baseFee).toBe(pricing.propertyAssessment.baseFee);
    expect(r.travelCost).toBe(38);
    expect(r.optionsCost).toBe(60 + 90);
    expect(r.total).toBe(r.baseFee + 38 + 150);
    expect(r.selected).toHaveLength(2);
  });

  test('unknown options ignored; empty is just base fee at zero distance', () => {
    const r = pa.calculate({ distanceMiles: 0, options: ['nope'] });
    expect(r.optionsCost).toBe(0);
    expect(r.total).toBe(pricing.propertyAssessment.baseFee);
  });
});
