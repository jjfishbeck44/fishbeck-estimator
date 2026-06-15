// bid-scorer/tests/dedupeStore.test.js
const fs = require('fs');
const os = require('os');
const path = require('path');

const { createDedupeStore, bidKey, createMemoryBackend } = require('../lib/dedupeStore');

const baseBid = {
  subject: 'IFB-2026-042 Unit Turn',
  agency: 'MPHA',
  dueAt: '2026-06-28'
};

describe('bidKey()', () => {
  test('is deterministic across calls', () => {
    expect(bidKey(baseBid, 'fishbeck')).toBe(bidKey(baseBid, 'fishbeck'));
  });

  test('differs across tenants', () => {
    expect(bidKey(baseBid, 'a')).not.toBe(bidKey(baseBid, 'b'));
  });

  test('case-insensitive on agency/subject/dueAt', () => {
    const upper = { ...baseBid, agency: 'MPHA', subject: 'IFB-2026-042 UNIT TURN' };
    const lower = { ...baseBid, agency: 'mpha', subject: 'ifb-2026-042 unit turn' };
    expect(bidKey(upper, 't')).toBe(bidKey(lower, 't'));
  });

  test('changes if any input changes', () => {
    expect(bidKey(baseBid, 't')).not.toBe(bidKey({ ...baseBid, dueAt: '2026-06-29' }, 't'));
  });
});

describe('createDedupeStore() — memory backend', () => {
  test('has() is false before mark', async () => {
    const store = createDedupeStore({ backend: createMemoryBackend() });
    expect(await store.has(baseBid)).toBe(false);
  });

  test('mark() then has() returns true', async () => {
    const store = createDedupeStore({ backend: createMemoryBackend() });
    await store.mark(baseBid);
    expect(await store.has(baseBid)).toBe(true);
  });

  test('size() reflects marks', async () => {
    const store = createDedupeStore({ backend: createMemoryBackend() });
    expect(await store.size()).toBe(0);
    await store.mark(baseBid);
    await store.mark({ ...baseBid, dueAt: 'other' });
    expect(await store.size()).toBe(2);
  });

  test('isolation across tenants', async () => {
    const a = createDedupeStore({ tenantId: 'a' });
    const b = createDedupeStore({ tenantId: 'b' });
    await a.mark(baseBid);
    expect(await a.has(baseBid)).toBe(true);
    expect(await b.has(baseBid)).toBe(false);
  });

  test('prune() removes entries older than retention window', async () => {
    let nowVal = 1_000_000_000_000;
    const store = createDedupeStore({
      backend: createMemoryBackend(),
      retentionDays: 30,
      now: () => nowVal
    });
    await store.mark(baseBid);
    expect(await store.size()).toBe(1);

    nowVal += 60 * 24 * 60 * 60 * 1000; // 60 days later
    const removed = await store.prune();
    expect(removed).toBe(1);
    expect(await store.size()).toBe(0);
  });
});

describe('createDedupeStore() — file backend persistence', () => {
  let tmpDir;
  let filePath;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bidstore-'));
    filePath = path.join(tmpDir, 'sub', 'seen.json');
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  test('persists across instances', async () => {
    const s1 = createDedupeStore({ filePath, tenantId: 't' });
    await s1.mark(baseBid);
    const s2 = createDedupeStore({ filePath, tenantId: 't' });
    expect(await s2.has(baseBid)).toBe(true);
  });

  test('creates parent directories if missing', async () => {
    createDedupeStore({ filePath, tenantId: 't' });
    expect(fs.existsSync(path.dirname(filePath))).toBe(true);
  });
});
