#!/usr/bin/env node

const fs = require('fs-extra');
const path = require('path');
const pwd = (...args) => path.resolve(process.cwd(), ...args);
const binPwd = (...args) => path.resolve(__dirname, ...args);
const argv = process.argv.splice(2);
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
    copy: 'sfs cp react-scripts node_modules',
    start: 'yarn copy && react-scripts start',
    build: 'yarn copy && GENERATE_SOURCEMAP=false react-scripts build',
    deploy: 'node deploy.js',
    server:
      'yarn server:build && NODE_ENV=development node dist/app-server/main.js',
    'server:watch':
      'concurrently --handle-input "tsc -w -p src/app-server/tsconfig.server.json" "NODE_ENV=development wait-on dist/app-server/main.js && nodemon"',
    'server:build': 'tsc -p src/app-server/tsconfig.server.json',
    'server:pm2':
      'tsc -p src/app-server/tsconfig.server.json && NODE_ENV=production pm2 start dist/app-server/main.js --name=bdc --watch -i 0',
    test: 'react-scripts test',
    eject: 'react-scripts eject',
    lib: 'tscu example/src/navar --outDir lib',
    'lint-ci': 'lint-staged',
  },
  devDependencies: {
    '@capacitor/cli': '^1.1.1',
    '@capacitor/core': '^1.1.1',
    '@types/mongodb': '^3.3.1',
    concurrently: '^4.1.2',
    husky: '^2.4.1',
    'lint-staged': '^8.2.1',
    mongodb: '^3.3.2',
    nodemon: '^1.19.1',
    prettier: '^1.18.2',
    'shell-fs': '^1.0.0',
    tslint: '^5.17.0',
    'tslint-config-prettier': '^1.18.0',
    'tslint-react': '^4.0.0',
    'wait-on': '^3.3.0',
  },
  repository: 'git@github.com:ymzuiku/tslint-react-cli.git',
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

fs.copySync(binPwd('tsconfig.json'), pwd('tsconfig.json'));
fs.copySync(binPwd('index.html'), pwd(public, 'index.html'));
fs.copySync(binPwd('LICENSE'), pwd('LICENSE'));
fs.copySync(binPwd('.gitignore-copy'), pwd('.gitignore'));
fs.copySync(binPwd('.npmignore-copy'), pwd('.npmignore'));
fs.copySync(binPwd('react-scripts'), pwd('./react-scripts'));
fs.copySync(binPwd('app-server'), pwd('./src/app-server'));
fs.copySync(binPwd('tslint.json'), pwd('tslint.json'));
fs.copySync(binPwd('.prettierrc'), pwd('.prettierrc'));

const package = deepmerge(require(pwd('package.json')), packageNeed);
fs.writeFileSync(pwd('package.json'), JSON.stringify(package, null, 2), 'utf8');
