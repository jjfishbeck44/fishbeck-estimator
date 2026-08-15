// bid-scorer/tests/sourcesAndSenders.test.js
const fs = require('fs');
const os = require('os');
const path = require('path');

const { fixturesSource, arraySource, imapSource } = require('../lib/sources');
const { stdoutSender, fileSender, resendSender, collectSender } = require('../lib/senders');

describe('sources', () => {
  test('arraySource yields a copy of items', async () => {
    const items = ['a', 'b'];
    const src = arraySource(items);
    const out = await src.fetchNew();
    expect(out).toEqual(items);
    expect(out).not.toBe(items);
  });

  test('fixturesSource reads .eml/.txt from a directory', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fsrc-'));
    fs.writeFileSync(path.join(dir, 'a.eml'), 'subject one');
    fs.writeFileSync(path.join(dir, 'b.txt'), 'subject two');
    fs.writeFileSync(path.join(dir, 'ignore.md'), 'not a notification');
    const src = fixturesSource(dir);
    const out = await src.fetchNew();
    expect(out).toHaveLength(2);
    expect(out.join('|')).toMatch(/subject one/);
    expect(out.join('|')).not.toMatch(/not a notification/);
    fs.rmSync(dir, { recursive: true });
  });

  test('fixturesSource returns empty when dir missing', async () => {
    const out = await fixturesSource('/tmp/does-not-exist-zzz').fetchNew();
    expect(out).toEqual([]);
  });

  test('imapSource throws a clear not-configured error', async () => {
    await expect(imapSource({}).fetchNew()).rejects.toThrow(/imap_source_not_configured/);
  });
});

describe('senders', () => {
  test('stdoutSender writes text digest to the stream', async () => {
    const chunks = [];
    const stream = { write: (s) => { chunks.push(s); } };
    const sender = stdoutSender({ stream });
    const result = await sender.send({ text: 'TEXT BODY', html: '<p>x</p>' });
    expect(chunks.join('')).toMatch(/TEXT BODY/);
    expect(result.channel).toBe('stdout');
  });

  test('fileSender writes html and text into directory', async () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'fsnd-'));
    const sender = fileSender(dir);
    const result = await sender.send({ text: 'T', html: '<p>H</p>' }, { date: '2026-06-14' });
    expect(fs.readFileSync(result.htmlPath, 'utf8')).toBe('<p>H</p>');
    expect(fs.readFileSync(result.textPath, 'utf8')).toBe('T');
    fs.rmSync(dir, { recursive: true });
  });

  test('collectSender captures sent digests for assertions', async () => {
    const sender = collectSender();
    await sender.send({ text: 't', html: 'h' }, { date: 'd1' });
    await sender.send({ text: 't2', html: 'h2' }, { date: 'd2' });
    expect(sender.captured).toHaveLength(2);
    expect(sender.captured[0].meta.date).toBe('d1');
  });

  test('resendSender throws a clear not-configured error', async () => {
    await expect(resendSender({}).send({ text: 't', html: 'h' })).rejects.toThrow(/resend_sender_not_configured/);
  });
});
