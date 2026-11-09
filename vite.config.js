import { defineConfig } from "vite";
import { resolve } from "node:path";

// Filled in by the GitHub workflow so link previews get a full image URL.
process.env.VITE_SITE_URL ??= "";

// A relative base lets the same build work at a repo path on GitHub Pages
// (user.github.io/repo/) or at the root of a custom domain.
export default defineConfig({
  base: "./",
  build: {
    rollupOptions: {
      // The invitation, plus the couple's replies page at /admin/.
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        admin: resolve(import.meta.dirname, "admin/index.html"),
      },
    },
  },
});
