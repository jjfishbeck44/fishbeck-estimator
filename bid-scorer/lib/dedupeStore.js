// bid-scorer/lib/dedupeStore.js
// Tracks which bid notifications have already been scored so the cron
// doesn't re-spend Claude tokens on the same opportunity.
//
// Default backend is a JSON file (cheap, no infra). Each entry is keyed by a
// stable hash of (tenantId, agency, subject, dueAt). When we move to Postgres
// for Tier 3 multi-tenancy, swap the backend — the createDedupeStore() API
// stays the same.

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const DEFAULT_TENANT = 'fishbeck';
const RETENTION_DAYS = 180;

function hashKey(parts) {
  return crypto
    .createHash('sha256')
    .update(parts.filter(Boolean).join('|'))
    .digest('hex')
    .slice(0, 24);
}

function bidKey(bid, tenantId) {
  return hashKey([
    tenantId || DEFAULT_TENANT,
    (bid.agency || '').toLowerCase().trim(),
    (bid.subject || '').toLowerCase().trim(),
    (bid.dueAt || '').toLowerCase().trim()
  ]);
}

function createMemoryBackend(initial) {
  const map = new Map(Object.entries(initial || {}));
  return {
    async get(key) { return map.get(key) || null; },
    async set(key, value) { map.set(key, value); },
    async entries() { return Array.from(map.entries()); },
    async delete(key) { map.delete(key); }
  };
}

function createFileBackend(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  let state = {};
  if (fs.existsSync(filePath)) {
    try { state = JSON.parse(fs.readFileSync(filePath, 'utf8')); }
    catch { state = {}; }
  }
  function persist() {
    fs.writeFileSync(filePath, JSON.stringify(state, null, 2));
  }
  return {
    async get(key) { return state[key] || null; },
    async set(key, value) { state[key] = value; persist(); },
    async entries() { return Object.entries(state); },
    async delete(key) { delete state[key]; persist(); }
  };
}

function createDedupeStore(opts) {
  opts = opts || {};
  const tenantId = opts.tenantId || DEFAULT_TENANT;
  const backend = opts.backend || (opts.filePath
    ? createFileBackend(opts.filePath)
    : createMemoryBackend(opts.initial));
  const now = opts.now || (() => Date.now());
  const retentionMs = (opts.retentionDays || RETENTION_DAYS) * 24 * 60 * 60 * 1000;

  async function has(bid) {
    return Boolean(await backend.get(bidKey(bid, tenantId)));
  }

  async function mark(bid, extra) {
    const key = bidKey(bid, tenantId);
    await backend.set(key, {
      seenAt: now(),
      agency: bid.agency,
      subject: bid.subject,
      dueAt: bid.dueAt,
      ...(extra || {})
    });
    return key;
  }

  async function prune() {
    const cutoff = now() - retentionMs;
    const entries = await backend.entries();
    let removed = 0;
    for (const [key, entry] of entries) {
      if (entry && entry.seenAt && entry.seenAt < cutoff) {
        await backend.delete(key);
        removed++;
      }
    }
    return removed;
  }

  async function size() {
    return (await backend.entries()).length;
  }

  return { has, mark, prune, size, tenantId };
}

module.exports = { createDedupeStore, bidKey, hashKey, createMemoryBackend, createFileBackend };
