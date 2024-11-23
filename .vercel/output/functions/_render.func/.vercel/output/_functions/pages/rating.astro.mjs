/* empty css                                   */
import { c as createComponent, r as renderTemplate, d as renderComponent, b as createAstro, m as maybeRenderHead } from '../chunks/astro/server_CKFZCLmU.mjs';
import 'kleur/colors';
import 'html-escaper';
import { g as getRestaurant, $ as $$Layout } from '../chunks/api_DxeWbPBm.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import 'react';
export { renderers } from '../renderers.mjs';

function RatingForm({ restaurantId, nextUrl, linkMaps }) {
  const handleRatingSelect = (rating) => {
    localStorage.setItem("yuppie_rating", rating.toString());
    localStorage.setItem("yuppie_restaurant", restaurantId);
    if (rating === 5) {
      window.location.href = linkMaps;
    } else {
      window.location.href = nextUrl;
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md flex flex-col items-center gap-8", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-xl font-medium text-white text-center", children: "¿Qué tan satisfecho quedaste con el servicio?" }),
    /* @__PURE__ */ jsx("div", { className: "flex justify-between w-full px-4", children: [
      { rating: 1, emoji: "😠", label: "Muy insatisfecho" },
      { rating: 2, emoji: "🙁", label: "Insatisfecho" },
      { rating: 3, emoji: "😐", label: "Neutral" },
      { rating: 4, emoji: "🙂", label: "Satisfecho" },
      { rating: 5, emoji: "😍", label: "Muy satisfecho" }
    ].map(({ rating, emoji, label }) => /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => handleRatingSelect(rating),
        className: "text-4xl transition-all hover:scale-110 focus:scale-125 focus:outline-none",
        "aria-label": label,
        children: emoji
      },
      rating
    )) })
  ] });
}

const $$Astro = createAstro();
const $$Rating = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Rating;
  const localId = Astro2.url.searchParams.get("local");
  if (!localId) {
    return Astro2.redirect("/404");
  }
  const restaurant = await getRestaurant(localId);
  if (!restaurant) {
    return Astro2.redirect("/404");
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Califica tu experiencia" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen px-4 py-8 flex flex-col items-center justify-center relative"> <div class="absolute top-0 left-0 w-full h-full overflow-hidden z-0"> <div class="float absolute top-10 left-10 w-20 h-20 bg-[#5F50E5] rounded-full opacity-20"></div> <div class="float absolute bottom-20 right-10 w-32 h-32 bg-[#5F50E5] rounded-full opacity-20" style="animation-delay: -2s;"></div> </div> <h1 class="text-4xl font-bold mb-8 text-center relative z-10"> <span class="bg-clip-text text-transparent bg-gradient-to-r from-white to-[#5F50E5]"> ${restaurant.name} </span> </h1> <div class="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-lg relative z-10"> ${renderComponent($$result2, "RatingForm", RatingForm, { "client:load": true, "restaurantId": restaurant.id.toString(), "nextUrl": `/improvement?local=${localId}`, "linkMaps": restaurant.linkMaps, "client:component-hydration": "load", "client:component-path": "/Users/Mati/Desktop/yuppie-web/src/components/feedback/Rating", "client:component-export": "RatingForm" })} </div> </div> ` })}`;
}, "/Users/Mati/Desktop/yuppie-web/src/pages/rating.astro", void 0);

const $$file = "/Users/Mati/Desktop/yuppie-web/src/pages/rating.astro";
const $$url = "/rating";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Rating,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
