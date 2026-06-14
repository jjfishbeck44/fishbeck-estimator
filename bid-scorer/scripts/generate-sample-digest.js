#!/usr/bin/env node
// bid-scorer/scripts/generate-sample-digest.js
// Generates a sample HTML + text digest using hand-written scored bids
// (no Claude call required). Lets you preview the digest layout before
// wiring up real scoring.
//
// Usage:
//   node bid-scorer/scripts/generate-sample-digest.js
//   Output: bid-scorer/samples/digest.html and digest.txt

const fs = require('fs');
const path = require('path');

const { renderDigest } = require('../lib/digest');

const SAMPLE_SCORED = [
  {
    title: 'IFB-2026-042 — Unit Turnover Painting & Flooring (14 sites)',
    agency: 'Minneapolis Public Housing Authority',
    deadline_iso: '2026-06-28',
    estimated_value_low: 38000,
    estimated_value_high: 52000,
    spec_flexibility: 9,
    spec_flexibility_reasoning: 'Paint is contractor\'s choice; LVP uses "or approved equal" with informal cut-sheet submission.',
    trade_fit: 10,
    trade_fit_reasoning: 'Pure unit-turn package: paint, LVP, cabinet hardware, minor drywall patch.',
    bid_friendliness: 9,
    bid_friendliness_reasoning: 'Below $75k bond threshold; no prevailing wage; single-year with two renewals.',
    out_of_scope_flags: [],
    recommendation: 'bid',
    recommendation_one_liner: 'MPHA 14-unit scattered-site turn, $38–52k, no bond, flexible specs — pure clearance arbitrage.'
  },
  {
    title: 'RFP 2026-S04 — Roosevelt Elementary Summer Repaint',
    agency: 'Saint Paul Public Schools',
    deadline_iso: '2026-07-01',
    estimated_value_low: 28000,
    estimated_value_high: 42000,
    spec_flexibility: 8,
    spec_flexibility_reasoning: '"Or equal" on wall paint; contractor\'s choice on trim, doors, ceilings.',
    trade_fit: 9,
    trade_fit_reasoning: 'Interior paint + drywall patch — core wheelhouse.',
    bid_friendliness: 6,
    bid_friendliness_reasoning: 'Prevailing wage applies (SPPS board policy) — bid math needs to account for that.',
    out_of_scope_flags: [],
    recommendation: 'review',
    recommendation_one_liner: 'SPPS Roosevelt summer repaint, $28–42k, very flexible specs but prevailing wage — worth modeling.'
  },
  {
    title: 'Aeon — 248-unit refresh program, Q3 2026',
    agency: 'Aeon (nonprofit affordable housing)',
    deadline_iso: '2026-07-08',
    estimated_value_low: 180000,
    estimated_value_high: 240000,
    spec_flexibility: 8,
    spec_flexibility_reasoning: '"Manufacturer\'s choice subject to Aeon approval" on all materials.',
    trade_fit: 10,
    trade_fit_reasoning: 'Paint + LVP + cabinet hardware across 248 units — exact wheelhouse at scale.',
    bid_friendliness: 7,
    bid_friendliness_reasoning: '$200k+ at the edge of bond threshold; large enough to attract regional bidders.',
    out_of_scope_flags: [],
    recommendation: 'bid',
    recommendation_one_liner: 'Aeon 248-unit refresh, ~$200k, flexible specs — biggest clearance play this month.'
  },
  {
    title: 'Bid 240615-A — District 6 Maintenance Facility Repainting',
    agency: 'Minnesota Department of Transportation',
    deadline_iso: '2026-07-15',
    estimated_value_low: 185000,
    estimated_value_high: 185000,
    spec_flexibility: 1,
    spec_flexibility_reasoning: 'Hard SKU lockdown on Sherwin-Williams Loxon, SuperPaint, Macropoxy. No substitutions language.',
    trade_fit: 7,
    trade_fit_reasoning: 'Exterior paint adjacent to wheelhouse but includes concrete + electrical scope.',
    bid_friendliness: 4,
    bid_friendliness_reasoning: '100% bonds, Davis-Bacon prevailing wage, 7% DBE goal, $185k size attracts mid-size GCs.',
    out_of_scope_flags: ['Concrete spall repair', 'Electrical (LED replacement)'],
    recommendation: 'skip',
    recommendation_one_liner: 'MnDOT $185k exterior repaint — Sherwin-Williams lockdown kills clearance edge.'
  },
  {
    title: 'IFB 2026-114 — Government Center Renovation Phase II',
    agency: 'Hennepin County',
    deadline_iso: '2026-07-22',
    estimated_value_low: 1200000,
    estimated_value_high: 1800000,
    spec_flexibility: 5,
    spec_flexibility_reasoning: 'Finishes scope has "or approved equal" but finishes are <5% of total contract.',
    trade_fit: 2,
    trade_fit_reasoning: 'Mostly HVAC, electrical switchgear, and plumbing — Fishbeck is single-prime ineligible.',
    bid_friendliness: 2,
    bid_friendliness_reasoning: '$5M aggregate liability, 100% bonds, 3+ similar-scale prior projects required.',
    out_of_scope_flags: ['HVAC', 'Electrical (switchgear)', 'Plumbing'],
    recommendation: 'skip',
    recommendation_one_liner: 'Hennepin $1.2–1.8M GC project — Fishbeck is not a single-prime GC for this scale.'
  }
];

function main() {
  const outDir = path.join(__dirname, '..', 'samples');
  fs.mkdirSync(outDir, { recursive: true });

  const date = new Date().toISOString().slice(0, 10);
  const digest = renderDigest(SAMPLE_SCORED, { date });

  fs.writeFileSync(path.join(outDir, 'digest.html'), digest.html);
  fs.writeFileSync(path.join(outDir, 'digest.txt'), digest.text);

  console.log('Wrote bid-scorer/samples/digest.html');
  console.log('Wrote bid-scorer/samples/digest.txt');
  console.log('');
  console.log('Summary:', digest.counts);
}

main();
