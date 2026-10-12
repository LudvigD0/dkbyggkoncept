import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTypescript from 'eslint-config-next/typescript'

const eslintConfig = [
  ...nextVitals,
  ...nextTypescript,
  {
    rules: {
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: false,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^(_|ignore)',
        },
      ],
    },
  },
  // The retained template theme utilities synchronize browser storage on mount.
  {
    files: ['src/providers/Theme/index.tsx', 'src/providers/Theme/ThemeSelector/index.tsx'],
    rules: { 'react-hooks/set-state-in-effect': 'off' },
  },
  // This template hook returns ref objects in nested card/link wrappers.
  { files: ['src/components/Card/index.tsx'], rules: { 'react-hooks/refs': 'off' } },
  {
    ignores: ['lovable/', '.next/', 'src/payload-types.ts', 'src/payload-generated-schema.ts'],
  },
]

export default eslintConfig
