/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AppConfigService, AuthenticationService } from '@alfresco/adf-core';
import { HxPFeaturesService } from './hxp-features.service';
import { ReplaySubject, firstValueFrom, of } from 'rxjs';
import { MockService } from 'ng-mocks';
import { AdfHttpClient } from '@alfresco/adf-core/api';

describe('HxPFeaturesService', () => {
    let service: HxPFeaturesService;
    let adfHttpClient: AdfHttpClient;
    let authenticationService: AuthenticationService;

    const appConfigService: AppConfigService = {
        get: (property: string) => {
            if (property === 'bpmHost') {
                return 'http://mock.com';
            } else if (property === 'alfresco-deployed-apps') {
                return [{ name: 'mock-app' }];
            } else {
                return null;
            }
        },
        loadWellKnown: () => jest.fn().mockImplementation(() => Promise.resolve()),
    } as unknown as AppConfigService;

    beforeEach(() => {
        const alfrescoApiInitialized$ = new ReplaySubject<boolean>();
        alfrescoApiInitialized$.next(true);
        const onLogin$ = new ReplaySubject<boolean>();
        onLogin$.next(true);

        authenticationService = MockService(AuthenticationService, {
            isLoggedIn: () => true,
            onLogin: onLogin$,
        });
        adfHttpClient = MockService(AdfHttpClient);

        service = new HxPFeaturesService(appConfigService, authenticationService, adfHttpClient, {});
        service.init();
    });

    describe('Check path generation based on the received configuration', () => {
        let apiUrl;

        beforeEach(() => {
            apiUrl = '';
            spyOn(adfHttpClient, 'request').and.returnValue(Promise.resolve({}));
        });

        it('should return correct path', async () => {
            apiUrl = 'http://mock.com/v1/feature-flags';
            await firstValueFrom(service.init());

            service.getFlags$().toPromise();
            expect(adfHttpClient.request).toHaveBeenCalledWith(apiUrl, { httpMethod: 'GET' });
        });

        it('should return correct path when is not application aware', async () => {
            apiUrl = 'http://mock.com/v1/feature-flags';
            service = new HxPFeaturesService(appConfigService, authenticationService, adfHttpClient, { isApplicationAware: false });
            await firstValueFrom(service.init());

            service.getFlags$().toPromise();
            expect(adfHttpClient.request).toHaveBeenCalledWith(apiUrl, { httpMethod: 'GET' });
        });

        it('should return correct path when is application aware and service relative path was provided', async () => {
            apiUrl = 'http://mock.com/mock-app/rb/v1/feature-flags';
            service = new HxPFeaturesService(appConfigService, authenticationService, adfHttpClient, {
                isApplicationAware: true,
                serviceRelativePath: '/rb/',
            });
            await firstValueFrom(service.init());

            service.getFlags$().toPromise();
            expect(adfHttpClient.request).toHaveBeenCalledWith(apiUrl, { httpMethod: 'GET' });
        });
    });

    describe('Getting values for the feature flags', () => {
        const expectedFeatureFlags = {
            ff1: { current: true },
            ff2: { current: false },
            ff3: { current: true },
        };

        beforeEach(async () => {
            spyOn(service, 'getFlags$').and.returnValue(of(expectedFeatureFlags));
        });

        it('should get false when flag is unknown - isOn$', (done) => {
            service.isOn$('ff4').subscribe((result) => {
                expect(result).toBeFalsy();
                done();
            });
        });

        it('should get true when flag is unknown - isOff$', (done) => {
            service.isOff$('ff4').subscribe((result) => {
                expect(result).toBeTruthy();
                done();
            });
        });

        it('should get the value of the flag when flag is known - isOn$', (done) => {
            service.isOn$('ff1').subscribe((result) => {
                expect(result).toBeTruthy();
                done();
            });
            service.isOn$('ff2').subscribe((result) => {
                expect(result).toBeFalsy();
                done();
            });
            service.isOn$('ff3').subscribe((result) => {
                expect(result).toBeTruthy();
                done();
            });
        });

        it('should get the value of the flag when flag is known - isOff$', (done) => {
            service.isOff$('ff1').subscribe((result) => {
                expect(result).toBeFalsy();
                done();
            });
            service.isOff$('ff2').subscribe((result) => {
                expect(result).toBeTruthy();
                done();
            });
            service.isOff$('ff3').subscribe((result) => {
                expect(result).toBeFalsy();
                done();
            });
        });

        it('should get all the flags values asynchronously', (done) => {
            service.init();
            service.getFlags$().subscribe((result) => {
                expect(result).toEqual(expectedFeatureFlags);
                done();
            });
        });
    });
});
