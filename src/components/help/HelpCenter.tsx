import { useState } from 'react';

export default function HelpCenter() {
  const [openIndex, setOpenIndex] = useState<number | null>(1); // Set one open by default as in screenshot
  const [searchTerm, setSearchTerm] = useState('');

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const topics = [
    { title: 'Gestión de Inventario', icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" /></svg>
    )},
    { title: 'Configuración de Kiosco', icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" /></svg>
    )},
    { title: 'Reportes y Analítica', icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" /><path d="M12 2.252A8.001 8.001 0 0117.748 8H12V2.252z" /></svg>
    )},
    { title: 'Usuarios y Permisos', icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" /></svg>
    )},
  ];

  const faqs = [
    { question: '¿Cómo restablecer un kiosco?', answer: 'Para restablecer un kiosco, dirígete a la configuración del mismo y selecciona la opción de reinicio forzado.' },
    { question: '¿Cómo añadir un nuevo producto?', answer: 'Para añadir un nuevo producto, dirígete a la pestaña \'Inventario\' en el menú principal, haz clic en el botón \'+\' ubicado en la esquina superior derecha y completa los campos obligatorios como nombre, precio y stock inicial.' },
    { question: '¿Por qué no se sincroniza mi inventario?', answer: 'Asegúrate de tener una conexión a internet estable y que los servicios de base de datos estén activos.' },
    { question: '¿Cómo cambiar los métodos de pago?', answer: 'Dirígete a la configuración de pagos en el panel administrativo para habilitar o deshabilitar métodos.' },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-24 relative">
      {/* Search Header */}
      <div className="mb-10 text-left pt-6">
        <h1 className="text-[26px] font-extrabold text-[#111827] tracking-tight mb-6">¿En qué podemos ayudarte?</h1>
        <div className="relative group">
          <input 
            type="text" 
            placeholder="Busca guías, tutoriales o FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#f3f4f6] border-none py-4 pl-12 pr-6 rounded-2xl text-[15px] focus:ring-4 focus:ring-red-50 focus:bg-white transition-all placeholder:text-gray-400 font-medium"
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#ec131e] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
      </div>

      {/* Popular Topics */}
      <section className="mb-12">
        <h2 className="text-[17px] font-bold text-[#111827] mb-6">Temas Populares</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {topics.map((topic, idx) => (
            <button 
              key={idx}
              className="flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-2xl hover:shadow-xl hover:border-red-50 transition-all text-left active:scale-[0.98] group"
            >
              <div className="w-12 h-12 bg-red-50 text-[#ec131e] rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#ec131e] group-hover:text-white transition-colors">
                {topic.icon}
              </div>
              <span className="font-bold text-[#111827] text-[15px] leading-tight">{topic.title}</span>
            </button>
          ))}
        </div>
      </section>

      {/* FAQs */}
      <section>
        <h2 className="text-[17px] font-bold text-[#111827] mb-6">Preguntas Frecuentes</h2>
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isActive = openIndex === idx;
            return (
              <div 
                key={idx} 
                className={`border transition-all duration-300 rounded-2xl overflow-hidden ${
                  isActive ? 'border-red-200 bg-red-50/10 shadow-lg' : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-5 text-left flex justify-between items-center group"
                >
                  <span className={`font-bold transition-colors text-[15px] ${isActive ? 'text-[#ec131e]' : 'text-[#374151]'}`}>
                    {faq.question}
                  </span>
                  <svg 
                    className={`w-5 h-5 transition-transform ${isActive ? 'rotate-180 text-[#ec131e]' : 'text-gray-400 group-hover:text-gray-600'}`} 
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div 
                  className={`px-6 text-[#6b7280] text-[14px] leading-relaxed transition-all duration-350 ease-in-out overflow-hidden ${
                    isActive ? 'pb-6 pt-0 max-h-[300px] opacity-100 visible' : 'max-h-0 opacity-0 invisible'
                  }`}
                >
                  {faq.answer}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <button className="fixed bottom-6 right-6 bg-[#ec131e] hover:bg-[#d01019] text-white px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-3 active:scale-95 transition-all z-50">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
        <span className="font-bold text-[14px]">Chat en vivo</span>
      </button>
    </div>
  );
}
