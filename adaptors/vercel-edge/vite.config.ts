import { vercelEdgeAdaptor } from "../../fake_modules/qwik-city/adaptors/vercel-edge/vite/index.mjs";
import { extendConfig } from "@builder.io/qwik-city/vite";
import baseConfig from "../../vite.config";

export default extendConfig(baseConfig, () => {
  return {
    build: {
      ssr: true,
      rollupOptions: {
        input: ["src/entry.vercel-edge.tsx", "@qwik-city-plan"],
      },
      outDir: ".vercel/output/functions/qwik-city.func",
    },
    plugins: [
      vercelEdgeAdaptor({
        staticGenerate: true,
      }) as any,
    ],
  };
});
