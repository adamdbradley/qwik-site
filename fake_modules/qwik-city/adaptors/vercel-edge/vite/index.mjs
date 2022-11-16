// packages/qwik-city/adaptors/shared/vite/index.ts
import fs2 from "fs";
import { basename as basename2, dirname as dirname2, join as join2, resolve } from "path";

// packages/qwik-city/adaptors/shared/vite/static-paths.ts
import fs from "fs";
import { join, relative as relative2 } from "path";

// packages/qwik-city/utils/fs.ts
import { basename, dirname, normalize, relative } from "path";
function normalizePath(path) {
  path = normalize(path);
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
async function createStaticPathsModule(publicDir, basePathname, staticPaths, routes) {
  const staticFilePaths = await getStaticFilePaths(publicDir);
  const staticPathSet = new Set(staticPaths);
  staticFilePaths.forEach((filePath) => {
    const relFilePath = normalizePath(relative2(publicDir, filePath));
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
  c.push(`export default function isStaticPath(p) {`);
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
  return c.join("\n");
}
async function getStaticFilePaths(publicDir) {
  const staticPaths = [];
  const loadDir = async (dir) => {
    const itemNames = await fs.promises.readdir(dir);
    await Promise.all(
      itemNames.map(async (itemName) => {
        const itemPath = join(dir, itemName);
        const stat = await fs.promises.stat(itemPath);
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
      var _a, _b, _c;
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
        publicDir = resolve(config.root, config.publicDir || "public");
      }
    },
    resolveId(id) {
      if (id === STATIC_PATHS_ID) {
        return {
          id: "./" + RESOLVED_STATIC_PATHS_ID,
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
              renderModulePath = join2(serverOutDir, fileName);
            } else if (chunk.name === "@qwik-city-plan") {
              qwikCityPlanModulePath = join2(serverOutDir, fileName);
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
        const serverPackageJsonPath = join2(serverOutDir, "package.json");
        const serverPackageJsonCode = `{"type":"module"}`;
        await fs2.promises.mkdir(serverOutDir, { recursive: true });
        await fs2.promises.writeFile(serverPackageJsonPath, serverPackageJsonCode);
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
          routes
        );
        await fs2.promises.writeFile(join2(serverOutDir, RESOLVED_STATIC_PATHS_ID), staticPathModule);
      }
    }
  };
  return plugin;
}
function getParentDir(startDir, dirName) {
  const root = resolve("/");
  let dir = startDir;
  for (let i = 0; i < 20; i++) {
    dir = dirname2(dir);
    if (basename2(dir) === dirName) {
      return dir;
    }
    if (dir === root) {
      break;
    }
  }
  throw new Error(`Unable to find "${dirName}" directory from "${startDir}"`);
}
var STATIC_PATHS_ID = "@qwik-city-static-paths";
var RESOLVED_STATIC_PATHS_ID = "qwik-city-static-paths.mjs";

// packages/qwik-city/adaptors/vercel-edge/vite/index.ts
import fs3 from "fs";
import { join as join3 } from "path";
function vercelEdgeAdaptor(opts = {}) {
  var _a;
  return viteAdaptor({
    name: "vercel-edge",
    origin: ((_a = process == null ? void 0 : process.env) == null ? void 0 : _a.VERCEL_URL) || "https://yoursitename.vercel.app",
    staticGenerate: opts.staticGenerate,
    config(config) {
      var _a2;
      const outDir = ((_a2 = config.build) == null ? void 0 : _a2.outDir) || ".vercel/output/functions/_qwik-city.func";
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
    async generateRoutes({ clientOutDir, serverOutDir, routes, staticPaths }) {
      const vercelOutputDir = getParentDir(serverOutDir, "output");
      if (opts.outputConfig !== false) {
        const ssrRoutes = routes.filter((r) => !staticPaths.includes(r.pathname));
        const vercelOutputConfig = {
          routes: ssrRoutes.map((r) => {
            let src = r.pattern.toString().slice(1, -2).replace(/\\\//g, "/");
            if (src === "^/") {
              src = "^/?";
            }
            return {
              src,
              middlewarePath: "_qwik-city"
            };
          }),
          version: 3
        };
        await fs3.promises.writeFile(
          join3(vercelOutputDir, "config.json"),
          JSON.stringify(vercelOutputConfig, null, 2)
        );
      }
      const vcConfigPath = join3(serverOutDir, ".vc-config.json");
      const vcConfig = {
        runtime: "edge",
        entrypoint: opts.vcConfigEntryPoint || "entry.vercel-edge.js",
        envVarsInUse: opts.vcConfigEnvVarsInUse
      };
      await fs3.promises.writeFile(vcConfigPath, JSON.stringify(vcConfig, null, 2));
      const staticDir = join3(vercelOutputDir, "static");
      if (fs3.existsSync(staticDir)) {
        await fs3.promises.rm(staticDir, { recursive: true });
      }
      await fs3.promises.rename(clientOutDir, staticDir);
    }
  });
}
export {
  vercelEdgeAdaptor
};
