// bid-scorer/lib/sources.js
// Notification source adapters. Each implements: async fetchNew() -> string[]
//
// Today: fixturesSource (reads .eml files for local testing) and
// imapSource (stubbed — needs IMAP credentials, throws clear error).
//
// Tomorrow: swap fixturesSource for imapSource in cron/daily.js.

const fs = require('fs');
const path = require('path');

function fixturesSource(dirPath) {
  return {
    name: 'fixtures',
    async fetchNew() {
      if (!fs.existsSync(dirPath)) return [];
      const files = fs.readdirSync(dirPath).filter((f) => f.endsWith('.eml') || f.endsWith('.txt'));
      return files.map((f) => fs.readFileSync(path.join(dirPath, f), 'utf8'));
    }
  };
}

function arraySource(items) {
  return {
    name: 'array',
    async fetchNew() { return items.slice(); }
  };
}

function imapSource(_config) {
  return {
    name: 'imap',
    async fetchNew() {
      throw new Error(
        'imap_source_not_configured: install an IMAP client (e.g. imapflow) ' +
        'and wire credentials when ready to go live'
      );
    }
  };
}

module.exports = { fixturesSource, arraySource, imapSource };
