import js from '@eslint/js';
import html from 'eslint-plugin-html';
import globals from 'globals';

export default [
  {
    files: ['timer.html'],
    plugins: { html },
    languageOptions: { sourceType: 'script', globals: globals.browser },
    rules: {
      ...js.configs.recommended.rules,
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
  {
    files: ['scripts/*.mjs', 'eslint.config.mjs'],
    languageOptions: { globals: globals.node },
    rules: js.configs.recommended.rules,
  },
];
