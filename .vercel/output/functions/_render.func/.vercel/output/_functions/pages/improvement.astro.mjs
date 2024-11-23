/* empty css                                   */
import { c as createComponent, r as renderTemplate, d as renderComponent, b as createAstro, m as maybeRenderHead } from '../chunks/astro/server_CKFZCLmU.mjs';
import 'kleur/colors';
import 'html-escaper';
import { g as getRestaurant, $ as $$Layout } from '../chunks/api_DxeWbPBm.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
export { renderers } from '../renderers.mjs';

const improvementOptions = [
  { id: "Atención", label: "Atención", icon: "🔔" },
  { id: "Comidas", label: "Comidas", icon: "🍽" },
  { id: "Bebidas", label: "Bebidas", icon: "☕️🍷" },
  { id: "Ambiente", label: "Ambiente", icon: "🎵" },
  { id: "Otra", label: "Otra", icon: "⏰" }
];
function ImprovementSelector({ restaurantId, nextUrl }) {
  const handleSelect = (improvement) => {
    localStorage.setItem("yuppie_improvement", improvement);
    window.location.href = nextUrl;
  };
  return /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md flex flex-col gap-4", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-xl text-center text-white font-medium mb-4", children: "¿En qué podríamos mejorar?" }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-2", children: improvementOptions.map(({ id, label, icon }) => /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => handleSelect(id),
        className: "w-full p-4 rounded-lg flex items-center gap-3 bg-primary-dark hover:bg-primary-light transition-colors text-white",
        children: [
          /* @__PURE__ */ jsx("span", { role: "img", "aria-label": label, children: icon }),
          /* @__PURE__ */ jsx("span", { children: label })
        ]
      },
      id
    )) })
  ] });
}

const $$Astro = createAstro();
const $$Improvement = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Improvement;
  const restaurantId = Astro2.url.searchParams.get("local");
  const restaurant = restaurantId ? await getRestaurant(restaurantId) : null;
  if (!restaurant) {
    return Astro2.redirect("/404");
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "\xBFEn qu\xE9 podr\xEDamos mejorar?" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen px-4 py-8 flex flex-col items-center justify-center relative"> <div class="absolute top-0 left-0 w-full h-full overflow-hidden z-0"> <div class="pulse absolute top-20 right-10 w-40 h-40 bg-[#5F50E5] rounded-full opacity-10"></div> <div class="pulse absolute bottom-10 left-10 w-24 h-24 bg-[#5F50E5] rounded-full opacity-10" style="animation-delay: -1s;"></div> </div> <h1 class="text-4xl font-bold mb-8 text-center relative z-10"> <span class="bg-clip-text text-transparent bg-gradient-to-r from-white to-[#5F50E5]">
Yuppie
</span> </h1> <div class="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-lg relative z-10"> <h2 class="text-2xl font-semibold mb-6 text-center">¿En qué podríamos mejorar?</h2> ${renderComponent($$result2, "ImprovementSelector", ImprovementSelector, { "client:load": true, "restaurantId": restaurant.id, "nextUrl": `/comment?local=${restaurantId}`, "client:component-hydration": "load", "client:component-path": "/Users/Mati/Desktop/yuppie-web/src/components/feedback/ImprovementSelector", "client:component-export": "ImprovementSelector" })} </div> </div> ` })}`;
}, "/Users/Mati/Desktop/yuppie-web/src/pages/improvement.astro", void 0);

const $$file = "/Users/Mati/Desktop/yuppie-web/src/pages/improvement.astro";
const $$url = "/improvement";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Improvement,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
