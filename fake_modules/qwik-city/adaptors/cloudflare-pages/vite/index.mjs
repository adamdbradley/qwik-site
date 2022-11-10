// packages/qwik-city/adaptors/cloudflare-pages/vite/index.ts
import { join as join2 } from "path";
import fs2 from "fs";

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

// packages/qwik-city/adaptors/cloudflare-pages/vite/index.ts
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
      const clientFiles = await fs2.promises.readdir(clientOutDir, { withFileTypes: true });
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
      if (!hasRoutesJson) {
        staticPaths.sort();
        staticPaths.sort((a, b) => a.length - b.length);
        exclude.push(...staticPaths);
        const routesJsonPath = join2(clientOutDir, "_routes.json");
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
        await fs2.promises.writeFile(routesJsonPath, JSON.stringify(routesJson, void 0, 2));
      }
    }
  });
}
var isNotNullable = (v) => {
  return v != null;
};
export {
  cloudflarePagesAdaptor
};
