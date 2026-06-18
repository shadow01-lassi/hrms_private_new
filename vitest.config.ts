import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    testTimeout: 60000,
    alias: {
      "@": path.resolve(__dirname, "./frontend/src"),
      "lucide-react": path.resolve(__dirname, "./tests/lucide-react-mock.ts"),
    },
  },
});
