// @ts-check
import { defineConfig, fontProviders } from "astro/config";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

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
  ],
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
