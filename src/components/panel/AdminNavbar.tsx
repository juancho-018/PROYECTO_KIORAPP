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
    <header className="sticky top-0 z-40 border-b border-white/10 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 shadow-[0_1px_0_0_rgba(255,255,255,0.06)]">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src="/img/logo-kiora-vectorizado.svg"
            alt="Kiora"
            className="h-8 w-auto shrink-0 object-contain"
          />
          <div className="min-w-0">
            <span className="block truncate text-sm font-semibold tracking-tight text-white sm:text-[0.95rem]">
              Panel de Administración
            </span>
            <span className="hidden text-xs font-medium text-slate-400 sm:block">Kiora</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onProfileOpen}
            className="group flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition-colors hover:bg-white/10 sm:px-3"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ec131e] text-xs font-bold text-white shadow-md ring-2 ring-white/10 transition-transform group-hover:scale-[1.03]">
              {getInitials(String(user.nom_usu))}
            </div>
            <span className="hidden max-w-[10rem] truncate text-sm font-medium text-slate-200 group-hover:text-white sm:block">
              Hola, {String(user.nom_usu)}
            </span>
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition-colors hover:border-white/25 hover:bg-white/10 hover:text-white sm:text-sm"
          >
            Cerrar sesión
          </button>
        </div>
      </nav>
    </header>
  );
};
