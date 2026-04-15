import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_BrQ9irSI.mjs';
import 'piccolore';
import 'html-escaper';
import { jsxs, Fragment, jsx } from 'react/jsx-runtime';
import { useState } from 'react';
import { L as Loading, b as authService, a as alertService } from '../chunks/cargando_eu6GBj-M.mjs';
import { G as GlobalControls } from '../chunks/GlobalControls_BOS-C6mP.mjs';
import { $ as $$Mainlayout } from '../chunks/mainlayout_CkP3HL3S.mjs';
export { renderers } from '../renderers.mjs';

function RecoverPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      await alertService.showSuccess("Código enviado", "Revisa tu correo para obtener el código de verificación.");
      window.location.href = `/verificar-codigo?email=${encodeURIComponent(email)}`;
    } catch (error) {
      const err = error;
      alertService.showError("Error", err.message || "Error desconocido");
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
            /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-[#1e293b] mb-2", children: "Restablecimiento de contraseña" }),
            /* @__PURE__ */ jsx("p", { className: "text-[0.95rem] text-[#64748b]", children: "Ingresa tu correo para recibir un enlace de recuperación." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mb-7", children: [
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
                  placeholder: "ejemplo@kiora.com",
                  value: email,
                  onChange: (e) => setEmail(e.target.value),
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
              children: isLoading ? "Enviando..." : "Enviar enlace"
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "text-center", children: /* @__PURE__ */ jsxs("a", { href: "/login", className: "inline-flex items-center gap-1 text-[#64748b] hover:text-[#334155] font-medium text-[0.9rem] no-underline transition-colors", children: [
            /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10 19l-7-7m0 0l7-7m-7 7h18" }) }),
            "Volver al inicio"
          ] }) })
        ]
      }
    ),
    isLoading && /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(Loading, { message: "Enviando..." }) })
  ] });
}

const $$RecuperarContrasena = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "MainLayout", $$Mainlayout, { "title": "Recuperar Contrase\xF1a - Kiora" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex flex-col items-center justify-center min-h-screen w-full relative z-10 px-4"> <!-- Abstract Background Detail --> <div class="absolute -top-50 -right-25 w-150 h-150 rounded-full bg-[radial-gradient(circle,rgba(237,27,36,0.06)_0%,rgba(250,250,252,0)_70%)] -z-10 pointer-events-none"></div> <!-- App Logo --> <img src="/img/logo-kiora-vectorizado.svg" alt="Kiora Logo" class="w-48 h-auto mt-4 mb-6 relative z-10 object-contain"> <p class="text-[0.95rem] text-[#64748b] m-0 mb-8 font-medium text-center max-w-md px-4">
Ingresa tu correo electrónico asociado a tu cuenta y te enviaremos
          instrucciones para restablecer tu contraseña.
</p> ${renderComponent($$result2, "RecoverPasswordForm", RecoverPasswordForm, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/jcami/OneDrive/Desktop/sena/Kiora/PROYECTO_KIORAPP/src/components/auth/RecoverPasswordForm", "client:component-export": "default" })} </div> ${renderComponent($$result2, "GlobalControls", GlobalControls, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/jcami/OneDrive/Desktop/sena/Kiora/PROYECTO_KIORAPP/src/components/ui/GlobalControls", "client:component-export": "default" })} ` })}`;
}, "C:/Users/jcami/OneDrive/Desktop/sena/Kiora/PROYECTO_KIORAPP/src/pages/recuperar-contrasena.astro", void 0);

const $$file = "C:/Users/jcami/OneDrive/Desktop/sena/Kiora/PROYECTO_KIORAPP/src/pages/recuperar-contrasena.astro";
const $$url = "/recuperar-contrasena";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$RecuperarContrasena,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
