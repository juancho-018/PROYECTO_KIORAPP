import { useEffect } from 'react';

export default function GlobalControls() {
  useEffect(() => {
    const apiKey = import.meta.env.PUBLIC_WEGLOT_API_KEY?.trim();
    if (!apiKey) return;

    const style = document.createElement('style');
    style.innerHTML = `
      .weglot-container { /* Por defecto, abajo a la derecha */
        position: fixed !important;
        bottom: 1.5rem !important;
        right: 1.5rem !important;
        z-index: 9999 !important;
      }
      .wg-default, .wg-default .wg-li {
        background: rgba(255, 255, 255, 0.95) !important;
        backdrop-filter: blur(8px) !important;
        border: 1px solid rgba(226, 232, 240, 0.8) !important;
        border-radius: 0.5rem !important;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03) !important;
        color: #475569 !important;
        font-family: 'Inter', sans-serif !important;
        font-size: 0.80rem !important;
        font-weight: 600 !important;
        padding: 0.2rem 0.6rem !important;
        transition: all 0.2s ease !important;
      }
      .wg-default:hover, .wg-default.wg-open {
        border-color: #ec131e !important;
        color: #ec131e !important;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
        transform: translateY(-2px) !important;
      }
      .wg-default a { 
        color: inherit !important; 
        text-decoration: none !important;
      }
      .wg-default .wg-li {
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
      }
    `;
    document.head.appendChild(style);

    const script = document.createElement('script');
    script.src = 'https://cdn.weglot.com/weglot.min.js';
    script.async = true;
    script.onload = () => {
      window.Weglot?.initialize({ api_key: apiKey });
    };
    document.head.appendChild(script);
  }, []);

  return (
    <div className="fixed bottom-5 left-5 z-[9999] flex items-center gap-3 sm:bottom-6 sm:left-6">
      <a
        href="/ayuda"
        className="flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white/95 px-3.5 py-2.5 text-xs font-semibold text-slate-600 shadow-md shadow-slate-900/5 backdrop-blur-sm transition hover:border-[#ec131e]/30 hover:text-[#ec131e] no-underline"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
        </svg>
        Centro de Ayuda
      </a>
    </div>
  );
}
