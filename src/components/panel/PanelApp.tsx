import { useState, useEffect, useMemo } from 'react';
import { authService, userService, alertService } from '../../config/setup';
import { SessionManager } from '../../services/SessionManager';
import type { User } from '../../models/User';
import type { RegisterUserDto } from '../../services/UserService';

export default function PanelApp() {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Lista y Paginación
  const [usersList, setUsersList] = useState<(User & { isBlocked: boolean })[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 10;

  // Drawer (Sidebar) para Nuevo Usuario
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [newUser, setNewUser] = useState<RegisterUserDto>({
    nom_usu: '',
    correo_usu: '',
    tel_usu: '',
    rol_usu: ''
  });
  const [isRegistering, setIsRegistering] = useState(false);

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
      setIsAdmin(currentUser.rol_usu === 'admin');
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
    } catch (error) {
      alertService.showToast('error', 'Error al cargar los usuarios');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadUsersList(currentPage);
    }
  }, [isAdmin]);

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    const confirmed = await alertService.showConfirm(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar tu sesión en Kiora?',
      'Cerrar sesión',
      'Cancelar'
    );
    if (confirmed) {
      sessionManager.stopMonitoring();
      authService.logout();
      window.location.href = '/login';
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.nom_usu || !newUser.correo_usu || !newUser.rol_usu) {
      alertService.showToast('warning', 'Nombre, correo y rol son obligatorios');
      return;
    }
    setIsRegistering(true);
    try {
      await userService.registerUser(newUser);
      alertService.showToast('success', 'Usuario creado exitosamente');
      setIsDrawerOpen(false);
      setNewUser({ nom_usu: '', correo_usu: '', tel_usu: '', rol_usu: '' });
      loadUsersList(1); // recargar la primera página para ver el nuevo
    } catch (e: any) {
      alertService.showToast('error', e.message || 'Error al crear usuario');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleUnlockUser = async (id: string | number, currentStatusBlocked: boolean) => {
    if (!currentStatusBlocked) return; // Only allow unlock if blocked
    const confirm = await alertService.showConfirm('Desbloquear Usuario', '¿Confirmas que deseas levantar la restricción de esta cuenta?', 'Desbloquear', 'Cancelar');
    if (!confirm) return;

    try {
      await userService.unlockUser(id.toString());
      alertService.showToast('success', 'Usuario desbloqueado con éxito.');
      await loadUsersList(currentPage);
    } catch (e) {
      alertService.showToast('error', 'Acción denegada. Contacte con soporte.');
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'UN';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  if (!user) return null;

  return (
    <div className="font-[Inter] bg-[#f9fafb] text-[#334155] min-h-screen pb-20 relative">
      {/* Navbar Superior Clásica */}
      <nav className="bg-[#3E2723] border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <img src="/img/path1.png" alt="Kiora" className="h-8 w-auto object-contain" />
          <span className="text-[0.95rem] text-white font-medium ml-2">
            Panel de Administración Kiora
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-300 font-medium">Hola, {String(user.nom_usu)}</span>
          <a
            href="#"
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-[#ec131e] bg-white/5 hover:bg-white/10 rounded-lg transition-all no-underline"
          >
            Cerrar sesión
          </a>
        </div>
      </nav>

      {/* Main Content apegado al Mockup */}
      <main className="max-w-4xl mx-auto px-6 py-10 w-full relative">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-[28px] font-bold text-[#1f2937]">Usuarios y Roles</h1>
          </div>
          {isAdmin && (
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="bg-[#ec131e] hover:bg-[#d01019] text-white font-semibold flex items-center gap-2 px-5 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <span>+ Nuevo Usuario</span>
            </button>
          )}
        </div>

        {/* Sección Lista de Usuarios */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-4 px-1">
            <h2 className="text-[11px] font-bold text-gray-400 tracking-widest uppercase">Lista de Usuarios</h2>
            <span className="text-[12px] font-semibold text-[#ec131e] cursor-pointer hover:underline">Ver todos</span>
          </div>

          <div className="bg-white rounded-[1rem] shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden flex flex-col p-2 gap-2">
            {isLoadingUsers ? (
              <div className="flex justify-center items-center py-12 flex-col gap-3">
                 <div className="w-8 h-8 border-4 border-gray-100 border-t-[#ec131e] rounded-full animate-spin"></div>
                 <span className="text-sm font-medium text-gray-400">Cargando cuentas...</span>
              </div>
            ) : usersList.length === 0 ? (
              <div className="text-center py-10 text-gray-500 font-medium text-sm">No hay usuarios registrados</div>
            ) : (
              usersList.map((u, i) => (
                <div 
                  key={u.id_usu || `user-${i}`} 
                  className="flex items-center justify-between p-4 rounded-xl border border-transparent hover:border-gray-100 hover:bg-gray-50/50 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-[42px] h-[42px] min-w-[42px] ${u.rol_usu === 'admin' ? 'bg-blue-50 text-blue-600' : u.rol_usu === 'operario' ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'} rounded-full flex items-center justify-center font-bold text-sm`}>
                      {getInitials(String(u.nom_usu))}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-800 text-[15px]">{String(u.nom_usu || 'Sin Nombre')}</span>
                      <span className="text-[13px] text-gray-400 capitalize">{u.rol_usu || 'Usuario'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {u.isBlocked ? (
                       <button onClick={() => handleUnlockUser(u.id_usu as string, true)} className="bg-gray-100 text-gray-500 hover:bg-gray-200 font-bold text-[10px] px-3 py-1.5 rounded-full tracking-wider transition-colors">INACTIVO</button>
                    ) : (
                       <span className="bg-green-100/60 text-emerald-600 font-bold text-[10px] px-3 py-1.5 rounded-full tracking-wider">ACTIVO</span>
                    )}
                    <button className="text-gray-300 hover:text-gray-500 transition-colors p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
            
            {/* Controles de Paginación integrados a la tabla limpia */}
            {totalPages > 1 && !isLoadingUsers && (
              <div className="flex justify-between items-center px-4 py-3 mt-2 border-t border-gray-50">
                <button 
                  disabled={currentPage <= 1}
                  onClick={() => loadUsersList(currentPage - 1)}
                  className="text-xs font-semibold text-gray-500 hover:text-[#ec131e] disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
                >
                  &larr; Anterior
                </button>
                <div className="flex gap-1.5">
                  {[...Array(totalPages)].map((_, idx) => (
                    <button 
                      key={idx}
                      onClick={() => loadUsersList(idx + 1)}
                      className={`w-6 h-6 rounded-md text-xs font-bold ${currentPage === idx + 1 ? 'bg-[#ec131e] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'} transition-all flex items-center justify-center`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                </div>
                <button 
                  disabled={currentPage >= totalPages}
                  onClick={() => loadUsersList(currentPage + 1)}
                  className="text-xs font-semibold text-gray-500 hover:text-[#ec131e] disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
                >
                  Siguiente &rarr;
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Sección Roles y Permisos (Estática visual según mockup) */}
        <section>
          <div className="flex justify-between items-center mb-4 px-1">
            <h2 className="text-[11px] font-bold text-gray-400 tracking-widest uppercase">Roles y Permisos</h2>
            <span className="text-[12px] font-semibold text-[#ec131e] cursor-pointer hover:underline">Gestionar</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
             {/* Admin */}
             <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.03)] border border-gray-100 p-5 flex flex-col gap-2 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <h3 className="font-bold text-gray-800">Administrador</h3>
                  </div>
                  <span className="bg-gray-100 text-gray-500 text-[11px] font-bold px-3 py-1 rounded-md">∞ Usuarios</span>
                </div>
                <p className="text-[12px] text-gray-400 leading-relaxed pr-10">Acceso total a configuración, reportes financieros, gestión de usuarios e inventario completo.</p>
             </div>

             {/* Operario */}
             <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.03)] border border-gray-100 p-5 flex flex-col gap-2 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" /><path d="M9 11v6H4.5a2.5 2.5 0 010-5H9zm2 0h4.5a2.5 2.5 0 010 5H11v-6z" /></svg>
                    <h3 className="font-bold text-gray-800">Operario</h3>
                  </div>
                </div>
                <p className="text-[12px] text-gray-400 leading-relaxed pr-10">Acceso a cajas, procesamiento de comandas, ventas e inventario básico.</p>
             </div>

             {/* Usuario */}
             <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(0,0,0,0.03)] border border-gray-100 p-5 flex flex-col gap-2 relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                    <h3 className="font-bold text-gray-800">Usuario</h3>
                  </div>
                </div>
                <p className="text-[12px] text-gray-400 leading-relaxed pr-10">Vista limitada, consultas y funciones estándar sin permisos de edición crítica.</p>
             </div>
          </div>
        </section>

      </main>

      {/* Side-Panel (Offcanvas) para Nuevo Usuario */}
      <div className={`fixed inset-0 z-[99999] transition-all duration-300 ${isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {/* Backdrop */}
        <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)}></div>
        
        {/* Panel derecho */}
        <div className={`absolute top-0 right-0 h-full w-[400px] max-w-[calc(100vw-1rem)] bg-[#fafafc] shadow-2xl transition-transform duration-300 transform ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
           {/* Header Panel */}
           <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
             <button onClick={() => setIsDrawerOpen(false)} className="p-2 -ml-2 text-gray-400 hover:bg-gray-50 rounded-full transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
             </button>
             <h2 className="text-[15px] font-bold text-gray-800">Nuevo Usuario</h2>
             <div className="w-9" /> {/* spacer para centrar tittle */}
           </div>

           {/* Formulario Body */}
           <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              <form onSubmit={handleCreateUser} id="createUserForm" className="flex flex-col gap-5">
                 
                 {/* Input Nombre */}
                 <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-gray-600">Nombre Completo</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                      </div>
                      <input 
                         type="text" 
                         required
                         value={newUser.nom_usu}
                         onChange={(e) => setNewUser({...newUser, nom_usu: e.target.value})}
                         className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#ec131e] focus:ring-4 focus:ring-red-50 transition-all text-[0.95rem] bg-white placeholder:text-gray-300" 
                         placeholder="Ej. Juan Pérez" 
                      />
                    </div>
                 </div>

                 {/* Input Email */}
                 <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-gray-600">Correo Electrónico</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                      </div>
                      <input 
                         type="email" 
                         required
                         value={newUser.correo_usu}
                         onChange={(e) => setNewUser({...newUser, correo_usu: e.target.value})}
                         className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#ec131e] focus:ring-4 focus:ring-red-50 transition-all text-[0.95rem] bg-white placeholder:text-gray-300" 
                         placeholder="juan@kiora.com" 
                      />
                    </div>
                 </div>

                 {/* Input Tel */}
                 <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-gray-600">Número de Teléfono</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      </div>
                      <input 
                         type="text" 
                         value={newUser.tel_usu}
                         onChange={(e) => setNewUser({...newUser, tel_usu: e.target.value})}
                         className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#ec131e] focus:ring-4 focus:ring-red-50 transition-all text-[0.95rem] bg-white placeholder:text-gray-300" 
                         placeholder="+57 300 123 4567" 
                      />
                    </div>
                 </div>

                 {/* Input Contraseña */}
                 <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-gray-600">Contraseña Temporal</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                      </div>
                      <input 
                         type="password" 
                         required
                         value={newUser.password || ''}
                         onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                         className="w-full pl-10 pr-3 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#ec131e] focus:ring-4 focus:ring-red-50 transition-all text-[0.95rem] bg-white placeholder:text-gray-300" 
                         placeholder="Ingresa clave segura" 
                         minLength={6}
                      />
                    </div>
                 </div>

                 {/* Select Rol */}
                 <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-gray-600">Seleccionar Rol</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                      </div>
                      <select 
                         required
                         value={newUser.rol_usu}
                         onChange={(e) => setNewUser({...newUser, rol_usu: e.target.value})}
                         className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#ec131e] focus:ring-4 focus:ring-red-50 transition-all text-[0.95rem] bg-white text-gray-700 appearance-none cursor-pointer" 
                      >
                        <option value="" disabled>Selecciona un rol</option>
                        <option value="operario">Operario</option>
                        <option value="usuario">Usuario</option>
                        <option value="admin">Administrador</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                      </div>
                    </div>
                 </div>

              </form>

              {/* Switches decorativos según Mockup (Los permisos nativos los asigna el backend según rol) */}
              <div className="flex flex-col gap-3 mt-4">
                 <label className="text-[11px] font-bold text-gray-400 tracking-widest uppercase mb-1">Permisos de Acceso</label>
                 <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
                    <div className="flex justify-between items-center p-4 border-b border-gray-50">
                       <div className="flex items-center gap-3">
                         <div className="w-7 h-7 bg-blue-50 text-blue-500 rounded-lg flex items-center justify-center"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" /><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" /></svg></div>
                         <span className="font-semibold text-sm text-gray-700">Ver Ventas</span>
                       </div>
                       <div className="w-11 h-6 bg-[#ec131e] rounded-full relative shadow-inner cursor-pointer">
                         <div className="absolute right-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm flex items-center justify-center"><svg className="w-2.5 h-2.5 text-[#ec131e]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg></div>
                       </div>
                    </div>
                    <div className="flex justify-between items-center p-4 border-b border-gray-50">
                       <div className="flex items-center gap-3">
                         <div className="w-7 h-7 bg-orange-50 text-orange-500 rounded-lg flex items-center justify-center"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm0 2h10v7h-2l-1 2H8l-1-2H5V5z" clipRule="evenodd" /></svg></div>
                         <span className="font-semibold text-sm text-gray-700">Editar Inventario</span>
                       </div>
                       <div className="w-11 h-6 bg-gray-200 rounded-full relative shadow-inner cursor-not-allowed opacity-70">
                         <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm"></div>
                       </div>
                    </div>
                 </div>
              </div>

           </div>

           {/* Footer Panel */}
           <div className="p-6 bg-white border-t border-gray-100 flex flex-col gap-3">
             <button 
                form="createUserForm" 
                type="submit" 
                disabled={isRegistering}
                className="w-full bg-[#ec131e] hover:bg-[#d01019] text-white font-bold py-3.5 rounded-xl shadow-[0_4px_14px_0_rgba(236,19,30,0.39)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
             >
               {isRegistering ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
               ) : (
                 <>
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                   <span>Crear Usuario</span>
                 </>
               )}
             </button>
             <button 
                type="button" 
                disabled={isRegistering}
                onClick={() => setIsDrawerOpen(false)} 
                className="w-full bg-white hover:bg-gray-50 text-gray-600 font-bold py-3.5 rounded-xl border border-gray-200 transition-all"
             >
               Cancelar
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}
