import React, { useState } from 'react';
import type { User } from '@/models/User';

interface SecurityDrawerProps {
  isOpen: boolean;
  user: User | null;
  isResetting: boolean;
  onConfirm: (newPassword: string) => void;
  onClose: () => void;
}

export const SecurityDrawer: React.FC<SecurityDrawerProps> = ({
  isOpen,
  user,
  isResetting,
  onConfirm,
  onClose
}) => {
  const [newPassword, setNewPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) return;
    onConfirm(newPassword);
    setNewPassword(''); // Limpiar para la próxima vez
  };

  return (
    <div className={`fixed inset-0 z-[100] transition-all duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm" onClick={onClose}></div>
      <div className={`absolute top-0 right-0 h-full w-96 max-w-full bg-[#fafafc] shadow-2xl transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
            <h2 className="text-lg font-bold text-gray-800">Seguridad de Cuenta</h2>
            <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-50 rounded-full transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto">
            {user && (
                <div className="mb-8 p-4 bg-white border border-gray-100 rounded-2xl">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Usuario seleccionado</p>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-50 text-[#ec131e] flex items-center justify-center font-bold">
                            {user.nom_usu?.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-gray-900">{user.nom_usu}</p>
                            <p className="text-xs text-gray-400">{user.correo_usu}</p>
                        </div>
                    </div>
                </div>
            )}

            <form id="securityForm" onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Nueva Contraseña</label>
                    <input 
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        minLength={8}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#ec131e] focus:ring-4 focus:ring-red-50 transition-all bg-white text-[0.95rem]"
                        placeholder="Mínimo 8 caracteres"
                    />
                    <p className="text-[10px] text-gray-400">La nueva contraseña debe tener al menos 8 caracteres para ser aceptada.</p>
                </div>
            </form>
        </div>

        <div className="p-6 bg-white border-t border-gray-100 space-y-3">
            <button 
                form="securityForm"
                type="submit"
                disabled={isResetting || newPassword.length < 8}
                className="w-full bg-[#ec131e] text-white font-bold py-4 rounded-xl shadow-lg shadow-red-200 hover:bg-[#d01019] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {isResetting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Actualizar Contraseña'}
            </button>
            <button 
                type="button"
                onClick={onClose}
                className="w-full py-3 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
            >
                Cancelar
            </button>
        </div>
      </div>
    </div>
  );
};
