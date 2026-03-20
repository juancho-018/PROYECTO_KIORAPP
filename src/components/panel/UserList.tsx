import React from 'react';
import type { User } from '../../models/User';

interface UserListProps {
  users: (User & { isBlocked: boolean })[];
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onEdit: (user: User) => void;
  onDelete: (id: string | number) => void;
  onUnlock: (id: string | number, isBlocked: boolean) => void;
  onPasswordReset: (user: User) => void;
  pagination: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

export const UserList: React.FC<UserListProps> = ({
  users,
  isLoading,
  searchTerm,
  onSearchChange,
  onEdit,
  onDelete,
  onUnlock,
  onPasswordReset,
  pagination
}) => {
  const getInitials = (name: string) => {
    if (!name) return 'UN';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <section className="mb-12">
      <div className="flex justify-between items-center mb-4 px-1">
        <h2 className="text-[11px] font-bold text-gray-400 tracking-widest uppercase">Lista de Usuarios</h2>
        <div className="flex items-center gap-3">
          <div className="relative">
            <input 
              type="text"
              placeholder="Buscar usuario..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="bg-white border border-gray-200 rounded-full pl-8 pr-4 py-1.5 text-[12px] focus:outline-none focus:border-[#ec131e] focus:ring-2 focus:ring-red-50 transition-all w-50"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_2px_15px_-3px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden flex flex-col p-2 gap-2">
        {isLoading ? (
          <div className="flex justify-center items-center py-12 flex-col gap-3">
             <div className="w-8 h-8 border-4 border-gray-100 border-t-[#ec131e] rounded-full animate-spin"></div>
             <span className="text-sm font-medium text-gray-400">Cargando cuentas...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-10 text-gray-500 font-medium text-sm">
            {searchTerm ? 'No se encontraron usuarios que coincidan' : 'No hay usuarios registrados'}
          </div>
        ) : (
          users.map((u, i) => (
            <div 
              key={u.id_usu || `user-${i}`} 
              className="flex items-center justify-between p-4 rounded-xl border border-transparent hover:border-gray-100 hover:bg-gray-50/50 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10.5 h-10.5 min-w-10.5 ${u.rol_usu === 'admin' ? 'bg-blue-50 text-blue-600' : u.rol_usu === 'operario' ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'} rounded-full flex items-center justify-center font-bold text-sm`}>
                  {getInitials(String(u.nom_usu))}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-gray-800 text-[15px]">{String(u.nom_usu || 'Sin Nombre')}</span>
                  <span className="text-[13px] text-gray-400 capitalize">{u.rol_usu || 'Usuario'}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {u.isBlocked ? (
                   <button onClick={() => onUnlock(u.id_usu as string, true)} className="bg-gray-100 text-gray-500 hover:bg-gray-200 font-bold text-[10px] px-3 py-1.5 rounded-full tracking-wider transition-colors">INACTIVO</button>
                ) : (
                   <span className="bg-green-100/60 text-emerald-600 font-bold text-[10px] px-3 py-1.5 rounded-full tracking-wider">ACTIVO</span>
                )}
                 <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onEdit(u)}
                      className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
                      title="Editar usuario"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => onPasswordReset(u)}
                      className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-all"
                      title="Cambiar contraseña"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </button>
                    <button 
                      onClick={() => u.id_usu && onDelete(u.id_usu)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Eliminar usuario"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                 </div>
              </div>
            </div>
          ))
        )}
        
        {pagination.totalPages > 1 && !isLoading && (
          <div className="flex justify-between items-center px-4 py-3 mt-2 border-t border-gray-50">
            <button 
              disabled={pagination.currentPage <= 1}
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              className="text-xs font-semibold text-gray-500 hover:text-[#ec131e] disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
            >
              &larr; Anterior
            </button>
            <div className="flex gap-1.5">
              {[...Array(pagination.totalPages)].map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => pagination.onPageChange(idx + 1)}
                  className={`w-6 h-6 rounded-md text-xs font-bold ${pagination.currentPage === idx + 1 ? 'bg-[#ec131e] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'} transition-all flex items-center justify-center`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
            <button 
              disabled={pagination.currentPage >= pagination.totalPages}
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              className="text-xs font-semibold text-gray-500 hover:text-[#ec131e] disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
            >
              Siguiente &rarr;
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
