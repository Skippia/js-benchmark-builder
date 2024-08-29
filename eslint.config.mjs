import antfu from '@antfu/eslint-config'
import js from '@eslint/js'
import globals from 'globals'

export default antfu(
  {
    stylistic: {
      indent: 2,
      quotes: 'single',
    },
  },
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      ...js.configs.recommended.rules,
      'prefer-const': 'error',
      'no-undef': 'off',
    },
  },
  {
    ignores: ['node_modules/*', 'dist/*'],
  },
)
