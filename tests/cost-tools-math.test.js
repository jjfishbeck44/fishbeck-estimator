// Unit tests for the dollar-based calculator math modules (read pricing.js).
const toolRental = require('../public/js/calculators/tool-rental-math');
const snow = require('../public/js/calculators/snow-math');
const unitTurn = require('../public/js/calculators/unit-turn-math');
const repairReplace = require('../public/js/calculators/repair-replace-math');
const flip = require('../public/js/calculators/flip-math');
const diy = require('../public/js/calculators/diy-math');
const schedule = require('../public/js/calculators/schedule-math');
const pricing = require('../public/js/calculators/pricing');

describe('tool rental', () => {
  test('jackhammer 4 hours = rate × 4', () => {
    const r = toolRental.calculate({ toolKey: 'jackhammer', hours: 4 });
    expect(r.valid).toBe(true);
    expect(r.cost).toBe(pricing.toolRental.jackhammer.perHour * 4);
  });
  test('unknown tool or zero hours is invalid', () => {
    expect(toolRental.calculate({ toolKey: 'nope', hours: 2 }).valid).toBe(false);
    expect(toolRental.calculate({ toolKey: 'jackhammer', hours: 0 }).valid).toBe(false);
  });
});

describe('snow removal', () => {
  test('small driveway × 12 visits scales the season range', () => {
    const r = snow.calculate({ tierKey: 'driveway_small', visits: 12 });
    expect(r.seasonLow).toBe(pricing.snow.tiers.driveway_small.perVisit[0] * 12);
    expect(r.seasonHigh).toBe(pricing.snow.tiers.driveway_small.perVisit[1] * 12);
  });
  test('defaults to season visit count when omitted', () => {
    const r = snow.calculate({ tierKey: 'lot_small' });
    expect(r.visits).toBe(pricing.snow.defaultVisitsPerSeason);
  });
});

describe('unit turn', () => {
  test('2br multiplier applied to selected items', () => {
    const r = unitTurn.calculate({ size: '2br', items: ['full_paint', 'deep_clean'] });
    const m = pricing.unitTurn.sizeMultiplier['2br'];
    const expLow = Math.round(600 * m) + Math.round(200 * m);
    const expHigh = Math.round(1400 * m) + Math.round(450 * m);
    expect(r.low).toBe(expLow);
    expect(r.high).toBe(expHigh);
    expect(r.selected).toHaveLength(2);
  });
  test('no items selected = zero', () => {
    const r = unitTurn.calculate({ size: '1br', items: [] });
    expect(r.low).toBe(0); expect(r.high).toBe(0);
  });
});

describe('repair vs replace', () => {
  test('past service life recommends replace', () => {
    const r = repairReplace.calculate({ system: 'furnace', ageYears: 20, condition: 'fair' });
    expect(r.recommendation).toBe('replace');
    expect(r.percentOfLifeUsed).toBe(100);
  });
  test('young + good condition recommends repair', () => {
    const r = repairReplace.calculate({ system: 'roof', ageYears: 5, condition: 'good' });
    expect(r.recommendation).toBe('repair');
  });
  test('unknown system is invalid', () => {
    expect(repairReplace.calculate({ system: 'spaceship' }).valid).toBe(false);
  });
});

describe('fix-n-flip', () => {
  test('profit, ROI, and 70% rule', () => {
    const r = flip.calculate({ purchase: 200000, rehab: 50000, arv: 320000 });
    expect(r.sellingCost).toBe(Math.round(320000 * pricing.flip.sellingCostPct / 100));
    expect(r.holdingCost).toBe(Math.round(250000 * pricing.flip.holdingCostPct / 100));
    expect(r.profit).toBe(r.arv - r.totalInvested);
    expect(r.maxOffer70).toBe(Math.round(320000 * 0.7 - 50000));
  });
});

describe('DIY vs hire', () => {
  test('counts material + value of time vs pro quote', () => {
    const r = diy.calculate({ materialCost: 300, hours: 10, timeValuePerHour: 35, proQuote: 1200 });
    expect(r.timeCost).toBe(350);
    expect(r.diyTrueCost).toBe(650);
    expect(r.cashSavings).toBe(900);
    expect(r.trueSavings).toBe(550);
    expect(r.recommendation).toBe('DIY likely saves money');
  });
});

describe('project schedule', () => {
  test('sums selected service ranges and days', () => {
    const r = schedule.calculate({ serviceIds: ['paint', 'flooring'] });
    expect(r.low).toBe(600 + 900);
    expect(r.high).toBe(2000 + 3000);
    expect(r.days).toBe(4);
    expect(r.selected).toHaveLength(2);
  });
});
