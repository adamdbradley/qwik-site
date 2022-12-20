// packages/qwik-city/middleware/vercel-edge/index.ts
import {
  mergeHeadersCookies,
  requestHandler,
} from "../request-handler/index.mjs";
import { getNotFound } from "@qwik-city-not-found-paths";
import { isStaticPath } from "@qwik-city-static-paths";
function createQwikCity(opts) {
  async function onRequest(request) {
    try {
      console.log("request");
      const url = new URL(request.url);
      console.log("request url", url.href);
      console.log("isStaticPath(url)", isStaticPath(url));
      if (isStaticPath(url)) {
        return new Response(null, {
          headers: {
            "x-middleware-next": "1",
          },
        });
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
        platform: process.env,
      };
      const handledResponse = await requestHandler(serverRequestEv, opts);
      if (handledResponse) {
        return handledResponse;
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
          "X-Error": "vercel-edge",
        },
      });
    }
  }
  return onRequest;
}
export { createQwikCity };
