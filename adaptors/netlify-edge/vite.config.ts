import { netifyEdgeAdaptor } from "@builder.io/qwik-city/adaptors/netlify-edge/vite";
import { extendConfig } from "@builder.io/qwik-city/vite";
import baseConfig from "../../vite.config";

export default extendConfig(baseConfig, () => {
  return {
    build: {
      ssr: true,
      rollupOptions: {
        input: ["src/entry.netlify-edge.tsx", "@qwik-city-plan"],
      },
      outDir: ".netlify/edge-functions/entry.netlify-edge",
      minify: false,
    },
    plugins: [
      netifyEdgeAdaptor({
        staticGenerate: true,
      }),
    ],
  };
});
