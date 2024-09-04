// @ts-check
// const eslint = require('@eslint/js');
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from 'angular-eslint';
import stylistic from '@stylistic/eslint-plugin';

export default tseslint.config(
  {
    files: ["**/*.ts"],
    plugins: {
      '@stylistic': stylistic,
    },
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...tseslint.configs.stylistic,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        {
          type: "attribute",
          prefix: "app",
          style: "camelCase",
        },
      ],
      "@angular-eslint/component-selector": [
        "error",
        {
          type: "element",
          prefix: "app",
          style: "kebab-case",
        },
      ],
      "@typescript-eslint/array-type": [
        "error",
        {
          "default": "generic",
        },
      ],
      '@typescript-eslint/no-inferrable-types': ["off"],
      '@stylistic/indent': ["error", 2],
      '@stylistic/object-curly-spacing': ["error", "always"],
      '@stylistic/quotes': ["error", "single", { "allowTemplateLiterals": true, "avoidEscape": true }],
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
