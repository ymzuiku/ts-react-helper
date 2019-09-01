/**
 * 0. 同时部署前端和后端项目的
 * 1. 确保服务器已安装 nodejs，pm2，rsync, yarn
 * 2. 确保目标路径及目标备份路径在服务器存在
 * 3. 确保本地 sshkeyPath 有 ssh 密钥，并且已在目标服务器注册
 * 4. 确保服务器所使用的端口已配置好外网访问
 * 5. 依赖更新时长较长时，需要手动登录目标服务器安装依赖（除非添加node_modules同步，同步node_modules比使用yarn安装依赖更块）
 */
const fs = require('fs-extra');
const { resolve } = require('path');
const { exec } = require('child_process');
const pwd = (...args) => resolve(process.cwd(), ...args);
const package = require('./package.json');
const version = package.version.replace(/\./g, '_');

// 运行本地命令
const bash = code => {
  console.log(code);

  return new Promise(res => {
    exec(code, (err, stdout, stderr) => {
      console.log(stdout, stderr);
      if (err) {
        throw err;
      }
      res(stdout);
    });
  });
};

// 运行远程命令
const bashOrigin = (url, sshkey, code) => {
  const orignShell = `
ssh -i ${sshkey} ${url} 2>&1 << eeooff
  ${code}
eeooff
  `;

  return bash(orignShell);
};

const app = package.name;
const targetUrl = 'root@0000000';
const sshKeyPath = '~/.ssh/id_rsa';
const clientRsync = [pwd('build'), `${targetUrl}:/db/static/${app}`];
const serverRsync = [pwd('dist'), `${targetUrl}:/db/nodejs/${app}`];
const nodeModulesRsync = [
  pwd('node_modules'),
  `${targetUrl}:/db/nodejs/${app}/node_modules`,
];

const start = async () => {
  const startTime = Date.now();

  await bash(`yarn prestart:prod`);

  fs.copySync(pwd('package.json'), resolve(sourceDir, 'package.json'));
  fs.copySync(pwd('yarn.lock'), resolve(sourceDir, 'yarn.lock'));

  if (!fs.existsSync(sourceDir)) {
    throw new Error('你的部署资源为空，请确保已编译');
  }

  if (!fs.existsSync(sourceDirNodeModules)) {
    throw new Error('你的node_modules为空，请确保依赖是当前版本所需');
  }

  await bash(`rsync -av ${clientRsync[0]}/* ${clientRsync[1]}`);
  await bash(`rsync -av ${serverRsync[0]}/* ${serverRsync[1]}`);
  await bash(`rsync -av ${nodeModulesRsync[0]}/* ${nodeModulesRsync[1]}`);

  await bashOrigin(
    targetUrl,
    sshKeyPath,
    `
    cd /db/nodejs/${app}
    # yarn 由于同步了node_nodumes, 不需要使用 yarn
    {pm2 delete ${app}} || {}
    pm2 start main.js --name=${app} --watch -i 0
  `,
  );

  console.log(`项目: ${app}_v${version}`);
  console.log(`目标路径: ${targetDir}`);
  console.log('部署成功! 耗时:', (Date.now() - startTime) / 1000, 's');
};

start();
