import { defineConfig } from "cypress";

export default defineConfig({
  video: false,
  e2e: {
    setupNodeEvents(on, config) {
      // modify config values here
      config.baseUrl =
        process.env.WEB_APP_FRONTEND_URL ||
        config.env.WEB_APP_FRONTEND_URL ||
        "http://localhost:5174";
      config.env.VITE_API_URL =
        process.env.VITE_API_URL ||
        config.env.VITE_API_URL ||
        "http://localhost:5000";
      config.env.MAILGUN_DOMAIN =
        process.env.MAILGUN_DOMAIN || config.env.MAILGUN_DOMAIN;
      config.env.MAILGUN_CINEPHORIA_API_KEY =
        process.env.MAILGUN_CINEPHORIA_API_KEY ||
        config.env.MAILGUN_CINEPHORIA_API_KEY;

      return config;
    },
  },
});
