import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_BrQ9irSI.mjs';
import 'piccolore';
import 'html-escaper';
import { jsxs, jsx } from 'react/jsx-runtime';
import { G as GlobalControls } from '../chunks/GlobalControls_BOS-C6mP.mjs';
import { $ as $$Mainlayout } from '../chunks/mainlayout_CkP3HL3S.mjs';
export { renderers } from '../renderers.mjs';

function EmailSentMessage() {
  return /* @__PURE__ */ jsxs("div", { className: "bg-white w-full max-w-105 p-10 rounded-xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)] text-center", children: [
    /* @__PURE__ */ jsx("div", { className: "flex justify-center mb-6", children: /* @__PURE__ */ jsx("svg", { className: "w-16 h-16 text-[#ec131e]", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 1.5, d: "M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" }) }) }),
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-[#1e293b] mb-4", children: "¡Enlace Enviado!" }),
    /* @__PURE__ */ jsx("p", { className: "text-[#64748b] mb-8 leading-relaxed", children: "Revisa tu bandeja de entrada o la carpeta de spam. Te hemos enviado un enlace para que recuperar tu contraseña." }),
    /* @__PURE__ */ jsxs(
      "a",
      {
        href: "/login",
        className: "inline-flex items-center gap-2 px-5 py-2.5 bg-[#ec131e] hover:bg-[#d0111a] text-white rounded-lg font-semibold transition-colors shadow-sm no-underline",
        children: [
          /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10 19l-7-7m0 0l7-7m-7 7h18" }) }),
          "Volver a Iniciar Sesión"
        ]
      }
    )
  ] });
}

const $$CorreoEnviado = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "MainLayout", $$Mainlayout, { "title": "Correo Enviado - Kiora" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex flex-col items-center justify-center min-h-screen w-full relative z-10 px-4"> <!-- Abstract Background Detail --> <div class="absolute -top-50 -right-25 w-150 h-150 rounded-full bg-[radial-gradient(circle,rgba(237,27,36,0.06)_0%,rgba(250,250,252,0)_70%)] -z-10 pointer-events-none"></div> <!-- App Logo --> <img src="/img/logo-kiora-vectorizado.svg" alt="Kiora Logo" class="w-48 h-auto mt-4 mb-10 relative z-10 object-contain"> ${renderComponent($$result2, "EmailSentMessage", EmailSentMessage, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/jcami/OneDrive/Desktop/sena/Kiora/PROYECTO_KIORAPP/src/components/auth/EmailSentMessage", "client:component-export": "default" })} </div> ${renderComponent($$result2, "GlobalControls", GlobalControls, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/jcami/OneDrive/Desktop/sena/Kiora/PROYECTO_KIORAPP/src/components/ui/GlobalControls", "client:component-export": "default" })} ` })}`;
}, "C:/Users/jcami/OneDrive/Desktop/sena/Kiora/PROYECTO_KIORAPP/src/pages/correo-enviado.astro", void 0);

const $$file = "C:/Users/jcami/OneDrive/Desktop/sena/Kiora/PROYECTO_KIORAPP/src/pages/correo-enviado.astro";
const $$url = "/correo-enviado";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$CorreoEnviado,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
