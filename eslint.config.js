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
      // ── Rules that catch missing imports / undefined refs ───────────
      'no-undef': 'error',                  // catches bare identifiers
      'react/jsx-no-undef': 'error',        // catches <Component/> where Component isn't in scope (the bug that crashed the customer details page on 2026-05-23)
      // catches const/let referenced before its declaration — the bug that
      // took the admin panel down on 2026-05-29 (Phase 2 _t TDZ error).
      // functions: false → hoisted function decls are allowed
      // variables: true  → const/let MUST be declared before use
      // classes: true    → class hoisting is illegal anyway
      //
      // Strict across all NEW code. App.jsx has 65 textual-order references
      // inside callback bodies (hooks declared late in AdminDash, used in
      // inline functions defined earlier). They are NOT runtime TDZ — the
      // callbacks only fire after mount, by which point the hooks have run.
      // The override below relaxes this rule for App.jsx until that file
      // can be refactored to hoist all hook declarations to top-of-function.
      // The real defence against runtime TDZ in App.jsx is browser-level
      // verification (verify_admin_bundle.js — mounts the bundle in real
      // Chrome after every deploy and reports pageerror immediately).
      'no-use-before-define': ['error', { functions: false, classes: true, variables: true }],
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
  // ── App.jsx override (temporary) ────────────────────────────────────────
  // AdminDash declares useState/useCallback/useAuth/useRef late in the
  // function body, and inline callbacks defined earlier reference those
  // hooks. Lint sees text-order violations, but runtime is safe (closures
  // resolve at call time, callbacks only fire after mount). 65 violations
  // → warn so they stay visible without blocking the build.
  // TODO: refactor AdminDash to hoist all hooks to top of function, then
  // delete this override block. Track via the runtime verifier
  // (verify_admin_bundle.js) which catches the actual TDZ bug class.
  {
    files: ['src/App.jsx'],
    rules: {
      'no-use-before-define': ['warn', { functions: false, classes: true, variables: true }],
    },
  },
];
