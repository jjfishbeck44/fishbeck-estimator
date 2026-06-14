// bid-scorer/lib/digest.js
// Renders a list of scored bids into a morning email digest.
// Produces both HTML (rich email) and plain-text (fallback) versions.

const VERDICT_ORDER = { bid: 0, review: 1, skip: 2 };

function sortScored(scored) {
  return scored.slice().sort((a, b) => {
    const va = VERDICT_ORDER[a.recommendation] ?? 99;
    const vb = VERDICT_ORDER[b.recommendation] ?? 99;
    if (va !== vb) return va - vb;
    // Within the same verdict, rank by trade_fit then bid_friendliness desc
    const tfa = a.trade_fit ?? -1;
    const tfb = b.trade_fit ?? -1;
    if (tfa !== tfb) return tfb - tfa;
    return (b.bid_friendliness ?? -1) - (a.bid_friendliness ?? -1);
  });
}

function valueRange(score) {
  const lo = score.estimated_value_low;
  const hi = score.estimated_value_high;
  if (lo == null && hi == null) return null;
  const fmt = (n) => '$' + Math.round(n).toLocaleString('en-US');
  if (lo != null && hi != null) return `${fmt(lo)} – ${fmt(hi)}`;
  return fmt(lo ?? hi);
}

function escapeHtml(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function summaryCounts(scored) {
  const counts = { bid: 0, review: 0, skip: 0 };
  for (const s of scored) {
    if (counts[s.recommendation] != null) counts[s.recommendation]++;
  }
  return counts;
}

function renderTextDigest(scored, opts) {
  opts = opts || {};
  const date = opts.date || new Date().toISOString().slice(0, 10);
  const sorted = sortScored(scored);
  const counts = summaryCounts(scored);

  const lines = [];
  lines.push(`FISHBECK BID DIGEST — ${date}`);
  lines.push('============================================================');
  lines.push(`${counts.bid} BID · ${counts.review} REVIEW · ${counts.skip} SKIP`);
  lines.push('');

  for (const s of sorted) {
    if (s.recommendation === 'skip') continue;
    lines.push(`[${(s.recommendation || 'UNKNOWN').toUpperCase()}] ${s.title || '(untitled)'}`);
    if (s.agency) lines.push(`  Agency:   ${s.agency}`);
    const val = valueRange(s);
    if (val) lines.push(`  Value:    ${val}`);
    if (s.deadline_iso) lines.push(`  Due:      ${s.deadline_iso}`);
    lines.push(`  Scores:   spec ${s.spec_flexibility ?? '-'}/10 · trade ${s.trade_fit ?? '-'}/10 · friendly ${s.bid_friendliness ?? '-'}/10`);
    if (s.recommendation_one_liner) {
      lines.push(`  Why:      ${s.recommendation_one_liner}`);
    }
    if (s.out_of_scope_flags && s.out_of_scope_flags.length) {
      lines.push(`  OOS:      ${s.out_of_scope_flags.join(', ')}`);
    }
    lines.push('');
  }

  const skipped = sorted.filter((s) => s.recommendation === 'skip');
  if (skipped.length) {
    lines.push('--- Skipped (low score) ---');
    for (const s of skipped) {
      lines.push(`  · ${s.title || '(untitled)'} — ${s.recommendation_one_liner || ''}`);
    }
  }

  return lines.join('\n');
}

function verdictBadgeHtml(verdict) {
  const colors = {
    bid: { bg: '#0f7b3a', label: 'BID' },
    review: { bg: '#b8860b', label: 'REVIEW' },
    skip: { bg: '#777', label: 'SKIP' }
  };
  const c = colors[verdict] || { bg: '#444', label: (verdict || '?').toUpperCase() };
  return `<span style="display:inline-block;padding:2px 8px;border-radius:3px;background:${c.bg};color:#fff;font-size:11px;font-weight:600;letter-spacing:0.5px;">${c.label}</span>`;
}

function renderScoreCardHtml(s) {
  const val = valueRange(s);
  const oos = (s.out_of_scope_flags || []).map(escapeHtml).join(', ');
  return [
    `<div style="border:1px solid #e1e4e8;border-radius:6px;padding:14px 16px;margin-bottom:12px;background:#fff;">`,
    `  <div style="margin-bottom:6px;">${verdictBadgeHtml(s.recommendation)} <strong style="font-size:15px;color:#1B3A5C;">${escapeHtml(s.title || '(untitled)')}</strong></div>`,
    s.agency ? `  <div style="font-size:13px;color:#555;margin-bottom:4px;">${escapeHtml(s.agency)}</div>` : '',
    `  <div style="font-size:13px;color:#333;margin-bottom:8px;"><em>${escapeHtml(s.recommendation_one_liner || '')}</em></div>`,
    `  <div style="font-size:12px;color:#555;">`,
    val ? `    <span style="margin-right:14px;">Value: <strong>${escapeHtml(val)}</strong></span>` : '',
    s.deadline_iso ? `    <span style="margin-right:14px;">Due: <strong>${escapeHtml(s.deadline_iso)}</strong></span>` : '',
    `    <span style="margin-right:14px;">Spec: <strong>${s.spec_flexibility ?? '–'}/10</strong></span>`,
    `    <span style="margin-right:14px;">Trade: <strong>${s.trade_fit ?? '–'}/10</strong></span>`,
    `    <span>Friendly: <strong>${s.bid_friendliness ?? '–'}/10</strong></span>`,
    `  </div>`,
    oos ? `  <div style="font-size:12px;color:#a00;margin-top:6px;">Out of scope: ${oos}</div>` : '',
    `</div>`
  ].filter(Boolean).join('\n');
}

function renderHtmlDigest(scored, opts) {
  opts = opts || {};
  const date = opts.date || new Date().toISOString().slice(0, 10);
  const sorted = sortScored(scored);
  const counts = summaryCounts(scored);
  const actionable = sorted.filter((s) => s.recommendation !== 'skip');
  const skipped = sorted.filter((s) => s.recommendation === 'skip');

  const head = `
    <div style="background:#1B3A5C;color:#fff;padding:18px 20px;border-radius:6px 6px 0 0;">
      <div style="font-size:18px;font-weight:700;letter-spacing:0.3px;">Fishbeck Bid Digest</div>
      <div style="font-size:13px;opacity:0.85;margin-top:2px;">${escapeHtml(date)} &middot; ${counts.bid} bid · ${counts.review} review · ${counts.skip} skip</div>
    </div>`;

  const cards = actionable.map(renderScoreCardHtml).join('\n');

  const skippedHtml = skipped.length
    ? `
      <div style="margin-top:18px;padding-top:12px;border-top:1px solid #e1e4e8;">
        <div style="font-size:12px;color:#777;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Skipped (${skipped.length})</div>
        ${skipped.map((s) => `<div style="font-size:12px;color:#666;margin-bottom:4px;">&middot; ${escapeHtml(s.title || '(untitled)')} — ${escapeHtml(s.recommendation_one_liner || '')}</div>`).join('\n')}
      </div>`
    : '';

  return `
<!DOCTYPE html>
<html><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:20px;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <div style="max-width:680px;margin:0 auto;background:#fff;border:1px solid #e1e4e8;border-radius:6px;overflow:hidden;">
    ${head}
    <div style="padding:18px 20px;background:#fafbfc;">
      ${cards || '<div style="color:#777;font-size:13px;">No actionable bids today.</div>'}
      ${skippedHtml}
    </div>
  </div>
</body></html>`.trim();
}

function renderDigest(scored, opts) {
  return {
    text: renderTextDigest(scored, opts),
    html: renderHtmlDigest(scored, opts),
    counts: summaryCounts(scored)
  };
}

module.exports = {
  renderDigest,
  renderTextDigest,
  renderHtmlDigest,
  sortScored,
  summaryCounts
};
