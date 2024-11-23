import { renderers } from './renderers.mjs';
import { s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_BRPlOEDL.mjs';
import { manifest } from './manifest_id8NjM-o.mjs';
import { createExports } from '@astrojs/vercel/serverless/entrypoint';

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/comment.astro.mjs');
const _page2 = () => import('./pages/improvement.astro.mjs');
const _page3 = () => import('./pages/rating.astro.mjs');
const _page4 = () => import('./pages/index.astro.mjs');

const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/comment.astro", _page1],
    ["src/pages/improvement.astro", _page2],
    ["src/pages/rating.astro", _page3],
    ["src/pages/index.astro", _page4]
]);
const serverIslandMap = new Map();
const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "951db124-2dec-4f38-a349-8dc93cd12505",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (_start in serverEntrypointModule) {
	serverEntrypointModule[_start](_manifest, _args);
}

export { __astrojsSsrVirtualEntry as default, pageMap };
