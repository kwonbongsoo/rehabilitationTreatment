const { FlatCompat } = require('@eslint/eslintrc');
const js = require('@eslint/js');
const nextConfig = require('eslint-config-next');

const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
});

module.exports = [
    ...compat.extends('next/core-web-vitals'),
    {
        rules: {
            'no-console': [
                'warn',
                {
                    allow: ['warn', 'error'],
                },
            ],
        },
    },
];
