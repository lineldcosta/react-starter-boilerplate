'use strict';

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

// Use babel-register to precompile ES6 syntax
require('../babel-register');
// Ensure environment variables are read.
require('../config/env');

const fs = require('fs');
const http = require('http');
const Express = require('express');
const webpack = require('webpack');
const chalk = require('chalk');
const checkRequiredFiles = require('react-dev-utils/checkRequiredFiles');
const {
  choosePort,
  createCompiler,
  prepareProxy,
  prepareUrls,
} = require('react-dev-utils/WebpackDevServerUtils');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const paths = require('../config/paths');
const buildDLL = require('./buildDLL');
const config = require('../config/webpack.config');
const createDevServerConfig = require('../config/webpackDevServer.config');

const useYarn = fs.existsSync(paths.yarnLockFile);
const buildDLLIfNeed = !fs.existsSync(paths.appDllManifestPath);

// // Warn and crash if required files are missing
if (!checkRequiredFiles([paths.appHtml, paths.appIndexJs])) {
  process.exit(1);
}

// Tools like Cloud9 rely on this.
const DEFAULT_PORT = parseInt(+process.env.PORT + 1, 10) || 3001;
const HOST = process.env.HOST || '0.0.0.0';

// We attempt to use the default port but if it is busy, we offer the user to
// run on a different port. `detect()` Promise resolves to the next free port.
choosePort(HOST, DEFAULT_PORT)
  .then(async port => {
    if (port == null) {
      // We have not found a port.
      return;
    }

    if (buildDLLIfNeed) {
      await buildDLL();

      config.plugins.push(
        new webpack.DllReferencePlugin({
          context: require('path').join(process.cwd()),
          manifest: require(paths.appDllManifestPath),
        })
      );
    }

    const app = new Express();
    const server = new http.Server(app);
    const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
    const appName = require(paths.appPackageJson).name;
    const urls = prepareUrls(protocol, HOST, port - 1);
    // Load proxy config
    const proxySetting = require(paths.appPackageJson).proxy;
    const proxyConfig = prepareProxy(proxySetting, paths.appPublic);
    // Serve webpack assets generated by the compiler over a web sever.
    const compiler = createCompiler(webpack, config, appName, urls, useYarn);
    const serverConfig = createDevServerConfig(
      proxyConfig,
      urls.lanUrlForConfig
    );

    app.use(webpackDevMiddleware(compiler, serverConfig));
    app.use(webpackHotMiddleware(compiler));

    // Launch WebpackDevServer.
    server.listen(port, HOST, err => {
      if (err) {
        return console.log(err);
      }
    });

    ['SIGINT', 'SIGTERM'].forEach(function(sig) {
      process.on(sig, function() {
        server.close();
        process.exit();
      });
    });
  })
  .catch(err => {
    if (err && err.message) {
      console.log(err.message);
    }
    process.exit(1);
  });
