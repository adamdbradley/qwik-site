// packages/qwik-city/adaptors/shared/vite/index.ts
import fs from "fs";
import { basename, dirname, join, resolve } from "path";
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
      }
    },
    async closeBundle() {
      if (isSsrBuild && serverOutDir && (qwikCityPlugin == null ? void 0 : qwikCityPlugin.api) && (qwikVitePlugin == null ? void 0 : qwikVitePlugin.api)) {
        const serverPackageJsonPath = join(serverOutDir, "package.json");
        const serverPackageJsonCode = `{"type":"module"}`;
        await fs.promises.mkdir(serverOutDir, { recursive: true });
        await fs.promises.writeFile(serverPackageJsonPath, serverPackageJsonCode);
        let staticGenerateResult = null;
        if (opts.staticGenerate && renderModulePath && qwikCityPlanModulePath) {
          let origin = opts.origin;
          if (!origin) {
            origin = `https://yoursite.qwik.builder.io`;
          }
          if (origin.length > 0 && !origin.startsWith("https://") && !origin.startsWith("http://")) {
            origin = `https://${origin}`;
          }
          const staticGenerate = await import("../../../static/index.mjs");
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
  const root = resolve("/");
  let dir = startDir;
  for (let i = 0; i < 20; i++) {
    dir = dirname(dir);
    if (basename(dir) === dirName) {
      return dir;
    }
    if (dir === root) {
      break;
    }
  }
  throw new Error(`Unable to find "${dirName}" directory from "${startDir}"`);
}

// packages/qwik-city/adaptors/netlify-edge/vite/index.ts
import fs2 from "fs";
import { join as join2 } from "path";
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
        const netlifyEdgeFnsDir = getParentDir(serverOutDir, "edge-functions");
        await fs2.promises.writeFile(
          join2(netlifyEdgeFnsDir, "manifest.json"),
          JSON.stringify(netlifyEdgeManifest, null, 2)
        );
      }
    }
  });
}
export {
  netifyEdgeAdaptor
};
