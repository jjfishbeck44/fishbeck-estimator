// scripts/demo-shots.js — screenshot tools by fulfilling every request from disk
// (no server, no sockets — avoids the sandbox's network kill). Chromium renders
// pages served entirely from public/ via route interception.
const { chromium } = require('playwright-core');
const fs = require('fs');
const path = require('path');

const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const ROOT = path.join(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const OUT = process.env.SHOT_DIR || '/tmp/shots';
fs.mkdirSync(OUT, { recursive: true });

const rewrites = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8')).rewrites || [];
const rewriteMap = {}; rewrites.forEach((r) => { rewriteMap[r.source] = r.destination; });

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain' };

function resolveFile(urlPath) {
  let dest = rewriteMap[urlPath] || urlPath;
  if (dest === '/' || dest === '') dest = '/index.html';
  let fp = path.join(PUBLIC, dest);
  if (!fs.existsSync(fp) && fs.existsSync(fp + '.html')) fp += '.html';
  if (fs.existsSync(fp) && fs.statSync(fp).isFile()) return fp;
  return null;
}

async function main() {
  const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'] });
  const page = await browser.newPage({ viewport: { width: 900, height: 1000 } });

  await page.route('**', (route) => {
    const url = new URL(route.request().url());
    if (url.hostname !== 'app.local') return route.abort(); // block Google Fonts etc.
    const fp = resolveFile(decodeURIComponent(url.pathname));
    if (!fp) return route.fulfill({ status: 404, body: 'not found' });
    route.fulfill({ status: 200, headers: { 'Content-Type': MIME[path.extname(fp)] || 'application/octet-stream' }, body: fs.readFileSync(fp) });
  });

  const BASE = 'http://app.local';
  async function shot(n) { await page.screenshot({ path: path.join(OUT, n + '.png'), fullPage: true }); console.log('shot:', n); }
  async function calc() { await page.click('#calc-btn'); await page.waitForSelector('#results-card:not(.hidden)', { timeout: 6000 }).catch(() => {}); await page.waitForTimeout(300); }

  await page.goto(BASE + '/tools', { waitUntil: 'load' }); await shot('01-tools-hub');

  await page.goto(BASE + '/tools/mulch-calculator', { waitUntil: 'load' });
  await page.fill('#length-input', '20'); await page.fill('#width-input', '40'); await page.fill('#depth-input', '3');
  await calc(); await shot('02-mulch');

  await page.goto(BASE + '/tools/unit-turn-calculator', { waitUntil: 'load' });
  await page.selectOption('#size-select', '2br'); await page.check('.turn-item[value="lvp_flooring"]');
  await calc(); await shot('03-unit-turn');

  await page.goto(BASE + '/tools/fix-and-flip-calculator', { waitUntil: 'load' });
  await page.fill('#purchase-input', '200000'); await page.fill('#rehab-input', '50000'); await page.fill('#arv-input', '320000');
  await calc(); await shot('04-fix-and-flip');

  await page.goto(BASE + '/tools/3d-print-calculator', { waitUntil: 'load' });
  await page.fill('#link-input', 'https://makerworld.com/en/models/12345');
  await page.fill('#grams-input', '80'); await page.fill('#hours-input', '5');
  await page.check('#multicolor-checkbox'); await page.selectOption('#colors-select', '3');
  await calc(); await shot('05-3d-print');

  await browser.close(); console.log('DONE'); process.exit(0);
}
main().catch((e) => { console.error('ERR', e.message); process.exit(1); });
