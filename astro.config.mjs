// @ts-check
import { defineConfig } from "astro/config";
import node from "@astrojs/node";

// Configuration Astro — Maison & Monde
export default defineConfig({
  output: "server",

  adapter: node({
    mode: "standalone",
  }),

  devToolbar: {
    enabled: false,
  },
});
