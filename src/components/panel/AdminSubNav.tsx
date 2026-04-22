import React from 'react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface AdminSubNavProps {
  activeId: string;
  onItemClick: (id: string) => void;
}

<<<<<<< Updated upstream
export const AdminSubNav: React.FC<AdminSubNavProps> = ({ activeId, onItemClick }) => {
=======
export const AdminSubNav: React.FC<AdminSubNavProps> = ({ activeId, onItemClick, isAdmin }) => {
  const menuRef = useRef<HTMLDivElement>(null);

>>>>>>> Stashed changes
  const items: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Inicio',
      icon: (
<<<<<<< Updated upstream
<<<<<<< Updated upstream
        <svg className="h-6 w-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
=======
=======
>>>>>>> Stashed changes
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: 'productos',
      label: 'Productos',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
        </svg>
      ),
    },
    {
      id: 'inventario',
      label: 'Stock',
      icon: (
<<<<<<< Updated upstream
<<<<<<< Updated upstream
        <svg className="h-6 w-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
=======
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
>>>>>>> Stashed changes
=======
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
>>>>>>> Stashed changes
        </svg>
      ),
    },
    {
      id: 'pedidos',
      label: 'Pedidos',
      icon: (
<<<<<<< Updated upstream
<<<<<<< Updated upstream
        <svg className="h-6 w-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      id: 'usuarios',
      label: 'Usuarios',
      icon: (
        <svg className="h-6 w-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
    },
    {
      id: 'ajustes',
      label: 'Ajustes',
      icon: (
        <svg className="h-6 w-6 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
=======
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
>>>>>>> Stashed changes
=======
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
>>>>>>> Stashed changes
        </svg>
      ),
    },
  ];

<<<<<<< Updated upstream
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <nav
        className="flex items-center gap-1 rounded-2xl bg-[#3E2723]/90 p-1.5 shadow-2xl backdrop-blur-md ring-1 ring-white/10"
        aria-label="Secciones del panel"
      >
=======
  if (isAdmin) {
    items.push({
      id: 'usuarios',
      label: 'Usuarios',
      icon: (
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    });
  }

  items.push({
    id: 'ajustes',
    label: 'Ajustes',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      </svg>
    ),
  });

  return (
    <div ref={menuRef} className="fixed left-0 top-0 bottom-0 z-[100] flex flex-col items-center w-24 bg-[#2C1810] shadow-2xl border-r border-white/5 py-8 group transition-all duration-300 hover:w-28">
      {/* Logo */}
      <div className="mb-12">
        <img src="/img/logo-kiora-vectorizado-blanco.png" alt="Kiora" className="w-12 h-auto" />
      </div>

      {/* Nav Items */}
      <nav className="flex flex-col items-center gap-6 w-full">
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
        {items.map((item) => {
          const active = activeId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onItemClick(item.id)}
<<<<<<< Updated upstream
<<<<<<< Updated upstream
              title={`Próximamente`}
              aria-current={active ? 'page' : undefined}
              className={`group flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-left font-medium transition-all ${
                active
                  ? 'bg-white text-[#ec131e] shadow-[0_8px_30px_rgb(0,0,0,0.12)] scale-105 ring-1 ring-white/20'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <span className={`transition-all duration-300 ${active ? 'text-[#ec131e] scale-110' : 'text-white/40 group-hover:text-white/70'}`}>
                {item.icon}
              </span>
              <span className={`hidden whitespace-nowrap text-sm sm:block ${active ? 'font-bold' : ''}`}>{item.label}</span>
=======
=======
>>>>>>> Stashed changes
              className={`group relative flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 ${
                active 
                  ? 'bg-white/10 text-white shadow-xl ring-1 ring-white/20' 
                  : 'text-white/40 hover:bg-white/5 hover:text-white'
              }`}
            >
              {item.icon}
              
              {/* Tooltip label */}
              <div className="absolute left-full ml-4 whitespace-nowrap rounded-lg bg-[#2C1810] px-3 py-2 text-[10px] font-black uppercase tracking-widest text-white opacity-0 transition-all group-hover:opacity-100 pointer-events-none ring-1 ring-white/10 shadow-2xl translate-x-[-10px] group-hover:translate-x-0">
                {item.label}
              </div>

              {/* Active Indicator */}
              {active && (
                <div className="absolute -left-1 w-1.5 h-6 rounded-full bg-[#ec131e] shadow-[0_0_15px_#ec131e]"></div>
              )}
<<<<<<< Updated upstream
>>>>>>> Stashed changes
=======
>>>>>>> Stashed changes
            </button>
          );
        })}
      </nav>
<<<<<<< Updated upstream
=======

      {/* Bottom info */}
      <div className="mt-auto pt-8 border-t border-white/5 w-full flex flex-col items-center gap-6">
         <div className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20 rotate-90 whitespace-nowrap">
           Kiora System
         </div>
         <div className="flex flex-col gap-1.5">
           {[...Array(6)].map((_, i) => (
             <div key={i} className="w-1 h-1 rounded-full bg-white/10" />
           ))}
         </div>
      </div>
>>>>>>> Stashed changes
    </div>
  );
};
