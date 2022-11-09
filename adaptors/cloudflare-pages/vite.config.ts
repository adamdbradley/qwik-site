import { cloudflarePagesAdaptor } from "@builder.io/qwik-city/adaptors/cloudflare-pages/vite";
import { extendConfig } from "@builder.io/qwik-city/vite";
import path from "path";
import fs from "fs";
import baseConfig from "../../vite.config";

export default extendConfig(baseConfig, () => {
  let root = "";
  return {
    build: {
      ssr: true,
      rollupOptions: {
        input: ["src/entry.cloudflare-pages.tsx", "@qwik-city-plan"],
      },
    },
    plugins: [
      cloudflarePagesAdaptor({
        staticGenerate: true,
      }),
      {
        name: "cf-hack",
        enforce: "post",
        configResolved(config) {
          root = config.root;
          console.log("root", root);
        },
        async closeBundle() {
          return new Promise((resolve) => {
            setTimeout(() => {
              const routesPath = path.join(root, "dist", "_routes.json");
              console.log("closeBundle1", routesPath);
              const routes = JSON.parse(fs.readFileSync(routesPath, "utf8"));
              routes.include = ["/*"];
              routes.exclude = routes.exclude.filter((r) => {
                return r.startsWith("/");
              });
              fs.writeFileSync(routesPath, JSON.stringify(routes, null, 2));
              console.log("closeBundle routes", routes);
              resolve();
            }, 1000);
          });
        },
      },
    ],
  };
});
