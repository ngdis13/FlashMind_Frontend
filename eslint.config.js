import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierConfig,

  // ─────────────────────────────────────────────
  // Общие настройки для всего проекта
  // ─────────────────────────────────────────────
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // Запрещаем require в коде приложения
      '@typescript-eslint/no-require-imports': [
        'error',
        {
          allow: [
            String.raw`\.png$`,
            String.raw`\.jpe?g$`,
            String.raw`\.svg$`,
            String.raw`\.ttf$`,
            String.raw`\.woff2?$`,
            String.raw`\.gif$`,
            String.raw`\.webp$`,
          ],
        },
      ],
    },
  },

  // ─────────────────────────────────────────────
  // Разрешаем require в metro.config.js (Node / Metro)
  // ─────────────────────────────────────────────
  {
    files: ['metro.config.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  // ─────────────────────────────────────────────
  // Специфично для расширений
  // ─────────────────────────────────────────────
  {
    files: [
      'FlashMind/Shared\\ \\(App\\)/**/*.{js,jsx}',
      'FlashMind/Shared\\ \\(Extension\\)/**/*.{js,jsx}',
    ],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.webextensions,
        webkit: 'readonly',
      },
    },
    rules: {
      'no-undef': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  }
);
