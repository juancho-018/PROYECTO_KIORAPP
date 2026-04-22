import React, { useRef } from 'react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface AdminSubNavProps {
  activeId: string;
  onItemClick: (id: string) => void;
  isAdmin?: boolean;
}

export const AdminSubNav: React.FC<AdminSubNavProps> = ({ activeId, onItemClick, isAdmin }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  const items: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Inicio',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      id: 'productos',
      label: 'Productos',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      id: 'inventario',
      label: 'Stock',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: 'pedidos',
      label: 'Pedidos',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
    },
    {
      id: 'ventas',
      label: 'Ventas',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  if (isAdmin) {
    items.push({
      id: 'usuarios',
      label: 'Usuarios',
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    });
  }

  items.push({
    id: 'ajustes',
    label: 'Ajustes',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      </svg>
    ),
  });

  return (
    <div ref={menuRef} className="fixed left-6 top-1/2 -translate-y-1/2 z-[100] flex flex-col items-center w-14 bg-[#2C1810]/95 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-white/10 py-10 rounded-[4rem] transition-all duration-300">
      
      {/* Nav Items */}
      <nav className="flex flex-col items-center gap-5 w-full">
        {items.map((item) => {
          const active = activeId === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onItemClick(item.id)}
              className={`group relative flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 ${
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
                <div className="absolute -left-1 w-1 h-5 rounded-full bg-[#ec131e] shadow-[0_0_10px_#ec131e]"></div>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};
