import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import jest from "eslint-plugin-jest";
import { defineConfig, globalIgnores } from "eslint/config";
import testingLibrary from "eslint-plugin-testing-library";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      jest.configs["flat/recommended"],
      jest.configs["flat/style"],
      testingLibrary.configs["flat/react"],
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "react-refresh/only-export-components": "warn",
    },
  },
]);
