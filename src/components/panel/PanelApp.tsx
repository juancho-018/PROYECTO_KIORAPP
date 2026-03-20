import { useState, useEffect, useMemo } from 'react';
import { authService, userService, alertService } from '../../config/setup';
import { SessionManager } from '../../services/SessionManager';
import type { User } from '../../models/User';
import type { RegisterUserDto } from '../../services/UserService';

// Modular Components
import { AdminNavbar } from './AdminNavbar';
import { AdminSubNav } from './AdminSubNav';
import { UserList } from './UserList';
import { UserDrawer } from './UserDrawer';
import { ProfileDrawer } from './ProfileDrawer';
import { RolesSection } from './RolesSection';
import { SecurityDrawer } from './SecurityDrawer';
import { ComingSoonSection } from './ComingSoonSection';
import { getErrorMessage } from '../../utils/getErrorMessage';

export default function PanelApp() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Tab switching
  const [activeTab, setActiveTab] = useState('ajustes');
  
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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100/80 via-slate-50 to-white pb-24 font-[Inter] text-slate-800 antialiased">
      <AdminNavbar user={user} onLogout={handleLogout} onProfileOpen={() => setIsProfileOpen(true)} />
      
      <AdminSubNav activeId={activeTab} onItemClick={setActiveTab} />

      <main className="relative mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        {activeTab === 'ajustes' ? (
          <>
            <header className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Ajustes</p>
                <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Usuarios y roles</h1>
                <p className="mt-1.5 max-w-xl text-sm text-slate-500">
                  Alta, edición y bloqueos de cuentas. Los cambios dependen de tu rol en el sistema.
                </p>
              </div>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setNewUser({ nom_usu: '', correo_usu: '', tel_usu: '', rol_usu: '' });
                    setIsDrawerOpen(true);
                  }}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[#ec131e] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-[#ec131e]/25 transition hover:bg-[#d01019] focus:outline-none focus:ring-2 focus:ring-[#ec131e] focus:ring-offset-2"
                >
                  <span className="text-lg leading-none">+</span>
                  Nuevo usuario
                </button>
              )}
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
        ) : (
          <ComingSoonSection tabId={activeTab} />
        )}
      </main>

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
