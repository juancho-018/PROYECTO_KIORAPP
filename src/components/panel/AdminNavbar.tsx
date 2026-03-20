import React from 'react';
import type { User } from '../../models/User';

interface AdminNavbarProps {
  user: User;
  onLogout: (e: React.MouseEvent) => void;
  onProfileOpen: () => void;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({ user, onLogout, onProfileOpen }) => {
  const getInitials = (name: string) => {
    if (!name) return 'UN';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <nav className="bg-[#3E2723] border-b border-gray-200 px-6 py-4 flex justify-between items-center shadow-sm">
      <div className="flex items-center gap-3">
        <img src="/img/path1.png" alt="Kiora" className="h-8 w-auto object-contain" />
        <span className="text-[0.95rem] text-white font-medium ml-2">
          Panel de Administración Kiora
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div 
          onClick={onProfileOpen}
          className="flex items-center gap-2 cursor-pointer hover:bg-white/10 px-3 py-1.5 rounded-xl transition-all group"
        >
          <div className="w-8 h-8 rounded-full bg-[#ec131e] flex items-center justify-center text-white font-bold text-xs shadow-sm group-hover:scale-105 transition-transform">
            {getInitials(String(user.nom_usu))}
          </div>
          <span className="text-sm text-gray-300 font-medium group-hover:text-white transition-colors">
            Hola, {String(user.nom_usu)}
          </span>
        </div>
        <a
          href="#"
          onClick={onLogout}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-[#ec131e] bg-white/5 hover:bg-white/10 rounded-lg transition-all no-underline"
        >
          Cerrar sesión
        </a>
      </div>
    </nav>
  );
};
