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

// packages/qwik-city/adaptors/cloudflare-pages/vite/index.ts
var vite_exports = {};
__export(vite_exports, {
  cloudflarePagesAdaptor: () => cloudflarePagesAdaptor
});
module.exports = __toCommonJS(vite_exports);

// packages/qwik-city/adaptors/shared/vite/index.ts
var import_node_fs2 = __toESM(require("fs"), 1);
var import_node_path3 = require("path");

// packages/qwik-city/adaptors/shared/vite/server-utils.ts
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

// packages/qwik-city/adaptors/shared/vite/server-utils.ts
async function createStaticPathsModule(publicDir, basePathname, staticPaths, routes, format) {
  const staticFilePaths = await getStaticFilePaths(publicDir);
  const staticPathSet = new Set(staticPaths);
  staticFilePaths.forEach((filePath) => {
    const relFilePath = normalizePath((0, import_node_path2.relative)(publicDir, filePath));
    const pathname = basePathname + encodeURIComponent(relFilePath);
    staticPathSet.add(pathname);
  });
  for (const route of routes) {
    const { pathname } = route;
    if (pathname.endsWith("service-worker.js")) {
      staticPathSet.add(pathname);
    }
  }
  staticPathSet.add(basePathname + "sitemap.xml");
  const assetsPath = basePathname + "assets/";
  const baseBuildPath = basePathname + "build/";
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
    c.push("export { isStaticPath };");
  }
  return c.join("\n");
}
async function getStaticFilePaths(publicDir) {
  const staticPaths = [];
  const loadDir = async (dir) => {
    const itemNames = await import_node_fs.default.promises.readdir(dir);
    await Promise.all(
      itemNames.map(async (itemName) => {
        const itemPath = (0, import_node_path2.join)(dir, itemName);
        const stat = await import_node_fs.default.promises.stat(itemPath);
        if (stat.isDirectory()) {
          await loadDir(itemPath);
        } else if (stat.isFile()) {
          staticPaths.push(itemPath);
        }
      })
    );
  };
  await loadDir(publicDir);
  return staticPaths;
}

// packages/qwik-city/adaptors/shared/vite/index.ts
function viteAdaptor(opts) {
  let qwikCityPlugin = null;
  let qwikVitePlugin = null;
  let serverOutDir = null;
  let renderModulePath = null;
  let publicDir = null;
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
      var _a, _b, _c, _d;
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
        if (((_a = config.build) == null ? void 0 : _a.ssr) !== true) {
          throw new Error(
            `"build.ssr" must be set to "true" in order to use the "${opts.name}" adaptor.`
          );
        }
        if (!((_c = (_b = config.build) == null ? void 0 : _b.rollupOptions) == null ? void 0 : _c.input)) {
          throw new Error(
            `"build.rollupOptions.input" must be set in order to use the "${opts.name}" adaptor.`
          );
        }
        publicDir = (0, import_node_path3.resolve)(config.root, config.publicDir || "public");
        if (((_d = config.ssr) == null ? void 0 : _d.format) === "cjs") {
          format = "cjs";
        }
      }
    },
    resolveId(id) {
      if (id === SERVER_UTILS_ID) {
        return {
          id: "./" + RESOLVED_SERVER_UTILS_ID,
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
              renderModulePath = (0, import_node_path3.join)(serverOutDir, fileName);
            } else if (chunk.name === "@qwik-city-plan") {
              qwikCityPlanModulePath = (0, import_node_path3.join)(serverOutDir, fileName);
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
      if (isSsrBuild && serverOutDir && (qwikCityPlugin == null ? void 0 : qwikCityPlugin.api) && (qwikVitePlugin == null ? void 0 : qwikVitePlugin.api) && publicDir) {
        const serverPackageJsonPath = (0, import_node_path3.join)(serverOutDir, "package.json");
        const serverPackageJsonCode = `{"type":"module"}`;
        await import_node_fs2.default.promises.mkdir(serverOutDir, { recursive: true });
        await import_node_fs2.default.promises.writeFile(serverPackageJsonPath, serverPackageJsonCode);
        const staticPaths = opts.additionalStaticPaths || [];
        const routes = qwikCityPlugin.api.getRoutes();
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
            basePathname: qwikCityPlugin.api.getBasePathname(),
            outDir: qwikVitePlugin.api.getClientOutDir(),
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
        if (typeof opts.generateRoutes === "function") {
          await opts.generateRoutes({
            serverOutDir,
            clientOutDir: qwikVitePlugin.api.getClientOutDir(),
            routes,
            staticPaths: [],
            warn: (message) => this.warn(message),
            error: (message) => this.error(message)
          });
        }
        const staticPathModule = await createStaticPathsModule(
          publicDir,
          qwikCityPlugin.api.getBasePathname(),
          staticPaths,
          routes,
          format
        );
        await import_node_fs2.default.promises.writeFile((0, import_node_path3.join)(serverOutDir, RESOLVED_SERVER_UTILS_ID), staticPathModule);
      }
    }
  };
  return plugin;
}
var SERVER_UTILS_ID = "@qwik-city-server-utils";
var RESOLVED_SERVER_UTILS_ID = "qwik-city-server-utils.js";

// packages/qwik-city/adaptors/cloudflare-pages/vite/index.ts
var import_node_fs3 = __toESM(require("fs"), 1);
var import_node_path4 = require("path");
function cloudflarePagesAdaptor(opts = {}) {
  var _a;
  return viteAdaptor({
    name: "cloudflare-pages",
    origin: ((_a = process == null ? void 0 : process.env) == null ? void 0 : _a.CF_PAGES_URL) || "https://your.cloudflare.pages.dev",
    staticGenerate: opts.staticGenerate,
    config() {
      return {
        ssr: {
          target: "webworker",
          noExternal: true
        },
        build: {
          ssr: true,
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
    async generateRoutes({ clientOutDir, staticPaths, warn }) {
      const clientFiles = await import_node_fs3.default.promises.readdir(clientOutDir, { withFileTypes: true });
      const exclude = clientFiles.map((f) => {
        if (f.name.startsWith(".")) {
          return null;
        }
        if (f.isDirectory()) {
          return `/${f.name}/*`;
        } else if (f.isFile()) {
          return `/${f.name}`;
        }
        return null;
      }).filter(isNotNullable);
      const include = ["/*"];
      const hasRoutesJson = exclude.includes("/_routes.json");
      if (!hasRoutesJson && opts.functionRoutes !== false) {
        staticPaths.sort();
        staticPaths.sort((a, b) => a.length - b.length);
        exclude.push(...staticPaths);
        const routesJsonPath = (0, import_node_path4.join)(clientOutDir, "_routes.json");
        const total = include.length + exclude.length;
        const maxRules = 100;
        if (total > maxRules) {
          const toRemove = total - maxRules;
          const removed = exclude.splice(-toRemove, toRemove);
          warn(
            `Cloudflare Pages does not support more than 100 static rules. Qwik SSG generated ${total}, the following rules were excluded: ${JSON.stringify(
              removed,
              void 0,
              2
            )}`
          );
          warn('Please manually create a routes config in the "public/_routes.json" directory.');
        }
        const routesJson = {
          version: 1,
          include,
          exclude
        };
        await import_node_fs3.default.promises.writeFile(routesJsonPath, JSON.stringify(routesJson, void 0, 2));
      }
    }
  });
}
var isNotNullable = (v) => {
  return v != null;
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  cloudflarePagesAdaptor
});