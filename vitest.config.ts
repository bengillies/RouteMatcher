import { defineConfig } from "vitest/config";
import { playwright } from "@vitest/browser-playwright";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    setupFiles: "./tests/setup.ts",
    browser: {
      enabled: true,
      provider: playwright({
        launchOptions: {
          headless: true
        }
      }),
      instances: [
        {
          browser: "chromium"
        }
      ]
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100
      }
    }
  }
});
