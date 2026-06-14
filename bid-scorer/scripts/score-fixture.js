#!/usr/bin/env node
// bid-scorer/scripts/score-fixture.js
// CLI: run Claude on a bid fixture and print the structured scoring.
//
// Usage:
//   ANTHROPIC_API_KEY=sk-ant-... node bid-scorer/scripts/score-fixture.js mpha-unit-turn.txt
//
// If no fixture name is provided, runs all fixtures sequentially.

const fs = require('fs');
const path = require('path');

const { scoreBid } = require('../lib/scoreBid');

const FIXTURES_DIR = path.join(__dirname, '..', 'fixtures');

function parseFixture(name) {
  const raw = fs.readFileSync(path.join(FIXTURES_DIR, name), 'utf8');
  const subjectMatch = raw.match(/^Subject:\s*(.+)$/m);
  const agencyMatch = raw.match(/^Agency:\s*(.+)$/m);
  const postedMatch = raw.match(/^Posted:\s*(.+)$/m);
  const dueMatch = raw.match(/^Due:\s*(.+)$/m);
  const bodyStart = raw.indexOf('--- Notification body ---');
  const specStart = raw.indexOf('--- Spec excerpt ---');
  const body = raw.slice(bodyStart, specStart >= 0 ? specStart : undefined).trim();
  const specText = specStart >= 0 ? raw.slice(specStart).trim() : null;
  return {
    subject: subjectMatch && subjectMatch[1].trim(),
    agency: agencyMatch && agencyMatch[1].trim(),
    postedAt: postedMatch && postedMatch[1].trim(),
    dueAt: dueMatch && dueMatch[1].trim(),
    body,
    specText
  };
}

function printScore(name, score) {
  const verdict = score.recommendation
    ? score.recommendation.toUpperCase()
    : 'UNKNOWN';
  console.log('');
  console.log('================================================================');
  console.log(`FIXTURE: ${name}`);
  console.log(`VERDICT: ${verdict}`);
  console.log('================================================================');
  console.log(score.recommendation_one_liner || '(no one-liner)');
  console.log('');
  console.log(`spec_flexibility:  ${score.spec_flexibility}/10`);
  console.log(`  ${score.spec_flexibility_reasoning || ''}`);
  console.log(`trade_fit:         ${score.trade_fit}/10`);
  console.log(`  ${score.trade_fit_reasoning || ''}`);
  console.log(`bid_friendliness:  ${score.bid_friendliness}/10`);
  console.log(`  ${score.bid_friendliness_reasoning || ''}`);
  if (score.out_of_scope_flags && score.out_of_scope_flags.length) {
    console.log(`out_of_scope:      ${score.out_of_scope_flags.join(', ')}`);
  }
  console.log('');
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('ERROR: ANTHROPIC_API_KEY env var is required.');
    process.exit(1);
  }

  const arg = process.argv[2];
  const fixtures = arg
    ? [arg]
    : fs.readdirSync(FIXTURES_DIR).filter((f) => f.endsWith('.txt'));

  for (const name of fixtures) {
    try {
      const bid = parseFixture(name);
      const score = await scoreBid(bid);
      printScore(name, score);
    } catch (err) {
      console.error(`FAILED on ${name}:`, err.message);
    }
  }
}

main();
