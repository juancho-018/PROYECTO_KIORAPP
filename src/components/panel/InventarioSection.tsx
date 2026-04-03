import React, { useState, useEffect } from 'react';
import { productService, inventoryService, alertService } from '@/config/setup';
import type { Product } from '@/models/Product';
import { ProductDrawer } from './ProductDrawer';
import { MovementDrawer } from './MovementDrawer';

export function InventarioSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [criticalStock, setCriticalStock] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  // Drawer states
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
  const [isMovementDrawerOpen, setIsMovementDrawerOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Fetch products
      const prodRes = await productService.getProducts(1, 100);
      if (prodRes && prodRes.data) {
        setProducts(prodRes.data);
      }
      
      // Fetch low stock count
      try {
        const stockRes = await inventoryService.getLowStock();
        if (stockRes && Array.isArray(stockRes)) {
          setCriticalStock(stockRes.length);
        }
      } catch (err) {
        console.warn('Could not fetch low stock', err);
      }
    } catch (error: any) {
      alertService.showError('Error', error.message || 'Error cargando inventario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreateProduct = () => {
    setCurrentProduct({});
    setIsEditing(false);
    setIsDrawerOpen(true);
  };

  const handleOpenEditProduct = (product: Product) => {
    setCurrentProduct(product);
    setIsEditing(true);
    setIsDrawerOpen(true);
  };

  const handleDeleteProduct = async (id: number) => {
    const isConfirmed = await alertService.showConfirm(
      '¿Eliminar Producto?',
      'Esta acción no se puede deshacer y podría afectar el historial mecánico.',
      'Sí, eliminar',
      'Cancelar'
    );
    if (!isConfirmed) return;

    try {
      await productService.deleteProduct(id);
      alertService.showSuccess('Eliminado', 'Producto eliminado exitosamente');
      window.dispatchEvent(new CustomEvent('kiora-refresh-alerts'));
      loadData();
    } catch (error: any) {
      alertService.showError('Error', error.message || 'No se pudo eliminar el producto');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (isEditing && currentProduct.cod_prod) {
        await productService.updateProduct(currentProduct.cod_prod, currentProduct);
        alertService.showSuccess('Actualizado', 'Producto actualizado correctamente');
      } else {
        await productService.createProduct(currentProduct);
        alertService.showSuccess('Creado', 'Producto registrado exitosamente');
      }
      setIsDrawerOpen(false);
      window.dispatchEvent(new CustomEvent('kiora-refresh-alerts'));
      loadData();
    } catch (error: any) {
      alertService.showError('Error', error.message || 'Ocurrió un error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.nom_prod.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <header className="mb-10 flex flex-col gap-6 sm:mb-12 sm:flex-row sm:items-center sm:justify-between animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#111827] sm:text-4xl relative inline-block">
            Gestión de Inventario
            <div className="absolute -bottom-2 right-0 h-1.5 w-1/3 rounded-full bg-[#ec131e]"></div>
          </h1>
          <div className="mt-4 flex gap-3">
            <button 
              onClick={() => setIsMovementDrawerOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-xl font-bold text-sm shadow-lg shadow-emerald-200 transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
              Registrar Entrada / Salida
            </button>
          </div>
        </div>
        
        {/* Barra de Búsqueda */}
        <div className="flex items-center justify-end">
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
              </svg>
            </div>
            <input 
              type="text" 
              className="block w-full p-3.5 pl-10 text-sm text-gray-900 bg-white border border-gray-200 rounded-xl focus:ring-[#ec131e] focus:border-[#ec131e] shadow-sm transition-all" 
              placeholder="Buscar productos por nombre..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      {/* Resumen Cards (Métricas Globales) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
         <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.05)] transition-shadow">
           <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
           </div>
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Productos</p>
           <h3 className="text-3xl font-extrabold text-gray-900">{products.length}</h3>
         </div>
         <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.05)] transition-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 rounded-bl-full -z-0"></div>
           <div className="w-12 h-12 bg-red-50 text-[#ec131e] rounded-xl flex items-center justify-center mb-4 relative z-10">
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
           </div>
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 relative z-10">Stock Crítico</p>
           <h3 className="text-3xl font-extrabold text-[#ec131e] relative z-10">{criticalStock}</h3>
         </div>
         <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.05)] transition-shadow bg-gradient-to-br from-white to-orange-50/30">
           <div className="w-12 h-12 bg-orange-100/50 text-orange-600 rounded-xl flex items-center justify-center mb-4">
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
           </div>
           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Último Actualizado</p>
           <h3 className="text-xl font-bold text-gray-900 truncate">Hace un momento</h3>
         </div>
      </div>

      {/* Lista de Productos */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900">Catálogo Reciente</h2>
          <button 
            onClick={handleOpenCreateProduct}
            className="text-sm font-bold text-[#ec131e] bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
            Añadir Producto
          </button>
        </div>
        
        <div className="divide-y divide-slate-100 relative min-h-[100px]">
          {isLoading ? (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10">
              <div className="w-8 h-8 rounded-full border-4 border-red-100 border-t-[#ec131e] animate-spin"></div>
            </div>
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div key={product.cod_prod} className="p-4 sm:px-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center gap-4 group">
                <div className="w-12 h-12 rounded-xl bg-gray-50 overflow-hidden shrink-0 border border-gray-100 flex items-center justify-center text-gray-300 shadow-sm transition-transform group-hover:scale-105">
                  <svg className="w-6 h-6 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-base font-bold text-gray-900 truncate">{product.nom_prod}</h3>
                    {product.nom_cat && (
                      <span className="bg-red-50 text-[#ec131e] text-[10px] font-black uppercase px-2 py-0.5 rounded-md border border-red-100 flex items-center gap-1 shrink-0">
                        <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
                        {product.nom_cat}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 font-medium truncate">{product.descrip_prod || 'Sin descripción'}</p>
                </div>
                
                <div className="flex items-center gap-6 sm:gap-10 mt-2 sm:mt-0">
                  <div className="text-right">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Stock Actual</p>
                    <div className="flex items-center justify-end gap-2">
                       <span className={`font-black text-lg ${Number(product.stock_actual) <= Number(product.stock_minimo) ? 'text-[#ec131e]' : 'text-gray-900'}`}>
                         {product.stock_actual}
                       </span>
                       {Number(product.stock_actual) <= Number(product.stock_minimo) && (
                         <span className="animate-pulse bg-red-100 text-[#ec131e] text-[8px] font-black uppercase px-2 py-0.5 rounded-full border border-red-200">Bajo</span>
                       )}
                    </div>
                  </div>
                  <div className="text-right w-24">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Precio</p>
                    <p className="font-bold text-gray-900">${Number(product.precio_unitario).toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:opacity-0 sm:-translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all sm:w-20 justify-end mt-4 sm:mt-0 border-t sm:border-0 pt-4 sm:pt-0 border-gray-100">
                   <button 
                     onClick={() => handleOpenEditProduct(product)}
                     className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 hover:scale-105 transition-all"
                   >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                   </button>
                   <button 
                     onClick={() => handleDeleteProduct(product.cod_prod)}
                     className="w-8 h-8 rounded-full bg-red-50 text-[#ec131e] flex items-center justify-center hover:bg-red-100 hover:scale-105 transition-all"
                   >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                   </button>
                </div>
              </div>
            ))
          ) : !isLoading && (
             <div className="p-12 text-center flex flex-col items-center">
                 <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg>
                 </div>
                 <h3 className="text-gray-900 font-bold text-lg mb-1">No hay resultados</h3>
                 <p className="text-gray-500 font-medium text-sm max-w-sm">No encontramos productos que coincidan con tu búsqueda o aún no hay productos.</p>
             </div>
          )}
        </div>
      </div>

      <ProductDrawer 
        isOpen={isDrawerOpen}
        isEditing={isEditing}
        isSaving={isSaving}
        productData={currentProduct}
        onProductDataChange={setCurrentProduct}
        onSubmit={handleSaveProduct}
        onClose={() => setIsDrawerOpen(false)}
      />

      <MovementDrawer 
        isOpen={isMovementDrawerOpen}
        onClose={() => setIsMovementDrawerOpen(false)}
        onSuccess={loadData}
      />
    </>
  );
}
