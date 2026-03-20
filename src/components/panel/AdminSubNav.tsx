import React from 'react';
import { isPanelTabAvailable } from './panelNav';

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface AdminSubNavProps {
  activeId: string;
  onItemClick: (id: string) => void;
}

export const AdminSubNav: React.FC<AdminSubNavProps> = ({ activeId, onItemClick }) => {
  const items: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      ),
    },
    {
      id: 'inventario',
      label: 'Inventario',
      icon: (
        <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      ),
    },
    {
      id: 'pedidos',
      label: 'Pedidos',
      icon: (
        <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      ),
    },
    {
      id: 'reportes',
      label: 'Reportes',
      icon: (
        <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      id: 'ajustes',
      label: 'Ajustes',
      icon: (
        <svg className="h-5 w-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="border-b border-slate-200/80 bg-white/90 backdrop-blur-sm">
      <nav
        className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-3 py-3 sm:px-6"
        aria-label="Secciones del panel"
      >
        <div className="mx-auto flex min-w-min items-center gap-1 rounded-2xl bg-slate-100/90 p-1 ring-1 ring-slate-200/60">
          {items.map((item) => {
            const available = isPanelTabAvailable(item.id);
            const active = activeId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onItemClick(item.id)}
                title={available ? item.label : `${item.label} — Próximamente`}
                aria-current={active ? 'page' : undefined}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-left font-medium transition-all sm:px-4 ${
                  active
                    ? 'bg-white text-[#ec131e] shadow-sm ring-1 ring-slate-200/80'
                    : 'text-slate-500 hover:bg-white/60 hover:text-slate-800'
                } ${!available && !active ? 'opacity-75' : ''}`}
              >
                <span className={active ? 'text-[#ec131e]' : 'text-slate-400'}>{item.icon}</span>
                <span className="whitespace-nowrap text-[13px] sm:text-sm">{item.label}</span>
                {!available && (
                  <span className="rounded-md bg-amber-100/90 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
                    Próx.
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
