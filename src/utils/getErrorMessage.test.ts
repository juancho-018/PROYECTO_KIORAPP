import { describe, it, expect } from 'vitest';
import { getErrorMessage } from './getErrorMessage';

describe('getErrorMessage', () => {
  it('extrae message de Error', () => {
    expect(getErrorMessage(new Error('fallo'), 'x')).toBe('fallo');
  });

  it('string directo', () => {
    expect(getErrorMessage('texto', 'x')).toBe('texto');
  });

  it('fallback', () => {
    expect(getErrorMessage(null, 'def')).toBe('def');
  });
});
