/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AuthenticationCredentialsField } from './authentication-details-form-values.types';

export const URL_REGEXP = /^[A-Za-z][A-Za-z\d.+-]*:\/*(?:\w+(?::\w+)?@)?[^\s/]+(?::\d+)?(?:\/[\w#!:.?+=&%@\-/]*)?$/;
export const SCOPE_REGEXP = /^[^\s]*$/;

export const basicAuthenticationFormFields: AuthenticationCredentialsField[] = [
    {
        key: 'username',
        translationKey: 'SHARED_AUTHENTICATION.DETAILS.USERNAME',
        required: true,
        type: 'text',
    },
    {
        key: 'password',
        translationKey: 'SHARED_AUTHENTICATION.DETAILS.PASSWORD',
        required: true,
        type: 'password',
        isHidden: true,
    },
];

export const bearerAuthenticationFormFields: AuthenticationCredentialsField[] = [
    {
        key: 'token',
        translationKey: 'SHARED_AUTHENTICATION.DETAILS.TOKEN',
        required: true,
        type: 'password',
        isHidden: true,
    },
];

export const clientCredentialsAuthenticationFormFields: AuthenticationCredentialsField[] = [
    {
        key: 'clientId',
        translationKey: 'SHARED_AUTHENTICATION.DETAILS.CLIENT_ID',
        required: true,
        type: 'text',
    },
    {
        key: 'clientSecret',
        translationKey: 'SHARED_AUTHENTICATION.DETAILS.CLIENT_SECRET',
        required: true,
        type: 'password',
        isHidden: true,
    },
    {
        key: 'endpoint',
        translationKey: 'SHARED_AUTHENTICATION.DETAILS.ENDPOINT',
        required: true,
        pattern: URL_REGEXP,
        type: 'text',
    },
    {
        key: 'scope',
        translationKey: 'SHARED_AUTHENTICATION.DETAILS.SCOPE',
        required: false,
        pattern: SCOPE_REGEXP,
        type: 'text',
        hint: 'SHARED_AUTHENTICATION.HINTS.SCOPE_HINT',
    },
];

export const grantTypeAuthenticationFormFields: AuthenticationCredentialsField[] = [
    {
        key: 'clientId',
        translationKey: 'SHARED_AUTHENTICATION.DETAILS.CLIENT_ID',
        required: true,
        type: 'text',
    },
    {
        key: 'clientSecret',
        translationKey: 'SHARED_AUTHENTICATION.DETAILS.CLIENT_SECRET',
        required: true,
        type: 'password',
        isHidden: true,
    },
    {
        key: 'endpoint',
        translationKey: 'SHARED_AUTHENTICATION.DETAILS.ENDPOINT',
        required: true,
        pattern: URL_REGEXP,
        type: 'text',
    },
    {
        key: 'scope',
        translationKey: 'SHARED_AUTHENTICATION.DETAILS.SCOPE',
        required: false,
        pattern: SCOPE_REGEXP,
        type: 'text',
        hint: 'SHARED_AUTHENTICATION.HINTS.SCOPE_HINT',
    },
    {
        key: 'grantType',
        translationKey: 'SHARED_AUTHENTICATION.DETAILS.GRANT_TYPE',
        required: true,
        type: 'text',
    },
];
