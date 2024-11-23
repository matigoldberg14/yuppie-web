/* empty css                                   */
import { c as createComponent, r as renderTemplate, d as renderComponent, m as maybeRenderHead, a as addAttribute } from '../chunks/astro/server_CKFZCLmU.mjs';
import 'kleur/colors';
import 'html-escaper';
import { a as getAllRestaurants, $ as $$Layout } from '../chunks/api_DxeWbPBm.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const response = await getAllRestaurants();
  const restaurants = response.data;
  console.log("Restaurants loaded:", restaurants);
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Inicio | Yuppie" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="flex min-h-screen flex-col items-center justify-center p-4 text-center"> <h1 class="text-4xl font-bold mb-8">
Bienvenido a Yuppie
</h1> <p class="text-xl mb-8 max-w-md">
Tu plataforma para gestionar la reputación de tu negocio
</p> <div class="grid gap-4 md:grid-cols-2 max-w-4xl"> ${restaurants && restaurants.map((restaurant) => renderTemplate`<a${addAttribute(`/rating?local=${restaurant.documentId}`, "href")} class="flex flex-col md:flex-row items-center bg-white/5 rounded-lg hover:bg-white/10 transition-all overflow-hidden"> <div class="w-full md:w-48 h-48 relative"> ${restaurant.cover ? renderTemplate`<img${addAttribute(`http://localhost:1337${restaurant.cover.url}`, "src")}${addAttribute(restaurant.name, "alt")} class="w-full h-full object-cover" onerror="this.onerror=null; this.src='/placeholder.png';">` : renderTemplate`<div class="w-full h-full bg-gray-800 flex items-center justify-center"> <span class="text-gray-500">Sin imagen</span> </div>`} </div> <div class="p-6 flex-1"> <h2 class="text-xl font-bold mb-2"> ${restaurant.name} </h2> <p class="text-gray-400">Deja tu opinión sobre tu experiencia</p> </div> </a>`)} </div> <footer class="mt-16 text-gray-400"> <p>© ${(/* @__PURE__ */ new Date()).getFullYear()} Yuppie. Todos los derechos reservados.</p> </footer> </main> ` })}`;
}, "/Users/Mati/Desktop/yuppie-web/src/pages/index.astro", void 0);

const $$file = "/Users/Mati/Desktop/yuppie-web/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
