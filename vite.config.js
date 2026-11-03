import { defineConfig } from "vite";

// Link previews (WhatsApp, iMessage, etc.) only load an image from a full URL.
// The GitHub workflow sets VITE_SITE_URL; on Vercel we fall back to the
// production domain, and finally to the known live address.
process.env.VITE_SITE_URL ||= process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "https://ritvik-weds-vineesha.vercel.app";
process.env.VITE_SITE_URL = process.env.VITE_SITE_URL.replace(/\/+$/, "");

// A relative base lets the same build work at a repo path on GitHub Pages
// (user.github.io/repo/) or at the root of a custom domain.
export default defineConfig({
  base: "./",
});
