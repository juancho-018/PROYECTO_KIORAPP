import { describe, it, expect } from 'vitest';
import { getPaginationPages } from './pagination';

describe('getPaginationPages', () => {
  it('devuelve todas las páginas si son pocas', () => {
    expect(getPaginationPages(1, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it('usa elipsis cuando hay muchas páginas', () => {
    const pages = getPaginationPages(10, 50);
    expect(pages).toContain(1);
    expect(pages).toContain(50);
    expect(pages).toContain('ellipsis');
    expect(pages.length).toBeLessThan(15);
  });

  it('incluye la página actual y vecinos', () => {
    const pages = getPaginationPages(25, 100);
    expect(pages).toContain(25);
    expect(pages).toContain(24);
    expect(pages).toContain(26);
  });

  it('maneja total vacío', () => {
    expect(getPaginationPages(1, 0)).toEqual([]);
  });
});
