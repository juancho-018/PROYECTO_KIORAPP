import { c as createComponent, g as createAstro } from '../chunks/astro/server_BrQ9irSI.mjs';
import 'piccolore';
import 'html-escaper';
import 'clsx';
export { renderers } from '../renderers.mjs';

const $$Astro = createAstro();
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Index;
  return Astro2.redirect("/login");
}, "C:/Users/jcami/OneDrive/Desktop/sena/Kiora/PROYECTO_KIORAPP/src/pages/index.astro", void 0);

const $$file = "C:/Users/jcami/OneDrive/Desktop/sena/Kiora/PROYECTO_KIORAPP/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
