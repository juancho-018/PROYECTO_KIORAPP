import { c as createComponent, r as renderComponent, a as renderTemplate } from '../chunks/astro/server_BrQ9irSI.mjs';
import 'piccolore';
import 'html-escaper';
import { G as GlobalControls } from '../chunks/GlobalControls_BOS-C6mP.mjs';
import { $ as $$Mainlayout } from '../chunks/mainlayout_CkP3HL3S.mjs';
export { renderers } from '../renderers.mjs';

const $$Panel = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "MainLayout", $$Mainlayout, { "title": "Panel Principal - Kiora" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "PanelApp", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "C:/Users/jcami/OneDrive/Desktop/sena/Kiora/PROYECTO_KIORAPP/src/components/panel/PanelApp", "client:component-export": "default" })} ${renderComponent($$result2, "GlobalControls", GlobalControls, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/jcami/OneDrive/Desktop/sena/Kiora/PROYECTO_KIORAPP/src/components/ui/GlobalControls", "client:component-export": "default" })} ` })}`;
}, "C:/Users/jcami/OneDrive/Desktop/sena/Kiora/PROYECTO_KIORAPP/src/pages/panel.astro", void 0);

const $$file = "C:/Users/jcami/OneDrive/Desktop/sena/Kiora/PROYECTO_KIORAPP/src/pages/panel.astro";
const $$url = "/panel";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$Panel,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
