import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
  resolvePluginsRelativeTo: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  // Substituímos a configuração "next/typescript" pela configuração explícita abaixo
  ...tseslint.config({
    files: ['**/*.ts', '**/*.tsx'],
    extends: [
      ...compat.extends('plugin:@typescript-eslint/recommended-type-checked'),
      ...compat.extends('plugin:@typescript-eslint/stylistic-type-checked'),
    ],
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: __dirname,
      },
    },
  }),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
];

export default eslintConfig;
