import js from "@eslint/js";

export default [
  { ignores: ["shlz-design-source/**", "**/dist/**", "node_modules/**"] },
  js.configs.recommended,
  {
    files: ["**/*.js", "**/*.mjs"],
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
