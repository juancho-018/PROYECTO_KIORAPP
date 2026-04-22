import { useState, useEffect } from 'react';
import { productService, alertService, inventoryService } from '@/config/setup';
import type { Product } from '@/models/Product';
import type { Category } from '@/models/Category';
import { CategoryDrawer } from './CategoryDrawer';
import { ProductDrawer } from './ProductDrawer';
import { ProductDetailsDrawer } from './ProductDetailsDrawer';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { useStockSync } from '@/context/StockContext';

export function ProductsSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals/Drawers
  const [isCategoryListOpen, setIsCategoryListOpen] = useState(false);
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [isProductOpen, setIsProductOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAdjustOpen, setIsAdjustOpen] = useState(false);
  const [adjustQty, setAdjustQty] = useState(1);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  // Advanced Filters
  const [activeFilterId, setActiveFilterId] = useState<string | null>(null); // 'comida' | 'bebida'
  const [subFilter, setSubFilter] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });
  const [stockFilter, setStockFilter] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const { stockSyncVersion, notifyStockChange } = useStockSync();

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [p, c] = await Promise.all([
        productService.fetchProducts(),
        productService.fetchCategories()
      ]);
      setProducts(Array.isArray(p) ? p : []);
      setCategories(Array.isArray(c) ? c : []);
    } catch (error) {
      alertService.showToast('error', 'Error al cargar productos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [stockSyncVersion]);

  const productsArray = Array.isArray(products) ? products : [];
  
  const filteredProducts = productsArray.filter(p => {
    // Basic search
    const lowerSearch = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || 
      (p.nom_prod && p.nom_prod.toLowerCase().includes(lowerSearch)) ||
      (p.descrip_prod && p.descrip_prod.toLowerCase().includes(lowerSearch)) ||
      (p.nom_cat && p.nom_cat.toLowerCase().includes(lowerSearch));

    if (!matchesSearch) return false;

    // Price range
    if (p.precio_unitario < priceRange.min || p.precio_unitario > priceRange.max) return false;

    // Type filters
    if (activeFilterId) {
       const isComida = p.nom_cat?.toLowerCase().includes('comida') || p.nom_cat?.toLowerCase().includes('alimento');
       const isBebida = p.nom_cat?.toLowerCase().includes('bebida');
       
       if (activeFilterId === 'comida' && !isComida) return false;
       if (activeFilterId === 'bebida' && !isBebida) return false;

       // Sub-filters (logic-based check on name/desc)
       if (subFilter) {
          const content = (p.nom_prod + ' ' + (p.descrip_prod || '')).toLowerCase();
          if (!content.includes(subFilter.toLowerCase())) return false;
       }
    }

    // Stock Filter Logic
    if (stockFilter) {
       if (stockFilter === 'agotado' && p.stock_actual > 0) return false;
       if (stockFilter === 'bajo' && (p.stock_actual > p.stock_minimo || p.stock_actual === 0)) return false;
       if (stockFilter === 'normal' && p.stock_actual <= p.stock_minimo) return false;
    }

    return true;
  });

  // Manage suggestions when no products found or during typing
  useEffect(() => {
    if (searchTerm.length > 2) {
       const names = productsArray.map(p => p.nom_prod);
       import('@/utils/searchUtils').then(u => {
          setSuggestions(u.findSuggestions(searchTerm, names));
       });
    } else {
       setSuggestions([]);
    }
  }, [searchTerm, productsArray]);

  const handleAdjustStock = async (tipo: 'entrada' | 'salida') => {
    if (!selectedProduct) return;
    const cantidad = Math.trunc(Number(adjustQty));
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
      alertService.showToast('warning', 'La cantidad debe ser un entero mayor a 0');
      return;
    }
    setIsAdjusting(true);
    try {
      await inventoryService.createMovement({
        tipo_mov: tipo,
        cantidad,
        cod_prod: selectedProduct.cod_prod,
        fecha_mov: new Date().toISOString()
      });
      alertService.showToast('success', `Stock ${tipo === 'entrada' ? 'sumado' : 'restado'} correctamente`);
      notifyStockChange();
      await loadData();
      setIsAdjustOpen(false);
      setAdjustQty(1);
    } catch (error) {
      alertService.showToast('error', getErrorMessage(error, 'No se pudo ajustar el inventario'));
    } finally {
      setIsAdjusting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 text-pretty">Catálogo de Productos</h2>
          <p className="text-sm text-slate-500 font-medium">Gestiona el inventario maestro y categorías.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsCategoryListOpen(true)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all"
          >
            Categorías
          </button>
          <button 
            onClick={() => { setSelectedProduct(null); setIsProductOpen(true); }}
            className="rounded-xl bg-[#ec131e] px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#ec131e]/20 transition-all hover:bg-[#d01019]"
          >
            Nuevo Producto
          </button>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="relative group">
          <input
            type="text"
            placeholder="Buscar por nombre, descripción o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-sm font-medium shadow-sm transition-all focus:border-[#ec131e] focus:ring-4 focus:ring-[#ec131e]/5 outline-none"
          />
          <svg className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 group-focus-within:text-[#ec131e] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>

          {/* Type Suggestions Popup */}
          {suggestions.length > 0 && filteredProducts.length === 0 && (
            <div className="absolute top-full left-0 right-0 z-50 mt-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-2xl animate-in fade-in slide-in-from-top-2">
              <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">¿Quisiste decir?</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map(s => (
                  <button 
                    key={s} 
                    onClick={() => setSearchTerm(s)}
                    className="rounded-xl bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-[#ec131e]/10 hover:text-[#ec131e] transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actionable Filters Bar */}
        <div className="flex flex-wrap items-center gap-3">
           <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
              <button 
                onClick={() => { setActiveFilterId(null); setSubFilter(null); }}
                className={`rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all ${!activeFilterId ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
              >
                Todos
              </button>
              <button 
                onClick={() => { setActiveFilterId('comida'); setSubFilter(null); }}
                className={`rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all ${activeFilterId === 'comida' ? 'bg-white text-[#ec131e] shadow-sm' : 'text-slate-500'}`}
              >
                Comida
              </button>
              <button 
                onClick={() => { setActiveFilterId('bebida'); setSubFilter(null); }}
                className={`rounded-lg px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-all ${activeFilterId === 'bebida' ? 'bg-white text-[#ec131e] shadow-sm' : 'text-slate-500'}`}
              >
                Bebidas
              </button>
           </div>

           {/* Dynamic Sub-filters */}
           {activeFilterId === 'comida' && (
             <div className="flex gap-2 animate-in slide-in-from-left-2 duration-300">
                {['Dulce', 'Salado', 'Picante', 'Ácido'].map(t => (
                   <button 
                    key={t}
                    onClick={() => setSubFilter(subFilter === t ? null : t)}
                    className={`rounded-full px-3 py-1 text-[10px] font-bold border transition-all ${subFilter === t ? 'bg-[#ec131e] border-[#ec131e] text-white shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                   >
                     {t}
                   </button>
                ))}
             </div>
           )}

           {activeFilterId === 'bebida' && (
             <div className="flex gap-2 animate-in slide-in-from-left-2 duration-300">
                {['Alcohol', 'Gaseosa', 'Agua', 'Energizante'].map(t => (
                   <button 
                    key={t}
                    onClick={() => setSubFilter(subFilter === t ? null : t)}
                    className={`rounded-full px-3 py-1 text-[10px] font-bold border transition-all ${subFilter === t ? 'bg-[#ec131e] border-[#ec131e] text-white shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                   >
                     {t}
                   </button>
                ))}
             </div>
           )}

           {/* Price Range Filter */}
           <div className="ml-auto flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rango:</span>
              <div className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 p-1">
                 <input 
                  type="number" 
                  placeholder="Min" 
                  value={priceRange.min || ''}
                  onChange={(e) => setPriceRange(p => ({ ...p, min: Number(e.target.value) }))}
                  className="w-16 bg-transparent border-none text-[10px] font-bold outline-none text-center"
                 />
                 <span className="text-slate-300">—</span>
                 <input 
                  type="number" 
                  placeholder="Max" 
                  value={priceRange.max || ''}
                  onChange={(e) => setPriceRange(p => ({ ...p, max: Number(e.target.value) }))}
                  className="w-20 bg-transparent border-none text-[10px] font-bold outline-none text-center"
                 />
              </div>
           </div>

           {/* Stock Filter */}
           <div className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 p-1 px-2">
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Stock:</span>
             <select 
               value={stockFilter || ''} 
               onChange={(e) => setStockFilter(e.target.value || null)}
               className="bg-transparent border-none text-[10px] font-bold outline-none text-slate-600 focus:ring-0"
             >
               <option value="">Todos</option>
               <option value="normal">Suficiente</option>
               <option value="bajo">Bajo/Crítico</option>
               <option value="agotado">Agotado</option>
             </select>
           </div>
           
           {/* Clear Filters Button */}
           {(activeFilterId || subFilter || stockFilter || priceRange.min > 0 || priceRange.max < 100000 || searchTerm) && (
             <button
               onClick={() => {
                 setActiveFilterId(null);
                 setSubFilter(null);
                 setStockFilter(null);
                 setPriceRange({ min: 0, max: 100000 });
                 setSearchTerm('');
               }}
               className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition-all"
             >
               Limpiar
             </button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-3xl bg-slate-100"></div>
          ))
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full py-20 text-center text-slate-400">
            No se encontraron productos.
          </div>
        ) : (
          filteredProducts.map((p) => (
            <article key={p.cod_prod} className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
              <div 
                className="relative aspect-video w-full bg-slate-100 cursor-pointer"
                onClick={() => { setSelectedProduct(p); setIsDetailsOpen(true); }}
              >
                {p.url_imagen ? (
                  <img src={p.url_imagen} alt={p.nom_prod} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-300">
                    <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-slate-900 backdrop-blur-sm">
                  {new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(p.precio_unitario)}
                </div>
              </div>
              <div className="p-5">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#ec131e]">{p.nom_cat || 'Sin Categoría'}</span>
                  <span className={`text-[10px] font-bold ${p.stock_actual <= p.stock_minimo ? 'text-red-500' : 'text-emerald-500'}`}>
                    Stock: {p.stock_actual}
                  </span>
                </div>
                <h3 
                  className="font-bold text-slate-900 group-hover:text-[#ec131e] transition-colors cursor-pointer"
                  onClick={() => { setSelectedProduct(p); setIsDetailsOpen(true); }}
                >
                  {p.nom_prod}
                </h3>
                <p className="mt-1 line-clamp-1 text-xs text-slate-500">{p.descrip_prod || 'Sin descripción'}</p>
                
                <div className="mt-4 flex gap-2">
                  <button 
                    onClick={() => { setSelectedProduct(p); setIsProductOpen(true); }}
                    className="flex-1 rounded-xl bg-slate-100 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => { setSelectedProduct(p); setAdjustQty(1); setIsAdjustOpen(true); }}
                    className="flex-1 rounded-xl bg-amber-50 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100"
                  >
                    Ajustar inventario
                  </button>
                  <button 
                    onClick={async () => {
                      const confirm = await alertService.showConfirm('¿Eliminar Producto?', `¿Deseas eliminar "${p.nom_prod}"?`, 'Eliminar', 'Cancelar');
                      if (confirm) {
                        try {
                          await productService.deleteProduct(p.cod_prod);
                          alertService.showToast('success', 'Producto eliminado');
                          loadData();
                        } catch (e) {
                          alertService.showToast('error', getErrorMessage(e, 'No se pudo eliminar'));
                        }
                      }
                    }}
                    className="rounded-xl bg-slate-100 p-2 text-slate-400 hover:text-red-500"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      <CategoryDrawer 
        isOpen={isCategoryDrawerOpen} 
        onClose={() => setIsCategoryDrawerOpen(false)} 
        category={selectedCategory}
        onSuccess={loadData}
      />

      <ProductDrawer
        isOpen={isProductOpen}
        onClose={() => setIsProductOpen(false)}
        product={selectedProduct}
        categories={categories}
        onSuccess={loadData}
        onOpenCategoryDrawer={() => { setSelectedCategory(null); setIsCategoryDrawerOpen(true); }}
      />

      <ProductDetailsDrawer
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        product={selectedProduct}
      />

      {isAdjustOpen && selectedProduct && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-900">Ajustar inventario</h3>
              <p className="text-sm text-slate-500">{selectedProduct.nom_prod}</p>
              <p className="text-xs font-bold text-slate-400">Stock actual: {selectedProduct.stock_actual}</p>
            </div>
            <label className="mb-2 block text-[10px] font-bold uppercase tracking-widest text-slate-400">Cantidad</label>
            <input
              type="number"
              min={1}
              step={1}
              value={adjustQty}
              onChange={(e) => setAdjustQty(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#ec131e] focus:outline-none"
            />
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                onClick={() => void handleAdjustStock('salida')}
                disabled={isAdjusting}
                className="rounded-xl bg-red-50 py-2.5 text-sm font-bold text-red-600 hover:bg-red-100 disabled:opacity-50"
              >
                Restar stock
              </button>
              <button
                onClick={() => void handleAdjustStock('entrada')}
                disabled={isAdjusting}
                className="rounded-xl bg-emerald-50 py-2.5 text-sm font-bold text-emerald-600 hover:bg-emerald-100 disabled:opacity-50"
              >
                Sumar stock
              </button>
            </div>
            <button
              onClick={() => setIsAdjustOpen(false)}
              className="mt-2 w-full rounded-xl bg-slate-100 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Category List Modal */}
      {isCategoryListOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="w-full max-w-lg bg-white rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-500">
              <header className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Listado de Categorías</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Total: {categories.length}</p>
                </div>
                <button 
                  onClick={() => setIsCategoryListOpen(false)}
                  className="rounded-full bg-slate-100 p-2 text-slate-400 hover:text-slate-600 transition-all hover:rotate-90 duration-300"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </header>
              
              <div className="max-h-96 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-200">
                {categories.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 italic">No hay categorías registradas.</div>
                ) : (
                  categories.map(cat => (
                    <div key={cat.cod_cat} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:border-[#ec131e]/20 hover:shadow-md group">
                      <div className="flex-1">
                        <p className="font-bold text-slate-900 leading-tight group-hover:text-[#ec131e] transition-colors">{cat.nom_cat}</p>
                        {cat.descrip_cat && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{cat.descrip_cat}</p>}
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => { setSelectedCategory(cat); setIsCategoryDrawerOpen(true); }}
                          className="rounded-xl bg-white p-2.5 text-slate-400 hover:text-blue-500 hover:shadow-sm transition-all shadow-sm"
                          title="Editar"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button 
                          onClick={async () => {
                            const confirm = await alertService.showConfirm('¿Eliminar Categoría?', `¿Deseas eliminar "${cat.nom_cat}"? Se desvinculará de los productos asociados.`, 'Eliminar', 'Cancelar');
                            if (confirm) {
                              try {
                                await productService.deleteCategory(cat.cod_cat);
                                alertService.showToast('success', 'Categoría eliminada');
                                loadData();
                              } catch (e) {
                                alertService.showToast('error', getErrorMessage(e, 'No se pudo eliminar'));
                              }
                            }
                          }}
                          className="rounded-xl bg-white p-2.5 text-slate-400 hover:text-red-500 hover:shadow-sm transition-all shadow-sm"
                          title="Eliminar"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <button 
                onClick={() => { setSelectedCategory(null); setIsCategoryDrawerOpen(true); }}
                className="mt-8 w-full rounded-2xl bg-[#ec131e] py-4 text-sm font-bold text-white shadow-lg shadow-[#ec131e]/20 transition-all hover:bg-[#d01019] flex items-center justify-center gap-2"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                Crear Nueva Categoría
              </button>
           </div>
        </div>
      )}
    </div>
  );
}
