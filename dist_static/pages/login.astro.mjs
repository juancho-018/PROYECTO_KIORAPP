import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_BrQ9irSI.mjs';
import 'piccolore';
import 'html-escaper';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState } from 'react';
import { L as Loading, a as alertService, b as authService } from '../chunks/cargando_eu6GBj-M.mjs';
import { G as GlobalControls } from '../chunks/GlobalControls_BOS-C6mP.mjs';
import { $ as $$Mainlayout } from '../chunks/mainlayout_CkP3HL3S.mjs';
export { renderers } from '../renderers.mjs';

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alertService.showError("Campos incompletos", "Por favor, ingresa tu correo y contraseña.");
      return;
    }
    setIsLoading(true);
    try {
      await authService.login({ correo_usu: email, password });
      window.location.href = "/panel";
    } catch (error) {
      const err = error;
      const errorMsg = err.message || "Error al iniciar sesión";
      if (errorMsg.includes("bloqueada")) {
        alertService.showError("Cuenta bloqueada", errorMsg);
      } else {
        alertService.showToast("warning", errorMsg, 4e3);
      }
      setIsLoading(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "w-full flex flex-col items-center", children: [
    /* @__PURE__ */ jsx("p", { className: "text-[0.95rem] text-[#64748b] m-0 mb-8 font-medium", children: "Bienvenido de nuevo. Por favor, ingresa tus datos." }),
    /* @__PURE__ */ jsxs(
      "form",
      {
        onSubmit: handleSubmit,
        className: "bg-white w-full max-w-105 p-8 rounded-xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)]",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-5", children: [
            /* @__PURE__ */ jsx(
              "label",
              {
                htmlFor: "email",
                className: "block font-semibold text-[0.85rem] text-[#374151] mb-2",
                children: "Correo electrónico"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "relative flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden transition-all duration-200 focus-within:border-[#9ca3af] focus-within:ring-[3px] focus-within:ring-gray-400/10", children: [
              /* @__PURE__ */ jsx("div", { className: "pl-3.5 pr-2 text-gray-400 flex items-center", children: /* @__PURE__ */ jsx("svg", { fill: "none", className: "w-5 h-5", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.8", d: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" }) }) }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "email",
                  id: "email",
                  className: "flex-1 border-none bg-transparent py-2.5 text-[0.95rem] text-[#334155] outline-none w-full placeholder-gray-400",
                  placeholder: "kiora@gmail.com",
                  value: email,
                  onChange: (e) => setEmail(e.target.value),
                  required: true
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mb-7", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-2", children: [
              /* @__PURE__ */ jsx(
                "label",
                {
                  htmlFor: "password",
                  className: "block font-semibold text-[0.85rem] text-[#374151]",
                  children: "Contraseña"
                }
              ),
              /* @__PURE__ */ jsx("a", { href: "/recuperar-contrasena", className: "text-[#ec131e] font-semibold text-[0.8rem] no-underline hover:underline", children: "¿Olvidaste tu contraseña?" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "relative flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden transition-all duration-200 focus-within:border-[#9ca3af] focus-within:ring-[3px] focus-within:ring-gray-400/10", children: [
              /* @__PURE__ */ jsx("div", { className: "pl-3.5 pr-2 text-gray-400 flex items-center", children: /* @__PURE__ */ jsx("svg", { fill: "none", className: "w-5 h-5", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.8", d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" }) }) }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "password",
                  id: "password",
                  className: "flex-1 border-none bg-transparent py-2.5 text-[0.95rem] text-[#334155] outline-none w-full placeholder-gray-400",
                  placeholder: "Escribe tu contraseña",
                  value: password,
                  onChange: (e) => setPassword(e.target.value),
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
              className: "w-full bg-[#ec131e] hover:bg-[#d0111a] text-white border-none rounded-lg py-2.5 text-[1rem] font-semibold cursor-pointer transition-colors duration-200 shadow-[0_2px_4px_rgba(237,19,30,0.15)] disabled:opacity-70 disabled:cursor-not-allowed",
              children: isLoading ? "Iniciando sesión..." : "Iniciar sesión"
            }
          )
        ]
      }
    ),
    /* @__PURE__ */ jsx("div", { className: "mt-8 text-center bg-transparent border-none shadow-none flex flex-col items-center", children: /* @__PURE__ */ jsxs("p", { className: "text-[0.9rem] font-medium text-gray-500", children: [
      "¿Necesitas contactarte con nosotros?",
      /* @__PURE__ */ jsx("span", { className: "text-[#ec131e] font-bold", children: " KiosKiora@gmail.com" })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "mt-6 w-full px-[10%] sm:px-[15%] text-left", children: /* @__PURE__ */ jsx("span", { className: "text-[#797676] text-[0.85rem] font-medium tracking-wide", children: "Kiora | Sistema para Kioskos" }) }),
    isLoading && /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(Loading, { message: "Iniciando sesión..." }) })
  ] });
}

const $$Login = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "MainLayout", $$Mainlayout, { "title": "Iniciar Sesi\xF3n - Kiora" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex flex-col items-center justify-center min-h-screen w-full relative z-10 px-4"> <!-- Abstract Background Detail --> <div class="absolute -top-50 -right-25 w-150 h-150 rounded-full bg-[radial-gradient(circle,rgba(237,27,36,0.06)_0%,rgba(250,250,252,0)_70%)] -z-10 pointer-events-none"></div> <!-- App Logo --> <img src="/img/logo-kiora-vectorizado.svg" alt="Kiora Logo" class="w-48 h-auto mt-4 mb-6 relative z-10 object-contain"> ${renderComponent($$result2, "LoginForm", LoginForm, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/jcami/OneDrive/Desktop/sena/Kiora/PROYECTO_KIORAPP/src/components/auth/LoginForm", "client:component-export": "default" })} <!-- Legal Links --> <div class="fixed bottom-22 left-4 flex flex-col gap-2 text-left z-50"> <a href="/terminos" class="text-xs text-slate-500 hover:text-[#ec131e] font-medium transition-colors bg-white/90 backdrop-blur-md px-4 py-2 rounded-r-xl shadow-lg border border-l-0 border-slate-100 hover:border-[#ec131e]/30 inline-flex items-center">
Términos y Condiciones
</a> <a href="/privacidad" class="text-xs text-slate-500 hover:text-[#ec131e] font-medium transition-colors bg-white/90 backdrop-blur-md px-4 py-2 rounded-r-xl shadow-lg border border-l-0 border-slate-100 hover:border-[#ec131e]/30 inline-flex items-center">
Política de Privacidad
</a> </div> </div> ${renderComponent($$result2, "GlobalControls", GlobalControls, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/jcami/OneDrive/Desktop/sena/Kiora/PROYECTO_KIORAPP/src/components/ui/GlobalControls", "client:component-export": "default" })} ` })}`;
}, "C:/Users/jcami/OneDrive/Desktop/sena/Kiora/PROYECTO_KIORAPP/src/pages/login.astro", void 0);

const $$file = "C:/Users/jcami/OneDrive/Desktop/sena/Kiora/PROYECTO_KIORAPP/src/pages/login.astro";
const $$url = "/login";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Login,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
