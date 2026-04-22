import React, { useState, useEffect, useMemo, useRef } from 'react';
import { productService } from '@/config/setup';
import { useStockSync } from '@/context/StockContext';
import type { Product } from '@/models/Product';
import { findSuggestions } from '@/utils/searchUtils';

interface CartItem {
  product: Product;
  quantity: number;
}

interface OrderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: () => void;
  onSubmit: (items: { cod_prod: number; cantidad: number; precio_unit: number }[]) => Promise<void>;
  isSubmitting: boolean;
}

export const OrderDrawer: React.FC<OrderDrawerProps> = ({ 
  isOpen, 
  onClose, 
  onOrderCreated, 
  onSubmit, 
  isSubmitting 
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { stockSyncVersion } = useStockSync();

  useEffect(() => {
    if (isOpen) {
      loadProducts(true); // Always fresh
      setCart([]);
      setSearchTerm('');
      setSelectedCategory(null);
      // Focus search input after a short delay for the animation
      setTimeout(() => searchInputRef.current?.focus(), 500);
    }
  }, [isOpen, stockSyncVersion]);

  const loadProducts = async (isManual = false) => {
    if (!isManual && !isOpen) return;
    setIsLoading(true);
    try {
      const data = await productService.fetchProducts(500, 0); // Increased limit
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading products for sale:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    let result = products;

    if (selectedCategory) {
       result = result.filter(p => 
          p.nom_cat?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
          (selectedCategory === 'comida' && p.nom_cat?.toLowerCase().includes('alimento'))
       );
    }

    if (!searchTerm.trim()) return result;
    
    const lower = searchTerm.toLowerCase();
    return result.filter(p => 
      p.nom_prod.toLowerCase().includes(lower) || 
      p.descrip_prod?.toLowerCase().includes(lower) ||
      p.nom_cat?.toLowerCase().includes(lower)
    );
  }, [products, searchTerm, selectedCategory]);

  useEffect(() => {
    if (searchTerm.length > 2 && filteredProducts.length === 0) {
       const names = products.map(p => p.nom_prod);
       setSuggestions(findSuggestions(searchTerm, names));
    } else {
       setSuggestions([]);
    }
  }, [searchTerm, products, filteredProducts]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.cod_prod === product.cod_prod);
      if (existing) {
        if (existing.quantity >= product.stock_actual) {
          return prev;
        }
        return prev.map(item => 
          item.product.cod_prod === product.cod_prod 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (cod_prod: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.cod_prod === cod_prod) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const total = cart.reduce((sum, item) => sum + (item.product.precio_unitario * item.quantity), 0);
  const formattedTotal = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(total);

  const handleConfirmOrder = async () => {
    if (cart.length === 0) return;
    const hasInvalidQuantity = cart.some((item) => item.quantity > item.product.stock_actual);
    if (hasInvalidQuantity) {
      void loadProducts(true);
      return;
    }
    const items = cart.map(item => ({
      cod_prod: item.product.cod_prod,
      cantidad: item.quantity,
      precio_unit: item.product.precio_unitario
    }));
    
    try {
      await onSubmit(items);
      onOrderCreated();
      onClose();
    } catch (error: unknown) {
      console.error('Error in handleConfirmOrder:', error);
      // Actualizar stock si hubo error para mostrar la realidad actual (p.ej. alguien más compró)
      void loadProducts();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex justify-end overflow-hidden">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-500" 
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative flex h-full w-full max-w-2xl flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-500">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-slate-100 px-8 py-6">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">Nueva Venta</h2>
            <p className="text-sm font-medium text-slate-500 mt-1">Selecciona productos para registrar una salida.</p>
          </div>
          <button 
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Side: Product Selector */}
          <div className="flex w-1/2 flex-col border-r border-slate-100 bg-slate-50/50">
            <div className="p-6 space-y-4">
              <div className="relative group">
                <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 group-focus-within:text-[#ec131e] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Buscar producto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border-none bg-white py-2.5 pl-10 pr-4 text-sm font-medium shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-[#ec131e] outline-none transition-all"
                />

                {/* Suggestions Popup */}
                {suggestions.length > 0 && filteredProducts.length === 0 && (
                  <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-xl border border-slate-100 bg-white p-3 shadow-xl animate-in fade-in slide-in-from-top-1">
                    <p className="mb-2 text-[9px] font-black uppercase tracking-widest text-slate-400">¿Quisiste decir?</p>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestions.map(s => (
                        <button 
                          key={s} 
                          onClick={() => setSearchTerm(s)}
                          className="rounded-lg bg-slate-50 px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-[#ec131e]/10 hover:text-[#ec131e]"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Simple Category Chips */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                 {[
                   { id: null, label: 'Todos' },
                   { id: 'Comida', label: 'Comida' },
                   { id: 'Bebida', label: 'Bebidas' }
                 ].map(cat => (
                   <button
                    key={cat.label}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`shrink-0 rounded-lg px-3 py-1 text-[10px] font-black uppercase tracking-wider transition-all ${selectedCategory === cat.id ? 'bg-[#ec131e] text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-200'}`}
                   >
                     {cat.label}
                   </button>
                 ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3">
              {isLoading ? (
                <div className="space-y-3">
                  {[1,2,3,4].map(i => <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100"></div>)}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 opacity-40">
                   <svg className="h-10 w-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                   <p className="mt-2 text-xs font-bold text-slate-400">Sin resultados</p>
                </div>
              ) : (
                filteredProducts.map(product => (
                  <button
                    key={product.cod_prod}
                    onClick={() => addToCart(product)}
                    disabled={product.stock_actual <= 0}
                    className="flex w-full items-center gap-4 rounded-xl border border-white bg-white p-3 text-left shadow-sm transition-all hover:border-[#ec131e]/20 hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                      {product.url_imagen ? (
                        <img src={product.url_imagen} alt={product.nom_prod} className="h-full w-full object-cover rounded-lg" />
                      ) : (
                        <svg className="h-6 w-6 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="truncate text-sm font-bold text-slate-900 leading-tight">{product.nom_prod}</h4>
                      <p className="text-[11px] font-bold text-[#ec131e] mt-0.5">
                        {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(product.precio_unitario)}
                      </p>
                      <p className={`text-[10px] font-medium mt-0.5 ${product.stock_actual <= product.stock_minimo ? 'text-red-500' : 'text-slate-400'}`}>
                        Stock: {product.stock_actual}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Right Side: Cart */}
          <div className="flex w-1/2 flex-col bg-white">
              <div className="flex-1 overflow-y-auto p-6">
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Carrito de Venta</h3>
                  {cart.length > 0 && (
                    <button 
                      onClick={() => setCart([])}
                      className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:underline"
                    >
                      Vaciar Carrito
                    </button>
                  )}
                </div>
                {cart.length === 0 ? (
                   <div className="flex flex-col items-center justify-center py-20 text-center opacity-40">
                      <svg className="h-16 w-16 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <p className="mt-4 text-sm font-bold">Carrito Vacío</p>
                   </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map(item => (
                      <div key={item.product.cod_prod} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 ring-1 ring-slate-100">
                        <div className="min-w-0">
                          <h5 className="truncate text-sm font-bold text-slate-800">{item.product.nom_prod}</h5>
                          <p className="text-xs font-medium text-slate-500">
                            {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(item.product.precio_unitario)} x {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm ring-1 ring-slate-200">
                          <button 
                            onClick={() => updateQuantity(item.product.cod_prod, -1)}
                            className="h-7 w-7 rounded-md hover:bg-slate-50 text-slate-500"
                          >
                            -
                          </button>
                          <span className="w-6 text-center text-xs font-black">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.product.cod_prod, 1)}
                            className="h-7 w-7 rounded-md hover:bg-slate-50 text-[#ec131e] font-bold"
                            disabled={item.quantity >= item.product.stock_actual}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
             </div>

             {/* Footer summary */}
             <div className="border-t border-slate-100 p-8 shadow-[0_-10px_30px_rgb(0,0,0,0.02)]">
                <div className="mb-6 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-500">Total a Pagar</span>
                  <span className="text-2xl font-black tracking-tight text-slate-900">{formattedTotal}</span>
                </div>
                <button
                  onClick={handleConfirmOrder}
                  disabled={cart.length === 0 || isSubmitting}
                  className="relative w-full overflow-hidden rounded-2xl bg-[#ec131e] py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-[#ec131e]/20 transition-all hover:bg-[#d01019] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:translate-y-0"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/20 border-t-white"></div>
                      Procesando...
                    </div>
                  ) : (
                    'Confirmar Venta'
                  )}
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
