import React, { useState, useEffect } from 'react';
import type { User } from '@/models/User';
import { productService, notificationService } from '@/config/setup';
import type { Notification } from '@/models/Notification';

interface AdminNavbarProps {
  user: User;
  onLogout: (e: React.MouseEvent) => void;
  onProfileOpen: () => void;
}

export const AdminNavbar: React.FC<AdminNavbarProps> = ({ user, onLogout, onProfileOpen }) => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    let failCount = 0;
    const fetchAlerts = async () => {
      if (failCount >= 3) return;
      try {
        const res = await productService.getLowStock();
        failCount = 0;
        if (res && res.data) setAlerts(res.data);
      } catch (err) { failCount++; }
    };

    fetchAlerts();

    const updateNotifications = () => {
      setNotifications(notificationService.getNotifications());
    };

    updateNotifications();
    window.addEventListener('kiora_notification_updated', updateNotifications);

    const interval = setInterval(fetchAlerts, 120000);
    return () => {
      clearInterval(interval);
      window.removeEventListener('kiora_notification_updated', updateNotifications);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

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
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`relative p-1 transition-all hover:scale-110 ${showNotifications ? 'text-white' : 'text-white/80 hover:text-white'}`}
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
              {(unreadCount > 0 || alerts.length > 0) && (
                <div className="absolute right-1 top-1.5 h-2.5 w-2.5 rounded-full bg-[#ec131e] border-2 border-[#3E2723]"></div>
              )}
            </button>

            {showNotifications && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)}></div>
                <div className="absolute right-0 mt-3 w-80 max-h-[400px] overflow-y-auto bg-white rounded-2xl shadow-2xl z-20 border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                    <h4 className="font-black text-slate-800 text-xs uppercase tracking-widest">Notificaciones</h4>
                    {unreadCount > 0 && (
                      <button 
                        onClick={() => notificationService.markAllAsRead()}
                        className="text-[10px] font-bold text-[#ec131e] hover:underline"
                      >
                        Marcar todo leído
                      </button>
                    )}
                  </div>
                  <div className="divide-y divide-slate-50">
                    {alerts.length > 0 && alerts.map((a, i) => (
                      <div key={`alert-${i}`} className="p-4 bg-red-50/30 hover:bg-red-50/50 transition-colors">
                        <div className="flex gap-3">
                          <div className="mt-0.5 h-2 w-2 rounded-full bg-[#ec131e] shrink-0"></div>
                          <div>
                            <p className="text-xs font-black text-slate-800">Stock Crítico</p>
                            <p className="text-[11px] text-slate-500 font-medium mt-0.5">{a.nom_prod} tiene solo {a.stock_actual} unidades.</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {notifications.length === 0 && alerts.length === 0 ? (
                      <div className="p-8 text-center">
                        <p className="text-xs text-slate-400 font-medium italic">No tienes notificaciones pendientes</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <button
                          key={n.id}
                          onClick={() => {
                            notificationService.markAsRead(n.id);
                            // Maybe navigate?
                          }}
                          className={`w-full text-left p-4 hover:bg-slate-50 transition-colors flex gap-3 ${!n.read ? 'bg-blue-50/20' : ''}`}
                        >
                          <div className={`mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ${!n.read ? 'bg-blue-600' : 'bg-transparent'}`}></div>
                          <div>
                            <p className={`text-xs ${!n.read ? 'font-black text-slate-800' : 'font-bold text-slate-600'}`}>{n.title}</p>
                            <p className="text-[11px] text-slate-500 font-medium mt-0.5">{n.description}</p>
                            <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase">{new Date(n.timestamp).toLocaleTimeString()}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
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
