// packages/qwik-city/middleware/cloudflare-pages/index.ts
import { requestHandler } from "../request-handler/index.mjs";
import { mergeHeadersCookies } from "../request-handler/index.mjs";
import { getNotFound } from "@qwik-city-not-found-paths";
import { isStaticPath } from "@qwik-city-static-paths";
function createQwikCity(opts) {
  async function onCloudflarePagesRequest({ request, env, waitUntil, next }) {
    try {
      const url = new URL(request.url);
      if (isStaticPath(url)) {
        return next();
      }
      const useCache =
        url.hostname !== "127.0.0.1" &&
        url.hostname !== "localhost" &&
        url.port === "" &&
        request.method === "GET";
      const cacheKey = new Request(url.href, request);
      const cache = useCache ? await caches.open("custom:qwikcity") : null;
      if (cache) {
        const cachedResponse = await cache.match(cacheKey);
        if (cachedResponse) {
          return cachedResponse;
        }
      }
      const serverRequestEv = {
        mode: "server",
        locale: void 0,
        url,
        request,
        getWritableStream: (status, headers, cookies, resolve) => {
          const { readable, writable } = new TransformStream();
          const response = new Response(readable, {
            status,
            headers: mergeHeadersCookies(headers, cookies),
          });
          resolve(response);
          return writable;
        },
        platform: env,
      };
      const handledResponse = await requestHandler(serverRequestEv, opts);
      if (handledResponse) {
        const response = await handledResponse.response;
        if (response) {
          // if (response.ok && cache && response.headers.has("Cache-Control")) {
          //   waitUntil(cache.put(cacheKey, response.clone()));
          // }
          // return response;
          // const response = new Response("fu", {
          //   headers: { "Content-Type": "text/plain" },
          // });
          return response;
        }
      }
      const notFoundHtml = getNotFound(url.pathname);
      return new Response(notFoundHtml, {
        status: 404,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "X-Not-Found": url.pathname,
        },
      });
    } catch (e) {
      console.error(e);
      return new Response(String(e || "Error"), {
        status: 500,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "X-Error": "cloudflare-pages",
        },
      });
    }
  }
  return onCloudflarePagesRequest;
}
export { createQwikCity };
