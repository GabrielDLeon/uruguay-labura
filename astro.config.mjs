// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import pagefind from "astro-pagefind";
import mdx from "@astrojs/mdx";
import { prebuildJobsPlugin } from "./vite/plugins/prebuild-jobs.mjs";

export default defineConfig({
  site: "https://uruguaylaburos.uy",
  fonts: [
    {
      provider: fontProviders.fontsource(),
      name: "Manrope",
      cssVariable: "--font-manrope",
      weights: [400, 500, 600, 700, 800],
      styles: ["normal"],
    },
    {
      provider: fontProviders.fontsource(),
      name: "Playfair Display",
      cssVariable: "--font-playfair",
      weights: [400, 500, 600, 700, 800, 900],
      styles: ["normal", "italic"],
    },
  ],
  integrations: [react(), sitemap(), icon(), pagefind(), mdx()],
  vite: {
    plugins: [tailwindcss(), prebuildJobsPlugin()],
    optimizeDeps: {
      include: ["react", "react-dom", "react-dom/client"],
    },

  },
});
