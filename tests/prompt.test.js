const { buildSystemPrompt } = require('../lib/prompt');

describe('buildSystemPrompt', () => {
  test('returns a non-empty string', () => {
    const prompt = buildSystemPrompt();
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(100);
  });

  test('includes Fishbeck company name', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain('Fishbeck Innovations');
  });

  test('includes pricing for unit turns', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain('Unit turn');
    expect(prompt).toContain('800');
    expect(prompt).toContain('1,500');
  });

  test('includes JSON schema instruction', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain('clarification_needed');
    expect(prompt).toContain('line_items');
    expect(prompt).toContain('total_low');
    expect(prompt).toContain('out_of_scope');
  });

  test('instructs Claude to return JSON only', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain('No prose');
    expect(prompt.toLowerCase()).toContain('json');
  });

  test('includes all major service categories', () => {
    const prompt = buildSystemPrompt();
    const categories = [
      'Bathroom', 'Kitchen', 'Roofing', 'Demolition',
      'Flooring', 'Painting', 'Drywall', 'Fixtures',
      'Exterior', 'General'
    ];
    categories.forEach(cat => {
      expect(prompt).toContain(cat);
    });
  });

  test('includes out_of_scope instructions', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain('out_of_scope');
    expect(prompt).toContain('HVAC');
    expect(prompt).toContain('structural');
  });

  test('includes multi-unit multiplication rule', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain('multiply');
    expect(prompt).toContain('Show the math');
  });

  test('includes Twin Cities location context', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain('Twin Cities');
    expect(prompt).toContain('Minnesota');
  });

  test('returns identical string on repeated calls', () => {
    const prompt1 = buildSystemPrompt();
    const prompt2 = buildSystemPrompt();
    expect(prompt1).toBe(prompt2);
  });
});
