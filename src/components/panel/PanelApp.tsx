import { useState, useEffect, useMemo } from 'react';
import Fuse from 'fuse.js';
import { authService, userService, alertService, productService, notificationService, orderService } from '@/config/setup';
import { SessionManager } from '@/services/SessionManager';
import type { User } from '@/models/User';
import type { RegisterUserDto } from '@/services/UserService';

// Modular Components
import { AdminNavbar } from './AdminNavbar';
import { AdminSubNav } from './AdminSubNav';
import { UserList } from './UserList';
import { UserDrawer } from './UserDrawer';
import { ProfileDrawer } from './ProfileDrawer';
import { RolesSection } from './RolesSection';
import { SecurityDrawer } from './SecurityDrawer';
import { DashboardSection } from './DashboardSection';
import { InventarioSection } from './InventarioSection';
import { CategoriasSection } from './CategoriasSection';
import { ProveedoresSection } from './ProveedoresSection';
import { OrdersSection } from './OrdersSection';
import { GeneralSettings } from './GeneralSettings';
import { ComingSoonSection } from './ComingSoonSection'; 
import { ProductsSection } from './ProductsSection';
import { SalesSection } from './SalesSection';
import { OrderDrawer } from './OrderDrawer';
import HelpCenter from '@/components/help/HelpCenter';
import { StockProvider } from '@/context/StockContext';
import { getErrorMessage } from '@/utils/getErrorMessage';

import type { CreateOrderDto } from '@/services/OrderService';
import type { Product } from '@/models/Product';

const EMPTY_ORDER: CreateOrderDto = {
  metodopago_usu: 'efectivo',
  items: [],
};

export default function PanelApp() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Tab switching
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('kiora_active_tab') || 'dashboard';
    }
    return 'dashboard';
  });

  useEffect(() => {
    localStorage.setItem('kiora_active_tab', activeTab);
  }, [activeTab]);

  // Settings view state
  const [settingsView, setSettingsView] = useState<'main' | 'help' | 'terms' | 'privacy' | 'general'>('main');
  
  useEffect(() => {
    setSettingsView('main');
  }, [activeTab]);

  // Users List State
  const [usersList, setUsersList] = useState<(User & { isBlocked: boolean })[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 10;

  // Drawers & Modals
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isOrderDrawerOpen, setIsOrderDrawerOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [resettingUser, setResettingUser] = useState<User | null>(null);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  
  // Forms state
  const [searchTerm, setSearchTerm] = useState('');
  const [newUser, setNewUser] = useState<RegisterUserDto>({
    nom_usu: '',
    correo_usu: '',
    tel_usu: '',
    rol_usu: ''
  });
  const [isRegistering, setIsRegistering] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  // --- POS / Cart State ---
  const [orderForm, setOrderForm] = useState<CreateOrderDto>(EMPTY_ORDER);
  const [prodSearch, setProdSearch] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedPOSCategories, setSelectedPOSCategories] = useState<number[]>([]);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const cartKey = user ? `kiora_cart_${user.id_usu}` : null;

  // Persistence: Load cart
  useEffect(() => {
    if (!cartKey) return;
    const saved = localStorage.getItem(cartKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.items)) setOrderForm(parsed);
      } catch (e) { console.error('Error loading cart:', e); }
    }
  }, [cartKey]);

  // Persistence: Save cart
  useEffect(() => {
    if (!cartKey || orderForm === EMPTY_ORDER || ((orderForm.items || []).length === 0 && !localStorage.getItem(cartKey))) return;
    localStorage.setItem(cartKey, JSON.stringify(orderForm));
  }, [orderForm, cartKey]);

  const addToCart = (p: Product) => {
    const existing = orderForm.items.find(i => i.cod_prod === p.cod_prod);
    const currentQty = existing ? existing.cantidad : 0;
    if (currentQty + 1 > (p.stock_actual ?? 0)) {
      alertService.showToast('warning', `Stock insuficiente para ${p.nom_prod}.`);
      return;
    }
    if (existing) {
      setOrderForm(f => ({
        ...f,
        items: f.items.map(i => i.cod_prod === p.cod_prod ? { ...i, cantidad: i.cantidad + 1 } : i)
      }));
    } else {
      setOrderForm(f => ({
        ...f,
        items: [...f.items, { 
          cod_prod: p.cod_prod!, 
          cantidad: 1, 
          precio_unit: p.precio_prod,
          nom_prod: p.nom_prod,
          url_imagen: p.imagen_prod
        }]
      }));
    }
  };

  const removeFromCart = (cod_prod: number) => {
    setOrderForm(f => ({ ...f, items: f.items.filter(i => i.cod_prod !== cod_prod) }));
  };

  const updateQuantity = (cod_prod: number, delta: number, maxStock?: number) => {
    setOrderForm(f => ({
      ...f,
      items: f.items.map(i => {
        if (i.cod_prod === cod_prod) {
          const newCant = Math.max(1, i.cantidad + delta);
          if (maxStock !== undefined && newCant > maxStock) return i;
          return { ...i, cantidad: newCant };
        }
        return i;
      })
    }));
  };

  const clearCart = () => {
    setOrderForm(EMPTY_ORDER);
    if (cartKey) localStorage.removeItem(cartKey);
  };

  const cartTotal = useMemo(() => {
    return (orderForm.items || []).reduce((acc, item) => acc + (item.cantidad * (item.precio_unit || 0)), 0);
  }, [orderForm.items]);

  const loadAllProducts = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        productService.getProducts(),
        productService.getCategories()
      ]);
      setAllProducts(Array.isArray(productsData) ? productsData : (productsData?.data || []));
      setCategories(categoriesData?.data || []);
    } catch (e) { console.error('Error loading products/categories:', e); }
  };

  useEffect(() => {
    if (isOrderDrawerOpen) void loadAllProducts();
  }, [isOrderDrawerOpen]);

  const filteredPOSProducts = useMemo(() => {
    let source = allProducts;
    if (selectedPOSCategories.length > 0) {
      source = source.filter(p => p.fk_cod_cats && p.fk_cod_cats.some(id => selectedPOSCategories.includes(id)));
    }
    const q = prodSearch.trim().toLowerCase();
    if (!q) return source;
    const fuse = new Fuse(source, { keys: ['nom_prod', 'cod_prod'], threshold: 0.4 });
    return fuse.search(q).map(result => result.item);
  }, [allProducts, prodSearch, selectedPOSCategories]);

  const handleCreateOrder = async () => {
    if (!orderForm.items.length) return;
    setIsSavingOrder(true);
    try {
      const order = await orderService.createOrder(orderForm);
      if (orderForm.metodopago_usu === 'tarjeta' && order.id_vent) {
        const { checkoutUrl } = await orderService.createCheckoutSession(order.id_vent);
        clearCart();
        window.location.href = checkoutUrl;
        return;
      }
      alertService.showToast('success', 'Venta realizada con éxito');
      clearCart();
      setIsOrderDrawerOpen(false);
      window.dispatchEvent(new CustomEvent('kiora_reload_inventory'));
    } catch (e) {
      alertService.showToast('error', getErrorMessage(e, 'Error al procesar la venta'));
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleCancelOrder = async () => {
    const ok = await alertService.showConfirm('¿Cancelar?', 'Se borrará el carrito.', 'Sí', 'No');
    if (ok) { clearCart(); setIsOrderDrawerOpen(false); }
  };

  // --- Session & Security ---
  const sessionManager = useMemo(() => new SessionManager(authService, alertService), []);
  const userIsAdmin = authService.isAdmin();

  const checkLowStock = async () => {
    if (!userIsAdmin) return;
    try {
      const lowStock = await productService.getLowStockProducts();
      if (Array.isArray(lowStock) && lowStock.length > 0) {
        notificationService.addNotification({
          title: 'Alerta de Inventario',
          description: `Hay ${lowStock.length} productos con stock bajo.`,
          type: 'warning'
        });
      }
    } catch (err) { console.error('Error checking low stock:', err); }
  };

  useEffect(() => {
    if (!authService.isAuthenticated()) { window.location.href = '/login'; return; }
    sessionManager.startMonitoring();
    const currentUser = authService.getUser();
    if (currentUser) {
      setUser(currentUser);
      setIsAdmin(authService.isAdmin());
    }
    const handleNav = (e: any) => { if (e.detail?.tab) setActiveTab(e.detail.tab); };
    window.addEventListener('kiora_navigate', handleNav);
    window.addEventListener('kiora_reload_inventory', checkLowStock);
    const timeout = setTimeout(checkLowStock, 2000);
    return () => {
      sessionManager.stopMonitoring();
      window.removeEventListener('kiora_navigate', handleNav);
      window.removeEventListener('kiora_reload_inventory', checkLowStock);
      clearTimeout(timeout);
    };
  }, [sessionManager, userIsAdmin]);

  const loadUsersList = async (page: number = 1) => {
    setIsLoadingUsers(true);
    try {
      const paginated = await userService.fetchUsers(page, LIMIT);
      const usersArray = Array.isArray(paginated.data) ? paginated.data : [];
      setUsersList(usersArray.map(u => ({ ...u, isBlocked: userService.isUserBlocked(u) })));
      setCurrentPage(paginated.pagination?.page || page);
      setTotalPages(paginated.pagination?.totalPages || 1);
    } catch (e) { alertService.showToast('error', 'Error al cargar usuarios'); }
    finally { setIsLoadingUsers(false); }
  };

  useEffect(() => {
    if (isAdmin) void loadUsersList(currentPage);
  }, [isAdmin, currentPage]);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (await alertService.showConfirm('Salir', '¿Cerrar sesión?', 'Sí', 'No')) await authService.logout();
  };

  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRegistering(true);
    try {
      if (isEditing && editingUser?.id_usu) {
        await userService.updateUser(editingUser.id_usu, newUser);
        if (newUser.rol_usu && newUser.rol_usu !== String(editingUser.rol_usu)) await userService.updateRole(editingUser.id_usu, newUser.rol_usu);
        alertService.showToast('success', 'Actualizado');
      } else {
        await userService.registerUser(newUser);
        alertService.showToast('success', 'Creado');
      }
      setIsDrawerOpen(false);
      loadUsersList(currentPage);
    } catch (e) { alertService.showToast('error', 'Error al procesar'); }
    finally { setIsRegistering(false); }
  };

  const handleConfirmPasswordReset = async (newPassword: string) => {
    if (!resettingUser?.id_usu) return;
    setIsResettingPassword(true);
    try {
      await userService.adminUpdatePassword(resettingUser.id_usu, newPassword);
      alertService.showToast('success', 'Contraseña actualizada');
      setIsSecurityOpen(false);
    } catch (e) { alertService.showToast('error', 'Error al actualizar'); }
    finally { setIsResettingPassword(false); }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      alertService.showToast('warning', 'Las contraseñas no coinciden');
      return;
    }
    setIsChangingPassword(true);
    try {
      await userService.changePassword(passwords.current, passwords.new);
      alertService.showToast('success', 'Contraseña actualizada');
      setIsProfileOpen(false);
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (e) {
      alertService.showToast('error', getErrorMessage(e, 'Error al actualizar'));
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleEditClick = (u: User) => {
    setEditingUser(u);
    setIsEditing(true);
    setNewUser({
      nom_usu: u.nom_usu || '',
      correo_usu: u.correo_usu || '',
      tel_usu: u.tel_usu || '',
      rol_usu: String(u.rol_usu)
    });
    setIsDrawerOpen(true);
  };

  const handleDeleteUser = async (id: string | number) => {
    if (await alertService.showConfirm('¿Eliminar?', '¿Seguro?', 'Eliminar', 'Cancelar')) {
      try {
        await userService.deleteUser(Number(id));
        alertService.showToast('success', 'Eliminado');
        loadUsersList(currentPage);
      } catch (e) { alertService.showToast('error', 'Error al eliminar'); }
    }
  };

  const handleUnlockUser = async (id: string | number) => {
    try {
      await userService.unlockUser(Number(id));
      alertService.showToast('success', 'Desbloqueado');
      loadUsersList(currentPage);
    } catch (e) { alertService.showToast('error', 'Error al desbloquear'); }
  };

  if (!user) return null;

  return (
    <StockProvider>
      <div className="min-h-screen w-full bg-[#FDFCFB]/80 font-[Inter] text-slate-800 antialiased">
        <AdminNavbar user={user} onLogout={handleLogout} onProfileOpen={() => setIsProfileOpen(true)} />
      
        <main className="relative mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 lg:pl-16">
          {activeTab === 'dashboard' ? (
            <DashboardSection onSwitchTab={setActiveTab} />
          ) : activeTab === 'inventario' ? (
            <InventarioSection />
          ) : activeTab === 'productos' ? (
            <ProductsSection />
          ) : activeTab === 'categorias' ? (
            <CategoriasSection />
          ) : activeTab === 'proveedores' ? (
            <ProveedoresSection />
          ) : activeTab === 'pedidos' ? (
            <OrdersSection />
          ) : activeTab === 'ventas' ? (
            <SalesSection onOpenPOS={() => setIsOrderDrawerOpen(true)} isAdmin={isAdmin} />
          ) : activeTab === 'usuarios' ? (
            <>
              <header className="mb-10 flex flex-col gap-6 sm:mb-12 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <h1 className="text-3xl font-extrabold text-[#1a1a1a]">Usuarios & Roles</h1>
                  <p className="text-slate-500 font-medium">Gestiona accesos y permisos.</p>
                </div>
                <button onClick={() => { setEditingUser(null); setIsEditing(false); setNewUser({ nom_usu: '', correo_usu: '', tel_usu: '', rol_usu: '' }); setIsDrawerOpen(true); }} className="rounded-xl bg-[#ec131e] px-5 py-3 text-sm font-bold text-white shadow-lg">Nuevo Usuario</button>
              </header>
              <UserList users={usersList} isLoading={isLoadingUsers} searchTerm={searchTerm} onSearchChange={setSearchTerm} onEdit={handleEditClick} onDelete={handleDeleteUser} onUnlock={handleUnlockUser} pagination={{ currentPage, totalPages, onPageChange: loadUsersList }} />
            </>
          ) : activeTab === 'ajustes' ? (
            <div className="space-y-8">
              <header className="mb-10">
                <h1 className="text-3xl font-extrabold text-[#1a1a1a]">Ajustes & Ayuda</h1>
              </header>

              {settingsView === 'main' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <button onClick={() => setSettingsView('help')} className="flex items-center gap-4 p-6 bg-white border border-slate-100 rounded-2xl text-left hover:border-[#ec131e]/30 hover:shadow-lg transition-all group">
                    <div className="w-14 h-14 bg-red-50 text-[#ec131e] rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>
                    </div>
                    <div><h3 className="font-bold text-[#111827] text-lg">Centro de Ayuda</h3><p className="text-slate-500 text-sm">Soporte y FAQs.</p></div>
                  </button>

                  <button onClick={() => setSettingsView('general')} className="flex items-center gap-4 p-6 bg-white border border-slate-100 rounded-2xl text-left hover:border-[#ec131e]/30 hover:shadow-lg transition-all group">
                    <div className="w-14 h-14 bg-red-50 text-[#ec131e] rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /></svg>
                    </div>
                    <div><h3 className="font-bold text-[#111827] text-lg">Configuración General</h3><p className="text-slate-500 text-sm">Parámetros globales.</p></div>
                  </button>

                  <div className="flex flex-col p-6 bg-white border border-slate-100 rounded-2xl md:col-span-2">
                    <h3 className="font-bold text-[#111827] mb-4">Información Legal</h3>
                    <div className="flex gap-4">
                      <button onClick={() => setSettingsView('terms')} className="text-sm font-bold text-[#ec131e] hover:underline">Términos y Condiciones</button>
                      <button onClick={() => setSettingsView('privacy')} className="text-sm font-bold text-[#ec131e] hover:underline">Política de Privacidad</button>
                    </div>
                  </div>
                </div>
              ) : settingsView === 'help' ? (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                  <button onClick={() => setSettingsView('main')} className="mb-6 flex items-center gap-2 text-slate-400 font-bold hover:text-[#ec131e] transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>Volver</button>
                  <HelpCenter />
                </div>
              ) : settingsView === 'general' ? (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                  <button onClick={() => setSettingsView('main')} className="mb-6 flex items-center gap-2 text-slate-400 font-bold hover:text-[#ec131e] transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>Volver</button>
                  <GeneralSettings />
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                  <button onClick={() => setSettingsView('main')} className="mb-6 flex items-center gap-2 text-slate-400 font-bold hover:text-[#ec131e] transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>Volver</button>
                  <section className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
                    <h3 className="text-xl font-black mb-6">{settingsView === 'terms' ? 'Términos y Condiciones' : 'Política de Privacidad'}</h3>
                    <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200">
                      <p className="text-[15px] text-slate-600 leading-relaxed italic">
                        {settingsView === 'terms' 
                          ? 'Bienvenido a Kiora. Al acceder y utilizar esta aplicación, usted acepta los siguientes términos y condiciones...' 
                          : 'En Kiora, protegemos la integridad de su información corporativa. La información recolectada se utiliza exclusivamente para la operación...'}
                      </p>
                    </div>
                  </section>
                </div>
              )}
            </div>
          ) : (
            <ComingSoonSection tabId={activeTab} />
          )}
        </main>

        <AdminSubNav activeId={activeTab} onItemClick={setActiveTab} isAdmin={isAdmin} />

        {/* Drawers */}
        <UserDrawer isOpen={isDrawerOpen} isEditing={isEditing} isRegistering={isRegistering} userData={newUser} onUserDataChange={setNewUser} onSubmit={handleSubmitUser} onClose={() => setIsDrawerOpen(false)} />
        <ProfileDrawer isOpen={isProfileOpen} user={user} passwords={passwords} isChangingPassword={isChangingPassword} onPasswordsChange={setPasswords} onSubmitPassword={handleUpdatePassword} onClose={() => setIsProfileOpen(false)} />
        <SecurityDrawer isOpen={isSecurityOpen} user={resettingUser} isResetting={isResettingPassword} onConfirm={handleConfirmPasswordReset} onClose={() => setIsSecurityOpen(false)} />
        <OrderDrawer drawerOpen={isOrderDrawerOpen} onClose={() => setIsOrderDrawerOpen(false)} prodSearch={prodSearch} setProdSearch={setProdSearch} filteredProducts={filteredPOSProducts} categories={categories} selectedCategories={selectedPOSCategories} setSelectedCategories={setSelectedPOSCategories} addToCart={addToCart} removeFromCart={removeFromCart} updateQuantity={updateQuantity} orderForm={orderForm} setOrderForm={setOrderForm} cartTotal={cartTotal} handleCreateOrder={handleCreateOrder} onCancelOrder={handleCancelOrder} saving={isSavingOrder} safePrice={(v) => (typeof v === 'number' && !isNaN(v)) ? v : Number(v) || 0} />
      </div>
    </StockProvider>
  );
}
