import { c as createComponent, r as renderComponent, a as renderTemplate, m as maybeRenderHead } from '../chunks/astro/server_BrQ9irSI.mjs';
import 'piccolore';
import 'html-escaper';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { a as alertService, L as Loading, b as authService } from '../chunks/cargando_eu6GBj-M.mjs';
import { G as GlobalControls } from '../chunks/GlobalControls_BOS-C6mP.mjs';
import { $ as $$Mainlayout } from '../chunks/mainlayout_CkP3HL3S.mjs';
export { renderers } from '../renderers.mjs';

function ResetPasswordForm() {
  const [email, setEmail] = useState(null);
  const [code, setCode] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const urlEmail = searchParams.get("email");
    const urlCode = searchParams.get("code");
    if (urlEmail && urlCode) {
      setEmail(urlEmail);
      setCode(urlCode);
    } else {
      alertService.showError(
        "Datos insuficientes",
        "Faltan el correo o el código de verificación en la URL."
      );
    }
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !code) {
      alertService.showError("Error", "Faltan datos para procesar el restablecimiento.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alertService.showError("Error", "Las contraseñas no coinciden, por favor verifica.");
      return;
    }
    if (newPassword.length < 6) {
      alertService.showError("Error", "La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setIsLoading(true);
    try {
      await authService.resetPassword(email, code, newPassword);
      await alertService.showSuccess(
        "¡Éxito!",
        "Tu contraseña ha sido restablecida exitosamente."
      );
      window.location.href = "/login";
    } catch (error) {
      const err = error;
      alertService.showError("Error", err.message || "Error desconocido");
    } finally {
      setIsLoading(false);
    }
  };
  if (!email || !code) {
    return /* @__PURE__ */ jsxs("div", { className: "bg-white w-full max-w-105 p-8 rounded-xl border border-red-100 shadow-sm text-center", children: [
      /* @__PURE__ */ jsx("svg", { className: "w-12 h-12 text-red-500 mx-auto mb-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" }) }),
      /* @__PURE__ */ jsx("h2", { className: "text-xl font-bold text-gray-800 mb-2", children: "Error de validación" }),
      /* @__PURE__ */ jsx("p", { className: "text-gray-600 mb-6", children: "No tienes los datos necesarios para acceder a esta página (correo o código)." }),
      /* @__PURE__ */ jsx("a", { href: "/recuperar-contrasena", className: "inline-block bg-[#ec131e] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#d0111a] transition-colors no-underline", children: "Volver a empezar" })
    ] });
  }
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      "form",
      {
        onSubmit: handleSubmit,
        className: "bg-white w-full max-w-105 p-8 rounded-xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.04)]",
        children: [
          /* @__PURE__ */ jsxs("div", { className: "mb-6 text-center", children: [
            /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-[#1e293b] mb-2", children: "Crear Nueva Contraseña" }),
            /* @__PURE__ */ jsx("p", { className: "text-[0.95rem] text-[#64748b]", children: "Ingresa tu nueva contraseña para la cuenta." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mb-5", children: [
            /* @__PURE__ */ jsx(
              "label",
              {
                htmlFor: "newPassword",
                className: "block font-semibold text-[0.85rem] text-[#374151] mb-2",
                children: "Nueva Contraseña"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "relative flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden transition-all duration-200 focus-within:border-[#9ca3af] focus-within:ring-[3px] focus-within:ring-gray-400/10", children: [
              /* @__PURE__ */ jsx("div", { className: "pl-3.5 pr-2 text-gray-400 flex items-center", children: /* @__PURE__ */ jsx("svg", { fill: "none", className: "w-5 h-5", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.8", d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" }) }) }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "password",
                  id: "newPassword",
                  className: "flex-1 border-none bg-transparent py-2.5 text-[0.95rem] text-[#334155] outline-none w-full placeholder-gray-400",
                  placeholder: "••••••••",
                  value: newPassword,
                  onChange: (e) => setNewPassword(e.target.value),
                  required: true,
                  minLength: 6,
                  disabled: isLoading
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mb-6", children: [
            /* @__PURE__ */ jsx(
              "label",
              {
                htmlFor: "confirmPassword",
                className: "block font-semibold text-[0.85rem] text-[#374151] mb-2",
                children: "Confirmar Contraseña"
              }
            ),
            /* @__PURE__ */ jsxs("div", { className: "relative flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden transition-all duration-200 focus-within:border-[#9ca3af] focus-within:ring-[3px] focus-within:ring-gray-400/10", children: [
              /* @__PURE__ */ jsx("div", { className: "pl-3.5 pr-2 text-gray-400 flex items-center", children: /* @__PURE__ */ jsx("svg", { fill: "none", className: "w-5 h-5", stroke: "currentColor", viewBox: "0 0 24 24", xmlns: "http://www.w3.org/2000/svg", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: "1.8", d: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" }) }) }),
              /* @__PURE__ */ jsx(
                "input",
                {
                  type: "password",
                  id: "confirmPassword",
                  className: "flex-1 border-none bg-transparent py-2.5 text-[0.95rem] text-[#334155] outline-none w-full placeholder-gray-400",
                  placeholder: "••••••••",
                  value: confirmPassword,
                  onChange: (e) => setConfirmPassword(e.target.value),
                  required: true,
                  disabled: isLoading
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
              children: isLoading ? "Restableciendo..." : "Restablecer Contraseña"
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "text-center", children: /* @__PURE__ */ jsxs("a", { href: "/login", className: "inline-flex items-center gap-1 text-[#64748b] hover:text-[#334155] font-medium text-[0.9rem] no-underline transition-colors", children: [
            /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", children: /* @__PURE__ */ jsx("path", { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M10 19l-7-7m0 0l7-7m-7 7h18" }) }),
            "Volver al inicio"
          ] }) })
        ]
      }
    ),
    isLoading && /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(Loading, { message: "Restableciendo..." }) })
  ] });
}

const $$ResetPassword = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "MainLayout", $$Mainlayout, { "title": "Restablecer Contrase\xF1a - Kiora" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex flex-col items-center justify-center min-h-screen w-full relative z-10 px-4"> <!-- Abstract Background Detail --> <div class="absolute -top-50 -right-25 w-150 h-150 rounded-full bg-[radial-gradient(circle,rgba(237,27,36,0.06)_0%,rgba(250,250,252,0)_70%)] -z-10 pointer-events-none"></div> <!-- App Logo --> <img src="/img/logo-kiora-vectorizado.svg" alt="Kiora Logo" class="w-48 h-auto mt-4 mb-6 relative z-10 object-contain"> <p class="text-[0.95rem] text-[#64748b] m-0 mb-8 font-medium text-center max-w-md px-4">
Estás a un paso de recuperar el acceso. Escribe y confirma tu nueva contraseña.
</p> ${renderComponent($$result2, "ResetPasswordForm", ResetPasswordForm, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/jcami/OneDrive/Desktop/sena/Kiora/PROYECTO_KIORAPP/src/components/auth/ResetPasswordForm", "client:component-export": "default" })} <!-- Legal Links --> <div class="fixed bottom-22 left-4 flex flex-col gap-2 text-left z-50"> <a href="/terminos" class="text-xs text-slate-500 hover:text-[#ec131e] font-medium transition-colors bg-white/90 backdrop-blur-md px-4 py-2 rounded-r-xl shadow-lg border border-l-0 border-slate-100 hover:border-[#ec131e]/30 inline-flex items-center">
Términos y Condiciones
</a> <a href="/privacidad" class="text-xs text-slate-500 hover:text-[#ec131e] font-medium transition-colors bg-white/90 backdrop-blur-md px-4 py-2 rounded-r-xl shadow-lg border border-l-0 border-slate-100 hover:border-[#ec131e]/30 inline-flex items-center">
Política de Privacidad
</a> </div> </div> ${renderComponent($$result2, "GlobalControls", GlobalControls, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/jcami/OneDrive/Desktop/sena/Kiora/PROYECTO_KIORAPP/src/components/ui/GlobalControls", "client:component-export": "default" })} ` })}`;
}, "C:/Users/jcami/OneDrive/Desktop/sena/Kiora/PROYECTO_KIORAPP/src/pages/reset-password.astro", void 0);

const $$file = "C:/Users/jcami/OneDrive/Desktop/sena/Kiora/PROYECTO_KIORAPP/src/pages/reset-password.astro";
const $$url = "/reset-password";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$ResetPassword,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
