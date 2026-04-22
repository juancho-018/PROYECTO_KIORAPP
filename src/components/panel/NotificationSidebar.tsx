import React, { useState, useEffect } from 'react';
import { notificationService } from '@/config/setup';
import type { Notification } from '@/models/Notification';

interface NotificationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationSidebar: React.FC<NotificationSidebarProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const loadNotifications = () => {
    setNotifications(notificationService.getNotifications());
  };

  useEffect(() => {
    loadNotifications();
    window.addEventListener('kiora_notification_updated', loadNotifications);
    return () => window.removeEventListener('kiora_notification_updated', loadNotifications);
  }, []);

  const handleMarkAsRead = (id: string) => {
    notificationService.markAsRead(id);
  };

  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead();
  };

  const handleClear = () => {
    notificationService.clearAll();
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end overflow-hidden">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-sm bg-white shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div>
            <h2 className="text-lg font-extrabold text-[#111827]">Notificaciones</h2>
            <p className="text-xs text-slate-400 font-medium">Bandeja de actividad reciente</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-b border-slate-100">
          <button onClick={handleMarkAllAsRead} className="text-[10px] font-bold text-blue-600 hover:underline uppercase tracking-wider">Marcar todo como leído</button>
          <button onClick={handleClear} className="text-[10px] font-bold text-red-500 hover:underline uppercase tracking-wider">Limpiar historial</button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 text-slate-400">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                <svg className="w-8 h-8 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              </div>
              <p className="font-bold text-slate-500">Todo al día</p>
              <p className="text-xs">No tienes notificaciones pendientes.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {notifications.map(n => (
                <div 
                  key={n.id} 
                  className={`p-6 transition-colors hover:bg-slate-50 relative ${!n.read ? 'bg-blue-50/30' : ''}`}
                  onClick={() => handleMarkAsRead(n.id)}
                >
                  {!n.read && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-blue-500 rounded-r" />}
                  <div className="flex gap-4">
                    <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      n.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                      n.type === 'error' ? 'bg-red-100 text-red-600' :
                      n.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {n.type === 'success' && <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>}
                      {n.type === 'error' && <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>}
                      {(n.type === 'warning' || n.type === 'info') && <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-bold ${!n.read ? 'text-[#111827]' : 'text-slate-600'}`}>{n.title}</p>
                        <span className="text-[10px] text-slate-400 font-medium">{formatDate(n.timestamp)}</span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2">{n.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">Kiora Management System</p>
        </div>
      </div>
    </div>
  );
};
