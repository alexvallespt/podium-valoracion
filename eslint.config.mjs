// eslint.config.mjs
import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

export default [
  // Config base de Next + TypeScript (compat)
  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  // Reglas propias del proyecto
  {
    rules: {
      // Queremos ir eliminando "any", pero que NO rompa el build
      '@typescript-eslint/no-explicit-any': 'warn',

      // Aviso por variables/parámetros sin usar; permite prefijo "_"
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],

      // Mantener navegación interna con <Link> (no <a href="/ruta">)
      '@next/next/no-html-link-for-pages': 'error',
    },
  },
]
