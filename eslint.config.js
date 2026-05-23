// Flat ESLint config (ESLint 9+).
// Minimal but specifically targeted at the bug class that took the admin
// panel down on 2026-05-23: a hook (useCallback) used in App.jsx without
// being imported. `no-undef` catches that at lint time.
//
// `npm run lint` is wired into `prebuild`, so any `npm run build` (which
// the VPS deploy runs) will refuse to build if lint fails.

import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  js.configs.recommended,
  {
    files: ['src/**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
    },
    settings: { react: { version: '18.2' } },
    rules: {
      // ── The rule that would have caught the outage ──────────────────
      'no-undef': 'error',
      // ── React hooks rules per user's request ────────────────────────
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // ── JSX correctness without enforcing import React (Vite handles JSX runtime)
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      // ── Pragmatic relaxations for this codebase ─────────────────────
      // App.jsx has many intentional unused destructured vars; tolerate them.
      'no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      }],
      // The codebase uses HTML entities inside JSX text for Arabic punctuation.
      'react/no-unescaped-entities': 'off',
      // Inline styles use the C / ui token objects, not className.
      'react/prop-types': 'off',
      // Empty catch blocks are deliberately used for best-effort fetch fallbacks.
      'no-empty': ['warn', { allowEmptyCatch: true }],
      // Some inner-loop awaits are intentional (sequential side effects).
      'no-constant-binary-expression': 'warn',
    },
  },
];
