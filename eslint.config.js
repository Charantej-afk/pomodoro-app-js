import { defineConfig } from 'eslint';

export default defineConfig({
  // Define the environments
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  
  // Define parser options
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  
  // Define rules directly, no "extends" allowed
  rules: {
    'no-console': 'warn', // Example rule
    'eqeqeq': 'error',    // Example rule
  },
});
