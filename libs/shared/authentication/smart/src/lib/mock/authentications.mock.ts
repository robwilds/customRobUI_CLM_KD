/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AuthenticationContent } from '@alfresco-dbp/shared-authentication-services';

export const mockBasicAuthenticationContentString = JSON.stringify({
    id: 'mock_id',
    name: 'basic',
    description: 'mock_description',
    authProperties: {
        authenticationType: 'basic',
        username: 'mock-username',
        password: '',
    },
});

export const mockBasicAuthenticationContent = new AuthenticationContent(mockBasicAuthenticationContentString);

export const mockBearerAuthenticationContent = new AuthenticationContent(
    JSON.stringify({
        id: 'mock_id_bearer',
        name: 'bearer',
        description: 'mock_bearer_description',
        authProperties: {
            authenticationType: 'bearer',
            token: '',
        },
    })
);

export const mockClientCredentialsAuthenticationContent = new AuthenticationContent(
    JSON.stringify({
        id: 'mock_id_client_credentials',
        name: 'client',
        description: 'mock_client_credentials_description',
        authProperties: {
            authenticationType: 'client_credentials',
            clientId: '',
            clientSecret: '',
            endpoint: '',
            scope: '',
        },
    })
);

export const mockGrantTypeAuthenticationContent = new AuthenticationContent(
    JSON.stringify({
        id: 'mock_id_grant_type',
        name: 'grant-type',
        description: 'mock_grant_type_description',
        authProperties: {
            authenticationType: 'grant_type',
            clientId: '',
            clientSecret: '',
            endpoint: '',
            scope: '',
            grantType: '',
        },
    })
);
