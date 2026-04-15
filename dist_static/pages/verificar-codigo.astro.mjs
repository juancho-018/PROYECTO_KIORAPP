import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_BrQ9irSI.mjs';
import 'piccolore';
import 'html-escaper';
import { jsxs, Fragment, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { a as alertService, L as Loading, b as authService } from '../chunks/cargando_eu6GBj-M.mjs';
import { G as GlobalControls } from '../chunks/GlobalControls_BOS-C6mP.mjs';
import { $ as $$Mainlayout } from '../chunks/mainlayout_CkP3HL3S.mjs';
export { renderers } from '../renderers.mjs';

function VerifyCodeForm() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const urlEmail = searchParams.get("email");
    if (urlEmail) {
      setEmail(urlEmail);
    } else {
      alertService.showError("Error", "Falta el correo electrónico para la verificación.");
    }
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !code) return;
    setIsLoading(true);
    try {
      await authService.verifyResetCode(email, code);
      window.location.href = `/reset-password?email=${encodeURIComponent(email)}&code=${encodeURIComponent(code)}`;
    } catch (error) {
      const err = error;
      alertService.showError("Error", err.message || "Error al verificar el código");
    } finally {
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      "form",
      {
        onSubmit: handleSubmit,
        className: "bg-white w-full max-w-105 p-8 rounded-xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)]",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-6 text-center", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-[#1e293b] mb-2", children: "Verificación de Código" }),
            /* @__PURE__ */ jsxs("p", { className: "text-[0.95rem] text-[#64748b]", children: [
              "Ingresa el código de 6 dígitos enviado a ",
              /* @__PURE__ */ jsx("strong", { children: email })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mb-7", children: [
            /* @__PURE__ */ jsx(
              "label",
              {
                htmlFor: "code",
                className: "block font-semibold text-[0.85rem] text-[#374151] mb-2",
                children: "Código de verificación"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "relative flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden transition-all duration-200 focus-within:border-[#9ca3af] focus-within:ring-[3px] focus-within:ring-gray-400/10", children: [
              /* @__PURE__ */ jsx("div", { className: "pl-3.5 pr-2 text-gray-400 flex items-center", children: /* @__PURE__ */ jsx("svg", { fill: "none", className: "w-5 h-5", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.8", d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }) }) }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "text",
                  id: "code",
                  className: "flex-1 border-none bg-transparent py-2.5 text-[0.95rem] text-[#334155] outline-none w-full placeholder-gray-400 text-center tracking-[0.5em] font-bold",
                  placeholder: "000000",
                  maxLength: 6,
                  value: code,
                  onChange: (e) => setCode(e.target.value.replace(/\D/g, "")),
                  required: true
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "submit",
              disabled: isLoading,
              className: "w-full bg-[#ec131e] hover:bg-[#d0111a] text-white border-none rounded-lg py-2.5 text-[1rem] font-semibold cursor-pointer transition-colors duration-200 shadow-[0_2px_4px_rgba(237,19,30,0.15)] disabled:opacity-70 disabled:cursor-not-allowed mb-4",
              children: isLoading ? "Verificando..." : "Verificar Código"
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "text-center", children: /* @__PURE__ */ jsxs("a", { href: "/recuperar-contrasena", className: "inline-flex items-center gap-1 text-[#64748b] hover:text-[#334155] font-medium text-[0.9rem] no-underline transition-colors", children: [
            /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10 19l-7-7m0 0l7-7m-7 7h18" }) }),
            "Volver a intentar"
          ] }) })
        ]
      }
    ),
    isLoading && /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(Loading, { message: "Verificando código..." }) })
  ] });
}

const $$VerificarCodigo = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "MainLayout", $$Mainlayout, { "title": "Verificar C\xF3digo - Kiora" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex flex-col items-center justify-center min-h-screen w-full relative z-10 px-4"> <!-- Abstract Background Detail --> <div class="absolute -top-50 -right-25 w-150 h-150 rounded-full bg-[radial-gradient(circle,rgba(237,27,36,0.06)_0%,rgba(250,250,252,0)_70%)] -z-10 pointer-events-none"></div> <!-- App Logo --> <img src="/img/logo-kiora-vectorizado.svg" alt="Kiora Logo" class="w-48 h-auto mt-4 mb-6 relative z-10 object-contain"> <p class="text-[0.95rem] text-[#64748b] m-0 mb-8 font-medium text-center max-w-md px-4">
Ingresa el código que hemos enviado a tu correo electrónico para validar tu identidad.
</p> ${renderComponent($$result2, "VerifyCodeForm", VerifyCodeForm, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/jcami/OneDrive/Desktop/sena/Kiora/PROYECTO_KIORAPP/src/components/auth/VerifyCodeForm", "client:component-export": "default" })} </div> ${renderComponent($$result2, "GlobalControls", GlobalControls, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/jcami/OneDrive/Desktop/sena/Kiora/PROYECTO_KIORAPP/src/components/ui/GlobalControls", "client:component-export": "default" })} ` })}`;
}, "C:/Users/jcami/OneDrive/Desktop/sena/Kiora/PROYECTO_KIORAPP/src/pages/verificar-codigo.astro", void 0);

const $$file = "C:/Users/jcami/OneDrive/Desktop/sena/Kiora/PROYECTO_KIORAPP/src/pages/verificar-codigo.astro";
const $$url = "/verificar-codigo";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$VerificarCodigo,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
