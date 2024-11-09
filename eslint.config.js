// @ts-check
// const eslint = require("@eslint/js");
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import angular from "angular-eslint";
import stylistic from "@stylistic/eslint-plugin";

export default tseslint.config(
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      }
    },
    files: ["**/*.ts"],
    plugins: {
      "@stylistic": stylistic,
    },
    extends: [
      eslint.configs.recommended,
      // ...tseslint.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "eu",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: ["eu", "app"],
          style: "kebab-case",
        },
      ],
      "@typescript-eslint/array-type": [
        "error",
        {
          "default": "generic",
        },
      ],
      "@typescript-eslint/explicit-member-accessibility": [
        "error",
        {
          overrides: {
            constructors: 'no-public',
          },
        },
      ],
      "@typescript-eslint/no-extraneous-class": ["off"],
      "@typescript-eslint/no-inferrable-types": ["off"],
      "@typescript-eslint/no-invalid-void-type": [
        "error",
        {
          allowInGenericTypeArguments: true,
        }
      ],
      "@typescript-eslint/no-unnecessary-type-arguments": ["off"],
      "@typescript-eslint/restrict-template-expressions": [
        "error",
        {
          allowBoolean: true,
          allowNumber: true,
        },
      ],
      "@typescript-eslint/switch-exhaustiveness-check": [
        "error",
        {
          allowDefaultCaseForExhaustiveSwitch: false,
          requireDefaultForNonUnion: true
        },
      ],
      "@stylistic/indent": ["error", 2],
      "@stylistic/object-curly-spacing": ["error", "always"],
      "@stylistic/quotes": ["error", "single", { "allowTemplateLiterals": true, "avoidEscape": true }],
      "@stylistic/semi": ["error", "always"],
    },
  },
  {
    files: ["**/*.html"],
    extends: [
      ...angular.configs.templateRecommended,
      ...angular.configs.templateAccessibility,
    ],
    rules: {},
  }
);
