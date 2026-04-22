import { c as createComponent, b as addAttribute, r as renderComponent, d as renderScript, F as Fragment$1, a as renderTemplate, e as renderHead, f as renderSlot, g as createAstro, h as defineScriptVars } from './astro/server_BrQ9irSI.mjs';
import 'piccolore';
import 'html-escaper';
/* empty css                         */
import { jsx, Fragment } from 'react/jsx-runtime';
import 'react';

function Icono() {
  return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(
    "link",
    {
      rel: "shortcut icon",
      href: "/img/logo-kiora-vectorizado.svg",
      type: "image/svg+xml"
    }
  ) });
}

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$Mainlayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Mainlayout;
  const weglotKey = "wg_9854cdf52fc0bfebbcb7d3d4782dcd777";
  const {
    title = "KIORA | Sistema para Kioskos",
    lang = "es"
  } = Astro2.props;
  return renderTemplate`<html${addAttribute(lang, "lang")}> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>${renderComponent($$result, "Icono", Icono, {})}<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"><!-- PWA Setup --><link rel="manifest" href="/manifest.webmanifest"><meta name="theme-color" content="#ec131e"><link rel="apple-touch-icon" href="/favicon.svg"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="default">${renderScript($$result, "C:/Users/jcami/OneDrive/Desktop/sena/Kiora/PROYECTO_KIORAPP/src/layouts/mainlayout.astro?astro&type=script&index=0&lang.ts")}<title>${title}</title>${renderTemplate`${renderComponent($$result, "Fragment", Fragment$1, {}, { "default": ($$result2) => renderTemplate(_a || (_a = __template(['<script src="https://cdn.weglot.com/weglot.min.js"></script><script>(function(){', "\n          // @ts-ignore\n          if (window.Weglot) {\n            window.Weglot.initialize({ api_key: weglotKey });\n          }\n        })();</script><style>\n          .weglot-container {\n            position: fixed !important;\n            bottom: 1.5rem !important;\n            right: 1.5rem !important;\n            z-index: 9999 !important;\n          }\n          .wg-default, .wg-default .wg-li {\n            background: rgba(255, 255, 255, 0.95) !important;\n            backdrop-filter: blur(8px) !important;\n            border: 1px solid rgba(226, 232, 240, 0.8) !important;\n            border-radius: 0.5rem !important;\n            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03) !important;\n            color: #475569 !important;\n            font-family: 'Inter', sans-serif !important;\n            font-size: 0.80rem !important;\n            font-weight: 600 !important;\n            padding: 0.2rem 0.6rem !important;\n            transition: all 0.2s ease !important;\n          }\n          .wg-default:hover, .wg-default.wg-open {\n            border-color: #ec131e !important;\n            color: #ec131e !important;\n            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;\n            transform: translateY(-2px) !important;\n          }\n        </style>"])), defineScriptVars({ weglotKey })) })}`}${renderHead()}</head> <body class="m-0 font-[Inter] bg-[#fafafc] text-[#334155] min-h-screen relative overflow-x-hidden"> ${renderSlot($$result, $$slots["default"])} </body></html>`;
}, "C:/Users/jcami/OneDrive/Desktop/sena/Kiora/PROYECTO_KIORAPP/src/layouts/mainlayout.astro", void 0);

export { $$Mainlayout as $ };
