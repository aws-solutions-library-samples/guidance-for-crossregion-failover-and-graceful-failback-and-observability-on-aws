// Copyright 2022 Amazon.com and its affiliates; all rights reserved.
// This file is Amazon Web Services Content and may not be duplicated or distributed without permission.

import { RouterState } from 'connected-react-router';

export interface IRemittance {
  id?: string;
  senderName?: string;
  senderBank?: string;
  senderAccount?: string;
  receiverName?: string;
  receiverBank?: string;
  receiverAccount?: string;
  amount?: string;
  creationTimestamp?: string;
}

export interface ReduxState {
  token: string;
  remittance: IRemittance;
}

export interface ReduxRoot {
  router: RouterState;
  reducerState: ReduxState;
}