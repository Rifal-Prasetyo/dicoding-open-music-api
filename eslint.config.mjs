/* eslint-disable import/no-extraneous-dependencies */
import globals from 'globals';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [...compat.extends('airbnb-base'), {
  languageOptions: {
    globals: {
      ...globals.node,
    },

    ecmaVersion: 2020,
    sourceType: 'module',
  },

  rules: {
    'no-console': 'off',
    'no-underscore-dangle': 'off',
  },
}];
