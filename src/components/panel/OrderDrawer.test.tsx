import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { OrderDrawer } from './OrderDrawer';
import type { Product } from '@/models/Product';
import type { CreateOrderDto } from '@/services/OrderService';

const mockSafePrice = (v: unknown): number => Number(v) || 0;

const mockProducts: Product[] = [
  { cod_prod: 1, nom_prod: 'Galletas', precio_prod: 1500, stock_actual: 10, stock_minimo: 5 },
  { cod_prod: 2, nom_prod: 'Agua', precio_prod: 2000, stock_actual: 0, stock_minimo: 5 },
];

const mockOrderForm: CreateOrderDto = {
  metodopago_usu: 'efectivo',
  items: [
    { cod_prod: 1, cantidad: 2, precio_unit: 1500, nom_prod: 'Galletas' }
  ]
};

describe('OrderDrawer', () => {
  it('does not render if drawerOpen is false', () => {
    render(
      <OrderDrawer
        drawerOpen={false}
        onClose={vi.fn()}
        prodSearch=""
        setProdSearch={vi.fn()}
        filteredProducts={mockProducts}
        addToCart={vi.fn()}
        removeFromCart={vi.fn()}
        updateQuantity={vi.fn()}
        orderForm={{ metodopago_usu: 'efectivo', items: [] }}
        setOrderForm={vi.fn()}
        cartTotal={0}
        handleCreateOrder={vi.fn()}
        onCancelOrder={vi.fn()}
        saving={false}
        safePrice={mockSafePrice}
        categories={[]}
        selectedCategories={[]}
        setSelectedCategories={vi.fn()}
      />
    );
    expect(screen.queryByText(/Punto de/)).not.toBeInTheDocument();
  });

  it('renders products and cart items when open', () => {
    render(
      <OrderDrawer
        drawerOpen={true}
        onClose={vi.fn()}
        prodSearch=""
        setProdSearch={vi.fn()}
        filteredProducts={mockProducts}
        addToCart={vi.fn()}
        removeFromCart={vi.fn()}
        updateQuantity={vi.fn()}
        orderForm={mockOrderForm}
        setOrderForm={vi.fn()}
        cartTotal={3000}
        handleCreateOrder={vi.fn()}
        onCancelOrder={vi.fn()}
        saving={false}
        safePrice={mockSafePrice}
        categories={[]}
        selectedCategories={[]}
        setSelectedCategories={vi.fn()}
      />
    );

    // POS header is displayed
    expect(screen.getByText(/Punto de/)).toBeInTheDocument();
    expect(screen.getByText(/Venta/)).toBeInTheDocument();
    // Products should be rendered
    expect(screen.getAllByText(/Galletas/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Agua')).toBeInTheDocument();
    // Cart section visible
    expect(screen.getByText(/Carrito/)).toBeInTheDocument();
  });

  it('calls addToCart when a product is clicked', () => {
    const addToCart = vi.fn();
    render(
      <OrderDrawer
        drawerOpen={true}
        onClose={vi.fn()}
        prodSearch=""
        setProdSearch={vi.fn()}
        filteredProducts={mockProducts}
        addToCart={addToCart}
        removeFromCart={vi.fn()}
        updateQuantity={vi.fn()}
        orderForm={mockOrderForm}
        setOrderForm={vi.fn()}
        cartTotal={3000}
        handleCreateOrder={vi.fn()}
        onCancelOrder={vi.fn()}
        saving={false}
        safePrice={mockSafePrice}
        categories={[]}
        selectedCategories={[]}
        setSelectedCategories={vi.fn()}
      />
    );

    const productButtons = screen.getAllByRole('button');
    const galletasBtn = productButtons.find(b => b.textContent?.includes('Galletas'));
    if (galletasBtn) {
       fireEvent.click(galletasBtn);
    }
    expect(addToCart).toHaveBeenCalledWith(mockProducts[0]);
  });

  it('renders cart section with items', () => {
    const removeFromCart = vi.fn();
    render(
      <OrderDrawer
        drawerOpen={true}
        onClose={vi.fn()}
        prodSearch=""
        setProdSearch={vi.fn()}
        filteredProducts={mockProducts}
        addToCart={vi.fn()}
        removeFromCart={removeFromCart}
        updateQuantity={vi.fn()}
        orderForm={mockOrderForm}
        setOrderForm={vi.fn()}
        cartTotal={3000}
        handleCreateOrder={vi.fn()}
        onCancelOrder={vi.fn()}
        saving={false}
        safePrice={mockSafePrice}
        categories={[]}
        selectedCategories={[]}
        setSelectedCategories={vi.fn()}
      />
    );

    // Cart section should be rendered
    const cartSection = screen.getByText(/Carrito/);
    expect(cartSection).toBeInTheDocument();

    // REALIZAR COBRO button should exist
    expect(screen.getByText(/REALIZAR COBRO/)).toBeInTheDocument();
    // CANCELAR PEDIDO button should exist
    expect(screen.getByText(/CANCELAR PEDIDO/)).toBeInTheDocument();
  });
});
