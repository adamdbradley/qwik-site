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

// packages/qwik-city/adaptors/netlify-edge/netlify-manifest.ts
function generateNetlifyEdgeManifest(routes, staticPaths) {
  const ssrRoutes = routes.filter((r) => !staticPaths.includes(r.pathname));
  const m = {
    functions: ssrRoutes.map((r) => {
      if (r.paramNames.length > 0) {
        return {
          pattern: r.pattern.toString(),
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
  return m;
}

// packages/qwik-city/adaptors/netlify-edge/vite/index.ts
var import_node_path = require("path");
var import_node_fs = __toESM(require("fs"), 1);
function netifyEdgeAdaptor(opts = {}) {
  let qwikCityPlugin = null;
  let qwikVitePlugin = null;
  let serverOutDir = null;
  let renderModulePath = null;
  let qwikCityPlanModulePath = null;
  async function generateBundles() {
    var _a;
    const qwikVitePluginApi = qwikVitePlugin.api;
    const clientOutDir = qwikVitePluginApi.getClientOutDir();
    const serverPackageJsonPath = (0, import_node_path.join)(serverOutDir, "package.json");
    const serverPackageJsonCode = `{"type":"module"}`;
    await import_node_fs.default.promises.mkdir(serverOutDir, { recursive: true });
    await import_node_fs.default.promises.writeFile(serverPackageJsonPath, serverPackageJsonCode);
    const staticPaths = [];
    if (opts.staticGenerate && renderModulePath && qwikCityPlanModulePath) {
      const staticGenerate = await import("../../../static/index.cjs");
      let generateOpts = {
        outDir: clientOutDir,
        origin: ((_a = process == null ? void 0 : process.env) == null ? void 0 : _a.URL) || "https://yoursitename.netlify.app",
        renderModulePath,
        qwikCityPlanModulePath,
        basePathname: qwikCityPlugin.api.getBasePathname()
      };
      if (typeof opts.staticGenerate === "object") {
        generateOpts = {
          ...generateOpts,
          ...opts.staticGenerate
        };
      }
      const result = await staticGenerate.generate(generateOpts);
      staticPaths.push(...result.staticPaths);
    }
    const routes = qwikCityPlugin.api.getRoutes();
    const netlifyManifest = generateNetlifyEdgeManifest(routes, staticPaths);
    const edgeFnsDir = getEdgeFunctionsDir(serverOutDir);
    const netlifyManifestPath = (0, import_node_path.join)(edgeFnsDir, "manifest.json");
    await import_node_fs.default.promises.writeFile(netlifyManifestPath, JSON.stringify(netlifyManifest, null, 2));
  }
  const plugin = {
    name: "vite-plugin-qwik-city-netlify-edge",
    enforce: "post",
    apply: "build",
    config(config) {
      var _a;
      const outDir = ((_a = config.build) == null ? void 0 : _a.outDir) || ".netlify/edge-functions/entry.netlify-edge";
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
              format: "es"
            }
          }
        },
        publicDir: false
      };
    },
    configResolved({ build, plugins }) {
      var _a;
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
          '"build.ssr" must be set to `true` in order to use the Netlify Edge adaptor.'
        );
      }
      if (!((_a = build == null ? void 0 : build.rollupOptions) == null ? void 0 : _a.input)) {
        throw new Error(
          '"build.rollupOptions.input" must be set in order to use the Netlify Edge adaptor.'
        );
      }
    },
    generateBundle(_, bundles) {
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
    },
    async closeBundle() {
      await generateBundles();
    }
  };
  return plugin;
}
function getEdgeFunctionsDir(serverOutDir) {
  const root = (0, import_node_path.resolve)("/");
  let dir = serverOutDir;
  for (let i = 0; i < 20; i++) {
    dir = (0, import_node_path.dirname)(dir);
    if ((0, import_node_path.basename)(dir) === "edge-functions") {
      return dir;
    }
    if (dir === root) {
      break;
    }
  }
  throw new Error(`Unable to find edge functions dir from: ${serverOutDir}`);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  netifyEdgeAdaptor
});
