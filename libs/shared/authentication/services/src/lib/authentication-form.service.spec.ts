/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AuthenticationFormService } from './authentication-form.service';
import { FormGroup, UntypedFormBuilder } from '@angular/forms';
import {
    basicAuthenticationSecuredFields,
    bearerAuthenticationSecuredFields,
    clientCredentialsAuthenticationSecuredFields,
    grantTypeAuthenticationSecuredFields,
} from './mock/authentication-secured-fields.mock';
import {
    basicAuthenticationContentMock,
    bearerAuthenticationContentMock,
    clientCredentialsAuthenticationContentMock,
    grantTypeAuthenticationContentMock,
    invalidAuthenticationTypeContentMock,
} from './mock/authentication-content.mock';
import { TestBed } from '@angular/core/testing';

describe('AuthenticationFormService', () => {
    let service: AuthenticationFormService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [AuthenticationFormService, UntypedFormBuilder],
        });

        service = TestBed.inject(AuthenticationFormService);
    });

    describe('Form Group Creation', () => {
        it('should create form group for basic authentication', () => {
            const authFormGroup = service.createFormGroupForAuthentication(basicAuthenticationSecuredFields, basicAuthenticationContentMock).controls[
                'myBasicAuthKey'
            ] as FormGroup;
            const formGroupControls = Object.values(authFormGroup.controls);

            expect(authFormGroup).toBeDefined();
            expect(formGroupControls.length).toEqual(2);
            expect(formGroupControls[0].value).toEqual('my-username');
            expect(formGroupControls[1].value).toEqual('my-password');
        });

        it('should create form group for bearer authentication', () => {
            const authFormGroup = service.createFormGroupForAuthentication(bearerAuthenticationSecuredFields, bearerAuthenticationContentMock)
                .controls['myBearerAuthKey'] as FormGroup;
            const formGroupControls = Object.values(authFormGroup.controls);

            expect(authFormGroup).toBeDefined();
            expect(formGroupControls.length).toEqual(1);
            expect(formGroupControls[0].value).toEqual('my-token');
        });

        it('should create form group for client credentials authentication', () => {
            const authFormGroup = service.createFormGroupForAuthentication(
                clientCredentialsAuthenticationSecuredFields,
                clientCredentialsAuthenticationContentMock
            ).controls['myClientCredentialsAuthKey'] as FormGroup;
            const formGroupControls = Object.values(authFormGroup.controls);

            expect(authFormGroup).toBeDefined();
            expect(formGroupControls.length).toEqual(4);
            expect(formGroupControls[0].value).toEqual('my-client-id');
            expect(formGroupControls[1].value).toEqual('my-client-secret');
            expect(formGroupControls[2].value).toEqual('my-endpoint');
            expect(formGroupControls[3].value).toEqual('email');
        });

        it('should create form group for grant type authentication with scope', () => {
            const authFormGroup = service.createFormGroupForAuthentication(grantTypeAuthenticationSecuredFields, grantTypeAuthenticationContentMock)
                .controls['myGrantTypeAuthKey'] as FormGroup;
            const formGroupControls = Object.values(authFormGroup.controls);

            expect(authFormGroup).toBeDefined();
            expect(formGroupControls.length).toEqual(5);
            expect(formGroupControls[0].value).toEqual('my-client-id');
            expect(formGroupControls[1].value).toEqual('my-client-secret');
            expect(formGroupControls[2].value).toEqual('my-endpoint');
            expect(formGroupControls[3].value).toEqual('hxp.integrations');
            expect(formGroupControls[4].value).toEqual('urn:hyland:params:oauth:grant-type:api-credentials');
        });
    });

    describe('getAuthenticationFormFields', () => {
        it('should return username and password fields in case of basic auth', () => {
            const fields = service.getAuthenticationFormFieldsDefinitionByType(basicAuthenticationContentMock.getAuthType());
            expect(fields).toEqual(basicAuthenticationSecuredFields);
        });

        it('should return token field in case of bearer auth', () => {
            const fields = service.getAuthenticationFormFieldsDefinitionByType(bearerAuthenticationContentMock.getAuthType());
            expect(fields).toEqual(bearerAuthenticationSecuredFields);
        });

        it('should return clientId, clientSecret, endpoint, scope fields in case of client_credentials auth', () => {
            const fields = service.getAuthenticationFormFieldsDefinitionByType(clientCredentialsAuthenticationContentMock.getAuthType());
            expect(fields).toEqual(clientCredentialsAuthenticationSecuredFields);
        });

        it('should return clientId, clientSecret, endpoint, scope and grant type fields in case of grant type auth', () => {
            const fields = service.getAuthenticationFormFieldsDefinitionByType(grantTypeAuthenticationContentMock.getAuthType());
            expect(fields).toEqual(grantTypeAuthenticationSecuredFields);
        });

        it('should return username and password as default fields in case the authenticationType is not correctly defined', () => {
            const fields = service.getAuthenticationFormFieldsDefinitionByType(invalidAuthenticationTypeContentMock.getAuthType());
            expect(fields).toEqual(basicAuthenticationSecuredFields);
        });
    });
});
