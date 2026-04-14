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
import { SecurityDrawer } from './SecurityDrawer';
import { DashboardSection } from './DashboardSection';
import { ProductsSection } from './ProductsSection';
import { InventorySection } from './InventorySection';
import { OrdersSection } from './OrdersSection';
import { MaintenanceSection } from './MaintenanceSection';
import { ComingSoonSection } from './ComingSoonSection';
import HelpCenter from '@/components/help/HelpCenter';
import { getErrorMessage } from '@/utils/getErrorMessage';
import { StockProvider } from '@/context/StockContext';

export default function PanelApp() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Tab switching
  const [activeTab, setActiveTab] = useState('dashboard');
  const [settingsView, setSettingsView] = useState<'main' | 'help' | 'terms' | 'privacy'>('main');
  
  // Reset settings view when switching tabs
  useEffect(() => {
    setSettingsView('main');
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
      const usersArray = Array.isArray(paginated.data) ? paginated.data : [];
      const displayUsers = usersArray.map(u => ({
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
    const usersArray = Array.isArray(usersList) ? usersList : [];
    return usersArray.filter(u => 
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

  if (!user) return null;

  return (
    <StockProvider>
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
        ) : activeTab === 'productos' ? (
          <ProductsSection />
        ) : activeTab === 'inventario' ? (
          <InventorySection />
        ) : activeTab === 'pedidos' ? (
          <OrdersSection />
        ) : activeTab === 'mantenimiento' ? (
          <MaintenanceSection />
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

            {settingsView === 'main' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Centro de Ayuda */}
                <button
                  onClick={() => setSettingsView('help')}
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

                {/* Términos */}
                <button
                  onClick={() => setSettingsView('terms')}
                  className="flex items-center gap-4 p-6 bg-white border border-slate-100 rounded-2xl text-left transition-all hover:border-[#ec131e]/30 hover:shadow-lg group"
                >
                  <div className="w-14 h-14 bg-red-50 text-[#ec131e] rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#111827] text-lg">Términos y Condiciones</h3>
                    <p className="text-slate-500 text-sm font-medium">Reglas y responsabilidades.</p>
                  </div>
                </button>

                {/* Privacidad */}
                <button
                  onClick={() => setSettingsView('privacy')}
                  className="flex items-center gap-4 p-6 bg-white border border-slate-100 rounded-2xl text-left transition-all hover:border-[#ec131e]/30 hover:shadow-lg group"
                >
                  <div className="w-14 h-14 bg-red-50 text-[#ec131e] rounded-xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#111827] text-lg">Política de Privacidad</h3>
                    <p className="text-slate-500 text-sm font-medium">Protección de datos.</p>
                  </div>
                </button>

                <div className="flex items-center gap-4 p-6 bg-slate-50 border border-slate-100 rounded-2xl opacity-60 cursor-not-allowed">
                  <div className="w-14 h-14 bg-slate-200 text-slate-400 rounded-xl flex items-center justify-center shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-[#111827] text-lg">Configuración General</h3>
                    <p className="text-slate-500 text-sm font-medium">Próximamente.</p>
                  </div>
                </div>
              </div>
            ) : settingsView === 'help' ? (
              <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-500">
                <button
                  onClick={() => setSettingsView('main')}
                  className="mb-6 flex items-center gap-2 text-slate-400 hover:text-[#ec131e] transition-all group font-bold text-xs uppercase tracking-widest bg-transparent border-none cursor-pointer"
                >
                  <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Volver a Ajustes
                </button>
                <HelpCenter hideBackButton={true} />
              </div>
            ) : settingsView === 'terms' ? (
              <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-500">
                <button
                  onClick={() => setSettingsView('main')}
                  className="mb-6 flex items-center gap-2 text-slate-400 hover:text-[#ec131e] transition-all group font-bold text-xs uppercase tracking-widest bg-transparent border-none cursor-pointer"
                >
                  <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Volver a Ajustes
                </button>
                <section className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
                  <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6 text-[#ec131e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Términos y Condiciones
                  </h3>
                  <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-[15px] text-slate-600 leading-relaxed max-h-[60vh] overflow-y-auto pr-4 italic">
                       Bienvenido a Kiora. Al acceder y utilizar esta aplicación, usted acepta los siguientes términos y condiciones. Kiora es una herramienta de gestión interna de inventarios y ventas. Usted es responsable de la exactitud de los datos ingresados y del uso adecuado de la información del catálogo. El sistema se proporciona "tal cual" y no nos hacemos responsables de pérdidas indirectas resultantes de fallos operativos. El acceso está estrictamente restringido según los roles asignados (Admin, Operario) por la gerencia.
                    </p>
                  </div>
                </section>
              </div>
            ) : (
              <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-500">
                <button
                  onClick={() => setSettingsView('main')}
                  className="mb-6 flex items-center gap-2 text-slate-400 hover:text-[#ec131e] transition-all group font-bold text-xs uppercase tracking-widest bg-transparent border-none cursor-pointer"
                >
                  <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Volver a Ajustes
                </button>
                <section className="bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
                  <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                    <svg className="w-6 h-6 text-[#ec131e]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Política de Privacidad
                  </h3>
                  <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200">
                    <p className="text-[15px] text-slate-600 leading-relaxed max-h-[60vh] overflow-y-auto pr-4 italic">
                       En Kiora, protegemos la integridad de su información corporativa. La información recolectada (registros de ventas, stock, perfiles de usuario) se utiliza exclusivamente para la operación del sistema y análisis de desempeño. No compartimos información con terceros sin consentimiento explícito, excepto por requerimiento legal. Implementamos medidas de seguridad de grado industrial, incluyendo encriptación de credenciales y monitoreo de sesiones activas.
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

      <SecurityDrawer 
        isOpen={isSecurityOpen}
        userName={resettingUser?.nom_usu || ''}
        isProcessing={isResettingPassword}
        onConfirm={handleConfirmPasswordReset}
        onClose={() => setIsSecurityOpen(false)}
      />
      </div>
    </StockProvider>
  );
}
