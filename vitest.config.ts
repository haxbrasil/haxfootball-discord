import { defineConfig } from "vitest/config";
import { babelMacrosPlugin } from "./build/babel-macros-plugin";

export default defineConfig({
  plugins: [babelMacrosPlugin()],
  resolve: {
    alias: {
      "@i18n": new URL("./src/i18n.ts", import.meta.url).pathname
    }
  },
  test: {
    exclude: ["dist/**", "node_modules/**"]
  }
});
