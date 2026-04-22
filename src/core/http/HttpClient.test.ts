import { describe, it, expect } from 'vitest';
import { errorMessageFromResponseBody } from './HttpClient';

describe('errorMessageFromResponseBody', () => {
  it('usa message string', () => {
    expect(errorMessageFromResponseBody({ message: 'No autorizado' }, 401)).toBe('No autorizado');
  });

  it('concatena errors de validación', () => {
    expect(
      errorMessageFromResponseBody({ errors: ['a', 'b'] }, 400)
    ).toBe('a, b');
  });

  it('usa status si no hay cuerpo útil', () => {
    expect(errorMessageFromResponseBody({}, 500)).toBe('Error 500');
  });
});
