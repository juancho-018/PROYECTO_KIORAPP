import { useState, useMemo } from 'react';
import { HELP_FAQS, HELP_TOPICS } from './helpContent';
import { RolesSection } from '../panel/RolesSection';
import { authService } from '@/config/setup';
import { IncidentForm } from './IncidentForm';

interface HelpCenterProps {
  hideBackButton?: boolean;
}

export default function HelpCenter({ hideBackButton = false }: HelpCenterProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchTerm, setSearchTerm] = useState('');

  const isStandalone = typeof window !== 'undefined' && window.location.pathname === '/ayuda';

  const handleBack = () => {
    if (authService.isAuthenticated()) {
      window.location.href = '/panel';
    } else {
      window.location.href = '/login/';
    }
  };

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const filteredFaqIndices = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return (Array.isArray(HELP_FAQS) ? HELP_FAQS : []).map((unused, i) => i);
    return (Array.isArray(HELP_FAQS) ? HELP_FAQS : []).map((faq, i) => ({ faq, i }))
      .filter(
        ({ faq }) =>
          faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q)
      )
      .map(({ i }) => i);
  }, [searchTerm]);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-24 relative">
      {!hideBackButton && (
        <button
          onClick={handleBack}
          className="mt-6 flex items-center gap-2 text-gray-400 hover:text-[#ec131e] transition-all group border-none bg-transparent cursor-pointer"
        >
          <svg
            className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-[12px] font-bold uppercase tracking-widest">Volver</span>
        </button>
      )}
      <div className="mb-10 text-left pt-4">
        <h1 className="text-[26px] font-extrabold text-[#111827] tracking-tight mb-6">¿En qué podemos ayudarte?</h1>
        <div className="relative group">
          <input
            type="text"
            placeholder="Buscar en preguntas frecuentes…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#f3f4f6] border-none py-4 pl-12 pr-6 rounded-2xl text-[15px] focus:ring-4 focus:ring-red-50 focus:bg-white transition-all placeholder:text-gray-400 font-medium"
          />
          <svg
            className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#ec131e] transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <section className="mb-12">
        <h2 className="text-[17px] font-bold text-[#111827] mb-6">Temas relacionados con esta versión</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {HELP_TOPICS.map((topic, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-2xl text-left"
            >
              <div className="w-12 h-12 bg-red-50 text-[#ec131e] rounded-xl flex items-center justify-center shrink-0">
                {topic.icon}
              </div>
              <span className="font-bold text-[#111827] text-[15px] leading-tight">{topic.title}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-[17px] font-bold text-[#111827] mb-6">Preguntas frecuentes</h2>
        {filteredFaqIndices.length === 0 ? (
          <p className="text-gray-500 text-[15px]">No hay resultados para «{searchTerm}». Prueba otras palabras.</p>
        ) : (
          <div className="space-y-3">
            {filteredFaqIndices.map((faqIndex) => {
              const faq = HELP_FAQS[faqIndex];
              const isActive = openIndex === faqIndex;
              return (
                <div
                  key={faqIndex}
                  className={`border transition-all duration-300 rounded-2xl overflow-hidden ${
                    isActive ? 'border-red-200 bg-red-50/10 shadow-lg' : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(faqIndex)}
                    className="w-full px-6 py-5 text-left flex justify-between items-center group"
                  >
                    <span
                      className={`font-bold transition-colors text-[15px] ${isActive ? 'text-[#ec131e]' : 'text-[#374151]'}`}
                    >
                      {faq.question}
                    </span>
                    <svg
                      className={`w-5 h-5 transition-transform ${isActive ? 'rotate-180 text-[#ec131e]' : 'text-gray-400 group-hover:text-gray-600'}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div
                    className={`px-6 text-[#6b7280] text-[14px] leading-relaxed transition-all duration-350 ease-in-out overflow-hidden ${
                      isActive ? 'pb-6 pt-0 max-h-80 opacity-100 visible' : 'max-h-0 opacity-0 invisible'
                    }`}
                  >
                    {faq.answer}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-16 pt-12 border-t border-slate-100">
        <div className="mb-8">
          <h2 className="text-[17px] font-bold text-[#111827] mb-2">Guía de Roles & Permisos</h2>
          <p className="text-sm text-slate-500">Consulta los niveles de acceso disponibles en la plataforma Kiora.</p>
        </div>
        <RolesSection />
      </section>

      <section className="mt-16 pt-12 border-t border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-[17px] font-bold text-[#111827] mb-4">¿Aún necesitas ayuda?</h2>
            <p className="text-sm text-slate-500 mb-6">Si no encontraste la respuesta que buscabas, puedes enviarnos un mensaje directo.</p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#ec131e] shadow-sm">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Email Soporte</p>
                  <p className="text-sm font-bold text-slate-900">soporte@kiora.app</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.445 0 .01 5.437.01 12.045c0 2.112.553 4.174 1.604 6.01L0 24l6.117-1.605a11.803 11.803 0 005.925 1.586h.005c6.605 0 12.041-5.438 12.041-12.045a11.808 11.808 0 00-3.517-8.417" /></svg>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">WhatsApp Business</p>
                  <p className="text-sm font-bold text-slate-900">+57 300 000 0000</p>
                </div>
              </div>
            </div>
          </div>
          
          <IncidentForm />
        </div>
      </section>

    </div>
  );
}
