import React from 'react';
import type { User } from '@/models/User';

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
    <header className="sticky top-0 z-40 bg-[#3E2723] shadow-lg border-b border-white/5">
      <nav className="flex items-center justify-between px-6 py-3">
        {/* Left Section: Branding */}
        <div className="flex items-center gap-4">
          <img 
            src="/img/logo-kiora-vectorizado-blanco.png" 
            alt="Kiora Logo" 
            className="h-8 w-auto hover:opacity-90 transition-opacity cursor-pointer"
            onClick={() => window.location.reload()}
          />
          <span className="hidden sm:block text-[10px] font-bold tracking-[0.3em] text-white/40 uppercase mt-1">
            Admin System
          </span>
        </div>

        {/* Right Section: Actions & User */}
        <div className="flex items-center gap-6">
          {/* Notifications */}
          <button className="relative p-1 text-white/80 transition-all hover:scale-110 hover:text-white">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <div className="absolute right-1 top-1.5 h-2.5 w-2.5 rounded-full bg-[#ec131e] border-2 border-[#3E2723]"></div>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-3">
             <button
              onClick={onProfileOpen}
              className="group flex items-center transition-all hover:opacity-90 active:scale-95"
            >
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[#ec131e] text-sm font-bold text-white shadow-xl ring-2 ring-white/10">
                {getInitials(String(user.nom_usu))}
              </div>
            </button>
            <button
               onClick={onLogout}
               className="ml-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold text-white transition-all hover:bg-white/15 active:bg-white/20"
            >
              Salir
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};
