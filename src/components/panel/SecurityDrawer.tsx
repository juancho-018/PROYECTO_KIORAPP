import React, { useState } from 'react';

interface SecurityDrawerProps {
  isOpen: boolean;
  userName: string;
  isProcessing: boolean;
  onConfirm: (password: string) => void;
  onClose: () => void;
}

export const SecurityDrawer: React.FC<SecurityDrawerProps> = ({
  isOpen,
  userName,
  isProcessing,
  onConfirm,
  onClose
}) => {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) return;
    onConfirm(password);
  };

  return (
    <div className={`fixed inset-0 z-99999 transition-all duration-300 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm" onClick={onClose}></div>
      <div className={`absolute top-0 right-0 h-full w-100 max-w-[calc(100vw-1rem)] bg-[#fafafc] shadow-2xl transition-transform duration-300 transform ${isOpen ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white">
          <button onClick={onClose} className="p-2 -ml-2 text-gray-400 hover:bg-gray-50 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
          </button>
          <h2 className="text-[15px] font-bold text-gray-800">Seguridad de la Cuenta</h2>
          <div className="w-9" />
        </div>

        <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8">
           <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-red-50 text-[#ec131e] rounded-2xl flex items-center justify-center shadow-sm">
                 <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">Cambiar Contraseña</h3>
                <p className="text-sm text-gray-500 mt-1">Estás forzando un cambio de clave para:</p>
                <div className="mt-2 text-[#ec131e] font-semibold bg-red-50 px-4 py-1.5 rounded-full text-sm inline-block">{userName}</div>
              </div>
           </div>

          <form onSubmit={handleSubmit} id="securityForm" className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-gray-600 uppercase tracking-wider">Nueva Contraseña Temporal</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-300" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                </div>
                <input 
                  type="text" 
                  required
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-3.5 rounded-xl border border-gray-200 focus:outline-none focus:border-[#ec131e] focus:ring-4 focus:ring-red-50 transition-all text-base bg-white placeholder:text-gray-300 font-medium" 
                  placeholder="Mínimo 6 caracteres" 
                  minLength={6}
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1 italic">El usuario recibirá esta clave directamente de tu parte.</p>
            </div>

            <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl flex gap-3">
               <svg className="w-5 h-5 text-orange-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
               <p className="text-[12px] text-orange-700 leading-relaxed font-medium">Esta acción aplicará de inmediato. El usuario ya no podrá entrar con su clave antigua.</p>
            </div>
          </form>
        </div>

        <div className="p-6 bg-white border-t border-gray-100 flex flex-col gap-3">
          <button 
             form="securityForm" 
             type="submit" 
             disabled={isProcessing || password.length < 6}
             className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                <span>Confirmar Nueva Clave</span>
              </>
            )}
          </button>
          <button 
             type="button" 
             disabled={isProcessing}
             onClick={onClose} 
             className="w-full bg-white hover:bg-gray-50 text-gray-500 font-bold py-3.5 rounded-xl border border-gray-100 transition-all text-sm"
          >
            Ahora No
          </button>
        </div>
      </div>
    </div>
  );
};
