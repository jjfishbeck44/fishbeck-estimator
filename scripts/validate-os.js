'use strict';

/**
 * Fishbeck OS validator (AUT-001).
 *
 * Enforces the standards in Fishbeck_AI_OS/_System against the OS itself.
 *
 * Design note: this validator does not hardcode the vocabularies it checks.
 * It *reads* them from the standards that define them, so there is exactly one
 * home for each fact (Charter principle #1):
 *
 *   type vocabulary   <- _System/03_Metadata_Standard.md   (SYS-0003)
 *   tag vocabulary    <- _System/04_Taxonomy_and_Tags.md   (SYS-0005)
 *   ID prefixes       <- _Registry/Entity_ID_Registry.csv  (SYS-0006)
 *
 * Amending a standard therefore updates the validator automatically.
 */

const fs = require('fs');
const path = require('path');

const OS_ROOT = path.join(__dirname, '..', 'Fishbeck_AI_OS');

// Fields every markdown document must carry (SYS-0003).
const REQUIRED_FIELDS = [
  'id', 'title', 'type', 'domain', 'status', 'version', 'owner',
  'created', 'updated', 'review_cycle', 'next_review', 'tags',
  'source_of_truth', 'ai_usage', 'confidence',
];

// Closed enums from SYS-0003.
const ENUMS = {
  status: ['draft', 'review', 'approved', 'deprecated'],
  confidence: ['high', 'medium', 'low', 'unverified'],
  ai_usage: ['read-only', 'read-write', 'ai-generated', 'human-only'],
  review_cycle: ['monthly', 'quarterly', 'semiannual', 'annual', 'as-needed'],
};

// Columns every CSV in the OS must carry (SYS-0003).
const REQUIRED_CSV_COLUMNS = ['id', 'status', 'source', 'confidence', 'last_updated', 'notes'];

const SEMVER = /^\d+\.\d+\.\d+$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Pull the backticked terms out of a slice of markdown. */
function backtickedTerms(markdown) {
  const found = [];
  const re = /`([a-z0-9-]+)`/g;
  let m;
  while ((m = re.exec(markdown)) !== null) found.push(m[1]);
  return found;
}

/** Type vocabulary, read from SYS-0003 rather than duplicated here. */
function loadTypeVocabulary(osRoot) {
  const text = fs.readFileSync(path.join(osRoot, '_System', '03_Metadata_Standard.md'), 'utf8');
  const section = text.split('## Type vocabulary')[1] || '';
  return new Set(backtickedTerms(section.split('\n##')[0]));
}

/**
 * Tag vocabulary, read from the facet sections of SYS-0005.
 * Only the "## Facet N" blocks count — the canonical-terms table lists banned
 * synonyms, and picking those up would defeat the check.
 */
function loadTagVocabulary(osRoot) {
  const text = fs.readFileSync(path.join(osRoot, '_System', '04_Taxonomy_and_Tags.md'), 'utf8');
  const tags = new Set();
  const facets = text.split(/^## Facet /m).slice(1);
  for (const facet of facets) {
    backtickedTerms(facet.split('\n## ')[0]).forEach((t) => tags.add(t));
  }
  return tags;
}

/** Registered ID prefixes, read from the Entity ID Registry. */
function loadPrefixes(osRoot) {
  const csv = fs.readFileSync(path.join(osRoot, '_Registry', 'Entity_ID_Registry.csv'), 'utf8');
  const prefixes = new Set();
  csv.trim().split('\n').slice(1).forEach((line) => {
    const prefix = line.split(',')[0].trim();
    if (prefix) prefixes.add(prefix);
  });
  return prefixes;
}

/** Split YAML front matter off a markdown file. Returns null when absent. */
function parseFrontMatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const fields = {};
  for (const line of match[1].split('\n')) {
    if (line.startsWith(' ') || line.startsWith('#')) continue;
    const idx = line.indexOf(':');
    if (idx <= 0) continue;
    fields[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
  return fields;
}

/** Parse a `[a, b, c]` inline YAML list into an array. */
function parseList(value) {
  if (!value) return [];
  return value.replace(/^\[|\]$/g, '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

/** RFC 4180 CSV parse — quoted fields may contain commas. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cell += '"'; i++; } else { quoted = false; }
      } else { cell += ch; }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ',') {
      row.push(cell); cell = '';
    } else if (ch === '\n') {
      row.push(cell); rows.push(row); row = []; cell = '';
    } else if (ch !== '\r') {
      cell += ch;
    }
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows.filter((r) => r.length > 1 || r[0] !== '');
}

/** Walk a directory collecting files with the given extension. */
function walk(dir, ext, found) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, ext, found);
    else if (entry.name.endsWith(ext)) found.push(full);
  }
  return found;
}

/**
 * Validate the OS. Returns { errors, warnings, stats }.
 * `errors` failing the build; `warnings` are advisory.
 */
function validateOS(osRoot = OS_ROOT) {
  const errors = [];
  const warnings = [];

  if (!fs.existsSync(osRoot)) {
    return { errors: [`OS root not found: ${osRoot}`], warnings, stats: {} };
  }

  const types = loadTypeVocabulary(osRoot);
  const tagVocab = loadTagVocabulary(osRoot);
  const prefixes = loadPrefixes(osRoot);

  const mdFiles = walk(osRoot, '.md', []);
  const csvFiles = walk(osRoot, '.csv', []);

  const idsSeen = new Map();
  const documents = [];

  for (const file of mdFiles) {
    const rel = path.relative(osRoot, file);
    const fm = parseFrontMatter(fs.readFileSync(file, 'utf8'));

    if (!fm) {
      errors.push(`${rel}: missing YAML front matter (SYS-0003)`);
      continue;
    }
    documents.push({ rel, fm });

    for (const field of REQUIRED_FIELDS) {
      if (!(field in fm)) errors.push(`${rel}: missing required field '${field}' (SYS-0003)`);
    }

    for (const [field, allowed] of Object.entries(ENUMS)) {
      if (fm[field] && !allowed.includes(fm[field])) {
        errors.push(`${rel}: ${field}='${fm[field]}' not in [${allowed.join(', ')}]`);
      }
    }

    if (fm.type && !types.has(fm.type)) {
      errors.push(`${rel}: type='${fm.type}' not in the SYS-0003 vocabulary`);
    }
    if (fm.version && !SEMVER.test(fm.version)) {
      errors.push(`${rel}: version='${fm.version}' is not semver (SYS-0007)`);
    }
    for (const field of ['created', 'updated', 'next_review']) {
      if (fm[field] && !ISO_DATE.test(fm[field])) {
        errors.push(`${rel}: ${field}='${fm[field]}' is not YYYY-MM-DD (SYS-0004)`);
      }
    }
    if (fm.source_of_truth && !['true', 'false'].includes(fm.source_of_truth)) {
      errors.push(`${rel}: source_of_truth='${fm.source_of_truth}' must be true or false`);
    }
    if (fm.owner === 'TBD' || fm.owner === '') {
      errors.push(`${rel}: owner must be a person, never TBD (SYS-0008)`);
    }

    // Domain must match the top-level folder the file actually sits in.
    if (fm.domain) {
      const top = rel.split(path.sep)[0];
      const expected = rel.includes(path.sep) ? top : 'Fishbeck_AI_OS';
      if (fm.domain !== expected) {
        errors.push(`${rel}: domain='${fm.domain}' but file is in '${expected}' (SYS-0002)`);
      }
    }

    // IDs: unique, and the prefix must be registered.
    if (fm.id) {
      if (idsSeen.has(fm.id)) {
        errors.push(`${rel}: duplicate id '${fm.id}' (also in ${idsSeen.get(fm.id)}) (SYS-0006)`);
      } else {
        idsSeen.set(fm.id, rel);
      }
      const prefix = fm.id.split('-')[0];
      if (!prefixes.has(prefix)) {
        errors.push(`${rel}: id prefix '${prefix}' is not registered in Entity_ID_Registry.csv (SYS-0006)`);
      }
    }

    // Tags: 2-8, drawn from the controlled vocabulary.
    const tags = parseList(fm.tags);
    if (tags.length < 2 || tags.length > 8) {
      warnings.push(`${rel}: ${tags.length} tags (SYS-0005 expects 2-8)`);
    }
    for (const tag of tags) {
      if (!tagVocab.has(tag)) {
        errors.push(`${rel}: tag '${tag}' is not in the SYS-0005 vocabulary`);
      }
    }
  }

  // Cross-reference pass: every `related:` ID must resolve to something real.
  //
  // Not every ID is a document. Decisions live as rows in the Decision Log
  // table (SYS-0012), and KPIs/automations live as CSV rows in _Registry.
  // Collect those too, or the check is pure noise.
  const resolvable = new Set(idsSeen.keys());

  const decisionLog = path.join(osRoot, '_System', 'Decision_Log.md');
  if (fs.existsSync(decisionLog)) {
    const text = fs.readFileSync(decisionLog, 'utf8');
    (text.match(/\bDEC-\d{4}\b/g) || []).forEach((id) => resolvable.add(id));
  }
  for (const registry of ['KPI_Registry.csv', 'Automation_Backlog.csv']) {
    const file = path.join(osRoot, '_Registry', registry);
    if (!fs.existsSync(file)) continue;
    parseCsv(fs.readFileSync(file, 'utf8')).slice(1).forEach((row) => {
      if (row[0]) resolvable.add(row[0].trim());
    });
  }

  for (const { rel, fm } of documents) {
    for (const ref of parseList(fm.related)) {
      if (!resolvable.has(ref)) {
        warnings.push(`${rel}: related id '${ref}' does not resolve to a document or registry row`);
      }
    }
  }

  // CSVs: rectangular, and carrying the mandatory columns.
  for (const file of csvFiles) {
    const rel = path.relative(osRoot, file);
    const rows = parseCsv(fs.readFileSync(file, 'utf8'));
    if (rows.length === 0) {
      errors.push(`${rel}: empty CSV`);
      continue;
    }
    const header = rows[0];
    rows.forEach((row, i) => {
      if (row.length !== header.length) {
        errors.push(`${rel}: row ${i} has ${row.length} fields, header has ${header.length}`);
      }
    });
    // Registry files are indexes with their own shapes, not domain databases.
    if (!rel.startsWith('_Registry')) {
      for (const col of REQUIRED_CSV_COLUMNS) {
        if (!header.includes(col)) {
          warnings.push(`${rel}: missing mandatory column '${col}' (SYS-0003)`);
        }
      }
    }
  }

  return {
    errors,
    warnings,
    stats: {
      documents: documents.length,
      markdownFiles: mdFiles.length,
      csvFiles: csvFiles.length,
      uniqueIds: idsSeen.size,
      tagVocabulary: tagVocab.size,
      registeredPrefixes: prefixes.size,
    },
  };
}

module.exports = { validateOS, parseFrontMatter, parseCsv, parseList };

// CLI: `node scripts/validate-os.js`
if (require.main === module) {
  const { errors, warnings, stats } = validateOS();
  console.log('Fishbeck OS validation');
  console.log(`  ${stats.documents}/${stats.markdownFiles} markdown files with front matter`);
  console.log(`  ${stats.uniqueIds} unique IDs · ${stats.csvFiles} CSVs`);
  console.log(`  ${stats.tagVocabulary} tags · ${stats.registeredPrefixes} prefixes\n`);
  warnings.forEach((w) => console.log(`  warn  ${w}`));
  errors.forEach((e) => console.log(`  ERROR ${e}`));
  console.log(`\n${errors.length} error(s), ${warnings.length} warning(s)`);
  process.exit(errors.length > 0 ? 1 : 0);
}
