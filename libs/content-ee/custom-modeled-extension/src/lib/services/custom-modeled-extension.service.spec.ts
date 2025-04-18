/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { AppConfigService, LocalizedDatePipe, NoopTranslateModule } from '@alfresco/adf-core';
import { AlfrescoApiService, AlfrescoApiServiceMock } from '@alfresco/adf-content-services';
import { CustomModeledExtensionTestingModule } from '../testing/custom-modeled-extension-testing.module';
import { CustomModeledExtensionExtensionService } from './custom-modeled-extension.service';
import { of } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { SnackbarErrorAction, SnackbarInfoAction } from '@alfresco/aca-shared/store';
import { FormActionDialogComponent } from '../components/form-action-dialog/form-action-dialog.component';
import { AdfHttpClient } from '@alfresco/adf-core/api';
import { MockProvider } from 'ng-mocks';

describe('CustomModeledExtensionExtensionService', () => {
    let store: Store<any>;
    let service: CustomModeledExtensionExtensionService;
    let appConfig: AppConfigService;
    let alfrescoApiService: AlfrescoApiService = null;
    let adfHttpClient: AdfHttpClient;
    let requestSpy: jasmine.Spy;

    const dialogRef = {
        close: jasmine.createSpy('close'),
        open: jasmine.createSpy('open'),
    };
    let localizedDatePipe: LocalizedDatePipe;

    const mockGoodHealthResponse = Promise.resolve({ status: 'UP' });

    const mockBadHealthResponse = Promise.resolve({ status: 'DOWN' });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [CustomModeledExtensionTestingModule, NoopTranslateModule],
            providers: [
                {
                    provide: AlfrescoApiService,
                    useClass: AlfrescoApiServiceMock,
                },
                { provide: MatDialog, useValue: dialogRef },
                MockProvider(LocalizedDatePipe),
            ],
        });

        service = TestBed.inject(CustomModeledExtensionExtensionService);
        alfrescoApiService = TestBed.inject(AlfrescoApiService);
        appConfig = TestBed.inject(AppConfigService);
        localizedDatePipe = TestBed.inject(LocalizedDatePipe);
        appConfig.config = Object.assign(appConfig.config, {
            'alfresco-deployed-apps.name': 'simple-app',
            'alfresco-deployed-apps': [
                {
                    name: 'mock-app-name',
                },
            ],
        });
        store = TestBed.inject(Store);
        appConfig.load();
        appConfig.onLoad = of(appConfig.config);
        adfHttpClient = TestBed.inject(AdfHttpClient);
        requestSpy = spyOn(adfHttpClient, 'request');
    });

    it('Should be able to call health check api if alfrescoApi is Initialized', (done) => {
        alfrescoApiService.alfrescoApiInitialized.next(true);
        requestSpy.and.returnValue(mockGoodHealthResponse);
        service.checkBackendHealth().subscribe(() => done());
        expect(requestSpy).toHaveBeenCalled();
    });

    it('Should not be able to call health check api if alfrescoApi is not Initialized', () => {
        alfrescoApiService.alfrescoApiInitialized.next(false);
        requestSpy.and.returnValue(mockGoodHealthResponse);
        service.checkBackendHealth().subscribe(() => {});
        expect(requestSpy).not.toHaveBeenCalled();
    });

    it('Should check runtimeBundleServicesCloudRunning is true if backend health status is UP', (done) => {
        alfrescoApiService.alfrescoApiInitialized.next(true);
        requestSpy.and.returnValue(mockGoodHealthResponse);
        service.checkBackendHealth().subscribe((result) => {
            expect(result).toEqual(true);
            expect(service.runtimeBundleServicesCloudRunning).toEqual(true);
            done();
        });
    });

    it('Should check runtimeBundleServicesCloudRunning is false if backend health status is DOWN', (done) => {
        alfrescoApiService.alfrescoApiInitialized.next(true);
        requestSpy.and.returnValue(mockBadHealthResponse);
        service.checkBackendHealth().subscribe((result) => {
            expect(result).toEqual(false);
            expect(service.runtimeBundleServicesCloudRunning).toEqual(false);
            done();
        });
    });

    it('Should display error message', () => {
        const spy = spyOn(store, 'dispatch');
        service.showError('error');
        expect(spy).toHaveBeenCalledWith(new SnackbarErrorAction('error'));
    });

    it('Should display info message', () => {
        const spy = spyOn(store, 'dispatch');
        service.showInfo('info');
        expect(spy).toHaveBeenCalledWith(new SnackbarInfoAction('info'));
    });

    it('Should open form dialog', () => {
        spyOn(store, 'select').and.returnValue(of('appName'));
        const expectedResult = {
            data: {
                formDefinitionId: 'formDefinitionId',
                appName: 'appName',
                nodes: [],
                processDefinitionKey: 'processDefinitionKey',
                processDefinitionName: 'processDefinitionName',
            },
            minWidth: '50%',
            height: '75%',
        };

        service.openFormActionDialog('formDefinitionId', [], 'processDefinitionKey', 'processDefinitionName');

        expect(dialogRef.open).toHaveBeenCalledWith(FormActionDialogComponent, expectedResult);
    });

    it('Should start process', () => {
        spyOn(store, 'select').and.returnValue(of('appName'));
        spyOn(localizedDatePipe, 'transform').and.returnValue('mockDate');
        const postSpy = spyOn<any>(service, 'post').and.returnValue(of(true));
        const expectedResult = {
            payloadType: 'StartProcessPayload',
            processDefinitionKey: 'processDefinitionKey',
            businessKey: 'processDefinitionName - mockDate',
            name: 'processDefinitionName - mockDate',
            variables: { var1: 'value1', var2: 'value2' },
        };

        service.startProcess('processDefinitionKey', 'processDefinitionName', {
            var1: 'value1',
            var2: 'value2',
        });

        expect(postSpy).toHaveBeenCalled();
        expect(postSpy.calls.mostRecent().args[0]).toContain('/appName/rb/v1/process-instances');
        expect(postSpy.calls.mostRecent().args[1]).toEqual(expectedResult);
    });

    it('Should start process without variables', () => {
        spyOn(store, 'select').and.returnValue(of('appName'));
        spyOn(localizedDatePipe, 'transform').and.returnValue('mockDate');
        const postSpy = spyOn<any>(service, 'post').and.returnValue(of(true));
        const expectedResult = {
            payloadType: 'StartProcessPayload',
            processDefinitionKey: 'processDefinitionKey',
            businessKey: 'processDefinitionName - mockDate',
            name: 'processDefinitionName - mockDate',
            variables: null,
        };

        service.startProcess('processDefinitionKey', 'processDefinitionName', null);

        expect(postSpy).toHaveBeenCalled();
        expect(postSpy.calls.mostRecent().args[0]).toContain('/appName/rb/v1/process-instances');
        expect(postSpy.calls.mostRecent().args[1]).toEqual(expectedResult);
    });

    it('Should submit form', () => {
        spyOn(store, 'select').and.returnValue(of('appName'));
        const postSpy = spyOn<any>(service, 'post').and.returnValue(of(true));
        const expectedResult = { values: { var1: 'value1', var2: 'value2' } };

        service.submitForm('formDefinitionId', {
            values: { var1: 'value1', var2: 'value2' },
        });

        expect(postSpy).toHaveBeenCalled();
        expect(postSpy.calls.mostRecent().args[0]).toContain('/appName/form/v1/user-action/form/formDefinitionId/submit');
        expect(postSpy.calls.mostRecent().args[1]).toEqual(expectedResult);
    });

    it('Should send named event', () => {
        spyOn(store, 'select').and.returnValue(of('appName'));
        const postSpy = spyOn<any>(service, 'post').and.returnValue(of(true));
        const expectedResult = { nodes: [] };

        service.sendNamedEvent('mockEventName', []);

        expect(postSpy).toHaveBeenCalled();
        expect(postSpy.calls.mostRecent().args[0]).toContain(`/mockEventName/send`);
        expect(postSpy.calls.mostRecent().args[1]).toEqual(expectedResult);
    });

    it('Should navigate', () => {
        const spy = spyOn(window, 'open');

        service.navigate('https://www.alfresco.com', [], true);

        expect(spy).toHaveBeenCalledWith('https://www.alfresco.com', '_blank');
    });
});
