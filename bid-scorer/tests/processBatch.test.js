// bid-scorer/tests/processBatch.test.js
const fs = require('fs');
const path = require('path');

const { processBatch, processOne } = require('../lib/processBatch');

function fixture(name) {
  return fs.readFileSync(
    path.join(__dirname, '..', 'fixtures', 'emails', name),
    'utf8'
  );
}

function makeClient(byKeyword) {
  return {
    messages: {
      create: jest.fn().mockImplementation(({ messages }) => {
        const userMsg = messages[0].content;
        for (const [keyword, response] of Object.entries(byKeyword)) {
          if (userMsg.includes(keyword)) {
            return Promise.resolve({
              content: [{ text: JSON.stringify(response) }]
            });
          }
        }
        return Promise.resolve({
          content: [{ text: JSON.stringify({ recommendation: 'review', title: 'fallback' }) }]
        });
      })
    }
  };
}

describe('processOne()', () => {
  test('returns ok=true with bid and score on happy path', async () => {
    const client = makeClient({
      'MPHA': { recommendation: 'bid', title: 'MPHA turn' }
    });
    const result = await processOne(fixture('mpha-notification.eml'), { client });
    expect(result.ok).toBe(true);
    expect(result.bid.agency).toBe('Minneapolis Public Housing Authority');
    expect(result.score.recommendation).toBe('bid');
  });

  test('returns ok=false when parse fails', async () => {
    const result = await processOne('', { client: makeClient({}) });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('empty_notification');
  });

  test('returns ok=false when scoring fails', async () => {
    const client = {
      messages: {
        create: jest.fn().mockResolvedValue({
          content: [{ text: 'not json at all' }]
        })
      }
    };
    const result = await processOne(fixture('mpha-notification.eml'), { client });
    expect(result.ok).toBe(false);
    expect(result.error).toBe('invalid_json');
    expect(result.rawPreview).toMatch(/MPHA/);
  });
});

describe('processBatch()', () => {
  test('scores all notifications and renders a digest', async () => {
    const client = makeClient({
      'MPHA': {
        title: 'MPHA Unit Turn',
        agency: 'MPHA',
        recommendation: 'bid',
        spec_flexibility: 9,
        trade_fit: 10,
        bid_friendliness: 9,
        recommendation_one_liner: 'Strong fit'
      },
      'Hennepin': {
        title: 'Hennepin Renovation',
        agency: 'Hennepin County',
        recommendation: 'skip',
        spec_flexibility: 5,
        trade_fit: 2,
        bid_friendliness: 2,
        recommendation_one_liner: 'Mostly HVAC/electrical'
      },
      'Saint Paul Public Schools': {
        title: 'SPPS Summer Paint',
        agency: 'SPPS',
        recommendation: 'review',
        spec_flexibility: 8,
        trade_fit: 9,
        bid_friendliness: 6,
        recommendation_one_liner: 'Prevailing wage but flexible specs'
      }
    });

    const batch = [
      fixture('mpha-notification.eml'),
      fixture('hennepin-notification.eml'),
      fixture('spps-notification.eml')
    ];

    const result = await processBatch(batch, { client, date: '2026-06-14' });

    expect(result.summary).toEqual({
      attempted: 3,
      succeeded: 3,
      failed: 0,
      bid: 1,
      review: 1,
      skip: 1
    });
    expect(result.scored).toHaveLength(3);
    expect(result.digest.text).toMatch(/FISHBECK BID DIGEST — 2026-06-14/);
    expect(result.digest.html).toMatch(/MPHA Unit Turn/);
  });

  test('isolates failures — one bad notification does not abort the batch', async () => {
    const client = makeClient({
      'MPHA': {
        title: 'MPHA Unit Turn',
        recommendation: 'bid',
        spec_flexibility: 9, trade_fit: 10, bid_friendliness: 9,
        recommendation_one_liner: 'Strong'
      }
    });

    const result = await processBatch(
      [fixture('mpha-notification.eml'), '', fixture('spps-notification.eml')],
      { client, date: '2026-06-14' }
    );

    expect(result.summary.attempted).toBe(3);
    expect(result.summary.failed).toBe(1);
    expect(result.summary.succeeded).toBe(2);
    expect(result.failed[0].error).toBe('empty_notification');
  });

  test('renders empty digest for empty batch', async () => {
    const result = await processBatch([], { client: makeClient({}), date: '2026-06-14' });
    expect(result.summary).toEqual({
      attempted: 0, succeeded: 0, failed: 0, bid: 0, review: 0, skip: 0
    });
    expect(result.digest.text).toMatch(/0 BID · 0 REVIEW · 0 SKIP/);
  });
});
