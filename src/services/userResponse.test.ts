import { describe, it, expect } from 'vitest';
import { parsePaginatedUsersPayload } from './userResponse';

describe('parsePaginatedUsersPayload', () => {
  it('parsea objeto con data y pagination', () => {
    const raw = {
      data: [{ correo_usu: 'a@b.com' }],
      pagination: { page: 2, limit: 10, total: 25, totalPages: 3 },
    };
    const r = parsePaginatedUsersPayload(raw, 2, 10);
    expect(r.data).toHaveLength(1);
    expect(r.pagination.totalPages).toBe(3);
  });

  it('parsea array plano', () => {
    const raw = [{ correo_usu: 'a@b.com' }, { correo_usu: 'c@d.com' }];
    const r = parsePaginatedUsersPayload(raw, 1, 10);
    expect(r.data).toHaveLength(2);
    expect(r.pagination.totalPages).toBe(1);
  });

  it('rechaza formato inválido', () => {
    expect(() => parsePaginatedUsersPayload({ foo: 1 }, 1, 10)).toThrow();
  });
});
