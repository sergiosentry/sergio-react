import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import { createBrowserHistory } from 'history';
import { Router, Switch, Route } from 'react-router-dom';
import { crasher } from './utils/errors'
import { determineBackendType, determineBackendUrl } from './utils/backendrouter'
import release from './utils/release'

import { Provider } from 'react-redux'
import { createStore, applyMiddleware, compose } from 'redux'
import logger from 'redux-logger'
import rootReducer from './reducers'

import ScrollToTop from './components/ScrollToTop';
import Footer from './components/Footer';
import Nav from './components/Nav';
import About from './components/About';
import Cart from './components/Cart';
import Checkout from './components/Checkout';
import Complete from './components/Complete';
import CompleteError from './components/CompleteError';
import Cra from './components/Cra';
import Employee from './components/Employee';
import Home from './components/Home';
import NotFound from './components/NotFound';
import Product from './components/Product';
import Products from './components/Products';
import ProductsJoin from './components/ProductsJoin';

const tracingOrigins = ['localhost', 'empowerplant.io', 'run.app', 'appspot.com', /^\//];

const history = createBrowserHistory();
const SentryRoute = Sentry.withSentryRouting(Route);

let ENVIRONMENT
console.log("window.location", window.location)
if (window.location.hostname === "localhost") {
  ENVIRONMENT = "test"
} else { // App Engine
  ENVIRONMENT = "production"
}

let BACKEND_URL
const DSN = process.env.REACT_APP_DSN
const RELEASE = process.env.REACT_APP_RELEASE

console.log("ENVIRONMENT", ENVIRONMENT)
console.log("RELEASE here", RELEASE)
console.log(process.env)

Sentry.init({
  dsn: DSN,
  release: RELEASE,
  environment: ENVIRONMENT,
  tracesSampleRate: 1.0,
  integrations: [
    new Integrations.BrowserTracing({
      tracingOrigins: tracingOrigins,
      routingInstrumentation: Sentry.reactRouterV5Instrumentation(history),
      _metricOptions: {
        _reportAllChanges: true,
      },
      beforeNavigate: context => {
        return {
          ...context,
          name: window.location.pathname.replace(/\/employee.*/, '/employee/:id')
        };
      },
    }),
  ],
  beforeSend(event, hint) {
    // Parse from tags because src/index.js already set it there. Once there are React route changes, it is no longer in the URL bar
    let se
    Sentry.withScope(function (scope) {
      se = scope._tags.se
    });

    if (se === "tda") {
      // Release Health
      event.fingerprint = ['{{ default }}', se, RELEASE];
    } else if (se) {
      event.fingerprint = ['{{ default }}', se];
    }

    console.log(event);

    return event;
  }
});

const sentryReduxEnhancer = Sentry.createReduxEnhancer({});

const store = createStore(
  rootReducer,
  compose(applyMiddleware(logger), sentryReduxEnhancer)
)

class App extends Component {

  constructor() {
    super();
    this.state = {
      cart: {
        items: [],
        quantities: {},
        total: 0,
      },
      products: {
        response: []
      }
    };

    let queryParams = new URLSearchParams(history.location.search)

    // Set desired backend
    let backendTypeParam = new URLSearchParams(history.location.search).get("backend")
    const backendType = determineBackendType(backendTypeParam)
    BACKEND_URL = determineBackendUrl(backendType, ENVIRONMENT)

    console.log(`> backendType: ${backendType} | backendUrl: ${BACKEND_URL}`)

    // These also get passed via request headers
    Sentry.configureScope(scope => {
      const customerType = ["medium-plan", "large-plan", "small-plan", "enterprise"][Math.floor(Math.random() * 4)]
      scope.setTag("customerType", customerType)

      if (queryParams.get("se")) {
        // Route components (navigation changes) will now have 'se' tag on scope
        console.log("> src/index.js se", queryParams.get("se"))
        scope.setTag("se", queryParams.get("se"))
      }

      scope.setTag("backendType", backendType)

      let email = Math.random().toString(36).substring(2, 6) + "@yahoo.com";
      scope.setUser({ email: email })
    })

    // Crasher will parse the query params
    crasher()
  }

  render() {
    return (
      <Provider
        store={store}
      >
        <Router history={history}>
          <ScrollToTop />
          <Nav />

          <div id="body-container">
            <Switch>
              <Route exact path="/">
                <Home backend={BACKEND_URL} />
              </Route>
              <Route path="/about">
                <About backend={BACKEND_URL} history={history} />
              </Route>
              <Route path="/cart" component={Cart} />
              <Route path="/checkout">
                <Checkout backend={BACKEND_URL} history={history} />
              </Route>
              <Route path="/complete" component={Complete} />
              <Route path="/error" component={CompleteError} />
              <Route path="/cra" component={Cra} />
              {/* Parameterization of the Employee Pages is done by beforeNavigate  */}
              <Route path="/employee/:id" component={Employee} />
              {/* Parameterizes the Product Page transactions */}
              <SentryRoute path="/product/:id" component={Product}></SentryRoute>
              <Route path="/products">
                <Products backend={BACKEND_URL} />
              </Route>
              <Route path="/products-join">
                <ProductsJoin backend={BACKEND_URL} />
              </Route>
              <Route component={NotFound} />
            </Switch>
          </div>
          <Footer />
        </Router>
      </Provider>
    );
  }
}

// React-router in use here https://reactrouter.com/web/guides/quick-start
ReactDOM.render(<App />, document.getElementById('root'));
