import React from 'react';

export const RolesSection: React.FC = () => {
  return (
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
  );
};
