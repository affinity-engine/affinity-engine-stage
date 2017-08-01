module.exports = {
  root: true,
  globals: {
    'Proxy': true,
    'Reflect': true
  },
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module'
  },
  extends: 'eslint:recommended',
  env: {
    browser: true
  },
  rules: {
  }
};
