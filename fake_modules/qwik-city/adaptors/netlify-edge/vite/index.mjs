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
import { basename, dirname, join, resolve } from "path";
import fs from "fs";
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
    const serverPackageJsonPath = join(serverOutDir, "package.json");
    const serverPackageJsonCode = `{"type":"module"}`;
    await fs.promises.mkdir(serverOutDir, { recursive: true });
    await fs.promises.writeFile(serverPackageJsonPath, serverPackageJsonCode);
    const staticPaths = [];
    if (opts.staticGenerate && renderModulePath && qwikCityPlanModulePath) {
      const staticGenerate = await import("../../../static/index.mjs");
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
    const netlifyManifestPath = join(edgeFnsDir, "manifest.json");
    await fs.promises.writeFile(netlifyManifestPath, JSON.stringify(netlifyManifest, null, 2));
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
            renderModulePath = join(serverOutDir, fileName);
          } else if (chunk.name === "@qwik-city-plan") {
            qwikCityPlanModulePath = join(serverOutDir, fileName);
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
  const root = resolve("/");
  let dir = serverOutDir;
  for (let i = 0; i < 20; i++) {
    dir = dirname(dir);
    if (basename(dir) === "edge-functions") {
      return dir;
    }
    if (dir === root) {
      break;
    }
  }
  throw new Error(`Unable to find edge functions dir from: ${serverOutDir}`);
}
export {
  netifyEdgeAdaptor
};
