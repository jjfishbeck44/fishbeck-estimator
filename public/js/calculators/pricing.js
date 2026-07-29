// public/js/calculators/pricing.js
// ============================================================================
//  SINGLE SOURCE OF TRUTH FOR ALL DOLLAR-BASED CALCULATOR RATES
//  ⬇⬇⬇  EDIT THE NUMBERS BELOW — they are PLACEHOLDERS, not real quotes.  ⬇⬇⬇
//  Every range is [low, high] in US dollars unless noted. Update these to your
//  actual Twin Cities pricing; the calculators read straight from this file.
// ============================================================================
// UMD: browser global (window.FCalc.pricing) + CommonJS (Jest).

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else { root.FCalc = root.FCalc || {}; root.FCalc.pricing = factory(); }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  return {
    // --- Tool rental: dollars per hour (your equipment) ---
    toolRental: {
      paver_lifter:     { label: 'Paver lifter',     perHour: 75 },
      paint_sprayer:    { label: 'Paint sprayer',    perHour: 60 },
      floor_sander:     { label: 'Floor sander',     perHour: 65 },
      jackhammer:       { label: 'Jackhammer',       perHour: 55 },
      enclosed_trailer: { label: 'Enclosed trailer', perHour: 50 },
      utility_trailer:  { label: 'Utility trailer',  perHour: 35 }
    },

    // --- Snow removal: per-visit cost range by property tier ---
    snow: {
      tiers: {
        driveway_small: { label: 'Residential driveway (1–2 cars)', perVisit: [45, 75] },
        driveway_large: { label: 'Large/long driveway',            perVisit: [75, 130] },
        lot_small:      { label: 'Small lot (≤10 stalls)',         perVisit: [150, 300] },
        lot_large:      { label: 'Large lot (10+ stalls)',         perVisit: [300, 650] }
      },
      defaultVisitsPerSeason: 12   // typical Twin Cities plowable events
    },

    // --- Rental unit turn: base by unit size + per-item scope ranges ---
    unitTurn: {
      sizeMultiplier: { studio: 0.8, '1br': 1.0, '2br': 1.35, '3br': 1.7 },
      items: {
        full_paint:      { label: 'Full repaint (walls, ceilings, trim)', range: [600, 1400] },
        deep_clean:      { label: 'Deep clean',                           range: [200, 450] },
        lvp_flooring:    { label: 'New LVP flooring',                     range: [900, 2200] },
        carpet:          { label: 'New carpet',                          range: [500, 1200] },
        appliance_clean: { label: 'Appliance clean / detail',            range: [100, 250] },
        cabinet_hardware:{ label: 'Cabinet hardware + fixtures',         range: [150, 450] },
        drywall_patch:   { label: 'Drywall patch & repair',             range: [150, 600] }
      }
    },

    // --- Repair vs. replace: repair & replace ranges + typical lifespan (yrs) ---
    repairReplace: {
      roof:         { label: 'Roof',          repair: [400, 1500],  replace: [9000, 22000], lifespanYears: 25 },
      furnace:      { label: 'Furnace',       repair: [200, 900],   replace: [4500, 9000],  lifespanYears: 18 },
      water_heater: { label: 'Water heater',  repair: [150, 600],   replace: [1400, 3200],  lifespanYears: 12 },
      central_ac:   { label: 'Central A/C',   repair: [250, 1200],  replace: [4000, 8500],  lifespanYears: 15 },
      windows:      { label: 'Windows (each)',repair: [100, 400],   replace: [550, 1200],   lifespanYears: 22 }
    },

    // --- Fix-n-flip: cost percentages applied to the deal ---
    flip: {
      sellingCostPct: 8,   // agent commission + closing on the sale side
      holdingCostPct: 4    // taxes, insurance, utilities, loan interest while held
    },

    // --- DIY vs. hire: default value of your own time ($/hr) ---
    diyHire: {
      defaultTimeValuePerHour: 35
    },

    // --- Project schedule: selectable services (price range + rough days) ---
    schedule: {
      services: [
        { id: 'demo',        label: 'Demolition / tear-out',     range: [400, 1500],  days: 1 },
        { id: 'paint',       label: 'Interior painting',         range: [600, 2000],  days: 2 },
        { id: 'flooring',    label: 'Flooring install',          range: [900, 3000],  days: 2 },
        { id: 'drywall',     label: 'Drywall hang & finish',     range: [700, 2500],  days: 3 },
        { id: 'trim',        label: 'Trim & doors',              range: [400, 1400],  days: 1 },
        { id: 'kitchen',     label: 'Kitchen remodel',           range: [6000, 20000],days: 10 },
        { id: 'bathroom',    label: 'Bathroom remodel',          range: [4000, 12000],days: 7 },
        { id: 'roofing',     label: 'Roofing',                   range: [9000, 22000],days: 3 },
        { id: 'fencing',     label: 'Fence install',             range: [2000, 6000], days: 2 },
        { id: 'cleanup',     label: 'Final cleanup & haul-away', range: [200, 600],   days: 1 }
      ]
    },

    // --- 3D printing: formula constants (Bambu A1 + AMS Lite) ---
    print3d: {
      baseFee: 8,                 // setup / handling per order
      perItemSetup: 3,            // per distinct item
      perGram: 0.12,              // material + machine time per gram of filament
      perPrintHour: 2.50,         // amortized machine time per hour
      colorMultiplier: { 1: 1.0, 2: 1.35, 3: 1.6, 4: 1.9 }, // multicolor costs more (purge + time)
      shippingFee: 9              // flat ship cost if not picked up
    },

    // --- Property assessment: base fee + travel + selectable scope items ---
    propertyAssessment: {
      baseFee: 75,                // shows up + standard walkthrough
      perMileRoundTrip: 1.25,     // $ per mile, applied round-trip beyond the free radius
      freeRadiusMiles: 15,        // no travel charge inside this radius of St. Paul
      options: {
        roof:       { label: 'Roof & gutters',        price: 60 },
        foundation: { label: 'Foundation & basement', price: 75 },
        plumbing:   { label: 'Plumbing',              price: 50 },
        electrical: { label: 'Electrical',            price: 50 },
        hvac:       { label: 'Heating & cooling',     price: 60 },
        moisture:   { label: 'Moisture / mold check', price: 65 },
        exterior:   { label: 'Exterior & siding',     price: 45 },
        report:     { label: 'Written report w/ photos', price: 90 }
      }
    }
  };
});
