import { c as createComponent, r as renderTemplate, e as renderHead, f as renderSlot, b as createAstro } from './astro/server_CKFZCLmU.mjs';
import 'kleur/colors';
import 'html-escaper';
import 'clsx';
/* empty css                           */

const $$Astro = createAstro();
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  const { title } = Astro2.props;
  return renderTemplate`<html lang="es" data-astro-cid-sckkx6r4> <head><meta charset="UTF-8"><meta name="description" content="Yuppie - Tu plataforma de feedback"><meta name="viewport" content="width=device-width"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><title>${title}</title>${renderHead()}</head> <body class="bg-primary min-h-screen text-white" data-astro-cid-sckkx6r4> ${renderSlot($$result, $$slots["default"])} </body></html>`;
}, "/Users/Mati/Desktop/yuppie-web/src/layouts/Layout.astro", void 0);

const API_URL = "http://localhost:1337/api";
async function getAllRestaurants() {
  try {
    const response = await fetch(`${API_URL}/restaurants?populate=*`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json = await response.json();
    return json;
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    return { data: [], meta: { pagination: { total: 0 } } };
  }
}
async function getRestaurant(documentId) {
  try {
    const response = await fetch(
      `${API_URL}/restaurants?filters[documentId][$eq]=${documentId}&populate=*`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json = await response.json();
    return json.data[0];
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    return null;
  }
}
async function createReview({
  restaurantId,
  typeImprovement,
  email,
  comment
}) {
  try {
    const documentId = "rev_" + Math.random().toString(36).substr(2, 9);
    const reviewData = {
      data: {
        googleSent: false,
        typeImprovement,
        email,
        date: /* @__PURE__ */ new Date(),
        comment,
        restaurant: restaurantId
        // Relación directa con el ID del restaurante.
      }
    };
    console.log("Sending to Strapi:", JSON.stringify(reviewData, null, 2));
    const response = await fetch(`${API_URL}/reviews`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(reviewData)
    });
    const responseData = await response.json();
    if (!response.ok) {
      console.error("Strapi error response:", responseData);
      throw new Error(
        responseData.error?.message || JSON.stringify(responseData.error?.details) || "Error creating review"
      );
    }
    return responseData;
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error details:", error.message);
    } else {
      console.error("Unknown error:", error);
    }
    throw error;
  }
}

export { $$Layout as $, getAllRestaurants as a, createReview as c, getRestaurant as g };
