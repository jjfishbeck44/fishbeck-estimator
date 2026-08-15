// bid-scorer/lib/senders.js
// Digest delivery adapters. Each implements: async send(digest, meta) -> {...}
//
// stdoutSender: prints text digest to console (local testing).
// fileSender: writes html/text digests to a directory (manual review).
// resendSender: stubbed — needs Resend API key when ready to go live.

const fs = require('fs');
const path = require('path');

function stdoutSender(opts) {
  opts = opts || {};
  const out = opts.stream || process.stdout;
  return {
    name: 'stdout',
    async send(digest) {
      out.write(digest.text + '\n');
      return { delivered: true, channel: 'stdout' };
    }
  };
}

function fileSender(dirPath) {
  return {
    name: 'file',
    async send(digest, meta) {
      fs.mkdirSync(dirPath, { recursive: true });
      const date = (meta && meta.date) || new Date().toISOString().slice(0, 10);
      const htmlPath = path.join(dirPath, `digest-${date}.html`);
      const textPath = path.join(dirPath, `digest-${date}.txt`);
      fs.writeFileSync(htmlPath, digest.html);
      fs.writeFileSync(textPath, digest.text);
      return { delivered: true, channel: 'file', htmlPath, textPath };
    }
  };
}

function resendSender(_config) {
  return {
    name: 'resend',
    async send() {
      throw new Error(
        'resend_sender_not_configured: install resend and set RESEND_API_KEY ' +
        'when ready to go live'
      );
    }
  };
}

function collectSender() {
  const captured = [];
  return {
    name: 'collect',
    captured,
    async send(digest, meta) {
      captured.push({ digest, meta: meta || {} });
      return { delivered: true, channel: 'collect' };
    }
  };
}

module.exports = { stdoutSender, fileSender, resendSender, collectSender };
