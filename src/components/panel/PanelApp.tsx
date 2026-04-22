import { useState, useEffect, useMemo } from 'react';
import { authService, userService, alertService } from '@/config/setup';
import { SessionManager } from '@/services/SessionManager';
import type { User } from '@/models/User';
import type { RegisterUserDto } from '@/services/UserService';

// Modular Components
import { AdminNavbar } from './AdminNavbar';
import { AdminSubNav } from './AdminSubNav';
import { UserList } from './UserList';
import { UserDrawer } from './UserDrawer';
import { LegalSection } from './LegalSection';
import { ProfileDrawer } from './ProfileDrawer';
import { RolesSection } from './RolesSection';
import { SecurityDrawer } from './SecurityDrawer';
import { ComingSoonSection } from './ComingSoonSection';
import { DashboardSection } from './DashboardSection';
<<<<<<< Updated upstream
=======
import { InventarioSection } from './InventarioSection';
import { InventorySection } from './InventorySection';
import { CategoriasSection } from './CategoriasSection';
import { ProveedoresSection } from './ProveedoresSection';
import { OrdersSection } from './OrdersSection';
import { GeneralSettings } from './GeneralSettings';
import { ComingSoonSection } from './ComingSoonSection'; 
import { ProductsSection } from './ProductsSection';
import { MaintenanceSection } from './MaintenanceSection';
import { SalesSection } from './SalesSection';
import { OrderDrawer } from './OrderDrawer';
>>>>>>> Stashed changes
import HelpCenter from '@/components/help/HelpCenter';
import { getErrorMessage } from '@/utils/getErrorMessage';

export default function PanelApp() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pollingFailCount, setPollingFailCount] = useState(0);
  
  // Tab switching
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showHelp, setShowHelp] = useState(false);
=======
=======
>>>>>>> Stashed changes
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('kiora_active_tab');
    if (saved) setActiveTab(saved);
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem('kiora_active_tab', activeTab);
    }
  }, [activeTab, isHydrated]);

  // Settings view state
  const [settingsView, setSettingsView] = useState<'main' | 'help' | 'terms' | 'privacy' | 'general'>('main');
>>>>>>> Stashed changes
  
  // Reset help view when switching tabs
  useEffect(() => {
    setShowHelp(false);
  }, [activeTab]);
  
  // Lista y Paginación
  const [usersList, setUsersList] = useState<(User & { isBlocked: boolean })[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 10;

  // Drawers state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
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

  const sessionManager = useMemo(
    () => new SessionManager(authService, alertService),
    []
  );

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      window.location.href = '/login';
      return;
    }
<<<<<<< Updated upstream
=======
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
    if (!userIsAdmin || pollingFailCount >= 3) return;
    try {
      const lowStock = await productService.getLowStockProducts();
      setPollingFailCount(0);
      if (Array.isArray(lowStock) && lowStock.length > 0) {
        notificationService.addNotification({
          title: 'Alerta de Inventario',
          description: `Hay ${lowStock.length} productos con stock bajo.`,
          type: 'warning'
        });
      }
    } catch (err) {
      setPollingFailCount(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (!authService.isAuthenticated()) { window.location.href = '/login'; return; }
>>>>>>> Stashed changes
    sessionManager.startMonitoring();
    const currentUser = authService.getUser();
    if (currentUser) {
      setUser(currentUser);
      setIsAdmin(String(currentUser.rol_usu ?? '').toLowerCase() === 'admin');
    }
    return () => {
      sessionManager.stopMonitoring();
    };
  }, [sessionManager]);

  const loadUsersList = async (page: number = 1) => {
    setIsLoadingUsers(true);
    try {
      const paginated = await userService.fetchUsers(page, LIMIT);
      const displayUsers = paginated.data.map(u => ({
        ...u,
        isBlocked: userService.isUserBlocked(u)
      }));
      setUsersList(displayUsers);
      setCurrentPage(paginated.pagination?.page || page);
      setTotalPages(paginated.pagination?.totalPages || 1);
    } catch (error: unknown) {
      alertService.showToast('error', getErrorMessage(error, 'Error al cargar los usuarios'));
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) {
      setIsLoadingUsers(false);
      setUsersList([]);
      setTotalPages(1);
      return;
    }
    void loadUsersList(currentPage);
  }, [isAdmin, currentPage]);

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return usersList;
    const lowerSearch = searchTerm.toLowerCase();
    return usersList.filter(u => 
      (u.nom_usu || '').toLowerCase().includes(lowerSearch) || 
      (u.correo_usu || '').toLowerCase().includes(lowerSearch)
    );
  }, [usersList, searchTerm]);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    const confirmed = await alertService.showConfirm('Cerrar Sesión', '¿Estás seguro que deseas cerrar tu sesión?', 'Cerrar sesión', 'Cancelar');
    if (confirmed) {
      sessionManager.stopMonitoring();
      await authService.logout();
    }
  };

  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.nom_usu || !newUser.correo_usu || !newUser.rol_usu) {
      alertService.showToast('warning', 'Nombre, correo y rol son obligatorios');
      return;
    }
    setIsRegistering(true);
    try {
      if (isEditing && editingUser?.id_usu) {
        await userService.updateUser(editingUser.id_usu, newUser);
        alertService.showToast('success', 'Usuario actualizado');
      } else {
        await userService.registerUser(newUser);
        alertService.showToast('success', 'Usuario creado');
      }
      setIsDrawerOpen(false);
      loadUsersList(currentPage); 
    } catch (e: unknown) {
      alertService.showToast('error', getErrorMessage(e, 'Error al procesar'));
    } finally {
      setIsRegistering(false);
    }
  };

  const handleEditClick = (u: User) => {
    setEditingUser(u);
    setIsEditing(true);
    setNewUser({
      nom_usu: String(u.nom_usu || ''),
      correo_usu: String(u.correo_usu || ''),
      tel_usu: String(u.tel_usu || ''),
      rol_usu: String(u.rol_usu || '')
    });
    setIsDrawerOpen(true);
  };

  const handleDeleteUser = async (id: string | number) => {
    const confirm = await alertService.showConfirm('¿Eliminar Usuario?', '¿Deseas eliminar este usuario?', 'Eliminar', 'Cancelar');
    if (confirm) {
      try {
        await userService.deleteUser(id);
        alertService.showToast('success', 'Usuario eliminado');
        loadUsersList(currentPage);
      } catch (e: unknown) {
        alertService.showToast('error', getErrorMessage(e, 'Error al eliminar'));
      }
    }
  };

  const handleUnlockUser = async (id: string | number) => {
    const confirm = await alertService.showConfirm('Desbloquear', '¿Desbloquear cuenta?', 'Desbloquear', 'Cancelar');
    if (confirm) {
      try {
        await userService.unlockUser(id.toString());
        alertService.showToast('success', 'Usuario desbloqueado');
        loadUsersList(currentPage);
      } catch (e: unknown) {
        alertService.showToast('error', getErrorMessage(e, 'Error al desbloquear'));
      }
    }
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
    } catch (e: unknown) {
      alertService.showToast('error', getErrorMessage(e, 'Error al cambiar la contraseña'));
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handlePasswordResetClick = (u: User) => {
    setResettingUser(u);
    setIsSecurityOpen(true);
  };

  const handleConfirmPasswordReset = async (newPassword: string) => {
    if (!resettingUser?.id_usu) return;
    setIsResettingPassword(true);
    try {
      await userService.adminUpdatePassword(resettingUser.id_usu, newPassword);
      alertService.showToast('success', 'Contraseña actualizada correctamente');
      setIsSecurityOpen(false);
    } catch (e: unknown) {
      alertService.showToast('error', getErrorMessage(e, 'Error al actualizar la contraseña'));
    } finally {
      setIsResettingPassword(false);
    }
  };

<<<<<<< Updated upstream
=======
  const handleUnlockUser = async (id: string | number) => {
    try {
      await userService.unlockUser(Number(id));
      alertService.showToast('success', 'Desbloqueado');
      loadUsersList(currentPage);
    } catch (e) { alertService.showToast('error', 'Error al desbloquear'); }
  };

>>>>>>> Stashed changes
  if (!isHydrated || !user) return null;

  return (
<<<<<<< Updated upstream
    <div className="min-h-screen w-full bg-[#FDFCFB]/80 pb-32 font-[Inter] text-slate-800 antialiased">
      <AdminNavbar user={user} onLogout={handleLogout} onProfileOpen={() => setIsProfileOpen(true)} />
      

      <main className="relative mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        {activeTab === 'dashboard' ? (
          <DashboardSection />
        ) : activeTab === 'usuarios' ? (
          <>
            <header className="mb-10 flex flex-col gap-6 sm:mb-12 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#3E2723]/5 border border-[#3E2723]/10">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#ec131e] animate-pulse"></div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#3E2723]/60">Gestión de Usuarios</span>
=======
    <StockProvider>
      <div className="min-h-screen w-full bg-[#FDFCFB]/80 pb-32 font-[Inter] text-slate-800 antialiased">
        <AdminNavbar user={user} onLogout={handleLogout} onProfileOpen={() => setIsProfileOpen(true)} />
      
        <main className="relative mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 transition-all duration-500 pl-24">
          <div className="mx-auto max-w-5xl px-6 py-8 sm:px-8 sm:py-10">
          {activeTab === 'dashboard' ? (
            <DashboardSection onSwitchTab={setActiveTab} />
          ) : activeTab === 'inventario' ? (
            <InventorySection onNavigateToProducts={() => setActiveTab('productos')} />
          ) : activeTab === 'productos' ? (
            <ProductsSection />
          ) : activeTab === 'categorias' ? (
            <CategoriasSection />
          ) : activeTab === 'proveedores' ? (
            <ProveedoresSection />
          ) : activeTab === 'pedidos' ? (
            <OrdersSection />
          ) : activeTab === 'mantenimiento' ? (
            <MaintenanceSection />
          ) : activeTab === 'ventas' ? (
            <SalesSection onOpenPOS={() => setIsOrderDrawerOpen(true)} isAdmin={isAdmin} />
          ) : activeTab === 'usuarios' ? (
            <>
              <header className="mb-10 flex flex-col gap-6 sm:mb-12 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <h1 className="text-3xl font-extrabold text-[#1a1a1a]">Usuarios & Roles</h1>
                  <p className="text-slate-500 font-medium">Gestiona accesos y permisos.</p>
>>>>>>> Stashed changes
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-[#1a1a1a] sm:text-4xl">
                  Usuarios <span className="text-[#ec131e]">&</span> Roles
                </h1>
                <p className="max-w-2xl text-[0.95rem] leading-relaxed text-slate-500 font-medium">
                  Control centralizado de acceso. Administra permisos, bloqueos y credenciales de forma segura.
                </p>
              </div>
              <button
                onClick={() => {
                  setEditingUser(null);
                  setIsEditing(false);
                  setNewUser({ nom_usu: '', correo_usu: '', tel_usu: '', rol_usu: '' });
                  setIsDrawerOpen(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-[#ec131e] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#ec131e]/20 transition-all hover:bg-[#d01019] hover:shadow-[#ec131e]/30 active:scale-95 whitespace-nowrap"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                </svg>
                Nuevo Usuario
              </button>
            </header>

            <UserList 
              users={filteredUsers}
              isLoading={isLoadingUsers}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onEdit={handleEditClick}
              onDelete={handleDeleteUser}
              onUnlock={handleUnlockUser}
              onPasswordReset={handlePasswordResetClick}
              pagination={{ currentPage, totalPages, onPageChange: loadUsersList }}
            />

            <RolesSection />
          </>
        ) : activeTab === 'ajustes' ? (
          <div className="space-y-8">
            <header className="mb-10 flex flex-col gap-6 sm:mb-12 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#3E2723]/5 border border-[#3E2723]/10">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#ec131e] animate-pulse"></div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#3E2723]/60">Preferencias</span>
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-[#1a1a1a] sm:text-4xl">
                  Ajustes <span className="text-[#ec131e]">&</span> Ayuda
                </h1>
              </div>
            </header>

            {!showHelp ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() => setShowHelp(true)}
                  className="flex items-center gap-4 p-6 bg-white border border-slate-100 rounded-2xl text-left transition-all hover:border-[#ec131e]/30 hover:shadow-lg group"
                >
                  <div className="w-14 h-14 bg-red-50 text-[#ec131e] rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#111827] text-lg">Centro de Ayuda</h3>
                    <p className="text-slate-500 text-sm font-medium">Preguntas frecuentes y soporte técnico.</p>
                  </div>
                </button>

                <div className="flex items-center gap-4 p-6 bg-slate-50 border border-slate-100 rounded-2xl opacity-60 cursor-not-allowed">
                  <div className="w-14 h-14 bg-slate-200 text-slate-400 rounded-xl flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#111827] text-lg">Configuración General</h3>
                    <p className="text-slate-500 text-sm font-medium">Próximamente.</p>
                  </div>
                </div>
<<<<<<< Updated upstream
              </div>
            ) : (
              <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-500">
                <button
                  onClick={() => setShowHelp(false)}
                  className="mb-6 flex items-center gap-2 text-slate-400 hover:text-[#ec131e] transition-all group font-bold text-xs uppercase tracking-widest bg-transparent border-none cursor-pointer"
                >
                  <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Volver a Ajustes
                </button>
                <HelpCenter hideBackButton={true} />
              </div>
            )}
          </div>
        ) : (
          <ComingSoonSection tabId={activeTab} />
        )}
      </main>

      <AdminSubNav activeId={activeTab} onItemClick={setActiveTab} />
=======
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
                  <button onClick={() => setSettingsView('main')} className="mb-6 flex items-center gap-2 text-slate-400 font-bold hover:text-[#ec131e] transition-all"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>Volver</button>
                  <LegalSection />
                </div>
              )}
            </div>
          ) : (
            <ComingSoonSection tabId={activeTab} />
          )}
          </div>
        </main>

        <AdminSubNav activeId={activeTab} isAdmin={isAdmin} onItemClick={(tab) => {
          if (!isAdmin && !['dashboard', 'ventas', 'ajustes'].includes(tab)) return;
          setActiveTab(tab);
        }} />
<<<<<<< Updated upstream
=======


>>>>>>> Stashed changes


>>>>>>> Stashed changes

      <UserDrawer 
        isOpen={isDrawerOpen}
        isEditing={isEditing}
        isRegistering={isRegistering}
        userData={newUser}
        onUserDataChange={setNewUser}
        onSubmit={handleSubmitUser}
        onClose={() => setIsDrawerOpen(false)}
      />

      <ProfileDrawer 
        isOpen={isProfileOpen}
        user={user}
        passwords={passwords}
        isChangingPassword={isChangingPassword}
        onPasswordsChange={setPasswords}
        onSubmitPassword={handleUpdatePassword}
        onClose={() => setIsProfileOpen(false)}
      />

      <SecurityDrawer 
        isOpen={isSecurityOpen}
        userName={resettingUser?.nom_usu || ''}
        isProcessing={isResettingPassword}
        onConfirm={handleConfirmPasswordReset}
        onClose={() => setIsSecurityOpen(false)}
      />
    </div>
  );
}
