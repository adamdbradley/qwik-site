// packages/qwik-city/middleware/cloudflare-pages/index.ts
import { requestHandler } from "../request-handler/index.mjs";
import { mergeHeadersCookies } from "../request-handler/index.mjs";
import { getNotFound } from "@qwik-city-not-found-paths";
import { isStaticPath } from "@qwik-city-static-paths";
function createQwikCity(opts) {
  async function onCloudflarePagesRequest({ request, env, waitUntil, next }) {
    try {
      const url = new URL(request.url);
      console.log("url1", url.href);
      if (isStaticPath(url)) {
        return next();
      }
      console.log("url2", url.href);
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
          // return cachedResponse;
        }
      }
      console.log("url3", url.href);
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
      console.log("url4", url.href);
      const handledResponse = await requestHandler(serverRequestEv, opts);
      console.log("url5", url.href);
      if (handledResponse) {
        console.log("url6", url.href);
        const response = await handledResponse.response;
        console.log("url7", url.href);
        if (response) {
          console.log("url8", url.href);
          if (response.ok && cache && response.headers.has("Cache-Control")) {
            // waitUntil(cache.put(cacheKey, response.clone()));
          }
          console.log("url9", url.href);
          return new Response("fu", {
            status: 404,
            headers: {
              "Content-Type": "text/plain; charset=utf-8",
            },
          });
          return response;
        }
      }
      console.log("url10", url.href);
      const notFoundHtml = getNotFound(url.pathname);
      return new Response(notFoundHtml, {
        status: 404,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "X-Not-Found": url.pathname,
        },
      });
    } catch (e) {
      console.log("url11", url.href);
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
