import { describe, expect, it } from 'vitest';

import { buildLookup, resolveIds } from './resolve-relations';

// ─── buildLookup ─────────────────────────────────────────────────────────────

describe('buildLookup', () => {
  it('creates a map from id to item', () => {
    const items = [
      { id: 'a', name: 'Alpha' },
      { id: 'b', name: 'Beta' },
    ];
    const map = buildLookup(items);
    expect(map.get('a')).toEqual({ id: 'a', name: 'Alpha' });
    expect(map.get('b')).toEqual({ id: 'b', name: 'Beta' });
  });

  it('returns an empty map for an empty array', () => {
    expect(buildLookup([]).size).toBe(0);
  });

  it('last entry wins when ids are duplicated', () => {
    const items = [
      { id: 'x', name: 'First' },
      { id: 'x', name: 'Second' },
    ];
    const map = buildLookup(items);
    expect(map.get('x')?.name).toBe('Second');
    expect(map.size).toBe(1);
  });

  it('does not include extra keys beyond what was passed', () => {
    const items = [{ id: '1', value: 42 }];
    const map = buildLookup(items);
    expect(map.has('2')).toBe(false);
  });
});

// ─── resolveIds ──────────────────────────────────────────────────────────────

describe('resolveIds', () => {
  const items = [
    { id: '1', name: 'One' },
    { id: '2', name: 'Two' },
    { id: '3', name: 'Three' },
  ];
  const lookup = buildLookup(items);

  it('resolves all matching ids', () => {
    const result = resolveIds(['1', '3'], lookup);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('One');
    expect(result[1].name).toBe('Three');
  });

  it('drops ids with no matching entry', () => {
    const result = resolveIds(['1', 'missing', '3'], lookup);
    expect(result).toHaveLength(2);
    expect(result.map((r) => r.name)).toEqual(['One', 'Three']);
  });

  it('preserves the ordering of the input ids', () => {
    const result = resolveIds(['3', '1', '2'], lookup);
    expect(result.map((r) => r.name)).toEqual(['Three', 'One', 'Two']);
  });

  it('returns an empty array for empty ids', () => {
    expect(resolveIds([], lookup)).toEqual([]);
  });

  it('returns an empty array when the lookup is empty', () => {
    expect(resolveIds(['1', '2'], new Map())).toEqual([]);
  });

  it('handles duplicate ids in the input', () => {
    const result = resolveIds(['1', '1'], lookup);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('One');
    expect(result[1].name).toBe('One');
  });
});
