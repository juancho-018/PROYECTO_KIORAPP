import React, { useState } from 'react';
import type { User } from '@/models/User';
import { useStockSync } from '@/context/StockContext';

interface AdminNavbarProps {
  user: User;
  onLogout: (e: React.MouseEvent) => void;
  onProfileOpen: () => void;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({ user, onLogout, onProfileOpen }) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const { lowStockItems } = useStockSync();

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
          <div className="relative">
            <button 
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className={`relative p-1 transition-all hover:scale-110 ${isNotificationsOpen ? 'text-white' : 'text-white/80 hover:text-white'}`}
            >
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
              {lowStockItems.length > 0 && (
                <div className="absolute right-1 top-1.5 h-2.5 w-2.5 rounded-full bg-[#ec131e] border-2 border-[#3E2723] animate-pulse"></div>
              )}
            </button>

            {/* Notifications Dropdown */}
            {isNotificationsOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsNotificationsOpen(false)}
                />
                <div className="absolute right-0 mt-3 w-80 origin-top-right rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="bg-[#3E2723] px-4 py-3">
                    <h3 className="text-xs font-black uppercase tracking-widest text-white/60">Notificaciones</h3>
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {lowStockItems.length === 0 ? (
                      <div className="p-8 text-center">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-500">
                           <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                           </svg>
                        </div>
                        <p className="text-sm font-bold text-slate-900">Todo en orden</p>
                        <p className="text-xs font-medium text-slate-500 mt-1">No hay productos con stock bajo en este momento.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-50">
                        {lowStockItems.map((item) => (
                          <div key={item.cod_prod} className="flex gap-4 p-4 hover:bg-slate-50 transition-colors">
                            <div className="h-10 w-10 shrink-0 rounded-lg bg-red-50 flex items-center justify-center text-[#ec131e]">
                               <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                               </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold text-slate-900 truncate">{item.nom_prod}</p>
                              <p className="text-xs font-medium text-red-500 mt-0.5">Stock crítico: {item.stock_actual} unidades</p>
                              <p className="text-[10px] font-medium text-slate-400 mt-1 uppercase tracking-tight">Mínimo requerido: {item.stock_minimo}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {lowStockItems.length > 0 && (
                    <div className="bg-slate-50 p-3 text-center border-t border-slate-100">
                      <button 
                        onClick={() => {
                          setIsNotificationsOpen(false);
                          // Maybe navigate to inventory?
                        }}
                        className="text-[10px] font-black uppercase tracking-widest text-[#ec131e] hover:underline"
                      >
                        Ver inventario completo
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

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
