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
import { ProfileDrawer } from './ProfileDrawer';
import { RolesSection } from './RolesSection';
import { ComingSoonSection } from './ComingSoonSection';
import { DashboardSection } from './DashboardSection';
import HelpCenter from '@/components/help/HelpCenter';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { ProductsSection } from './ProductsSection';
import { InventorySection } from './InventorySection';
import { SalesSection } from './SalesSection';
import { MaintenanceSection } from './MaintenanceSection';
import { LegalSection } from './LegalSection';
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
  // Navigation state persists in localStorage
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kiora_active_tab');
      return saved || 'dashboard';
    }
    return 'dashboard';
  });

  useEffect(() => {
    localStorage.setItem('kiora_active_tab', activeTab);
  }, [activeTab]);
  const [showHelp, setShowHelp] = useState(false);
  const [showLegal, setShowLegal] = useState(false);
  
  // Reset help view when switching tabs
  useEffect(() => {
    setShowHelp(false);
    setShowLegal(false);
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

  // --- Cart State (Lifted for Persistence) ---
  const [orderForm, setOrderForm] = useState<CreateOrderDto>(EMPTY_ORDER);
  const cartKey = user ? `kiora_cart_${user.id_usu}` : null;

  // Persistence: Load on mount or user change
  useEffect(() => {
    if (!cartKey) return;
    const saved = localStorage.getItem(cartKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.items)) {
          setOrderForm(parsed);
        }
      } catch (e) {
        console.error('Error loading cart:', e);
      }
    }
  }, [cartKey]);

  // Persistence: Save on changes
  useEffect(() => {
    if (!cartKey || orderForm === EMPTY_ORDER || (orderForm.items.length === 0 && !localStorage.getItem(cartKey))) return;
    localStorage.setItem(cartKey, JSON.stringify(orderForm));
  }, [orderForm, cartKey]);

  const addToCart = (p: Product) => {
    const existing = orderForm.items.find(i => i.cod_prod === p.cod_prod);
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
          nom_prod: p.nom_prod 
        }]
      }));
    }
  };

  const removeFromCart = (cod_prod: number) => {
    setOrderForm(f => ({ ...f, items: f.items.filter(i => i.cod_prod !== cod_prod) }));
  };

  const updateQuantity = (cod_prod: number, delta: number) => {
    setOrderForm(f => ({
      ...f,
      items: f.items.map(i => {
        if (i.cod_prod === cod_prod) {
          const newCant = Math.max(1, i.cantidad + delta);
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
  // -------------------------------------------

  const sessionManager = useMemo(
    () => new SessionManager(authService, alertService),
    []
  );

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      window.location.href = '/login';
      return;
    }
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
        // Enviar solo los campos base
        await userService.updateUser(editingUser.id_usu, newUser);
        // Si el rol cambió, enviar el request a la ruta específica
        if (newUser.rol_usu && newUser.rol_usu !== editingUser.rol_usu) {
          await userService.updateRole(editingUser.id_usu, newUser.rol_usu);
        }
        // Actualizar contraseña si se tipeó algo
        if (newUser.password && newUser.password.trim().length > 0) {
          await userService.adminUpdatePassword(editingUser.id_usu, newUser.password);
        }
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

  if (!user) return null;

  return (
    <div className="min-h-screen w-full bg-[#FDFCFB]/80 pb-32 font-[Inter] text-slate-800 antialiased">
      <AdminNavbar user={user} onLogout={handleLogout} onProfileOpen={() => setIsProfileOpen(true)} />
      

      <main className="relative mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10 transition-all duration-500 lg:pl-16">
        {activeTab === 'dashboard' ? (
          <DashboardSection />
        ) : activeTab === 'productos' ? (
          <ProductsSection />
        ) : activeTab === 'inventario' ? (
          <InventorySection onNavigateToProducts={() => setActiveTab('productos')} />
        ) : activeTab === 'ventas' ? (
          <SalesSection 
            orderForm={orderForm}
            setOrderForm={setOrderForm}
            addToCart={addToCart}
            removeFromCart={removeFromCart}
            updateQuantity={updateQuantity}
            clearCart={clearCart}
            cartKey={cartKey}
          />
        ) : activeTab === 'mantenimiento' ? (
          <MaintenanceSection />
        ) : activeTab === 'usuarios' ? (
          <>
            <header className="mb-10 flex flex-col gap-6 sm:mb-12 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#3E2723]/5 border border-[#3E2723]/10">
                  <div className="h-1.5 w-1.5 rounded-full bg-[#ec131e] animate-pulse"></div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#3E2723]/60">Gestión de Usuarios</span>
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

            {!showHelp && !showLegal ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Centro de Ayuda */}
                <button
                  onClick={() => setShowHelp(true)}
                  className="flex items-center gap-4 p-6 bg-white border border-slate-100 rounded-3xl text-left transition-all hover:border-[#ec131e]/30 hover:shadow-xl hover:shadow-slate-200/50 group"
                >
                  <div className="w-14 h-14 bg-red-50 text-[#ec131e] rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-inner">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#111827] text-lg">Centro de Ayuda</h3>
                    <p className="text-slate-500 text-sm font-medium mt-0.5">Soporte y FAQs.</p>
                  </div>
                </button>

                {/* Idioma / Language */}
                <div className="p-6 bg-white border border-slate-100 rounded-3xl shadow-sm transition-all hover:border-emerald-500/30">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#111827] text-lg">Idioma</h3>
                      <p className="text-slate-500 text-sm font-medium mt-0.5">Language Settings.</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => (window as any).Weglot?.switchTo('es')}
                      className="flex-1 py-2 px-3 rounded-xl border border-slate-100 bg-slate-50 text-xs font-bold text-slate-600 hover:bg-[#ec131e]/5 hover:text-[#ec131e] hover:border-[#ec131e]/20 transition-all active:scale-95"
                    >
                      🇪🇸 Español
                    </button>
                    <button 
                      onClick={() => (window as any).Weglot?.switchTo('en')}
                      className="flex-1 py-2 px-3 rounded-xl border border-slate-100 bg-slate-50 text-xs font-bold text-slate-600 hover:bg-[#ec131e]/5 hover:text-[#ec131e] hover:border-[#ec131e]/20 transition-all active:scale-95"
                    >
                      🇺🇸 English
                    </button>
                  </div>
                </div>

                {/* Legales */}
                <button
                  onClick={() => setShowLegal(true)}
                  className="flex items-center gap-4 p-6 bg-white border border-slate-100 rounded-3xl text-left transition-all hover:border-blue-500/30 hover:shadow-xl hover:shadow-slate-200/50 group"
                >
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-inner">
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#111827] text-lg">Documentos</h3>
                    <p className="text-slate-500 text-sm font-medium mt-0.5">Términos y Privacidad.</p>
                  </div>
                </button>
              </div>
            ) : showHelp ? (
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
                <HelpCenter />
              </div>
            ) : (
              <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-500">
                <button
                  onClick={() => setShowLegal(false)}
                  className="mb-6 flex items-center gap-2 text-slate-400 hover:text-[#ec131e] transition-all group font-bold text-xs uppercase tracking-widest bg-transparent border-none cursor-pointer"
                >
                  <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Volver a Ajustes
                </button>
                <LegalSection />
              </div>
            )}
          </div>
        ) : (
          <ComingSoonSection tabId={activeTab} />
        )}
      </main>

      <AdminSubNav activeId={activeTab} onItemClick={setActiveTab} />

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
    </div>
  );
}
