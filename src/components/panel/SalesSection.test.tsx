import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SalesSection } from './SalesSection';

// Mock services to prevent actual HTTP calls during render
vi.mock('@/config/setup', () => ({
  orderService: {
    getOrders: vi.fn().mockResolvedValue({ data: [], pagination: { totalPages: 1 } }),
    getInvoices: vi.fn().mockResolvedValue({ data: [] }),
  },
  productService: {
    getProducts: vi.fn().mockResolvedValue([{ cod_prod: 1, nom_prod: 'Galletas', precio_prod: 1000 }]),
  },
  inventoryService: {
    getMovements: vi.fn().mockResolvedValue([]),
  },
  alertService: {
    showToast: vi.fn(),
    showConfirm: vi.fn().mockResolvedValue(true),
  },
  authService: {
    getUser: vi.fn().mockReturnValue({ id: 1, id_usu: 1, correo_usu: 'test@kiora.com' }),
  }
}));

const SalesSectionWrapper = () => {
  const [orderForm, setOrderForm] = React.useState({
    metodopago_usu: 'efectivo',
    items: [],
  });

  return (
    <SalesSection 
      orderForm={orderForm}
      setOrderForm={setOrderForm}
      addToCart={(p) => setOrderForm(f => ({ ...f, items: [...f.items, { cod_prod: p.cod_prod!, cantidad: 1, precio_unit: p.precio_prod, nom_prod: p.nom_prod }] }))}
      removeFromCart={(id) => setOrderForm(f => ({ ...f, items: f.items.filter(i => i.cod_prod !== id) }))}
      updateQuantity={(id, d) => setOrderForm(f => ({ ...f, items: f.items.map(i => i.cod_prod === id ? { ...i, cantidad: i.cantidad + d } : i) }))}
      clearCart={() => setOrderForm({ metodopago_usu: 'efectivo', items: [] })}
      cartKey="test_cart"
    />
  );
};

describe('SalesSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading initially and then shows the sales table', async () => {
    render(<SalesSectionWrapper />);

    await waitFor(() => {
      expect(screen.getByText('No hay ventas registradas.')).toBeInTheDocument();
    });
  });

  it('can switch to Facturas tab', async () => {
    render(<SalesSectionWrapper />);

    await waitFor(() => {
      expect(screen.getByText('No hay ventas registradas.')).toBeInTheDocument();
    });

    const facturasTab = screen.getByText('facturas');
    fireEvent.click(facturasTab);

    expect(screen.getByText('Sin facturas emitidas')).toBeInTheDocument();
  });

  it('can switch to Movimientos tab', async () => {
    render(<SalesSectionWrapper />);

    await waitFor(() => {
      expect(screen.getByText('No hay ventas registradas.')).toBeInTheDocument();
    });

    const movTab = screen.getByText('movimientos');
    fireEvent.click(movTab);

    expect(screen.getByText('Sin movimientos registrados')).toBeInTheDocument();
  });

  it('opens Nueva Venta drawer when button is clicked', async () => {
    render(<SalesSectionWrapper />);

    await waitFor(() => {
      expect(screen.getByText('No hay ventas registradas.')).toBeInTheDocument();
    });

    const nuevaVentaBtn = screen.getByText('Nueva Venta');
    fireEvent.click(nuevaVentaBtn);

    expect(screen.getByText('Punto de')).toBeInTheDocument();
  });

  it('calls handleCancelOrder and clears the cart when confirmed', async () => {
    const { alertService } = await import('@/config/setup');
    render(<SalesSectionWrapper />);
    await waitFor(() => {
      expect(screen.getByText('No hay ventas registradas.')).toBeInTheDocument();
    });

    // Abrir drawer
    fireEvent.click(screen.getByText('Nueva Venta'));
    
    // El drawer debe mostrar productos. Vamos a añadir uno.
    const productBtn = await screen.findByText(/Galletas/i);
    fireEvent.click(productBtn.closest('button')!);

    // Esperar a que el estado se actualice y el botón se habilite
    const cancelBtn = screen.getByText(/CANCELAR PEDIDO/i);
    await waitFor(() => {
      expect(cancelBtn).not.toBeDisabled();
    });
    fireEvent.click(cancelBtn);

    expect(alertService.showConfirm).toHaveBeenCalled();

    await waitFor(() => {
      expect(alertService.showToast).toHaveBeenCalledWith('info', expect.stringContaining('Pedido cancelado'));
    });
  });
});
