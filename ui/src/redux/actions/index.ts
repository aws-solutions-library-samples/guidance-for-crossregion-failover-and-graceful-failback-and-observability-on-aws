// Copyright 2022 Amazon.com and its affiliates; all rights reserved.
// This file is Amazon Web Services Content and may not be duplicated or distributed without permission.

import {IRemittance} from "../../interfaces";

export enum ActionTypes {
    STORE_TOKEN = "STORE_TOKEN",
    STORE_REMITTANCE = "STORE_REMITTANCE"
}

export const storeToken = (token:string) => ({
    type: ActionTypes.STORE_TOKEN, token
})

export const storeRemittanceAction = (remittance:IRemittance) => ({
    type: ActionTypes.STORE_REMITTANCE, remittance
})