const { callClaude } = require('../lib/claude');

// Shared mock for messages.create — all Anthropic instances use this same fn
const mockCreate = jest.fn();

// Mock the Anthropic SDK so tests don't hit the real API
jest.mock('@anthropic-ai/sdk', () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      create: mockCreate
    }
  }));
});

const Anthropic = require('@anthropic-ai/sdk');

describe('callClaude', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('returns parsed estimate object on valid JSON response', async () => {
    const fakeResponse = {
      content: [{
        text: JSON.stringify({
          status: 'estimate',
          clarification_message: null,
          line_items: [{ label: 'Unit Turn x2', description: 'Standard turn', range_low: 1600, range_high: 3000 }],
          total_low: 1600,
          total_high: 3000,
          notes: null,
          out_of_scope: []
        })
      }]
    };

    mockCreate.mockResolvedValue(fakeResponse);

    const result = await callClaude('2 unit turns', 'system prompt here');
    expect(result.status).toBe('estimate');
    expect(result.line_items).toHaveLength(1);
    expect(result.total_low).toBe(1600);
  });

  test('returns clarification_needed when Claude signals it', async () => {
    const fakeResponse = {
      content: [{
        text: JSON.stringify({
          status: 'clarification_needed',
          clarification_message: 'Please tell us the property type.',
          line_items: [],
          total_low: 0,
          total_high: 0,
          notes: null,
          out_of_scope: []
        })
      }]
    };

    mockCreate.mockResolvedValue(fakeResponse);

    const result = await callClaude('fix my property', 'system prompt here');
    expect(result.status).toBe('clarification_needed');
    expect(result.clarification_message).toBeTruthy();
  });

  test('throws on invalid JSON from Claude', async () => {
    const fakeResponse = {
      content: [{ text: 'Here is your estimate: it will cost a lot.' }]
    };

    mockCreate.mockResolvedValue(fakeResponse);

    await expect(callClaude('some input', 'system prompt')).rejects.toThrow('invalid_json');
  });

  test('throws on API error', async () => {
    mockCreate.mockRejectedValue(new Error('API unavailable'));

    await expect(callClaude('some input', 'system prompt')).rejects.toThrow();
  });

  test('throws api_timeout when API call exceeds 25 seconds', async () => {
    jest.useFakeTimers();

    mockCreate.mockReturnValue(new Promise(() => {}));

    const callPromise = callClaude('some input', 'system prompt');
    jest.advanceTimersByTime(25001);

    await expect(callPromise).rejects.toThrow('api_timeout');
    jest.useRealTimers();
  });
});
