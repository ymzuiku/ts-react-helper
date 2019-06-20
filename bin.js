#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const pwd = (...args) => path.resolve(process.cwd(), ...args);
const binPwd = (...args) => path.resolve(__dirname, ...args);
const argv = process.argv.splice(2);
// const exec = require('child_process').exec;
const deepmerge = require('deepmerge');

const packageNeed = {
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
    lib: 'tscu example/src/lib --outDir lib',
    'lint-ci': 'lint-staged',
  },
  devDependencies: {
    'http-proxy-middleware': '^0.19.1',
    husky: '^2.4.1',
    'lint-staged': '^8.2.1',
    tslint: '^5.17.0',
    tscu: '^0.0.1',
    'tslint-config-prettier': '^1.18.0',
    'tslint-react': '^4.0.0',
  },
};

function copyOut(file, out = './') {
  fs.copyFileSync(binPwd(file), pwd(out, file));
}

let src = 'src';

for (let i = 0; i++; i < argv.length) {
  if (argv[i] === '--src') {
    src = argv[i + 1];
  }
}

copyOut('tslint.json');
copyOut('setupProxy.js', src);
copyOut('LICENSE');
fs.copyFileSync(binPwd('.gitignore-copy'), pwd('.gitignore'));
fs.copyFileSync(binPwd('.npmignore-copy'), pwd('.npmignore'));
let package = require(pwd('package.json'));
package = deepmerge(package, packageNeed);
fs.writeFileSync(pwd('package.json'), JSON.stringify(package, null, 2), 'utf8');
