import eslint from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import importPlugin from 'eslint-plugin-import';
import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';
import tseslint from 'typescript-eslint';

/** @type {import('eslint').Linter.Config[]} */
export default tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.recommended,
    eslintConfigPrettier,
    {
        plugins: {
            'unused-imports': unusedImports,
            'simple-import-sort': simpleImportSortPlugin,
            import: importPlugin,
        },
        rules: {
            '@typescript-eslint/no-unused-vars': 'off',
            'unused-imports/no-unused-vars': [
                'warn',
                {
                    vars: 'all',
                    varsIgnorePattern: '^_',
                    args: 'after-used',
                    argsIgnorePattern: '^_',
                },
            ],
            'simple-import-sort/imports': [
                'error',
                {
                    groups: [
                        [
                            '^(assert|buffer|child_process|cluster|console|constants|crypto|dgram|dns|domain|events|fs|http|https|module|net|os|path|punycode|querystring|readline|repl|stream|string_decoder|sys|timers|tls|tty|url|util|vm|zlib|freelist|v8|process|async_hooks|http2|perf_hooks)(/.*|$)',
                        ],
                        ['^@?\\w'],
                        ['^\\u0000'],
                        ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
                        ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
                    ],
                },
            ],
            'simple-import-sort/exports': 'error',
            'sort-imports': 'off',
            'import/order': 'off',
            'no-duplicate-imports': 'off',
            'import/no-duplicates': 'error',
            'unused-imports/no-unused-imports': 'error',
        },
    },
    {
        files: ['*.ts'],
        rules: {
            'no-undef': 'off',
        },
    },
);
