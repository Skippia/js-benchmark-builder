import antfu from '@antfu/eslint-config'
import globals from 'globals'

export default antfu(
  {
    stylistic: {
      indent: 2,
      quotes: 'single',
    },
  },
  {
    files: ['**/*.js', '**/*.mjs', '**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      'prefer-const': 'error',
      'no-undef': 'off',
      'no-console': 'off',
      'node/prefer-global/process': 'off',
    },
  },
  {
    ignores: ['node_modules/*', 'dist/*'],
  },
)
