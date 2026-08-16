'use strict';

const { validateOS, parseFrontMatter, parseCsv, parseList } = require('../scripts/validate-os');

describe('Fishbeck OS validation (AUT-001)', () => {
  const result = validateOS();

  test('every document satisfies the SYS-0003 metadata standard', () => {
    // Printed so a CI failure names the offending files rather than just a count.
    if (result.errors.length > 0) {
      console.error('\nOS validation errors:\n  ' + result.errors.join('\n  ') + '\n');
    }
    expect(result.errors).toEqual([]);
  });

  test('no advisory warnings outstanding', () => {
    if (result.warnings.length > 0) {
      console.warn('\nOS validation warnings:\n  ' + result.warnings.join('\n  ') + '\n');
    }
    expect(result.warnings).toEqual([]);
  });

  test('the OS is non-empty and fully addressable', () => {
    expect(result.stats.documents).toBeGreaterThan(100);
    expect(result.stats.documents).toBe(result.stats.markdownFiles);
    expect(result.stats.uniqueIds).toBe(result.stats.documents);
  });

  test('vocabularies are read from the standards, not hardcoded', () => {
    expect(result.stats.tagVocabulary).toBeGreaterThan(50);
    expect(result.stats.registeredPrefixes).toBeGreaterThan(40);
  });
});

describe('validator helpers', () => {
  test('parseFrontMatter returns null when front matter is absent', () => {
    expect(parseFrontMatter('# Just a heading\n')).toBeNull();
  });

  test('parseFrontMatter reads scalar fields', () => {
    const fm = parseFrontMatter('---\nid: SYS-0001\nstatus: approved\n---\n\n# Doc\n');
    expect(fm.id).toBe('SYS-0001');
    expect(fm.status).toBe('approved');
  });

  test('parseList splits inline YAML lists', () => {
    expect(parseList('[a, b, c]')).toEqual(['a', 'b', 'c']);
    expect(parseList('')).toEqual([]);
  });

  test('parseCsv keeps commas inside quoted fields', () => {
    const rows = parseCsv('id,title\nA-1,"Contracts, Insurance, and Risk"\n');
    expect(rows[1]).toEqual(['A-1', 'Contracts, Insurance, and Risk']);
  });

  test('parseCsv handles escaped double quotes', () => {
    const rows = parseCsv('id,item\nM-1,"1/2"" drywall"\n');
    expect(rows[1][1]).toBe('1/2" drywall');
  });
});
