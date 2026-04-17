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
        saving={false}
        safePrice={mockSafePrice}
      />
    );
    expect(screen.queryByText('Punto de Venta')).not.toBeInTheDocument();
  });

  it('renders products and cart items', () => {
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
        saving={false}
        safePrice={mockSafePrice}
      />
    );

    expect(screen.getAllByText(/Galletas/i).length).toBeGreaterThanOrEqual(1); // One in catalog, one in cart
    expect(screen.getByText('Agua')).toBeInTheDocument();
    
    // Check out of stock visualization
    expect(screen.getByText('Agotado')).toBeInTheDocument();

    // Check cart total (It appears in the item subtotal and the cart total)
    expect(screen.getAllByText('3.000').length).toBeGreaterThanOrEqual(1);
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
        saving={false}
        safePrice={mockSafePrice}
      />
    );

    const productButtons = screen.getAllByRole('button');
    // Find the Galletas btn (it's the first button that has Galletas in it)
    const galletasBtn = productButtons.find(b => b.textContent?.includes('Galletas'));
    if (galletasBtn) {
       fireEvent.click(galletasBtn);
    }
    expect(addToCart).toHaveBeenCalledWith(mockProducts[0]);
  });

  it('calls setProdSearch on typing in search box', () => {
    const setProdSearch = vi.fn();
    render(
      <OrderDrawer
        drawerOpen={true}
        onClose={vi.fn()}
        prodSearch=""
        setProdSearch={setProdSearch}
        filteredProducts={mockProducts}
        addToCart={vi.fn()}
        removeFromCart={vi.fn()}
        updateQuantity={vi.fn()}
        orderForm={mockOrderForm}
        setOrderForm={vi.fn()}
        cartTotal={3000}
        handleCreateOrder={vi.fn()}
        saving={false}
        safePrice={mockSafePrice}
      />
    );

    const input = screen.getByPlaceholderText(/Buscar producto por nombre o código/i);
    fireEvent.change(input, { target: { value: 'test' } });
    expect(setProdSearch).toHaveBeenCalledWith('test');
  });

  it('calls removeFromCart and updateQuantity correctly', () => {
    const removeFromCart = vi.fn();
    const updateQuantity = vi.fn();
    render(
      <OrderDrawer
        drawerOpen={true}
        onClose={vi.fn()}
        prodSearch=""
        setProdSearch={vi.fn()}
        filteredProducts={mockProducts}
        addToCart={vi.fn()}
        removeFromCart={removeFromCart}
        updateQuantity={updateQuantity}
        orderForm={mockOrderForm}
        setOrderForm={vi.fn()}
        cartTotal={3000}
        handleCreateOrder={vi.fn()}
        saving={false}
        safePrice={mockSafePrice}
      />
    );

    const decreaseBtn = screen.getByLabelText('Disminuir cantidad');
    const increaseBtn = screen.getByLabelText('Aumentar cantidad');
    const removeBtn = screen.getByLabelText('Remover del carrito');

    fireEvent.click(increaseBtn);
    expect(updateQuantity).toHaveBeenCalledWith(1, 1);

    fireEvent.click(decreaseBtn);
    expect(updateQuantity).toHaveBeenCalledWith(1, -1);

    fireEvent.click(removeBtn);
    expect(removeFromCart).toHaveBeenCalledWith(1);
  });

  it('calls handleCreateOrder but prevents if empty cart', () => {
    const handleCreateOrder = vi.fn();
    
    // Initial Render with items
    const { rerender } = render(
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
        handleCreateOrder={handleCreateOrder}
        saving={false}
        safePrice={mockSafePrice}
      />
    );

    const createBtn = screen.getByText('REALIZAR COBRO');
    fireEvent.click(createBtn);
    expect(handleCreateOrder).toHaveBeenCalledTimes(1);

    // Rerender with empty cart
    rerender(
      <OrderDrawer
        drawerOpen={true}
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
        handleCreateOrder={handleCreateOrder}
        saving={false}
        safePrice={mockSafePrice}
      />
    );

    const disabledBtn = screen.getByRole('button', { name: /REALIZAR COBRO/i });
    expect(disabledBtn).toBeDisabled();
  });
});
