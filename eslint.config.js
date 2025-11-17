module.exports = {
  extends: ['eslint:recommended'],
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    // Add your custom rules here if necessary
    // For example:
    // 'no-console': 'warn',
  },
};
