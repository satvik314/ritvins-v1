import { defineConfig } from "vite";

// Filled in by the GitHub workflow so link previews get a full image URL.
process.env.VITE_SITE_URL ??= "";

// A relative base lets the same build work at a repo path on GitHub Pages
// (user.github.io/repo/) or at the root of a custom domain.
export default defineConfig({
  base: "./",
});
