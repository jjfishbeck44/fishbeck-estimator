// bid-scorer/tests/scoreBid.test.js
const fs = require('fs');
const path = require('path');

const { scoreBid, formatUserMessage } = require('../lib/scoreBid');
const { buildBidScorerPrompt } = require('../lib/prompt');

function fixture(name) {
  return fs.readFileSync(path.join(__dirname, '..', 'fixtures', name), 'utf8');
}

function bidFromFixture(name) {
  const raw = fixture(name);
  const subjectMatch = raw.match(/^Subject:\s*(.+)$/m);
  const agencyMatch = raw.match(/^Agency:\s*(.+)$/m);
  const dueMatch = raw.match(/^Due:\s*(.+)$/m);
  const bodyStart = raw.indexOf('--- Notification body ---');
  const specStart = raw.indexOf('--- Spec excerpt ---');
  const body = raw.slice(bodyStart, specStart >= 0 ? specStart : undefined).trim();
  const specText = specStart >= 0 ? raw.slice(specStart).trim() : null;
  return {
    subject: subjectMatch && subjectMatch[1].trim(),
    agency: agencyMatch && agencyMatch[1].trim(),
    dueAt: dueMatch && dueMatch[1].trim(),
    body,
    specText
  };
}

function mockClient(jsonResponse) {
  return {
    messages: {
      create: jest.fn().mockResolvedValue({
        content: [{ text: JSON.stringify(jsonResponse) }]
      })
    }
  };
}

describe('buildBidScorerPrompt()', () => {
  test('returns a non-empty system prompt', () => {
    const prompt = buildBidScorerPrompt();
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(500);
  });

  test('documents all three scoring dimensions', () => {
    const prompt = buildBidScorerPrompt();
    expect(prompt).toMatch(/spec_flexibility/);
    expect(prompt).toMatch(/trade_fit/);
    expect(prompt).toMatch(/bid_friendliness/);
  });

  test('documents Fishbeck-specific trade scope and edge', () => {
    const prompt = buildBidScorerPrompt();
    expect(prompt).toMatch(/Fishbeck/);
    expect(prompt).toMatch(/clearance/i);
    expect(prompt).toMatch(/unit turn/i);
    expect(prompt).toMatch(/HVAC/);
  });

  test('mandates JSON-only output', () => {
    const prompt = buildBidScorerPrompt();
    expect(prompt).toMatch(/JSON/);
    expect(prompt).toMatch(/recommendation/);
  });

  test('lists the three recommendation values', () => {
    const prompt = buildBidScorerPrompt();
    expect(prompt).toMatch(/"bid"/);
    expect(prompt).toMatch(/"skip"/);
    expect(prompt).toMatch(/"review"/);
  });
});

describe('formatUserMessage()', () => {
  test('includes subject, agency, body, and spec text', () => {
    const msg = formatUserMessage({
      subject: 'IFB-2026-042',
      agency: 'MPHA',
      body: 'Unit turn at 14 sites',
      specText: 'Paint: contractors choice'
    });
    expect(msg).toMatch(/IFB-2026-042/);
    expect(msg).toMatch(/MPHA/);
    expect(msg).toMatch(/Unit turn at 14 sites/);
    expect(msg).toMatch(/Paint: contractors choice/);
  });

  test('omits spec section when none provided', () => {
    const msg = formatUserMessage({ subject: 'x', body: 'y' });
    expect(msg).not.toMatch(/Spec excerpt/);
  });

  test('handles missing fields without crashing', () => {
    const msg = formatUserMessage({});
    expect(typeof msg).toBe('string');
    expect(msg).toMatch(/no body/);
  });
});

describe('scoreBid() — happy path with mocked Claude', () => {
  test('returns parsed scoring object', async () => {
    const fake = {
      title: 'Unit Turn — 14 scattered sites',
      agency: 'MPHA',
      deadline_iso: '2026-06-28',
      estimated_value_low: 38000,
      estimated_value_high: 52000,
      spec_flexibility: 9,
      spec_flexibility_reasoning: 'Contractor\'s choice paint, "or approved equal" on LVP',
      trade_fit: 10,
      trade_fit_reasoning: 'Pure unit turn — paint, LVP, hardware',
      bid_friendliness: 9,
      bid_friendliness_reasoning: '$38–52k, no bond, no prevailing wage',
      out_of_scope_flags: [],
      recommendation: 'bid',
      recommendation_one_liner: 'MPHA 14-unit scattered-site turn, $38–52k, no bond, flexible specs — strong fit.'
    };
    const client = mockClient(fake);
    const bid = bidFromFixture('mpha-unit-turn.txt');

    const result = await scoreBid(bid, { client });

    expect(client.messages.create).toHaveBeenCalledTimes(1);
    expect(result).toEqual(fake);
  });

  test('passes the system prompt to Claude', async () => {
    const client = mockClient({ recommendation: 'bid' });
    await scoreBid({ body: 'x' }, { client });
    const callArg = client.messages.create.mock.calls[0][0];
    expect(callArg.system).toMatch(/Fishbeck/);
    expect(callArg.messages[0].role).toBe('user');
  });

  test('uses default model when none supplied', async () => {
    const client = mockClient({ recommendation: 'review' });
    await scoreBid({ body: 'x' }, { client });
    const callArg = client.messages.create.mock.calls[0][0];
    expect(callArg.model).toBe('claude-sonnet-4-6');
  });

  test('allows model override', async () => {
    const client = mockClient({ recommendation: 'review' });
    await scoreBid({ body: 'x' }, { client, model: 'claude-haiku-4-5-20251001' });
    const callArg = client.messages.create.mock.calls[0][0];
    expect(callArg.model).toBe('claude-haiku-4-5-20251001');
  });
});

describe('scoreBid() — error paths', () => {
  test('throws invalid_json when Claude returns non-JSON', async () => {
    const client = {
      messages: {
        create: jest.fn().mockResolvedValue({
          content: [{ text: 'Here is my analysis: this looks like a great bid.' }]
        })
      }
    };
    await expect(scoreBid({ body: 'x' }, { client })).rejects.toThrow('invalid_json');
  });

  test('throws api_timeout when client hangs', async () => {
    jest.useFakeTimers();
    const client = {
      messages: { create: jest.fn().mockReturnValue(new Promise(() => {})) }
    };
    const p = scoreBid({ body: 'x' }, { client });
    jest.advanceTimersByTime(45001);
    await expect(p).rejects.toThrow('api_timeout');
    jest.useRealTimers();
  });

  test('propagates Anthropic errors', async () => {
    const client = {
      messages: { create: jest.fn().mockRejectedValue(new Error('API down')) }
    };
    await expect(scoreBid({ body: 'x' }, { client })).rejects.toThrow('API down');
  });
});

describe('fixture sanity checks', () => {
  test('all fixtures parse into well-formed bid objects', () => {
    const names = [
      'mpha-unit-turn.txt',
      'mndot-rigid-spec.txt',
      'school-summer-paint.txt',
      'county-hvac-mixed.txt'
    ];
    for (const name of names) {
      const bid = bidFromFixture(name);
      expect(bid.subject).toBeTruthy();
      expect(bid.agency).toBeTruthy();
      expect(bid.body).toBeTruthy();
    }
  });
});
