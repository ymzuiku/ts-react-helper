#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const pwd = (...args) => path.resolve(process.cwd(), ...args);
const binPwd = (...args) => path.resolve(__dirname, ...args);
const argv = process.argv.splice(2);
const deepmerge = require('deepmerge');

export const packageNeed = {
  husky: {
    hooks: {
      'pre-commit': 'yarn lint-ci',
    },
  },
  'lint-staged': {
    'src/**/*.ts': ['git add', 'tslint'],
    'src/**/*.tsx': ['git add', 'tslint'],
  },
  scripts: {
    copy:
      "sfs cp 'config/paths.js, config/webpack.config.js, config/webpackDevServer.config.js' node_modules/react-scripts/config",
    start: 'yarn copy && react-scripts start',
    build: 'yarn copy && GENERATE_SOURCEMAP=false react-scripts build',
    test: 'react-scripts test',
    eject: 'react-scripts eject',
    lib: 'tscu example/src/navar --outDir lib',
    'lint-ci': 'lint-staged',
  },
  devDependencies: {
    '@typescript-eslint/parser': '^1.13.0',
    'eslint-config-airbnb': '^18.0.0',
    'eslint-config-prettier': '^6.0.0',
    'eslint-plugin-import': '^2.18.2',
    'eslint-plugin-prettier': '^3.1.0',
    prettier: '^1.18.2',
  },
};

let src = 'src';
let public = 'public';

for (let i = 0; i++; i < argv.length) {
  if (argv[i] === '--src') {
    src = argv[i + 1];
  } else if (argv[i] === '--public') {
    public = argv[i + 1];
  }
}

fs.copySync(binPwd('tslint.json'), pwd('tslint.json'));
fs.copySync(binPwd('index.html'), pwd(public, 'index.html'));
fs.copySync(binPwd('LICENSE'), pwd('LICENSE'));
fs.copySync(binPwd('.gitignore-copy'), pwd('.gitignore'));
fs.copySync(binPwd('.npmignore-copy'), pwd('.npmignore'));
fs.copySync(binPwd('confiy'), pwd('./'));
fs.copySync(binPwd('.eslintrc'), pwd(src, './eslintrc'));
fs.copySync(binPwd('.prettierrc'), pwd('.prettierrc'));

const package = deepmerge(require(pwd('package.json')), packageNeed);
fs.writeFileSync(pwd('package.json'), JSON.stringify(package, null, 2), 'utf8');
