import express from 'express';
import path from 'path';
import compression from 'compression';
import helmet from 'helmet';
import favicon from 'serve-favicon';
import React from 'react';
import ReactDOM from 'react-dom/server';
import Loadable from 'react-loadable';
import { getBundles } from 'react-loadable/webpack';
import createHistory from 'history/createMemoryHistory';
import renderRoutes from 'react-router-config/renderRoutes';
import matchRoutes from 'react-router-config/matchRoutes';
import ConnectedRouter from 'react-router-redux/ConnectedRouter';
import { StaticRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ServerStyleSheet, StyleSheetManager } from 'styled-components';
import cookies from '../utils/cookies';
import configureStore from '../configureStore';
import waitAll from './waitAll';
import createHTML from './createHTML';
import createRoutes from '../routes';

/* eslint-disable import/no-dynamic-require */
const stats = require(process.env.LOADABLE_CHUNKS);
const assets = require(process.env.ASSETS_MANIFEST);

const app = express();

app.use(compression());

// Serve static assets
app.use(
  express.static(path.resolve(process.cwd(), 'build'), {
    maxAge: 86400000 * 7,
  })
);

app.use(helmet());
app.use(favicon(path.join(process.cwd(), '/public/favicon.ico')));

// TODO: renderToNodeStream
app.use((req, res) => {
  cookies.setRawCookies(req.headers.cookie);

  const history = createHistory(req.originalUrl);
  const store = configureStore(history);
  const routes = createRoutes(store);

  const preLoaders = matchRoutes(routes, req.url)
    .filter(({ route }) => route.component && route.component.preLoad)
    .map(({ route, match }) => route.component.preLoad(match, req))
    .reduce((result, preLoader) => result.concat(preLoader), []);

  const runTasks = store.runSaga(waitAll(preLoaders));
  runTasks.done.then(() => {
    const routerContext = {};
    const modules = [];
    const sheet = new ServerStyleSheet();
    const component = (
      <Loadable.Capture report={moduleName => modules.push(moduleName)}>
        <StyleSheetManager sheet={sheet.instance}>
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <StaticRouter location={req.url} context={routerContext}>
                {renderRoutes(routes)}
              </StaticRouter>
            </ConnectedRouter>
          </Provider>
        </StyleSheetManager>
      </Loadable.Capture>
    );

    if (routerContext.url) {
      res.redirect(routerContext.status || 302, routerContext.url);
    }

    const content = ReactDOM.renderToString(component);
    const bundles = getBundles(stats, modules);
    const styles = sheet.getStyleTags();
    const preloadState = store.getState();
    const html = createHTML({
      content,
      styles,
      bundles,
      assets,
      preloadState,
    });

    res.status(routerContext.status || 200).send(html);
  });
});

export default app;
