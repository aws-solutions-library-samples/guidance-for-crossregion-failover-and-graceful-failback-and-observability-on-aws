// Copyright 2022 Amazon.com and its affiliates; all rights reserved.
// This file is Amazon Web Services Content and may not be duplicated or distributed without permission.

import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import configureStore, { history } from './redux/Store';
import { ConnectedRouter } from "connected-react-router";
import { Provider } from "react-redux";

const store = configureStore();

document.addEventListener('DOMContentLoaded', () => {
  ReactDOM.render(
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <App />
        </ConnectedRouter>
      </Provider>,
      document.getElementById('root')
  );
});



