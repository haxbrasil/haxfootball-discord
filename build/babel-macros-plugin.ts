import { transformAsync } from "@babel/core";

const sourcePattern = /\.[cm]?[jt]sx?$/;

export function babelMacrosPlugin() {
  return {
    name: "babel-macros",
    async transform(code: string, id: string) {
      if (!sourcePattern.test(id) || id.includes("node_modules")) {
        return null;
      }

      const result = await transformAsync(code, {
        babelrc: false,
        configFile: false,
        filename: id,
        plugins: ["macros"],
        presets: [
          [
            "@babel/preset-typescript",
            {
              allowDeclareFields: true
            }
          ]
        ],
        sourceMaps: true
      });

      if (!result?.code) {
        return null;
      }

      return {
        code: result.code,
        map: result.map
      };
    }
  };
}
