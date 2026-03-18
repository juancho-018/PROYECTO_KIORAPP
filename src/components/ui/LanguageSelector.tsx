import { useTranslation } from 'react-i18next';

export default function LanguageSelector() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
  };

  return (
    <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-lg border border-gray-200">
      <button 
        type="button"
        onClick={() => handleLanguageChange('es')} 
        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all duration-200 ${i18n.language === 'es' ? 'bg-white text-[#ec131e] shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700 bg-transparent border border-transparent'}`}
      >
        ES
      </button>
      <button 
        type="button"
        onClick={() => handleLanguageChange('en')} 
        className={`px-3 py-1 text-xs font-semibold rounded-md transition-all duration-200 ${i18n.language === 'en' ? 'bg-white text-[#ec131e] shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700 bg-transparent border border-transparent'}`}
      >
        EN
      </button>
    </div>
  );
}
