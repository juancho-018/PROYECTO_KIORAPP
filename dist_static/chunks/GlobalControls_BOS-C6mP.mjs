import { jsx, jsxs } from 'react/jsx-runtime';
import 'react';

function GlobalControls() {
  const isPanel = typeof window !== "undefined" && window.location.pathname.startsWith("/panel");
  return /* @__PURE__ */ jsx("div", { className: `fixed bottom-5 left-5 z-[9999] flex items-center gap-3 sm:bottom-6 sm:left-6 ${isPanel ? "hidden" : ""}`, children: /* @__PURE__ */ jsxs(
    "a",
    {
      href: "/ayuda",
      className: "flex items-center gap-2 rounded-xl border border-slate-200/90 bg-white/95 px-3.5 py-2.5 text-xs font-semibold text-slate-600 shadow-md shadow-slate-900/5 backdrop-blur-sm transition hover:border-[#ec131e]/30 hover:text-[#ec131e] no-underline",
      children: [
        /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", strokeWidth: 2, stroke: "currentColor", className: "w-4 h-4", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" }) }),
        "Centro de Ayuda"
      ]
    }
  ) });
}

export { GlobalControls as G };
