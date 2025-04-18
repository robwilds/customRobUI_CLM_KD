/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { of, throwError } from 'rxjs';
import { PublicFormComponent } from './public-form.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormCloudComponent } from '@alfresco/adf-process-services-cloud';
import { AppConfigService, NoopTranslateModule } from '@alfresco/adf-core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HxpNotificationService } from '@alfresco/adf-hx-content-services/services';
import { mockFormRepresentationWithOutcome, mockFormRepresentationWithNoOutcome } from './form-representation.mock';
import { ActivatedRoute, Router } from '@angular/router';
import { AdfHttpClient } from '@alfresco/adf-core/api';
import { By } from '@angular/platform-browser';
import { Location } from '@angular/common';

describe('PublicFormComponent with outcome', () => {
    let fixture: ComponentFixture<PublicFormComponent>;
    let component: PublicFormComponent;
    let router: Router;
    const mockRequest = jest.fn().mockImplementation((url) => {
        if (url.includes('start-form')) {
            return of(mockFormRepresentationWithOutcome);
        } else if (url.includes('static-values')) {
            return of({ Text0y1hh7: 'fake-static-value' });
        } else if (url.includes('form/submit')) {
            return of({});
        } else if (url.includes('constant-values')) {
            return of({ cancelEnabled: 'false', startProcessEnabled: 'true' });
        }
        return of({});
    });
    const notificationServiceMock = { showSuccess: jest.fn(), showError: jest.fn() };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopTranslateModule, FormCloudComponent, NoopAnimationsModule, HttpClientTestingModule, MatProgressSpinnerModule],
            providers: [
                { provide: AdfHttpClient, useValue: { request: mockRequest } },
                { provide: HxpNotificationService, useValue: notificationServiceMock },
                {
                    provide: ActivatedRoute,
                    useValue: { params: of({ processId: 'testProcessId' }) },
                },
                {
                    provide: AppConfigService,
                    useValue: {
                        get: (key: string) => {
                            if (key === 'bpmHost') {
                                return 'https://mock-hyland.com';
                            } else if (key === 'alfresco-deployed-apps') {
                                return [{ name: 'mock-appName' }];
                            }
                            return '';
                        },
                    },
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(PublicFormComponent);
        component = fixture.componentInstance;
        router = TestBed.inject(Router);
        jest.spyOn(router, 'navigate').mockImplementation(jest.fn());

        fixture.detectChanges();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should set loading to false', () => {
        expect(component.loading).toBeFalsy();
    });

    it('should show success notification when form loaded', () => {
        expect(notificationServiceMock.showSuccess).toHaveBeenCalledWith('APP.PUBLIC_FORM.SUCCESS.LOADING_FORM');
    });

    it('should populate form fields with static form values', () => {
        fixture.detectChanges();
        expect(mockRequest).toHaveBeenCalledWith(
            `https://mock-hyland.com/mock-appName/rb/v1/public/processes/testProcessId/static-values`,
            expect.anything()
        );

        expect(component.form.values).toEqual({ Text0y1hh7: 'fake-static-value' });
    });

    it('should call right endpoint to get FormRepresentation', () => {
        expect(mockRequest).toHaveBeenCalledWith(
            `https://mock-hyland.com/mock-appName/rb/v1/public/processes/testProcessId/start-form`,
            expect.anything()
        );
    });
    it('should start process when outcome clicked', () => {
        component.onOutcomeClicked('Custom Action');

        expect(mockRequest).toHaveBeenCalledWith(
            `https://mock-hyland.com/mock-appName/rb/v1/public/processes/testProcessId/form/submit`,
            expect.objectContaining({
                bodyParam: {
                    payloadType: 'StartProcessPayload',
                    processDefinitionKey: 'testProcessId',
                    values: { Text0y1hh7: 'fake-static-value' },
                    outcome: 'Custom Action',
                },
            })
        );
    });

    it('should navigate to success page when process started', () => {
        component.outcome = 'Custom Action';
        component.startProcess();

        expect(router.navigate).toHaveBeenCalledWith(['./success'], { state: { outcome: 'Custom Action' }, relativeTo: expect.anything() });
    });

    it('should redirect to error page when process failed to start', () => {
        mockRequest.mockReturnValueOnce(throwError(() => new Error('error')));

        component.startProcess();

        expect(router.navigate).toHaveBeenCalledWith(['/public/error/500']);
    });

    it('should display form outcomes', () => {
        const option1 = fixture.debugElement.query(By.css('#adf-form-option_1'));
        const option2 = fixture.debugElement.query(By.css('#adf-form-option_2'));

        expect(option1.nativeElement.textContent).toContain('OPTION 1');
        expect(option2.nativeElement.textContent).toContain('OPTION 2');
    });

    it('should NOT display START PROCESS button when at least one outcome provided by user', () => {
        const startButton = fixture.debugElement.query(By.css('[data-automation-id="hxp-public-process-start-button"]'));

        expect(startButton).toBeNull();
    });

    it('should redirect to error page when form failed to load', () => {
        mockRequest.mockReturnValueOnce(throwError(() => new Error('error')));
        component.ngOnInit();
        fixture.detectChanges();

        expect(router.navigate).toHaveBeenCalledWith(['/public/error/404']);
    });

    it('should go back when cancel button clicked', () => {
        const location = TestBed.inject(Location);
        const locationBackSpy = jest.spyOn(location, 'back');

        component.cancelStartProcess();

        expect(locationBackSpy).toHaveBeenCalled();
    });

    it('should NOT display CANCEL button when it is disabled', () => {
        const cancelButton = fixture.debugElement.query(By.css('[data-automation-id="hxp-public-process-cancel-button"]'));

        expect(cancelButton).toBeNull();
    });
});

describe('PublicFormComponent without outcome', () => {
    let fixture: ComponentFixture<PublicFormComponent>;
    let router: Router;
    const mockRequest = jest.fn().mockImplementation((url) => {
        if (url.includes('start-form')) {
            return of(mockFormRepresentationWithNoOutcome);
        } else if (url.includes('static-values')) {
            return of({});
        } else if (url.includes('form/submit')) {
            return of({});
        } else if (url.includes('constant-values')) {
            return of({ cancelEnabled: 'true', startProcessEnabled: 'true', cancelLabel: 'Custom Cancel', startLabel: 'Custom Start' });
        }
        return of({});
    });
    const notificationServiceMock = { showSuccess: jest.fn(), showError: jest.fn() };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopTranslateModule, FormCloudComponent, NoopAnimationsModule, HttpClientTestingModule, MatProgressSpinnerModule],
            providers: [
                { provide: AdfHttpClient, useValue: { request: mockRequest } },
                { provide: HxpNotificationService, useValue: notificationServiceMock },
                {
                    provide: ActivatedRoute,
                    useValue: { params: of({ processId: 'testProcessId' }) },
                },
                {
                    provide: AppConfigService,
                    useValue: {
                        get: (key: string) => {
                            if (key === 'bpmHost') {
                                return 'https://mock-hyland.com';
                            } else if (key === 'alfresco-deployed-apps') {
                                return [{ name: 'mock-appName' }];
                            }
                            return '';
                        },
                    },
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(PublicFormComponent);
        router = TestBed.inject(Router);
        jest.spyOn(router, 'navigate').mockImplementation(jest.fn());

        fixture.detectChanges();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should display Custom Start button', () => {
        const startButton = fixture.debugElement.query(By.css('[data-automation-id="hxp-public-process-start-button"]'));

        expect(startButton).not.toBeNull();
        expect(startButton.nativeElement.textContent.trim()).toEqual('Custom Start');
    });

    it('should display Custom CANCEL button', () => {
        const cancelButton = fixture.debugElement.query(By.css('[data-automation-id="hxp-public-process-cancel-button"]'));

        expect(cancelButton).not.toBeNull();
        expect(cancelButton.nativeElement.textContent.trim()).toEqual('Custom Cancel');
    });
});
