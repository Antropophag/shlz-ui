import js from "@eslint/js";
import noHardcodedCensusCounts from "./tools/eslint/no-hardcoded-census-counts.mjs";

export default [
  { ignores: ["shlz-design-source/**", "**/dist/**", "node_modules/**"] },
  js.configs.recommended,
  {
    files: ["**/*.js", "**/*.mjs"],
    plugins: {
      shlz: {
        rules: { "no-hardcoded-census-counts": noHardcodedCensusCounts },
      },
    },
    rules: { "shlz/no-hardcoded-census-counts": "error" },
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: "module",
      globals: {
        console: "readonly",
        document: "readonly",
        process: "readonly",
        window: "readonly",
      },
    },
  },
];
