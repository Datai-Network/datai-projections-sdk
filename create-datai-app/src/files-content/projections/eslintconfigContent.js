module.exports = `// @ts-check

import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import eslintConfigPrettier from 'eslint-config-prettier'
import unusedImports from 'eslint-plugin-unused-imports'

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    plugins: {
      'unused-imports': unusedImports
    },
    rules: {
      '@typescript-eslint/typedef': [
        'warn',
        {
          propertyDeclaration: true,
          memberVariableDeclaration: true
        }
      ],
      'no-case-declarations': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_'
        }
      ],
      '@typescript-eslint/explicit-function-return-type': [
        'warn',
        {
          allowExpressions: true
        }
      ],
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/ban-types': [
        'warn',
        {
          types: {
            BigInt: false
          },
          extendDefaults: true
        }
      ],
      '@typescript-eslint/quotes': [
        'warn',
        'single',
        {
          allowTemplateLiterals: false
        }
      ]
    }
  }
)
`
