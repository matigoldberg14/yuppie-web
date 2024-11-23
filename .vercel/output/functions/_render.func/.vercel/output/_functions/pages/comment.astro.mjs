/* empty css                                   */
import { c as createComponent, r as renderTemplate, d as renderComponent, b as createAstro, m as maybeRenderHead } from '../chunks/astro/server_CKFZCLmU.mjs';
import 'kleur/colors';
import 'html-escaper';
import { c as createReview, g as getRestaurant, $ as $$Layout } from '../chunks/api_DxeWbPBm.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState } from 'react';
export { renderers } from '../renderers.mjs';

function CommentForm({ restaurantId, successUrl }) {
  const [comment, setComment] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const handleSubmit = async () => {
    try {
      setError(null);
      setIsSubmitting(true);
      const typeImprovement = localStorage.getItem("yuppie_improvement");
      console.log("Attempting to submit:", {
        restaurantId,
        typeImprovement,
        email,
        comment
      });
      if (!typeImprovement) {
        throw new Error("Por favor, selecciona qué podemos mejorar");
      }
      await createReview({
        restaurantId,
        typeImprovement,
        email,
        comment: comment.trim()
      });
      localStorage.removeItem("yuppie_improvement");
      window.location.href = successUrl;
    } catch (error2) {
      const errorMessage = error2 instanceof Error ? error2.message : "Error desconocido";
      setError(errorMessage);
      console.error("Error submitting review:", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "w-full max-w-md flex flex-col gap-6", children: [
    /* @__PURE__ */ jsx("h2", { className: "text-xl text-center", children: "Por último ¿Nos quisieras dejar un comentario?" }),
    error && /* @__PURE__ */ jsx("div", { className: "bg-red-500/10 text-red-400 p-4 rounded-lg text-sm", children: error }),
    /* @__PURE__ */ jsx(
      "textarea",
      {
        value: comment,
        onChange: (e) => setComment(e.target.value),
        placeholder: "Comentanos aquí.",
        className: "w-full p-4 rounded-lg bg-white/5 text-white placeholder-gray-400 resize-none h-40",
        required: true
      }
    ),
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "email",
        value: email,
        onChange: (e) => setEmail(e.target.value),
        placeholder: "Tu email",
        className: "w-full p-4 rounded-lg bg-white/5 text-white placeholder-gray-400",
        required: true
      }
    ),
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: handleSubmit,
        disabled: isSubmitting || !email || !comment.trim(),
        className: "w-full py-3 px-6 bg-white text-black rounded-full font-medium hover:bg-gray-100 disabled:opacity-50",
        children: isSubmitting ? "Enviando..." : "Enviar"
      }
    )
  ] });
}

const $$Astro = createAstro();
const $$Comment = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Comment;
  const restaurantId = Astro2.url.searchParams.get("local");
  const restaurant = restaurantId ? await getRestaurant(restaurantId) : null;
  if (!restaurant) {
    return Astro2.redirect("/404");
  }
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Dejanos tu comentario" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="min-h-screen px-4 py-8 flex flex-col items-center justify-center relative"> <div class="absolute top-0 left-0 w-full h-full overflow-hidden z-0"> <div class="float absolute top-10 right-20 w-28 h-28 bg-[#5F50E5] rounded-full opacity-15" style="animation-delay: -3s;"></div> <div class="float absolute bottom-20 left-10 w-36 h-36 bg-[#5F50E5] rounded-full opacity-15" style="animation-delay: -1.5s;"></div> </div> <h1 class="text-4xl font-bold mb-8 text-center relative z-10"> <span class="bg-clip-text text-transparent bg-gradient-to-r from-white to-[#5F50E5]">
Yuppie
</span> </h1> <div class="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-lg relative z-10"> <h2 class="text-2xl font-semibold mb-6 text-center">Dejanos tu comentario</h2> ${renderComponent($$result2, "CommentForm", CommentForm, { "client:load": true, "restaurantId": restaurant.id, "successUrl": "/success", "client:component-hydration": "load", "client:component-path": "/Users/Mati/Desktop/yuppie-web/src/components/feedback/CommentForm", "client:component-export": "CommentForm" })} </div> </div> ` })}`;
}, "/Users/Mati/Desktop/yuppie-web/src/pages/comment.astro", void 0);

const $$file = "/Users/Mati/Desktop/yuppie-web/src/pages/comment.astro";
const $$url = "/comment";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Comment,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
