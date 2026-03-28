import React from 'react';

export function DashboardSection() {
  const stats = [
    { label: 'Ventas de Hoy', value: '$1,245,000', icon: 'money', color: 'text-emerald-500', bg: 'bg-emerald-50', iconSvg: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Pedidos Kiosco', value: '84', icon: 'clipboard', color: 'text-blue-500', bg: 'bg-blue-50', iconSvg: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { label: 'Upselling (IA)', value: '18%', icon: 'sparkles', color: 'text-purple-500', bg: 'bg-purple-50', growth: '+12%', iconSvg: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z' },
    { label: 'Stock Bajo', value: '2 Productos', icon: 'alert', color: 'text-red-500', bg: 'bg-red-50', iconSvg: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
  ];

  const trafficData = [
    { hour: '8am', height: '30%' },
    { hour: '10am', height: '45%' },
    { hour: '12pm', height: '80%', highlight: true },
    { hour: '2pm', height: '55%' },
    { hour: '4pm', height: '25%' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Resumen Header */}
      <header className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Resumen de Hoy</h2>
        <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600 ring-1 ring-emerald-200">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
          En línea
        </div>
      </header>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <article key={stat.label} className="group relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex items-start justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold ${stat.bg} ${stat.color} shadow-sm`}>
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={stat.iconSvg} />
                </svg>
              </div>
              {stat.growth && (
                <span className="text-xs font-bold text-emerald-500">{stat.growth}</span>
              )}
            </div>
            <div className="mt-4">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{stat.label}</p>
              <p className="mt-1 text-2xl font-black tracking-tight text-slate-900">{stat.value}</p>
            </div>
          </article>
        ))}
      </div>

      {/* Traffic Chart */}
      <section className="rounded-3xl border border-slate-200/60 bg-white p-6 shadow-sm">
        <div className="mb-8 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">Tráfico de Pedidos</h3>
          <select className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 outline-none ring-1 ring-slate-200">
            <option>Hoy</option>
            <option>Semana</option>
          </select>
        </div>
        <div className="flex h-48 items-end justify-between gap-2 px-4">
          {trafficData.map((bar) => (
            <div key={bar.hour} className="group flex flex-1 flex-col items-center gap-3">
              <div 
                className={`w-full max-w-[60px] rounded-t-lg transition-all duration-500 ease-out group-hover:opacity-80 ${bar.highlight ? 'bg-[#ec131e] shadow-lg shadow-[#ec131e]/20' : 'bg-[#ec131e]/20'}`}
                style={{ height: bar.height }}
              ></div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{bar.hour}</span>
            </div>
          ))}
        </div>
      </section>

      {/* AI Insights Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
           <svg className="h-5 w-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2l4.454.647a1 1 0 01.554 1.706l-3.222 3.141.76 4.437a1 1 0 01-1.45 1.054L11.25 15.1l-3.992 2.099a1 1 0 01-1.45-1.054l.76-4.437L3.346 9.553a1 1 0 01.554-1.706l4.454-.647 1.212-4.456A1 1 0 0111.25 2z" clipRule="evenodd" />
          </svg>
          <h3 className="text-lg font-bold text-slate-800">Kiora Insights (IA)</h3>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Pico Insight */}
          <div className="flex items-start gap-4 rounded-2xl bg-amber-50/50 p-6 ring-1 ring-amber-200/50">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-slate-900">Pico Detectado</h4>
              <p className="mt-1 text-sm leading-relaxed text-slate-600 font-medium">
                Alta demanda de "Merengón de Fresa" hoy. Sugerimos preparar <span className="text-[#ec131e] font-bold underline">15 unidades extra</span> para la tarde.
              </p>
            </div>
          </div>

          {/* Stock Insight */}
          <div className="flex items-start gap-4 rounded-2xl bg-red-50/50 p-6 ring-1 ring-red-200/50">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
               <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-900">Inventario Crítico</h4>
              <p className="mt-1 text-sm text-slate-600 font-medium">
                Quedan solo <span className="text-red-600 font-bold">5 Panelitas de Leche</span>. ¿Registrar entrada en inventario?
              </p>
              <button className="mt-4 w-full rounded-xl bg-red-100/80 py-2.5 text-xs font-bold uppercase tracking-wider text-red-700 transition-all hover:bg-red-200">
                Actualizar Stock
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
