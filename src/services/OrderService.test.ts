import { describe, it, expect, vi } from 'vitest';
import type { IHttpClient, HttpResponse } from '@/core/http/HttpClient';
import { OrderService } from './OrderService';
import type { CreateOrderDto, Order } from '@/models/Order';

function okResponse<T>(data: T): HttpResponse<T> {
  return { data, error: null, status: 200, ok: true };
}

function errResponse<T>(message: string, status = 400): HttpResponse<T> {
  return { data: null, error: message, status, ok: false };
}

describe('OrderService.createCompletedSale', () => {
  it('crea y completa la venta', async () => {
    const httpClient: IHttpClient = {
      get: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      post: vi.fn()
        .mockResolvedValueOnce(okResponse<Order>({
          id_vent: 1,
          precio_prod_final: 1000,
          montofinal_vent: 1000,
          fecha_vent: new Date().toISOString(),
          estado: 'pendiente'
        }))
        .mockResolvedValueOnce(okResponse<Order>({
          id_vent: 1,
          precio_prod_final: 1000,
          montofinal_vent: 1000,
          fecha_vent: new Date().toISOString(),
          estado: 'completada'
        })),
      patch: vi.fn()
        .mockResolvedValueOnce(okResponse<Order>({
          id_vent: 1,
          precio_prod_final: 1000,
          montofinal_vent: 1000,
          fecha_vent: new Date().toISOString(),
          estado: 'completada'
        }))
    };
    const authService = { getToken: vi.fn(() => 'token') } as any;
    const service = new OrderService(httpClient, authService);
    const dto: CreateOrderDto = {
      metodopago_usu: 'Efectivo',
      items: [{ cod_prod: 1, cantidad: 1, precio_unit: 1000 }]
    };

    const result = await service.createCompletedSale(dto);

    expect(result.estado).toBe('completada');
    expect(httpClient.post).toHaveBeenCalledWith('/orders', dto, expect.any(Object));
    expect(httpClient.patch).toHaveBeenCalledWith('/orders/1/status', { estado: 'completada' }, expect.any(Object));
  });

  it('intenta cancelar si falla completar', async () => {
    const httpClient: IHttpClient = {
      get: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      post: vi.fn().mockResolvedValue(okResponse<Order>({
        id_vent: 5,
        precio_prod_final: 2000,
        montofinal_vent: 2000,
        fecha_vent: new Date().toISOString(),
        estado: 'pendiente'
      })),
      patch: vi.fn()
        .mockResolvedValueOnce(errResponse<Order>('sin stock', 409))
        .mockResolvedValueOnce(okResponse<Order>({
          id_vent: 5,
          precio_prod_final: 2000,
          montofinal_vent: 2000,
          fecha_vent: new Date().toISOString(),
          estado: 'cancelada'
        }))
    };
    const authService = { getToken: vi.fn(() => 'token') } as any;
    const service = new OrderService(httpClient, authService);

    await expect(service.createCompletedSale({
      metodopago_usu: 'Efectivo',
      items: [{ cod_prod: 10, cantidad: 2, precio_unit: 1000 }]
    })).rejects.toThrow('sin stock');

    expect(httpClient.patch).toHaveBeenNthCalledWith(1, '/orders/5/status', { estado: 'completada' }, expect.any(Object));
    expect(httpClient.patch).toHaveBeenNthCalledWith(2, '/orders/5/status', { estado: 'cancelada' }, expect.any(Object));
  });
});
