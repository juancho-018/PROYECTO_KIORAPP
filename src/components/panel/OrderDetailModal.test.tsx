import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { OrderDetailModal } from './OrderDetailModal';
import type { Order } from '@/models/Order';

const mockSafePrice = (v: unknown): number => Number(v) || 0;
const mockEstadoColors = {
  pendiente: 'bg-amber-100 text-amber-700',
  completada: 'bg-emerald-100 text-emerald-700',
  cancelada: 'bg-red-100 text-red-600',
};

const mockOrder: Order = {
  id_vent: 101,
  fecha_vent: new Date('2026-04-16T12:00:00Z').toISOString(),
  metodopago_usu: 'tarjeta',
  estado: 'completada',
  montofinal_vent: 50000,
  items: [
    {
      cod_prod: 1,
      cantidad: 2,
      precio_unit: 25000,
      nom_prod: 'Producto A'
    }
  ]
};

describe('OrderDetailModal', () => {
  it('renders order details correctly', () => {
    const onClose = vi.fn();
    render(
      <OrderDetailModal
        detailOrder={mockOrder}
        onClose={onClose}
        safePrice={mockSafePrice}
        estadoColors={mockEstadoColors}
      />
    );

    // Check header
    expect(screen.getByText(/Venta/)).toBeInTheDocument();
    expect(screen.getByText('#101')).toBeInTheDocument();

    // Check content
    expect(screen.getByText('tarjeta')).toBeInTheDocument();
    expect(screen.getByText('completada')).toBeInTheDocument();
    expect(screen.getByText('Producto A')).toBeInTheDocument();
    
    // Check calculations are rendered
    expect(screen.getAllByText('$50.000').length).toBeGreaterThan(0);
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = vi.fn();
    render(
      <OrderDetailModal
        detailOrder={mockOrder}
        onClose={onClose}
        safePrice={mockSafePrice}
        estadoColors={mockEstadoColors}
      />
    );

    const closeBtn = screen.getByLabelText('Cerrar detalle');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking backdrop', () => {
    const onClose = vi.fn();
    render(
      <OrderDetailModal
        detailOrder={mockOrder}
        onClose={onClose}
        safePrice={mockSafePrice}
        estadoColors={mockEstadoColors}
      />
    );

    const backdrop = screen.getByLabelText('Cerrar modal');
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not call onClose when clicking inside the modal content', () => {
    const onClose = vi.fn();
    render(
      <OrderDetailModal
        detailOrder={mockOrder}
        onClose={onClose}
        safePrice={mockSafePrice}
        estadoColors={mockEstadoColors}
      />
    );

    const content = screen.getByText('Venta');
    fireEvent.click(content);
    expect(onClose).not.toHaveBeenCalled();
  });
});
