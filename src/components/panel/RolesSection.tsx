import React from 'react';

const roles = [
  {
    title: 'Administrador',
    description: 'Configuración completa, usuarios, reportes e inventario según políticas del sistema.',
    icon: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
        <path
          fillRule="evenodd"
          d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
    ),
    accent: 'from-sky-500/15 to-sky-500/5',
    iconBg: 'bg-sky-500/15 text-sky-600',
    badge: 'Sin límite de cuentas',
  },
  {
    title: 'Operario',
    description: 'Cajas, comandas, ventas y consultas de inventario según permisos asignados.',
    icon: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
        <path
          fillRule="evenodd"
          d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z"
          clipRule="evenodd"
        />
        <path d="M9 11v6H4.5a2.5 2.5 0 010-5H9zm2 0h4.5a2.5 2.5 0 010 5H11v-6z" />
      </svg>
    ),
    accent: 'from-amber-500/15 to-amber-500/5',
    iconBg: 'bg-amber-500/15 text-amber-700',
    badge: null,
  },
  {
    title: 'Usuario',
    description: 'Consultas y funciones estándar sin permisos de administración crítica.',
    icon: (
      <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
      </svg>
    ),
    accent: 'from-emerald-500/15 to-emerald-500/5',
    iconBg: 'bg-emerald-500/15 text-emerald-700',
    badge: null,
  },
];

export const RolesSection: React.FC = () => {
  return (
    <section>
      <div className="mb-4 flex flex-col gap-1 px-0.5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Roles y permisos</p>
          <h2 className="text-lg font-bold tracking-tight text-slate-900">Referencia rápida</h2>
        </div>
        <span className="text-xs font-medium text-slate-400">Solo lectura · la asignación es en cada usuario</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {roles.map((role) => (
          <article
            key={role.title}
            className="group relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[var(--panel-shadow)] ring-1 ring-slate-900/[0.03] transition-shadow hover:shadow-md"
          >
            <div
              className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-90 ${role.accent}`}
              aria-hidden
            />
            <div className="relative flex flex-col gap-3">
              <div className="flex items-start justify-between gap-2">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${role.iconBg}`}>{role.icon}</div>
                {role.badge && (
                  <span className="rounded-full bg-slate-900/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                    {role.badge}
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-slate-900">{role.title}</h3>
              <p className="text-sm leading-relaxed text-slate-600">{role.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
