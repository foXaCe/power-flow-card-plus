import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import typescript from "@rollup/plugin-typescript";
import terser from "@rollup/plugin-terser";
import minifyHTML from "rollup-plugin-html-literals";
import serve from "rollup-plugin-serve";

const dev = process.env.ROLLUP_WATCH;

const serveOptions = {
  contentBase: ["./dist"],
  host: "0.0.0.0",
  port: 5001,
  allowCrossOrigin: true,
  headers: {
    "Access-Control-Allow-Origin": "*",
  },
};

export default [
  {
    input: ["src/power-flow-card-plus.ts"],
    output: [
      {
        dir: "dist",
        format: "es",
        inlineDynamicImports: true,
        sourcemap: true,
      },
    ],
    plugins: [
      // Canonical plugin order: resolve -> commonjs -> json -> typescript -> minifyHTML -> terser
      // Babel a été retiré : la cible est ES2022 (navigateurs evergreen que HA sert),
      // donc aucun transpilage/polyfill n'est nécessaire. TypeScript émet directement
      // de l'ES2022 et terser le minifie au même niveau (ecma: 2022).
      nodeResolve(),
      commonjs(),
      json({
        compact: true,
      }),
      typescript({
        declaration: false,
      }),
      minifyHTML(),
      ...(dev
        ? [serve(serveOptions)]
        : [
            terser({
              ecma: 2022,
              module: true,
              compress: { passes: 2 },
              format: { comments: false },
            }),
          ]),
    ],
    moduleContext: (id) => {
      const thisAsWindowForModules = [
        "node_modules/@formatjs/intl-utils/lib/src/diff.js",
        "node_modules/@formatjs/intl-utils/lib/src/resolve-locale.js",
      ];
      if (thisAsWindowForModules.some((id_) => id.trimEnd().endsWith(id_))) {
        return "window";
      }
      return undefined;
    },
  },
];
