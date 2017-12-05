import React from 'react';
import { render } from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import reducer from './reducers'

import App from './pages/App';
import './index.css';

import registerServiceWorker from './registerServiceWorker';
registerServiceWorker();

const middleware = [ thunk ]

const store = createStore(
  reducer,
  applyMiddleware(...middleware)
);

// const store = createStore(
//   reducer,
//   compose(
//     applyMiddleware(...middleware),
//     window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
//   )
// )

render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);