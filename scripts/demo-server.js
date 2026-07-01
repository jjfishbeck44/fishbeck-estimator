// scripts/demo-server.js
// Zero-dependency local demo server for the Fishbeck tools.
// Serves public/ as static files, applies the vercel.json clean-URL rewrites,
// and dispatches /api/* to the real serverless handlers (with a JSON body
// parser and a Vercel-shaped res). Run: `node scripts/demo-server.js`
//
// This is a DEV/DEMO server only — not used in production (Vercel runs the
// static files + functions directly).

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PUBLIC = path.join(ROOT, 'public');
const PORT = process.env.PORT || 4000;

// Clean-URL rewrites pulled from vercel.json so /tools/<x> works locally.
const rewrites = JSON.parse(fs.readFileSync(path.join(ROOT, 'vercel.json'), 'utf8')).rewrites || [];
const rewriteMap = {};
rewrites.forEach((r) => { rewriteMap[r.source] = r.destination; });

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8', '.ico': 'image/x-icon'
};

function send(res, code, body, type) {
  res.writeHead(code, { 'Content-Type': type || 'text/plain; charset=utf-8' });
  res.end(body);
}

// Wrap a Node response so Vercel-style handlers (res.status().json()) work.
function vercelRes(res) {
  return {
    setHeader: (k, v) => res.setHeader(k, v),
    status(code) { res._code = code; return this; },
    json(obj) { res.writeHead(res._code || 200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(obj)); return this; },
    end(body) { res.writeHead(res._code || 200); res.end(body); return this; }
  };
}

async function handleApi(name, req, res) {
  let mod;
  try { mod = require(path.join(ROOT, 'api', name + '.js')); }
  catch { return send(res, 404, 'No such API: ' + name); }

  let raw = '';
  req.on('data', (c) => { raw += c; });
  req.on('end', async () => {
    let body = {};
    if (raw) { try { body = JSON.parse(raw); } catch { body = {}; } }
    const vreq = { method: req.method, headers: req.headers, body };
    try { await mod(vreq, vercelRes(res)); }
    catch (e) { send(res, 500, 'Handler error: ' + e.message); }
  });
}

function serveStatic(urlPath, res) {
  // Apply rewrite, else fall back to the raw path, else .html.
  let dest = rewriteMap[urlPath] || urlPath;
  if (dest === '/' || dest === '') dest = '/index.html';
  let filePath = path.join(PUBLIC, dest);
  if (!fs.existsSync(filePath) && fs.existsSync(filePath + '.html')) filePath += '.html';
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    return send(res, 404, 'Not found: ' + urlPath);
  }
  const ext = path.extname(filePath);
  send(res, 200, fs.readFileSync(filePath), MIME[ext] || 'application/octet-stream');
}

const server = http.createServer((req, res) => {
  const urlPath = decodeURIComponent(req.url.split('?')[0]);
  if (urlPath.startsWith('/api/')) {
    return handleApi(urlPath.slice('/api/'.length), req, res);
  }
  serveStatic(urlPath, res);
});

server.listen(PORT, () => {
  console.log(`Fishbeck tools demo running at http://localhost:${PORT}`);
  console.log(`  Tools hub:           http://localhost:${PORT}/tools`);
  console.log(`  Property assessment: http://localhost:${PORT}/tools/property-assessment-calculator`);
});
