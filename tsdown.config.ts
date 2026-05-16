import { defineConfig } from "tsdown";
import { babelMacrosPlugin } from "./build/babel-macros-plugin.ts";

export default defineConfig({
  alias: {
    "@i18n": "./src/i18n.ts"
  },
  entry: ["src/index.ts", "src/register-commands.ts"],
  clean: true,
  dts: true,
  format: "esm",
  plugins: [babelMacrosPlugin()]
});
