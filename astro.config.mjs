// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import pagefind from "astro-pagefind";
import mdx from "@astrojs/mdx";
import { prebuildJobsPlugin } from "./vite/plugins/prebuild-jobs.mjs";

export default defineConfig({
  site: "https://uruguaylaburos.uy",
  integrations: [react(), sitemap(), icon(), pagefind(), mdx()],
  vite: {
    plugins: [tailwindcss(), prebuildJobsPlugin()],
    optimizeDeps: {
      include: ["react", "react-dom", "react-dom/client"],
    },
  },
});
