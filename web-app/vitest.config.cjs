const path = require("path");

module.exports = {
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["dotenv/config"],
    include: ["**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/cypress/**",
      "**/.{idea,git,cache,output,temp}/**",
    ],
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: [
        "coverage/**",
        "dist/**",
        "**/[.]**",
        "packages/*/test{,s}/**",
        "**/*.d.ts",
        "cypress/**",
        "test{,s}/**",
        "test{,-*}.{js,cjs,mjs,ts,tsx,jsx}",
        "**/*{.,-}test.{js,cjs,mjs,ts,tsx,jsx}",
        "**/*{.,-}spec.{js,cjs,mjs,ts,tsx,jsx}",
        "**/__tests__/**",
        "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc}.config.*",
        "**/.{eslint,mocha,prettier}rc.{js,cjs,yml}",
      ],
    },
    alias: {
      "@": path.resolve(__dirname),
      "@backend": path.resolve(__dirname, "backend"),
      "@prisma-client": path.resolve(
        __dirname,
        "backend/config/prismaClient.js"
      ),
      "@backend-server": path.resolve(__dirname, "backend/server.js"),
      "@frontend": path.resolve(__dirname, "frontend"),
    },
  },
};
