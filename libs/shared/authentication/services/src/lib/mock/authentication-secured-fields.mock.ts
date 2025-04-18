/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AuthenticationCredentialsField } from '../models/authentication-details-form-values.types';
import { URL_REGEXP, SCOPE_REGEXP } from '../models';

export const basicAuthenticationSecuredFields: AuthenticationCredentialsField[] = [
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

export const bearerAuthenticationSecuredFields: AuthenticationCredentialsField[] = [
    {
        key: 'token',
        translationKey: 'SHARED_AUTHENTICATION.DETAILS.TOKEN',
        required: true,
        type: 'password',
        isHidden: true,
    },
];

export const clientCredentialsAuthenticationSecuredFields: AuthenticationCredentialsField[] = [
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

export const grantTypeAuthenticationSecuredFields: AuthenticationCredentialsField[] = [
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
