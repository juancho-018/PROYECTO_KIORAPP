import { useState, useEffect, useMemo } from 'react';
import { authService, userService, alertService } from '../../config/setup';
import { SessionManager } from '../../services/SessionManager';
import type { User } from '../../models/User';

export default function PanelApp() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUsersModalOpen, setIsUsersModalOpen] = useState(false);
  const [usersList, setUsersList] = useState<(User & { isBlocked: boolean })[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);

  // Instanciamos el manejador de sesiones
  const sessionManager = useMemo(
    () => new SessionManager(authService, alertService),
    []
  );

  useEffect(() => {
    // 1. Check Auth
    if (!authService.isAuthenticated()) {
      window.location.href = '/login';
      return;
    }

    // 2. Start monitor
    sessionManager.startMonitoring();

    // 3. Load user
    const currentUser = authService.getUser();
    if (currentUser) {
      setUser(currentUser);
      setIsAdmin(currentUser.rol_usu === 'admin');
    }

    return () => {
      sessionManager.stopMonitoring();
    };
  }, [sessionManager]);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    const confirmed = await alertService.showConfirm(
      '¿Estás seguro?',
      '¿Deseas cerrar tu sesión actual?',
      'Sí, cerrar sesión',
      'Cancelar'
    );

    if (confirmed) {
      sessionManager.stopMonitoring();
      authService.logout();
    }
  };

  const loadUsersList = async () => {
    setIsLoadingUsers(true);
    try {
      const rawUsers = await userService.fetchUsers();
      const displayUsers = rawUsers.map(u => ({
        ...u,
        isBlocked: userService.isUserBlocked(u)
      }));
      setUsersList(displayUsers);
    } catch (error) {
      alertService.showToast('error', 'Error al cargar usuarios');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleManageUsersClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsUsersModalOpen(true);
    await loadUsersList();
  };

  const handleUnlockUser = async (id: string | number) => {
    try {
      await userService.unlockUser(id.toString());
      alertService.showToast('success', 'Cuenta desbloqueada');
      await loadUsersList(); // Refresh
    } catch (e) {
      alertService.showToast('error', 'Restringido: Sólo Admins');
    }
  };

  if (!user) return null; // Avoid flicker before redirect

  return (
    <div className="m-0 font-[Inter] bg-[#fafafc] text-[#334155] min-h-screen">
      {/* Navbar */}
      <nav className="bg-[#3E2723] border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <img
            src="/img/path1.png"
            alt="Kiora Logo"
            className="h-8 w-auto object-contain"
          />
          <span className="flex-1 border-none bg-transparent py-2.5 text-[0.95rem] text-[#FFFFFF] outline-none w-full">
            {user.nom_usu || user.correo_usu}
          </span>
        </div>

        <div className="flex items-center">
          {isAdmin && (
            <a
              href="#"
              onClick={handleManageUsersClick}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 hover:text-[#3b82f6] hover:bg-blue-50/10 rounded-lg transition-colors border border-transparent hover:border-blue-100/20 no-underline mr-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Usuarios
            </a>
          )}

          <a
            href="#"
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-400 hover:text-[#ec131e] hover:bg-red-50/10 rounded-lg transition-colors border border-transparent hover:border-red-100/20 no-underline"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Cerrar sesión
          </a>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-[#1e293b] mb-4">
            Bienvenido al Panel de Control
          </h1>
          <p className="text-gray-600 text-[0.95rem]">
            Has iniciado sesión correctamente. Aquí podrás gestionar tu sistema Kiora próximamente.
          </p>
        </div>
      </main>

      {/* Modal Usuarios */}
      {isUsersModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden m-4 transform transition-all">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#fafafc]">
              <h2 className="text-xl font-bold text-[#1e293b] flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#ec131e]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                Gestión de Usuarios
              </h2>
              <button
                onClick={() => setIsUsersModalOpen(false)}
                className="text-gray-400 hover:text-[#ec131e] bg-gray-100 hover:bg-red-50 p-2 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-white">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-xs uppercase tracking-wider text-gray-500 border-b border-gray-100 bg-gray-50/50">
                    <th className="py-3 px-4 font-semibold rounded-tl-lg">Usuario</th>
                    <th className="py-3 px-4 font-semibold">Correo</th>
                    <th className="py-3 px-4 font-semibold">Rol</th>
                    <th className="py-3 px-4 font-semibold">Estado</th>
                    <th className="py-3 px-4 font-semibold text-right rounded-tr-lg">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {!isLoadingUsers && usersList.map(u => (
                    <tr key={u.id_usu || u.correo_usu} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="font-medium text-[#334155]">{u.nom_usu || 'Sin Nombre'}</div>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-gray-500 text-sm">{u.correo_usu}</td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100 capitalize">
                          {u.rol_usu || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap">
                        {u.isBlocked ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-red-50 text-red-600 border border-red-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>Bloqueado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>Activo
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 whitespace-nowrap text-right">
                        {u.isBlocked ? (
                          <button
                            onClick={() => handleUnlockUser(u.id_usu as string)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#1e293b] hover:bg-[#0f172a] rounded-lg transition-colors focus:ring-2 focus:ring-slate-400 focus:outline-none shadow-sm"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
                            Desbloquear
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {isLoadingUsers && (
                <div className="text-center py-10 flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-4 border-gray-200 border-t-[#ec131e] rounded-full animate-spin"></div>
                  <p className="text-sm font-medium text-gray-500">Cargando información de usuarios...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
