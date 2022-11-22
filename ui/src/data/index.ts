// Copyright 2022 Amazon.com and its affiliates; all rights reserved.
// This file is Amazon Web Services Content and may not be duplicated or distributed without permission.

// @ts-ignore
import ApiHandler, {ApiMethod} from '../common/api'

import {
IRemittance
} from '../interfaces/index'

import {
  REMITTANCE_ENDPOINTS
} from '../config/index'

export const remittance_api = new ApiHandler(
    REMITTANCE_ENDPOINTS.Endpoint,
    REMITTANCE_ENDPOINTS.ApiKey,
    REMITTANCE_ENDPOINTS.Resources
);

export const getRemittances = (token: string, user_params?:any) => remittance_api.get_authorized_resource<IRemittance[]>(
    "get-remittances", token, ApiMethod.GET, null, [])

export const createRemittance = (token: string, senderName: string, senderBank: string, senderAccount: string, receiverName: string, receiverBank: string, receiverAccount: string, amount: string, user_params?:any) => remittance_api.get_authorized_resource<IRemittance[]>(
    "create-remittance", token, ApiMethod.POST, {senderName: senderName, senderBank: senderBank, senderAccount: senderAccount, receiverName: receiverName, receiverBank: receiverBank, receiverAccount: receiverAccount, amount: amount}, [])

export const updateRemittance = (token: string, id: string, senderName: string, senderBank: string, senderAccount: string, receiverName: string, receiverBank: string, receiverAccount: string, amount: string, user_params?:any) => remittance_api.get_authorized_resource<IRemittance[]>(
    "update-remittance", token, ApiMethod.POST, {id: id, senderName: senderName, senderBank: senderBank, senderAccount: senderAccount, receiverName: receiverName, receiverBank: receiverBank, receiverAccount: receiverAccount, amount: amount}, [])

export const deleteRemittance = (token: string, id: string, user_params?:any) => remittance_api.get_authorized_resource<IRemittance[]>(
    "delete-remittance", token, ApiMethod.POST, {id: id}, [])

export const executeRunbook = (token: string, region:string, document:string, user_params?:any) => remittance_api.get_authorized_resource<any>(
    "execute-runbook", token, ApiMethod.POST, {region: region, document: document}, [])