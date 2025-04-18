/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { UntypedFormArray } from '@angular/forms';
import { AuthenticationInputsGeneratorSmartComponent } from './authentication-inputs-generator.smart-component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AuthenticationFormService, AuthenticationType } from '@alfresco-dbp/shared-authentication-services';
import {
    mockBasicAuthenticationContent,
    mockBearerAuthenticationContent,
    mockClientCredentialsAuthenticationContent,
    mockGrantTypeAuthenticationContent,
} from '../mock/authentications.mock';
import { SimpleChange } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NoopTranslateModule } from '@alfresco/adf-core';

describe('AuthenticationInputsGeneratorSmartComponent', () => {
    let component: AuthenticationInputsGeneratorSmartComponent;
    let fixture: ComponentFixture<AuthenticationInputsGeneratorSmartComponent>;
    let element: HTMLElement;
    let authenticationFormService: AuthenticationFormService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, NoopTranslateModule, AuthenticationInputsGeneratorSmartComponent],
            providers: [AuthenticationFormService],
        });
        fixture = TestBed.createComponent(AuthenticationInputsGeneratorSmartComponent);
        component = fixture.componentInstance;
        element = fixture.debugElement.nativeElement;
        authenticationFormService = TestBed.inject(AuthenticationFormService);
    });

    describe('Basic authentication inputs', () => {
        beforeEach(() => {
            component.authIndex = 0;
            component.authentication = mockBasicAuthenticationContent;
            component.formArray = new UntypedFormArray([]);
            const authenticationCredentialsFields = authenticationFormService.getAuthenticationFormFieldsDefinitionByType(AuthenticationType.BASIC);
            authenticationCredentialsFields.filter((field) => field.type === 'password').forEach((field) => (field.isHidden = true));
            const changes = {
                authenticationCredentialsFields: new SimpleChange(null, authenticationCredentialsFields, true),
            };
            component.authenticationCredentialsFields = authenticationCredentialsFields;
            component.ngOnChanges(changes);

            fixture.detectChanges();
        });

        it('should create inputs for basic auth type', () => {
            const usernameElement: HTMLInputElement = element.querySelector('[data-automation-id="apa-authentication-input-username"]');
            const passwordElement: HTMLInputElement = element.querySelector('[data-automation-id="apa-authentication-input-password"]');

            expect(usernameElement.placeholder).toEqual('SHARED_AUTHENTICATION.DETAILS.USERNAME');
            expect(usernameElement.type).toEqual('text');
            expect(passwordElement.placeholder).toEqual('SHARED_AUTHENTICATION.DETAILS.PASSWORD');
            expect(passwordElement.type).toEqual('password');
        });

        it('should show required error for required basic auth fields', () => {
            const requiredErrorPassword = element.querySelector('[data-automation-id="apa-authentication-field-required-error-password"]');

            expect(requiredErrorPassword.textContent.trim()).toEqual('SHARED_AUTHENTICATION.ERRORS.REQUIRED');
        });

        it('should be able to toggle (show/hide) password visibility', () => {
            const toggleVisibilityButton = element.querySelector('[data-automation-id="apa-authentication-visibility-toggle-button-password"]');
            let toggleVisibilityIcon = element.querySelector('[data-automation-id="apa-authentication-visibility-toggle-icon-password"]');

            expect(toggleVisibilityButton['ariaLabel']).toEqual('SHARED_AUTHENTICATION.HINTS.HIDE_PASSWORD');
            expect(toggleVisibilityIcon.innerHTML.trim()).toEqual('visibility_off');

            toggleVisibilityButton.dispatchEvent(new Event('click'));
            fixture.detectChanges();

            toggleVisibilityIcon = element.querySelector('[data-automation-id="apa-authentication-visibility-toggle-icon-password"]');

            expect(toggleVisibilityIcon.innerHTML.trim()).toEqual('visibility');
        });
    });

    describe('Bearer authentication inputs', () => {
        beforeEach(() => {
            component.authIndex = 0;
            component.authentication = mockBearerAuthenticationContent;
            component.formArray = new UntypedFormArray([]);
            const authenticationCredentialsFields = authenticationFormService.getAuthenticationFormFieldsDefinitionByType(AuthenticationType.BEARER);
            const changes = {
                authenticationCredentialsFields: new SimpleChange(null, authenticationCredentialsFields, true),
            };
            component.authenticationCredentialsFields = authenticationCredentialsFields;
            component.ngOnChanges(changes);

            fixture.detectChanges();
        });

        it('should create inputs for bearer auth type', () => {
            const tokenElement: HTMLInputElement = element.querySelector('[data-automation-id="apa-authentication-input-token"]');

            expect(tokenElement.placeholder).toEqual('SHARED_AUTHENTICATION.DETAILS.TOKEN');
            expect(tokenElement.type).toEqual('password');
        });

        it('should show required error for required bearer auth fields', () => {
            const requiredErrorToken = element.querySelector('[data-automation-id="apa-authentication-field-required-error-token"]');

            expect(requiredErrorToken.textContent.trim()).toEqual('SHARED_AUTHENTICATION.ERRORS.REQUIRED');
        });
    });

    describe('Client credentials authentication inputs', () => {
        beforeEach(() => {
            component.authIndex = 0;
            component.authentication = mockClientCredentialsAuthenticationContent;
            component.formArray = new UntypedFormArray([]);
            const authenticationCredentialsFields = authenticationFormService.getAuthenticationFormFieldsDefinitionByType(
                AuthenticationType.CLIENT_CREDENTIALS
            );
            const changes = {
                authenticationCredentialsFields: new SimpleChange(null, authenticationCredentialsFields, true),
            };
            component.authenticationCredentialsFields = authenticationCredentialsFields;
            component.ngOnChanges(changes);

            fixture.detectChanges();
        });

        it('should create inputs for client credentials auth type', () => {
            const clientIdElement: HTMLInputElement = element.querySelector('[data-automation-id="apa-authentication-input-clientId"]');
            const clientSecretElement: HTMLInputElement = element.querySelector('[data-automation-id="apa-authentication-input-clientSecret"]');
            const endpointElement: HTMLInputElement = element.querySelector('[data-automation-id="apa-authentication-input-endpoint"]');
            const scopeElement: HTMLInputElement = element.querySelector('[data-automation-id="apa-authentication-input-scope"]');

            expect(clientIdElement.placeholder).toEqual('SHARED_AUTHENTICATION.DETAILS.CLIENT_ID');
            expect(clientIdElement.type).toEqual('text');
            expect(clientSecretElement.placeholder).toEqual('SHARED_AUTHENTICATION.DETAILS.CLIENT_SECRET');
            expect(clientSecretElement.type).toEqual('password');
            expect(endpointElement.placeholder).toEqual('SHARED_AUTHENTICATION.DETAILS.ENDPOINT');
            expect(endpointElement.type).toEqual('text');
            expect(scopeElement.placeholder).toEqual('SHARED_AUTHENTICATION.DETAILS.SCOPE');
            expect(scopeElement.type).toEqual('text');
        });

        it('should show required error for required client credentials auth fields', () => {
            const requiredErrorClientId = element.querySelector('[data-automation-id="apa-authentication-field-required-error-clientId"]');
            const requiredErrorClientSecret = element.querySelector('[data-automation-id="apa-authentication-field-required-error-clientSecret"]');
            const requiredErrorEndpoint = element.querySelector('[data-automation-id="apa-authentication-field-required-error-endpoint"]');

            expect(requiredErrorClientId.textContent.trim()).toEqual('SHARED_AUTHENTICATION.ERRORS.REQUIRED');
            expect(requiredErrorClientSecret.textContent.trim()).toEqual('SHARED_AUTHENTICATION.ERRORS.REQUIRED');
            expect(requiredErrorEndpoint.textContent.trim()).toEqual('SHARED_AUTHENTICATION.ERRORS.REQUIRED');
        });

        it('should show invalid url error for endpoint field', () => {
            const endpointElement: HTMLInputElement = element.querySelector('[data-automation-id="apa-authentication-input-endpoint"]');
            endpointElement.value = 'invalid-url';
            endpointElement.dispatchEvent(new Event('input'));
            fixture.detectChanges();

            const urlErrorEndpoint = element.querySelector('[data-automation-id="apa-authentication-field-pattern-error-endpoint"]');
            expect(urlErrorEndpoint.textContent.trim()).toEqual('SHARED_AUTHENTICATION.ERRORS.URL_ERROR');
        });

        it('should deny whitespace and show pattern error for scope field', () => {
            const scopeElement: HTMLInputElement = element.querySelector('[data-automation-id="apa-authentication-input-scope"]');
            scopeElement.value = 'no whitespace allowed';
            scopeElement.dispatchEvent(new Event('input'));
            fixture.detectChanges();

            const patternErrorScope = element.querySelector('[data-automation-id="apa-authentication-field-pattern-error-scope"]');
            expect(patternErrorScope.textContent.trim()).toEqual('SHARED_AUTHENTICATION.ERRORS.SCOPE_ERROR');
        });

        it('should allow correct values for scope field', () => {
            const scopeElement: HTMLInputElement = element.querySelector('[data-automation-id="apa-authentication-input-scope"]');
            scopeElement.value = 'valid.value,valid/value,valid_value';
            scopeElement.dispatchEvent(new Event('input'));
            fixture.detectChanges();

            const patternErrorScope = element.querySelector('[data-automation-id="apa-authentication-field-pattern-error-scope"]');
            expect(patternErrorScope).toBeNull();
        });

        it('should show hint for scope field', () => {
            const scopeHintElement = element.querySelector('[data-automation-id="apa-authentication-field-hint-scope"]');
            expect(scopeHintElement.textContent.trim()).toEqual('SHARED_AUTHENTICATION.HINTS.SCOPE_HINT');
        });
    });

    describe('Grant type authentication inputs', () => {
        beforeEach(() => {
            component.authIndex = 0;
            component.authentication = mockGrantTypeAuthenticationContent;
            component.formArray = new UntypedFormArray([]);
            const authenticationCredentialsFields = authenticationFormService.getAuthenticationFormFieldsDefinitionByType(
                AuthenticationType.GRANT_TYPE
            );
            const changes = {
                authenticationCredentialsFields: new SimpleChange(null, authenticationCredentialsFields, true),
            };
            component.authenticationCredentialsFields = authenticationCredentialsFields;
            component.ngOnChanges(changes);

            fixture.detectChanges();
        });

        it('should create inputs for grant type auth type', () => {
            const clientIdElement: HTMLInputElement = element.querySelector('[data-automation-id="apa-authentication-input-clientId"]');
            const clientSecretElement: HTMLInputElement = element.querySelector('[data-automation-id="apa-authentication-input-clientSecret"]');
            const endpointElement: HTMLInputElement = element.querySelector('[data-automation-id="apa-authentication-input-endpoint"]');
            const scopeElement: HTMLInputElement = element.querySelector('[data-automation-id="apa-authentication-input-scope"]');
            const grantTypeElement: HTMLInputElement = element.querySelector('[data-automation-id="apa-authentication-input-grantType"]');

            expect(clientIdElement.placeholder).toEqual('SHARED_AUTHENTICATION.DETAILS.CLIENT_ID');
            expect(clientIdElement.type).toEqual('text');
            expect(clientSecretElement.placeholder).toEqual('SHARED_AUTHENTICATION.DETAILS.CLIENT_SECRET');
            expect(clientSecretElement.type).toEqual('password');
            expect(endpointElement.placeholder).toEqual('SHARED_AUTHENTICATION.DETAILS.ENDPOINT');
            expect(endpointElement.type).toEqual('text');
            expect(scopeElement.placeholder).toEqual('SHARED_AUTHENTICATION.DETAILS.SCOPE');
            expect(scopeElement.type).toEqual('text');
            expect(grantTypeElement.placeholder).toEqual('SHARED_AUTHENTICATION.DETAILS.GRANT_TYPE');
            expect(grantTypeElement.type).toEqual('text');
        });

        it('should show required error for required grant type auth fields', () => {
            const requiredErrorClientId = element.querySelector('[data-automation-id="apa-authentication-field-required-error-clientId"]');
            const requiredErrorClientSecret = element.querySelector('[data-automation-id="apa-authentication-field-required-error-clientSecret"]');
            const requiredErrorEndpoint = element.querySelector('[data-automation-id="apa-authentication-field-required-error-endpoint"]');
            const requiredErrorGrantType = element.querySelector('[data-automation-id="apa-authentication-field-required-error-grantType"]');

            expect(requiredErrorClientId.textContent.trim()).toEqual('SHARED_AUTHENTICATION.ERRORS.REQUIRED');
            expect(requiredErrorClientSecret.textContent.trim()).toEqual('SHARED_AUTHENTICATION.ERRORS.REQUIRED');
            expect(requiredErrorEndpoint.textContent.trim()).toEqual('SHARED_AUTHENTICATION.ERRORS.REQUIRED');
            expect(requiredErrorGrantType.textContent.trim()).toEqual('SHARED_AUTHENTICATION.ERRORS.REQUIRED');
        });

        it('should show invalid url error for endpoint field', () => {
            const endpointElement: HTMLInputElement = element.querySelector('[data-automation-id="apa-authentication-input-endpoint"]');
            endpointElement.value = 'invalid-url';
            endpointElement.dispatchEvent(new Event('input'));
            fixture.detectChanges();

            const urlErrorEndpoint = element.querySelector('[data-automation-id="apa-authentication-field-pattern-error-endpoint"]');
            expect(urlErrorEndpoint.textContent.trim()).toEqual('SHARED_AUTHENTICATION.ERRORS.URL_ERROR');
        });

        it('should deny whitespace and show pattern error for scope field', () => {
            const scopeElement: HTMLInputElement = element.querySelector('[data-automation-id="apa-authentication-input-scope"]');
            scopeElement.value = 'no whitespace allowed';
            scopeElement.dispatchEvent(new Event('input'));
            fixture.detectChanges();

            const patternErrorScope = element.querySelector('[data-automation-id="apa-authentication-field-pattern-error-scope"]');
            expect(patternErrorScope.textContent.trim()).toEqual('SHARED_AUTHENTICATION.ERRORS.SCOPE_ERROR');
        });

        it('should allow correct values for scope field', () => {
            const scopeElement: HTMLInputElement = element.querySelector('[data-automation-id="apa-authentication-input-scope"]');
            scopeElement.value = 'valid.value,valid/value,valid_value';
            scopeElement.dispatchEvent(new Event('input'));
            fixture.detectChanges();

            const patternErrorScope = element.querySelector('[data-automation-id="apa-authentication-field-pattern-error-scope"]');
            expect(patternErrorScope).toBeNull();
        });

        it('should show hint for scope field', () => {
            const scopeHintElement = element.querySelector('[data-automation-id="apa-authentication-field-hint-scope"]');
            expect(scopeHintElement.textContent.trim()).toEqual('SHARED_AUTHENTICATION.HINTS.SCOPE_HINT');
        });
    });
});
