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
var import_node_fs = __toESM(require("fs"), 1);
var import_node_path = require("path");
function viteAdaptor(opts) {
  let qwikCityPlugin = null;
  let qwikVitePlugin = null;
  let serverOutDir = null;
  let renderModulePath = null;
  let qwikCityPlanModulePath = null;
  let isSsrBuild = false;
  const plugin = {
    name: `vite-plugin-qwik-city-${opts.name}`,
    enforce: "post",
    apply: "build",
    config(config) {
      if (typeof opts.config === "function") {
        return opts.config(config);
      }
    },
    configResolved({ build, plugins }) {
      var _a;
      isSsrBuild = !!build.ssr;
      if (isSsrBuild) {
        qwikCityPlugin = plugins.find((p) => p.name === "vite-plugin-qwik-city");
        if (!qwikCityPlugin) {
          throw new Error("Missing vite-plugin-qwik-city");
        }
        qwikVitePlugin = plugins.find((p) => p.name === "vite-plugin-qwik");
        if (!qwikVitePlugin) {
          throw new Error("Missing vite-plugin-qwik");
        }
        serverOutDir = build.outDir;
        if ((build == null ? void 0 : build.ssr) !== true) {
          throw new Error(
            `"build.ssr" must be set to "true" in order to use the "${opts.name}" adaptor.`
          );
        }
        if (!((_a = build == null ? void 0 : build.rollupOptions) == null ? void 0 : _a.input)) {
          throw new Error(
            `"build.rollupOptions.input" must be set in order to use the "${opts.name}" adaptor.`
          );
        }
      }
    },
    generateBundle(_, bundles) {
      if (isSsrBuild) {
        for (const fileName in bundles) {
          const chunk = bundles[fileName];
          if (chunk.type === "chunk" && chunk.isEntry) {
            if (chunk.name === "entry.ssr") {
              renderModulePath = (0, import_node_path.join)(serverOutDir, fileName);
            } else if (chunk.name === "@qwik-city-plan") {
              qwikCityPlanModulePath = (0, import_node_path.join)(serverOutDir, fileName);
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
        const serverPackageJsonPath = (0, import_node_path.join)(serverOutDir, "package.json");
        const serverPackageJsonCode = `{"type":"module"}`;
        await import_node_fs.default.promises.mkdir(serverOutDir, { recursive: true });
        await import_node_fs.default.promises.writeFile(serverPackageJsonPath, serverPackageJsonCode);
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
        }
        if (typeof opts.generateRoutes === "function") {
          await opts.generateRoutes({
            serverOutDir,
            clientOutDir: qwikVitePlugin.api.getClientOutDir(),
            routes: qwikCityPlugin.api.getRoutes(),
            staticPaths: (staticGenerateResult == null ? void 0 : staticGenerateResult.staticPaths) ?? [],
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
  const root = (0, import_node_path.resolve)("/");
  let dir = startDir;
  for (let i = 0; i < 20; i++) {
    dir = (0, import_node_path.dirname)(dir);
    if ((0, import_node_path.basename)(dir) === dirName) {
      return dir;
    }
    if (dir === root) {
      break;
    }
  }
  throw new Error(`Unable to find "${dirName}" directory from "${startDir}"`);
}

// packages/qwik-city/adaptors/netlify-edge/vite/index.ts
var import_node_fs2 = __toESM(require("fs"), 1);
var import_node_path2 = require("path");
function netifyEdgeAdaptor(opts = {}) {
  var _a;
  return viteAdaptor({
    name: "netlify-edge",
    origin: ((_a = process == null ? void 0 : process.env) == null ? void 0 : _a.URL) || "https://yoursitename.netlify.app",
    staticGenerate: opts.staticGenerate,
    config(config) {
      var _a2;
      const outDir = ((_a2 = config.build) == null ? void 0 : _a2.outDir) || ".netlify/edge-functions/entry.netlify-edge";
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
    async generateRoutes({ serverOutDir, routes, staticPaths }) {
      if (opts.functionRoutes !== false) {
        const ssrRoutes = routes.filter((r) => !staticPaths.includes(r.pathname));
        const netlifyEdgeManifest = {
          functions: ssrRoutes.map((r) => {
            if (r.paramNames.length > 0) {
              return {
                pattern: r.pattern.toString().replace(/^\//, "").replace(/\/$/, ""),
                function: "entry.netlify-edge"
              };
            }
            return {
              path: r.pathname,
              function: "entry.netlify-edge"
            };
          }),
          version: 1
        };
        const netlifyEdgeFnsDir = getParentDir(serverOutDir, "edge-functions");
        await import_node_fs2.default.promises.writeFile(
          (0, import_node_path2.join)(netlifyEdgeFnsDir, "manifest.json"),
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
