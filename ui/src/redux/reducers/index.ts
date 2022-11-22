// Copyright 2022 Amazon.com and its affiliates; all rights reserved.
// This file is Amazon Web Services Content and may not be duplicated or distributed without permission.

import {combineReducers, Reducer} from 'redux';
import {History} from 'history';
import {connectRouter} from 'connected-react-router';
import {ReduxState} from '../../interfaces';
import {ActionTypes} from "../actions";

let initialState: ReduxState = {
  token: "",
  remittance: {}
};

export const AppReducer: Reducer<ReduxState> = (state = initialState, action) => {

  switch(action.type) {
    case ActionTypes.STORE_TOKEN: {
      return {
        ...state,
        token: action.token
      };
    }
    case ActionTypes.STORE_REMITTANCE: {
      return {
        ...state,
        remittance: action.remittance
      };
    }

  }
  return state;
};

const createRootReducer = (history: History) => combineReducers({
  router: connectRouter(history),
  reducerState: AppReducer
});

export default createRootReducer;
export type RootState = ReturnType<typeof createRootReducer>;