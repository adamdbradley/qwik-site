"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// packages/qwik-city/adaptors/netlify-edge/vite/index.ts
var vite_exports = {};
__export(vite_exports, {
  netifyEdgeAdaptor: () => netifyEdgeAdaptor
});
module.exports = __toCommonJS(vite_exports);

// packages/qwik-city/adaptors/shared/vite/index.ts
var import_node_fs3 = __toESM(require("fs"), 1);
var import_node_path4 = require("path");

// packages/qwik-city/adaptors/shared/vite/static-paths.ts
var import_node_fs = __toESM(require("fs"), 1);
var import_node_path2 = require("path");

// packages/qwik-city/utils/fs.ts
var import_node_path = require("path");
function normalizePath(path) {
  path = (0, import_node_path.normalize)(path);
  const isExtendedLengthPath = /^\\\\\?\\/.test(path);
  const hasNonAscii = /[^\u0000-\u0080]+/.test(path);
  if (isExtendedLengthPath || hasNonAscii) {
    return path;
  }
  path = path.replace(/\\/g, "/");
  if (path.endsWith("/")) {
    path = path.slice(0, path.length - 1);
  }
  return path;
}

// packages/qwik-city/adaptors/shared/vite/static-paths.ts
async function createStaticPathsModule(clientOutDir, basePathname2, staticPaths, format) {
  const staticFilePaths = await getStaticFilePaths(clientOutDir);
  const staticPathSet = new Set(staticPaths);
  staticFilePaths.forEach((filePath) => {
    const relFilePath = normalizePath((0, import_node_path2.relative)(clientOutDir, filePath));
    const pathname = basePathname2 + relFilePath;
    staticPathSet.add(pathname);
  });
  const assetsPath = basePathname2 + "assets/";
  const baseBuildPath = basePathname2 + "build/";
  const c = [];
  c.push(`const staticPaths = new Set(${JSON.stringify(Array.from(staticPathSet).sort())});`);
  c.push(`function isStaticPath(p) {`);
  c.push(`  if (p.startsWith(${JSON.stringify(baseBuildPath)})) {`);
  c.push(`    return true;`);
  c.push(`  }`);
  c.push(`  if (p.startsWith(${JSON.stringify(assetsPath)})) {`);
  c.push(`    return true;`);
  c.push(`  }`);
  c.push(`  if (staticPaths.has(p)) {`);
  c.push(`    return true;`);
  c.push(`  }`);
  c.push(`  return false;`);
  c.push(`}`);
  if (format === "cjs") {
    c.push("module.exports = { isStaticPath: isStaticPath };");
  } else {
    c.push("export default { isStaticPath };");
  }
  return c.join("\n");
}
async function getStaticFilePaths(publicDir) {
  const staticPaths = [];
  const loadDir = async (dir) => {
    const itemNames = await import_node_fs.default.promises.readdir(dir);
    await Promise.all(
      itemNames.map(async (itemName) => {
        if (!IGNORE_NAMES[itemName]) {
          const itemPath = (0, import_node_path2.join)(dir, itemName);
          const stat = await import_node_fs.default.promises.stat(itemPath);
          if (stat.isDirectory()) {
            await loadDir(itemPath);
          } else if (stat.isFile()) {
            staticPaths.push(itemPath);
          }
        }
      })
    );
  };
  await loadDir(publicDir);
  return staticPaths;
}
var IGNORE_NAMES = {
  build: true,
  assets: true,
  "index.html": true,
  "q-data.json": true
};

// packages/qwik-city/adaptors/shared/vite/not-found-paths.ts
var import_node_fs2 = __toESM(require("fs"), 1);
var import_node_path3 = require("path");

// packages/qwik-city/middleware/request-handler/cookie.ts
var SAMESITE = {
  lax: "Lax",
  none: "None",
  strict: "Strict"
};
var UNIT = {
  seconds: 1,
  minutes: 1 * 60,
  hours: 1 * 60 * 60,
  days: 1 * 60 * 60 * 24,
  weeks: 1 * 60 * 60 * 24 * 7
};
var createSetCookieValue = (cookieName, cookieValue, options) => {
  const c = [`${cookieName}=${cookieValue}`];
  if (typeof options.domain === "string") {
    c.push(`Domain=${options.domain}`);
  }
  if (typeof options.maxAge === "number") {
    c.push(`Max-Age=${options.maxAge}`);
  } else if (Array.isArray(options.maxAge)) {
    c.push(`Max-Age=${options.maxAge[0] * UNIT[options.maxAge[1]]}`);
  } else if (typeof options.expires === "number" || typeof options.expires == "string") {
    c.push(`Expires=${options.expires}`);
  } else if (options.expires instanceof Date) {
    c.push(`Expires=${options.expires.toUTCString()}`);
  }
  if (options.httpOnly) {
    c.push("HttpOnly");
  }
  if (typeof options.path === "string") {
    c.push(`Path=${options.path}`);
  }
  if (options.sameSite && SAMESITE[options.sameSite]) {
    c.push(`SameSite=${SAMESITE[options.sameSite]}`);
  }
  if (options.secure) {
    c.push("Secure");
  }
  return c.join("; ");
};
var parseCookieString = (cookieString) => {
  const cookie = {};
  if (typeof cookieString === "string" && cookieString !== "") {
    const cookieSegments = cookieString.split(";");
    for (const cookieSegment of cookieSegments) {
      const cookieSplit = cookieSegment.split("=");
      if (cookieSplit.length > 1) {
        const cookieName = decodeURIComponent(cookieSplit[0].trim());
        const cookieValue = decodeURIComponent(cookieSplit[1].trim());
        cookie[cookieName] = cookieValue;
      }
    }
  }
  return cookie;
};
var REQ_COOKIE = Symbol("request-cookies");
var RES_COOKIE = Symbol("response-cookies");
var _a;
var Cookie = class {
  constructor(cookieString) {
    this[_a] = {};
    this[REQ_COOKIE] = parseCookieString(cookieString);
  }
  get(cookieName) {
    const value = this[REQ_COOKIE][cookieName];
    if (!value) {
      return null;
    }
    return {
      value,
      json() {
        return JSON.parse(value);
      },
      number() {
        return Number(value);
      }
    };
  }
  has(cookieName) {
    return !!this[REQ_COOKIE][cookieName];
  }
  set(cookieName, cookieValue, options = {}) {
    const resolvedValue = typeof cookieValue === "string" ? cookieValue : encodeURIComponent(JSON.stringify(cookieValue));
    this[RES_COOKIE][cookieName] = createSetCookieValue(cookieName, resolvedValue, options);
  }
  delete(name, options) {
    this.set(name, "deleted", { ...options, expires: new Date(0) });
  }
  headers() {
    return Object.values(this[RES_COOKIE]);
  }
};
REQ_COOKIE, _a = RES_COOKIE;

// packages/qwik-city/middleware/request-handler/headers.ts
var HEADERS = Symbol("headers");
var _a2;
var HeadersPolyfill = class {
  constructor() {
    this[_a2] = {};
  }
  [(_a2 = HEADERS, Symbol.iterator)]() {
    return this.entries();
  }
  *keys() {
    for (const name of Object.keys(this[HEADERS])) {
      yield name;
    }
  }
  *values() {
    for (const value of Object.values(this[HEADERS])) {
      yield value;
    }
  }
  *entries() {
    for (const name of Object.keys(this[HEADERS])) {
      yield [name, this.get(name)];
    }
  }
  get(name) {
    return this[HEADERS][normalizeHeaderName(name)] || null;
  }
  set(name, value) {
    const normalizedName = normalizeHeaderName(name);
    this[HEADERS][normalizedName] = typeof value !== "string" ? String(value) : value;
  }
  append(name, value) {
    const normalizedName = normalizeHeaderName(name);
    const resolvedValue = this.has(normalizedName) ? `${this.get(normalizedName)}, ${value}` : value;
    this.set(name, resolvedValue);
  }
  delete(name) {
    if (!this.has(name)) {
      return;
    }
    const normalizedName = normalizeHeaderName(name);
    delete this[HEADERS][normalizedName];
  }
  all() {
    return this[HEADERS];
  }
  has(name) {
    return this[HEADERS].hasOwnProperty(normalizeHeaderName(name));
  }
  forEach(callback, thisArg) {
    for (const name in this[HEADERS]) {
      if (this[HEADERS].hasOwnProperty(name)) {
        callback.call(thisArg, this[HEADERS][name], name, this);
      }
    }
  }
};
var HEADERS_INVALID_CHARACTERS = /[^a-z0-9\-#$%&'*+.^_`|~]/i;
function normalizeHeaderName(name) {
  if (typeof name !== "string") {
    name = String(name);
  }
  if (HEADERS_INVALID_CHARACTERS.test(name) || name.trim() === "") {
    throw new TypeError("Invalid character in header field name");
  }
  return name.toLowerCase();
}

// packages/qwik-city/middleware/request-handler/error-handler.ts
function getErrorHtml(status, e) {
  let message = "Server Error";
  let stack = void 0;
  if (e != null) {
    if (typeof e === "object") {
      if (typeof e.message === "string") {
        message = e.message;
      }
      if (e.stack != null) {
        stack = String(e.stack);
      }
    } else {
      message = String(e);
    }
  }
  return minimalHtmlResponse(status, message, stack);
}
function minimalHtmlResponse(status, message, stack) {
  const width = typeof message === "string" ? "600px" : "300px";
  const color = status >= 500 ? COLOR_500 : COLOR_400;
  if (status < 500) {
    stack = "";
  }
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta http-equiv="Status" content="${status}"/>
  <title>${status} ${message}</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    body { color: ${color}; background-color: #fafafa; padding: 30px; font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Roboto, sans-serif; }
    p { max-width: ${width}; margin: 60px auto 30px auto; background: white; border-radius: 4px; box-shadow: 0px 0px 50px -20px ${color}; overflow: hidden; }
    strong { display: inline-block; padding: 15px; background: ${color}; color: white; }
    span { display: inline-block; padding: 15px; }
    pre { max-width: 580px; margin: 0 auto; }
  </style>
</head>
<body>
  <p><strong>${status}</strong> <span>${message}</span></p>${stack ? `
  <pre><code>${stack}</code></pre>` : ``}
</body>
</html>`;
}
var COLOR_400 = "#006ce9";
var COLOR_500 = "#713fc2";

// packages/qwik-city/middleware/request-handler/user-response.ts
var QDATA_JSON = "/q-data.json";
var QDATA_JSON_LEN = QDATA_JSON.length;

// packages/qwik-city/adaptors/shared/vite/not-found-paths.ts
async function createNotFoundPathsModule(clientOutDir, basePathname2, routes, format) {
  const notFounds = (await Promise.all(
    routes.filter((r) => r.pathname.endsWith("404.html")).map(async (r) => {
      const baselessPath = r.pathname.slice(basePathname2.length);
      const filePath = (0, import_node_path3.join)(clientOutDir, baselessPath);
      const html = await import_node_fs2.default.promises.readFile(filePath, "utf-8");
      const pathname = r.pathname.replace("404.html", "");
      return [pathname, html];
    }).filter((r) => !!r)
  )).sort((a, b) => {
    if (a[0].length > b[0].length)
      return -1;
    if (a[0].length < b[0].length)
      return 1;
    if (a[0] < b[0])
      return -1;
    if (a[0] > b[0])
      return 1;
    return 0;
  });
  if (!notFounds.some((r) => r[0] === basePathname2)) {
    const html = getErrorHtml(404, "Resource Not Found");
    notFounds.push([basePathname2, html]);
  }
  const c = [];
  c.push(`const notFounds = ${JSON.stringify(notFounds, null, 2)};`);
  c.push(`function getNotFound(p) {`);
  c.push(`  for (const r of notFounds) {`);
  c.push(`    if (p.startsWith(r[0])) {`);
  c.push(`      return r[1];`);
  c.push(`    }`);
  c.push(`  }`);
  c.push(`  return "Resource Not Found";`);
  c.push(`}`);
  if (format === "cjs") {
    c.push("module.exports = { getNotFound: getNotFound };");
  } else {
    c.push("export default { getNotFound };");
  }
  return c.join("\n");
}

// packages/qwik-city/adaptors/shared/vite/index.ts
function viteAdaptor(opts) {
  let qwikCityPlugin = null;
  let qwikVitePlugin = null;
  let serverOutDir = null;
  let renderModulePath = null;
  let qwikCityPlanModulePath = null;
  let isSsrBuild = false;
  let format = "esm";
  const plugin = {
    name: `vite-plugin-qwik-city-${opts.name}`,
    enforce: "post",
    apply: "build",
    config(config) {
      if (typeof opts.config === "function") {
        return opts.config(config);
      }
    },
    configResolved(config) {
      var _a3, _b, _c, _d;
      isSsrBuild = !!config.build.ssr;
      if (isSsrBuild) {
        qwikCityPlugin = config.plugins.find(
          (p) => p.name === "vite-plugin-qwik-city"
        );
        if (!qwikCityPlugin) {
          throw new Error("Missing vite-plugin-qwik-city");
        }
        qwikVitePlugin = config.plugins.find(
          (p) => p.name === "vite-plugin-qwik"
        );
        if (!qwikVitePlugin) {
          throw new Error("Missing vite-plugin-qwik");
        }
        serverOutDir = config.build.outDir;
        if (((_a3 = config.build) == null ? void 0 : _a3.ssr) !== true) {
          throw new Error(
            `"build.ssr" must be set to "true" in order to use the "${opts.name}" adaptor.`
          );
        }
        if (!((_c = (_b = config.build) == null ? void 0 : _b.rollupOptions) == null ? void 0 : _c.input)) {
          throw new Error(
            `"build.rollupOptions.input" must be set in order to use the "${opts.name}" adaptor.`
          );
        }
        if (((_d = config.ssr) == null ? void 0 : _d.format) === "cjs") {
          format = "cjs";
        }
      }
    },
    resolveId(id) {
      if (id === STATIC_PATHS_ID) {
        return {
          id: "./" + RESOLVED_STATIC_PATHS_ID,
          external: true
        };
      }
      if (id === NOT_FOUND_PATHS_ID) {
        return {
          id: "./" + RESOLVED_NOT_FOUND_PATHS_ID,
          external: true
        };
      }
    },
    generateBundle(_, bundles) {
      if (isSsrBuild) {
        for (const fileName in bundles) {
          const chunk = bundles[fileName];
          if (chunk.type === "chunk" && chunk.isEntry) {
            if (chunk.name === "entry.ssr") {
              renderModulePath = (0, import_node_path4.join)(serverOutDir, fileName);
            } else if (chunk.name === "@qwik-city-plan") {
              qwikCityPlanModulePath = (0, import_node_path4.join)(serverOutDir, fileName);
            }
          }
        }
        if (!renderModulePath) {
          throw new Error(
            'Unable to find "entry.ssr" entry point. Did you forget to add it to "build.rollupOptions.input"?'
          );
        }
        if (!qwikCityPlanModulePath) {
          throw new Error(
            'Unable to find "@qwik-city-plan" entry point. Did you forget to add it to "build.rollupOptions.input"?'
          );
        }
      }
    },
    async closeBundle() {
      if (isSsrBuild && serverOutDir && (qwikCityPlugin == null ? void 0 : qwikCityPlugin.api) && (qwikVitePlugin == null ? void 0 : qwikVitePlugin.api)) {
        const serverPackageJsonPath = (0, import_node_path4.join)(serverOutDir, "package.json");
        const serverPackageJsonCode = `{"type":"module"}`;
        await import_node_fs3.default.promises.mkdir(serverOutDir, { recursive: true });
        await import_node_fs3.default.promises.writeFile(serverPackageJsonPath, serverPackageJsonCode);
        const staticPaths = opts.staticPaths || [];
        const routes = qwikCityPlugin.api.getRoutes();
        const basePathname2 = qwikCityPlugin.api.getBasePathname();
        const clientOutDir = qwikVitePlugin.api.getClientOutDir();
        let staticGenerateResult = null;
        if (opts.staticGenerate && renderModulePath && qwikCityPlanModulePath) {
          let origin = opts.origin;
          if (!origin) {
            origin = `https://yoursite.qwik.builder.io`;
          }
          if (origin.length > 0 && !origin.startsWith("https://") && !origin.startsWith("http://")) {
            origin = `https://${origin}`;
          }
          const staticGenerate = await import("../../../static/index.cjs");
          let generateOpts = {
            basePathname: basePathname2,
            outDir: clientOutDir,
            origin,
            renderModulePath,
            qwikCityPlanModulePath
          };
          if (opts.staticGenerate && typeof opts.staticGenerate === "object") {
            generateOpts = {
              ...generateOpts,
              ...opts.staticGenerate
            };
          }
          staticGenerateResult = await staticGenerate.generate(generateOpts);
          if (staticGenerateResult.errors > 0) {
            this.error(
              `Error while runnning SSG from "${opts.name}" adaptor. At least one path failed to render.`
            );
          }
          staticPaths.push(...staticGenerateResult.staticPaths);
        }
        const staticPathsPromise = createStaticPathsModule(
          clientOutDir,
          basePathname2,
          staticPaths,
          format
        );
        const notFoundPathsPromise = createNotFoundPathsModule(
          clientOutDir,
          basePathname2,
          routes,
          format
        );
        await Promise.all([
          import_node_fs3.default.promises.writeFile(
            (0, import_node_path4.join)(serverOutDir, RESOLVED_STATIC_PATHS_ID),
            await staticPathsPromise
          ),
          import_node_fs3.default.promises.writeFile(
            (0, import_node_path4.join)(serverOutDir, RESOLVED_NOT_FOUND_PATHS_ID),
            await notFoundPathsPromise
          )
        ]);
        if (typeof opts.generate === "function") {
          await opts.generate({
            serverOutDir,
            clientOutDir,
            basePathname: basePathname2,
            routes,
            warn: (message) => this.warn(message),
            error: (message) => this.error(message)
          });
        }
      }
    }
  };
  return plugin;
}
function getParentDir(startDir, dirName) {
  const root = (0, import_node_path4.resolve)("/");
  let dir = startDir;
  for (let i = 0; i < 20; i++) {
    dir = (0, import_node_path4.dirname)(dir);
    if ((0, import_node_path4.basename)(dir) === dirName) {
      return dir;
    }
    if (dir === root) {
      break;
    }
  }
  throw new Error(`Unable to find "${dirName}" directory from "${startDir}"`);
}
var STATIC_PATHS_ID = "@qwik-city-static-paths";
var RESOLVED_STATIC_PATHS_ID = `${STATIC_PATHS_ID}.js`;
var NOT_FOUND_PATHS_ID = "@qwik-city-not-found-paths";
var RESOLVED_NOT_FOUND_PATHS_ID = `${NOT_FOUND_PATHS_ID}.js`;

// packages/qwik-city/adaptors/netlify-edge/vite/index.ts
var import_node_fs4 = __toESM(require("fs"), 1);
var import_node_path5 = require("path");

// packages/qwik-city/runtime/src/library/qwik-city-plan.ts
var basePathname = "/";

// packages/qwik-city/adaptors/netlify-edge/vite/index.ts
function netifyEdgeAdaptor(opts = {}) {
  var _a3;
  return viteAdaptor({
    name: "netlify-edge",
    origin: ((_a3 = process == null ? void 0 : process.env) == null ? void 0 : _a3.URL) || "https://yoursitename.netlify.app",
    staticGenerate: opts.staticGenerate,
    staticPaths: opts.staticPaths,
    config(config) {
      var _a4;
      const outDir = ((_a4 = config.build) == null ? void 0 : _a4.outDir) || ".netlify/edge-functions/entry.netlify-edge";
      return {
        ssr: {
          target: "webworker",
          noExternal: true
        },
        build: {
          ssr: true,
          outDir,
          rollupOptions: {
            output: {
              format: "es",
              hoistTransitiveImports: false
            }
          }
        },
        publicDir: false
      };
    },
    async generate({ serverOutDir }) {
      if (opts.functionRoutes !== false) {
        const netlifyEdgeManifest = {
          functions: [
            {
              path: basePathname + "*",
              function: "entry.netlify-edge"
            }
          ],
          version: 1
        };
        const netlifyEdgeFnsDir = getParentDir(serverOutDir, "edge-functions");
        await import_node_fs4.default.promises.writeFile(
          (0, import_node_path5.join)(netlifyEdgeFnsDir, "manifest.json"),
          JSON.stringify(netlifyEdgeManifest, null, 2)
        );
      }
    }
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  netifyEdgeAdaptor
});
