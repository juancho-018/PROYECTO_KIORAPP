import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_BrQ9irSI.mjs';
import 'piccolore';
import 'html-escaper';
import { jsx, jsxs } from 'react/jsx-runtime';
import { useState, useMemo } from 'react';
import { G as GlobalControls } from '../chunks/GlobalControls_BOS-C6mP.mjs';
import { $ as $$Mainlayout } from '../chunks/mainlayout_CkP3HL3S.mjs';
export { renderers } from '../renderers.mjs';

const HELP_TOPICS = [
  {
    title: "Inicio de sesión y cuenta",
    icon: /* @__PURE__ */ jsx("svg", { className: "w-6 h-6", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z", clipRule: "evenodd" }) })
  },
  {
    title: "Usuarios y roles (administrador)",
    icon: /* @__PURE__ */ jsx("svg", { className: "w-6 h-6", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx("path", { d: "M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" }) })
  },
  {
    title: "Panel y sesión",
    icon: /* @__PURE__ */ jsx("svg", { className: "w-6 h-6", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx("path", { d: "M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" }) })
  },
  {
    title: "Próximos módulos (roadmap)",
    icon: /* @__PURE__ */ jsx("svg", { className: "w-6 h-6", fill: "currentColor", viewBox: "0 0 20 20", children: /* @__PURE__ */ jsx("path", { d: "M10 3.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM2 10a8 8 0 1116 0 8 8 0 01-16 0z" }) })
  }
];
const HELP_FAQS = [
  {
    question: "¿Cómo inicio sesión en Kiora?",
    answer: "Usa el correo y la contraseña que te asignó un administrador. Si no tienes cuenta, pide a un administrador que cree un usuario con tu correo."
  },
  {
    question: "¿Qué hago si olvidé mi contraseña?",
    answer: "En la pantalla de inicio de sesión elige «¿Olvidaste tu contraseña?», ingresa tu correo y revisa tu bandeja (y spam) para el enlace de restablecimiento."
  },
  {
    question: "¿Qué diferencia hay entre Admin y Vendedor?",
    answer: "Los Administradores tienen acceso total a la gestión de usuarios, auditoría de salud del sistema y facturación histórica. Los Vendedores solo pueden gestionar el stock y realizar pedidos."
  },
  {
    question: "¿Cómo descargo una factura?",
    answer: "En la sección de «Pedidos», ve a la pestaña de «Facturación Histórica» y haz clic en el botón «Descargar PDF» de la factura deseada."
  },
  {
    question: "¿Para qué sirve el monitor de Salud?",
    answer: "Permite verificar en tiempo real si todos los microservicios (Usuarios, Productos, Inventario, Órdenes) están en línea y respondiendo correctamente."
  }
];

function HelpCenter() {
  const [openIndex, setOpenIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  const filteredFaqIndices = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return HELP_FAQS.map((_, i) => i);
    return HELP_FAQS.map((faq, i) => ({ faq, i })).filter(
      ({ faq }) => faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q)
    ).map(({ i }) => i);
  }, [searchTerm]);
  return /* @__PURE__ */ jsxs("div", { className: "w-full max-w-3xl mx-auto px-4 pb-24 relative", children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => {
          if (window.history.length > 1) {
            window.history.back();
          } else {
            window.location.href = "/login";
          }
        },
        className: "mt-6 flex items-center gap-2 text-gray-400 hover:text-[#ec131e] transition-all group border-none bg-transparent cursor-pointer",
        children: [
          /* @__PURE__ */ jsx(
            "svg",
            {
              className: "w-5 h-5 group-hover:-translate-x-1 transition-transform",
              fill: "none",
              stroke: "currentColor",
              viewBox: "0 0 24 24",
              children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M10 19l-7-7m0 0l7-7m-7 7h18" })
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "text-[12px] font-bold uppercase tracking-widest", children: "Volver" })
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "mb-10 text-left pt-4", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-[26px] font-extrabold text-[#111827] tracking-tight mb-6", children: "¿En qué podemos ayudarte?" }),
      /* @__PURE__ */ jsxs("div", { className: "relative group", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            placeholder: "Buscar en preguntas frecuentes…",
            value: searchTerm,
            onChange: (e) => setSearchTerm(e.target.value),
            className: "w-full bg-[#f3f4f6] border-none py-4 pl-12 pr-6 rounded-2xl text-[15px] focus:ring-4 focus:ring-red-50 focus:bg-white transition-all placeholder:text-gray-400 font-medium"
          }
        ),
        /* @__PURE__ */ jsx(
          "svg",
          {
            className: "w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#ec131e] transition-colors",
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24",
            children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" })
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "mb-12", children: [
      /* @__PURE__ */ jsx("h2", { className: "text-[17px] font-bold text-[#111827] mb-6", children: "Temas relacionados con esta versión" }),
      /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: HELP_TOPICS.map((topic, idx) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "flex items-center gap-4 p-5 bg-white border border-gray-100 rounded-2xl text-left",
          children: [
            /* @__PURE__ */ jsx("div", { className: "w-12 h-12 bg-red-50 text-[#ec131e] rounded-xl flex items-center justify-center shrink-0", children: topic.icon }),
            /* @__PURE__ */ jsx("span", { className: "font-bold text-[#111827] text-[15px] leading-tight", children: topic.title })
          ]
        },
        idx
      )) })
    ] }),
    /* @__PURE__ */ jsxs("section", { children: [
      /* @__PURE__ */ jsx("h2", { className: "text-[17px] font-bold text-[#111827] mb-6", children: "Preguntas frecuentes" }),
      filteredFaqIndices.length === 0 ? /* @__PURE__ */ jsxs("p", { className: "text-gray-500 text-[15px]", children: [
        "No hay resultados para «",
        searchTerm,
        "». Prueba otras palabras."
      ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: filteredFaqIndices.map((faqIndex) => {
        const faq = HELP_FAQS[faqIndex];
        const isActive = openIndex === faqIndex;
        return /* @__PURE__ */ jsxs(
          "div",
          {
            className: `border transition-all duration-300 rounded-2xl overflow-hidden ${isActive ? "border-red-200 bg-red-50/10 shadow-lg" : "border-gray-100 bg-white hover:border-gray-200"}`,
            children: [
              /* @__PURE__ */ jsxs(
                "button",
                {
                  onClick: () => toggleFaq(faqIndex),
                  className: "w-full px-6 py-5 text-left flex justify-between items-center group",
                  children: [
                    /* @__PURE__ */ jsx(
                      "span",
                      {
                        className: `font-bold transition-colors text-[15px] ${isActive ? "text-[#ec131e]" : "text-[#374151]"}`,
                        children: faq.question
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "svg",
                      {
                        className: `w-5 h-5 transition-transform ${isActive ? "rotate-180 text-[#ec131e]" : "text-gray-400 group-hover:text-gray-600"}`,
                        fill: "none",
                        viewBox: "0 0 24 24",
                        stroke: "currentColor",
                        children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M19 9l-7 7-7-7" })
                      }
                    )
                  ]
                }
              ),
              /* @__PURE__ */ jsx(
                "div",
                {
                  className: `px-6 text-[#6b7280] text-[14px] leading-relaxed transition-all duration-350 ease-in-out overflow-hidden ${isActive ? "pb-6 pt-0 max-h-[320px] opacity-100 visible" : "max-h-0 opacity-0 invisible"}`,
                  children: faq.answer
                }
              )
            ]
          },
          faqIndex
        );
      }) })
    ] }),
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        className: "fixed bottom-6 right-6 bg-[#ec131e] hover:bg-[#d01019] text-white px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-3 active:scale-95 transition-all z-50",
        children: [
          /* @__PURE__ */ jsx("svg", { className: "w-5 h-5", fill: "none", stroke: "currentColor", viewBox: "0 0 24 24", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "2", d: "M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" }) }),
          /* @__PURE__ */ jsx("span", { className: "font-bold text-[14px]", children: "Chat en vivo" })
        ]
      }
    )
  ] });
}

const $$Ayuda = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "MainLayout", $$Mainlayout, { "title": "Centro de Ayuda - Kiora" }, { "default": ($$result2) => renderTemplate`  ${maybeRenderHead()}<div class="absolute -top-50 -right-25 w-150 h-150 rounded-full bg-[radial-gradient(circle,rgba(237,27,36,0.06)_0%,rgba(250,250,252,0)_70%)] -z-10 pointer-events-none"></div>  <img src="/img/logo-kiora-vectorizado.svg" alt="Kiora Logo" class="w-48 h-auto mt-4 mb-6 relative z-10 object-contain"> ${renderComponent($$result2, "HelpCenter", HelpCenter, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/help/HelpCenter", "client:component-export": "default" })} ${renderComponent($$result2, "GlobalControls", GlobalControls, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/ui/GlobalControls", "client:component-export": "default" })} ` })}`;
}, "C:/Users/jcami/OneDrive/Desktop/sena/Kiora/PROYECTO_KIORAPP/src/pages/ayuda.astro", void 0);

const $$file = "C:/Users/jcami/OneDrive/Desktop/sena/Kiora/PROYECTO_KIORAPP/src/pages/ayuda.astro";
const $$url = "/ayuda";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Ayuda,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
