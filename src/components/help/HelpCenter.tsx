import { useState, useMemo } from 'react';
import { HELP_FAQS, HELP_TOPICS } from './helpContent';
import { RolesSection } from '../panel/RolesSection';
import { authService } from '@/config/setup';

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
      window.location.href = '/login';
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
<<<<<<< HEAD
      {isStandalone && (
        <button
          onClick={handleBack}
          className="mb-6 flex items-center gap-2 text-slate-400 hover:text-[#ec131e] transition-all group font-bold text-xs uppercase tracking-widest pt-4"
        >
          <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver
        </button>
      )}
=======
      {!hideBackButton && (
        <button
          onClick={() => {
            if (window.history.length > 1) {
              window.history.back();
            } else {
              window.location.href = '/login';
            }
          }}
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

>>>>>>> origin/develop
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
        <RolesSection />
      </section>

    </div>
  );
}
