// bid-scorer/tests/runDaily.test.js
const fs = require('fs');
const path = require('path');

const { runDaily } = require('../lib/runDaily');
const { arraySource } = require('../lib/sources');
const { collectSender } = require('../lib/senders');
const { createDedupeStore, createMemoryBackend } = require('../lib/dedupeStore');

function fixture(name) {
  return fs.readFileSync(path.join(__dirname, '..', 'fixtures', 'emails', name), 'utf8');
}

function scoringClient(byKeyword) {
  return {
    messages: {
      create: jest.fn().mockImplementation(({ messages }) => {
        const text = messages[0].content;
        for (const [k, v] of Object.entries(byKeyword)) {
          if (text.includes(k)) {
            return Promise.resolve({ content: [{ text: JSON.stringify(v) }] });
          }
        }
        return Promise.resolve({
          content: [{ text: JSON.stringify({ recommendation: 'review', title: 'fallback' }) }]
        });
      })
    }
  };
}

describe('runDaily()', () => {
  test('full pipeline: fetch -> score -> digest -> send', async () => {
    const source = arraySource([fixture('mpha-notification.eml'), fixture('spps-notification.eml')]);
    const sender = collectSender();
    const store = createDedupeStore({ backend: createMemoryBackend() });
    const client = scoringClient({
      'MPHA': { title: 'MPHA Unit Turn', recommendation: 'bid',
                spec_flexibility: 9, trade_fit: 10, bid_friendliness: 9,
                recommendation_one_liner: 'Strong fit' },
      'Saint Paul Public Schools': { title: 'SPPS', recommendation: 'review',
                spec_flexibility: 8, trade_fit: 9, bid_friendliness: 6,
                recommendation_one_liner: 'Worth a look' }
    });

    const result = await runDaily({
      source, sender, store, client,
      enrichSpecs: false,
      date: '2026-06-14'
    });

    expect(result.summary).toEqual({
      fetched: 2, scored: 2, duplicates: 0, failed: 0,
      bid: 1, review: 1, skip: 0
    });
    expect(sender.captured).toHaveLength(1);
    expect(sender.captured[0].digest.text).toMatch(/FISHBECK BID DIGEST/);
  });

  test('skips duplicates that have already been scored', async () => {
    const source = arraySource([fixture('mpha-notification.eml')]);
    const sender = collectSender();
    const store = createDedupeStore({ backend: createMemoryBackend() });
    const client = scoringClient({
      'MPHA': { title: 'MPHA', recommendation: 'bid',
                spec_flexibility: 9, trade_fit: 10, bid_friendliness: 9,
                recommendation_one_liner: 's' }
    });

    await runDaily({ source, sender, store, client, enrichSpecs: false, date: 'd1' });
    expect(client.messages.create).toHaveBeenCalledTimes(1);

    const result = await runDaily({ source, sender, store, client, enrichSpecs: false, date: 'd2' });
    expect(client.messages.create).toHaveBeenCalledTimes(1); // not called again
    expect(result.summary.duplicates).toBe(1);
    expect(result.summary.scored).toBe(0);
  });

  test('isolates parse/score failures into result.failed', async () => {
    const source = arraySource(['', fixture('mpha-notification.eml')]);
    const sender = collectSender();
    const store = createDedupeStore({ backend: createMemoryBackend() });
    const client = scoringClient({
      'MPHA': { title: 'MPHA', recommendation: 'bid',
                spec_flexibility: 9, trade_fit: 10, bid_friendliness: 9,
                recommendation_one_liner: 's' }
    });

    const result = await runDaily({
      source, sender, store, client, enrichSpecs: false, date: 'd1'
    });

    expect(result.summary.failed).toBe(1);
    expect(result.summary.scored).toBe(1);
    expect(result.failed[0].error).toBe('empty_notification');
  });

  test('emits lifecycle events for observability', async () => {
    const events = [];
    const source = arraySource([fixture('mpha-notification.eml')]);
    const sender = collectSender();
    const store = createDedupeStore({ backend: createMemoryBackend() });
    const client = scoringClient({
      'MPHA': { title: 'MPHA', recommendation: 'bid',
                spec_flexibility: 9, trade_fit: 10, bid_friendliness: 9,
                recommendation_one_liner: 's' }
    });

    await runDaily({
      source, sender, store, client, enrichSpecs: false,
      onEvent: (e) => events.push(e.type)
    });

    expect(events).toContain('fetched');
    expect(events).toContain('scored');
    expect(events).toContain('sent');
  });

  test('throws on missing required collaborators', async () => {
    await expect(runDaily({})).rejects.toThrow(/missing_source/);
    await expect(runDaily({ source: arraySource([]) })).rejects.toThrow(/missing_sender/);
    await expect(runDaily({ source: arraySource([]), sender: collectSender() }))
      .rejects.toThrow(/missing_store/);
  });

  test('enrichSpecs uses injected pdf parser when spec PDF URL is present', async () => {
    const source = arraySource([fixture('mpha-notification.eml')]);
    const sender = collectSender();
    const store = createDedupeStore({ backend: createMemoryBackend() });

    const parsePdf = jest.fn().mockResolvedValue({ text: 'EXTRACTED SPEC: contractor choice paint', numpages: 5 });
    const fetchPdf = jest.fn().mockResolvedValue({
      ok: true,
      headers: { get: () => null },
      arrayBuffer: async () => new ArrayBuffer(64)
    });

    const client = {
      messages: {
        create: jest.fn().mockImplementation(({ messages }) => {
          // assert the spec text made it into the prompt
          expect(messages[0].content).toMatch(/EXTRACTED SPEC: contractor choice paint/);
          return Promise.resolve({
            content: [{ text: JSON.stringify({
              title: 'MPHA', recommendation: 'bid',
              spec_flexibility: 9, trade_fit: 10, bid_friendliness: 9,
              recommendation_one_liner: 'spec-confirmed'
            }) }]
          });
        })
      }
    };

    const result = await runDaily({
      source, sender, store, client,
      enrichSpecs: true, parsePdf, fetchPdf
    });

    expect(parsePdf).toHaveBeenCalled();
    expect(fetchPdf).toHaveBeenCalled();
    expect(result.summary.scored).toBe(1);
  });
});
