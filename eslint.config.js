import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
export default [{ ignores: ['dist/**', 'node_modules/**', '**/*.d.ts'] }, { files: ['**/*.{ts,tsx}'], languageOptions: { parser: tsParser, parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } } }, plugins: { '@typescript-eslint': tsPlugin } }];
