import openWcConfig from "@open-wc/eslint-config";
import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import wcPlugin from "eslint-plugin-wc";
import prettierConfig from "eslint-config-prettier";
import globals from "globals";

export default [
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**",
      ".vscode/**",
      ".idea/**",
      ".cache/**",
      "**/*.js",
      "**/*.cjs",
      "**/*.mjs",
      "**/*.d.ts",
      "**/*.log",
      "**/*.cache",
      ".eslintcache",
    ],
  },

  ...openWcConfig,

  {
    files: ["src/**/*.ts", "__tests__/**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        project: "./tsconfig.json",
      },
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      wc: wcPlugin,
    },
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn"],
      "class-methods-use-this": "off",
      "import/no-unresolved": "off",
      "import/extensions": "off",
      "import-x/no-unresolved": "off",
      "import-x/extensions": "off",
      "import-x/no-extraneous-dependencies": "off",
      "no-use-before-define": "off",
      "@typescript-eslint/no-use-before-define": [
        "error",
        { functions: false, typedefs: false, ignoreTypeReferences: true },
      ],
      "lines-between-class-members": "off",
      "no-console": [
        "warn",
        { allow: ["warn", "error", "groupCollapsed", "groupEnd", "log"] },
      ],
      "no-debugger": "warn",
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "prefer-const": "warn",
      "no-var": "error",
      "no-undef": "off",
      "no-nested-ternary": "off",
      "lit/no-invalid-html": "off",
      camelcase: "off",
      "prefer-destructuring": "off",
      eqeqeq: "warn",
      "no-param-reassign": "off",
      "no-self-compare": "warn",
      "no-plusplus": "off",
      "wc/guard-super-call": "off",
      radix: "warn",
      "lit-a11y/click-events-have-key-events": "warn",
      "no-shadow": "off",
      "@typescript-eslint/no-shadow": "warn",
      ...prettierConfig.rules,
    },
  },

  {
    files: ["__tests__/**/*.ts"],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
];
