import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../../config/i18n';
import LanguageSelector from '../ui/LanguageSelector';

export default function HelpCenter() {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqs = [
    { question: t('help.q1'), answer: t('help.a1') },
    { question: t('help.q2'), answer: t('help.a2') },
    { question: t('help.q3'), answer: t('help.a3') },
  ];

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Botón Flotante para cambiar de idioma global */}
      <div className="fixed bottom-6 left-6 z-50">
        <LanguageSelector />
      </div>

      <div className="bg-white w-full max-w-2xl p-8 rounded-xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-[#1e293b]">{t('help.title')}</h2>
          <p className="text-[#64748b] mt-2">{t('help.subtitle')}</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-200"
            >
              <button
                type="button"
                className="w-full px-5 py-4 text-left font-semibold text-[#334155] bg-gray-50 hover:bg-gray-100 flex justify-between items-center transition-colors"
                onClick={() => toggleFaq(idx)}
              >
                {faq.question}
                <svg 
                  className={`w-5 h-5 transform transition-transform text-gray-500 ${openIndex === idx ? 'rotate-180 text-[#ec131e]' : ''}`} 
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div 
                className={`px-5 text-[#475569] bg-white transition-all duration-300 ease-in-out overflow-hidden ${
                  openIndex === idx ? 'py-4 max-h-40 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                {faq.answer}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center border-t border-gray-100 pt-6">
          <a
            href="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#ec131e] hover:bg-[#d0111a] text-white rounded-lg font-semibold transition-colors shadow-sm no-underline"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            {t('help.back')}
          </a>
        </div>

      </div>
    </div>
  );
}
